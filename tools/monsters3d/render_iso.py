"""Render the prepared monster / chest models as isometric sprites (headless Blender).

    blender -b --python render_iso.py -- <config.json> <models_dir> <out_dir> [px] [ids,...]

config.json: FpMonsters.MODELS ({ id: { height, yaw, ... } }), e.g.
    node -e "eval(require('fs').readFileSync('www/js/proto/fp-monsters.js','utf8')); console.log(JSON.stringify(FpMonsters.MODELS))" > models.json

Camera: orthographic 2:1 dimetric like the isometric tiles, looking from the
viewer's side so a model facing glTF +Z (TRELLIS's front) faces down-left,
like Mr Owl's sprites; the config yaw turns side-on models toward the viewer.
Each sprite is lit like the owl renders (key from the camera side, fill,
warm torch rim), trimmed to its opaque area and written as <id>.png;
index.json records the trimmed sizes.
"""
import bpy, sys, os, json, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
CONFIG, MODELS_DIR, OUT = argv[0], argv[1], argv[2]
PX = int(argv[3]) if len(argv) > 3 else 384
ONLY = argv[4].split(',') if len(argv) > 4 else None
os.makedirs(OUT, exist_ok=True)
cfg = json.load(open(CONFIG))
ids = [i for i in cfg if (ONLY is None or i in ONLY) and os.path.exists(os.path.join(MODELS_DIR, i + '.glb'))]


def aim(obj, from_pos):
    obj.rotation_euler = (-Vector(from_pos)).to_track_quat('-Z', 'Y').to_euler()


index_path = os.path.join(OUT, 'index.json')
index = json.load(open(index_path)) if os.path.exists(index_path) else {}

for mid in ids:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, mid + '.glb'))
    meshes = [o for o in scene.objects if o.type == 'MESH']
    holder = bpy.data.objects.new('holder', None)
    scene.collection.objects.link(holder)
    for o in list(scene.objects):
        if o.parent is None and o is not holder:
            o.parent = holder
    holder.rotation_euler = (0, 0, math.radians(cfg[mid].get('yaw', 0)))
    bpy.context.view_layer.update()

    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in meshes:
        for v in o.data.vertices:
            w = o.matrix_world @ v.co
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    centre = (lo + hi) / 2
    size = max(hi - lo)

    for m in bpy.data.materials:
        if m.use_nodes and m.node_tree.nodes.get('Principled BSDF'):
            b = m.node_tree.nodes['Principled BSDF']
            b.inputs['Metallic'].default_value = 0.0
            b.inputs['Roughness'].default_value = 0.7

    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.film_transparent = True
    scene.render.resolution_x = PX
    scene.render.resolution_y = PX
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.exposure = 0.35
    world = bpy.data.worlds.new('w')
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[1].default_value = 0.9
    for name, energy, pos, color in [('key', 4.0, (1.0, -2.0, 2.6), (1, 1, 1)), ('fill', 1.4, (-2.0, -0.5, 1.0), (1, 1, 1)),
                                     ('rim', 1.5, (0.5, 2.0, 1.5), (1.0, 0.8, 0.55))]:
        L = bpy.data.objects.new(name, bpy.data.lights.new(name, 'SUN'))
        L.data.energy = energy
        L.data.color = color
        aim(L, pos)
        scene.collection.objects.link(L)

    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = size * 1.25
    elev = math.atan(0.5)
    d = size * 6
    cam.location = centre + Vector((d * math.cos(elev) / math.sqrt(2), -d * math.cos(elev) / math.sqrt(2), d * math.sin(elev)))
    cam.rotation_euler = (centre - cam.location).to_track_quat('-Z', 'Y').to_euler()

    raw = os.path.join(OUT, mid + '_raw.png')
    scene.render.filepath = raw
    bpy.ops.render.render(write_still=True)

    # trim to the opaque area
    img = bpy.data.images.load(raw)
    w, h = img.size
    px = list(img.pixels)
    x0, y0, x1, y1 = w, h, -1, -1
    for yy in range(h):
        row = yy * w * 4
        for xx in range(w):
            if px[row + xx * 4 + 3] > 0.03:
                x0 = min(x0, xx); x1 = max(x1, xx)
                y0 = min(y0, yy); y1 = max(y1, yy)
    x0, y0 = max(0, x0 - 1), max(0, y0 - 1)
    tw, th = min(w - x0, x1 - x0 + 3), min(h - y0, y1 - y0 + 3)
    out = bpy.data.images.new(mid + '_trim', tw, th, alpha=True)
    trimmed = [0.0] * (tw * th * 4)
    for yy in range(th):
        src = ((y0 + yy) * w + x0) * 4
        dst = yy * tw * 4
        trimmed[dst:dst + tw * 4] = px[src:src + tw * 4]
    out.pixels = trimmed
    out.filepath_raw = os.path.join(OUT, mid + '.png')
    out.file_format = 'PNG'
    out.save()
    os.remove(raw)
    index[mid] = {'w': tw, 'h': th}
    print('SPRITE', mid, tw, th, flush=True)

json.dump(index, open(index_path, 'w'), indent=1, sort_keys=True)
