"""Render Kenney 3D kit models as isometric sprites for the cemetery level.

    blender -b --python tools/iso/render_kit.py -- \
        --kit graveyard=/path/kenney_graveyard-kit --kit nature=/path/kenney_nature-kit \
        --manifest tools/iso/cemetery_models.json --out www/assets/proto/iso/cemetery \
        [--ppt 128] [--only grave_0,tomb_small] [--list] [--samples 48]

Camera: orthographic, azimuth 45 deg, elevation 30 deg (asin 0.5), so a unit
floor square projects to the 2:1 diamond of the isometric view. One model unit
is one 128x64 tile (`--ppt` pixels per tile width). World +X is screen
down-right (+gx), world -Y is screen down-left (+gy), like render_torch.py.

The manifest lists sprites: { name: { kit, src: [candidate basenames], footprint:
[w, h], rot?, offset? [x, y, z] (tile units), scale?, light?: 'top'|[x,y,z],
door?: [x, y, z], parts?: [{kit, src, pos?, rot?, scale?}] } }. `--list` prints
the bounding box of every model a manifest entry refers to (or of every model
in the kits when no manifest is given) and renders nothing.

Output: <out>/<name>.png (trimmed, transparent) and <out>/cemetery.json with
w, h, anchor (floor point of the footprint centre as a fraction of the image),
footprint and the projected light/door points. Blender 4.x; Cycles.
"""
import bpy, sys, os, json, math, glob
import numpy as np
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def opt(name, default=None, multi=False):
    vals = [argv[i + 1] for i, a in enumerate(argv) if a == name and i + 1 < len(argv)]
    if multi:
        return vals
    return vals[-1] if vals else default


KITS = {}
for spec in opt('--kit', multi=True):
    k, _, d = spec.partition('=')
    KITS[k] = os.path.expanduser(d)
MANIFEST = opt('--manifest')
OUT = opt('--out', 'www/assets/proto/iso/cemetery')
PPT = int(opt('--ppt', 128))
ONLY = set(opt('--only', '').split(',')) - {''}
LIST = '--list' in argv
SAMPLES = int(opt('--samples', 48))
PAD = 2

MODEL_DIRS = ['Models/GLB format', 'Models/GLTF format', 'Models/glTF format', 'Models/OBJ format']


def find_model(kit, names):
    """First existing model file for the candidate basenames (glb/gltf/obj)."""
    root = KITS[kit]
    for name in names:
        for sub in MODEL_DIRS:
            for ext in ('.glb', '.gltf', '.obj'):
                p = os.path.join(root, sub, name + ext)
                if os.path.exists(p):
                    return p
    return None


def all_models(kit):
    root = KITS[kit]
    out = []
    for sub in MODEL_DIRS:
        for ext in ('*.glb', '*.gltf'):
            out += glob.glob(os.path.join(root, sub, ext))
        if out:
            break
    return sorted(out)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_model(path):
    """Import one model; returns the list of new mesh objects."""
    before = set(bpy.data.objects)
    if path.lower().endswith('.obj'):
        bpy.ops.wm.obj_import(filepath=path)
    else:
        bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    # the glTF importer leaves helper objects outside the view layer; keep the linked ones
    linked = set(bpy.context.view_layer.objects)
    return [o for o in new if o in linked]


def bbox_of(objs):
    pts = []
    for o in objs:
        if o.type != 'MESH':
            continue
        for c in o.bound_box:
            pts.append(o.matrix_world @ Vector(c))
    if not pts:
        return Vector((0, 0, 0)), Vector((0, 0, 0))
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def fix_materials(objs):
    for o in objs:
        if o.type != 'MESH':
            continue
        for slot in o.material_slots:
            m = slot.material
            if not m or not m.use_nodes:
                continue
            bsdf = m.node_tree.nodes.get('Principled BSDF')
            if bsdf:
                bsdf.inputs['Roughness'].default_value = 0.85
                if 'Specular IOR Level' in bsdf.inputs:
                    bsdf.inputs['Specular IOR Level'].default_value = 0.2
                bsdf.inputs['Metallic'].default_value = 0.0
        for p in o.data.polygons:
            p.use_smooth = False


def place_parts(entry):
    """Import every part of a sprite, apply its transform, return (objs, lo, hi)."""
    parts = entry.get('parts') or [dict(kit=entry['kit'], src=entry['src'], rot=entry.get('rot', 0),
                                        offset=entry.get('offset', [0, 0, 0]), scale=entry.get('scale', 1.0))]
    objs = []
    for part in parts:
        path = find_model(part['kit'], part['src'] if isinstance(part['src'], list) else [part['src']])
        if not path:
            raise RuntimeError('no model for ' + str(part['src']) + ' in kit ' + part['kit'])
        new = import_model(path)
        s = float(part.get('scale', 1.0))
        rot = math.radians(float(part.get('rot', 0)))
        pos = part.get('pos') or part.get('offset') or [0, 0, 0]
        M = Matrix.Translation(Vector(pos)) @ Matrix.Rotation(rot, 4, 'Z') @ Matrix.Scale(s, 4)
        # transform the top-level objects of the import (children follow their parents)
        for o in new:
            if o.parent is None or o.parent not in new:
                o.matrix_world = M @ o.matrix_world
        objs += [o for o in new if o.type == 'MESH']
    bpy.context.view_layer.update()
    fix_materials(objs)
    lo, hi = bbox_of(objs)
    return objs, lo, hi


def setup_render(scene):
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.view_settings.view_transform = 'Standard'
    world = bpy.data.worlds.new('w')
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (0.9, 0.92, 1.0, 1)
    bg.inputs['Strength'].default_value = 0.45
    # key from camera-left-above, fill from the right
    for name, direction, energy, color in (('key', (-1.0, -1.6, 2.6), 3.0, (1, 0.97, 0.92)),
                                           ('fill', (1.8, 0.4, 1.2), 1.0, (0.85, 0.9, 1.0))):
        light = bpy.data.lights.new(name, 'SUN')
        light.energy = energy
        light.color = color
        light.angle = math.radians(12)
        obj = bpy.data.objects.new(name, light)
        scene.collection.objects.link(obj)
        d = Vector(direction).normalized()
        obj.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()


def setup_camera(scene, target, width_units, height_units, rx, ry):
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.sensor_fit = 'HORIZONTAL'
    cam.data.ortho_scale = width_units
    cam.data.clip_start = 0.01
    cam.data.clip_end = 200
    elev = math.asin(0.5)
    d = 60.0
    cam.location = target + Vector((d * math.cos(elev) / math.sqrt(2), -d * math.cos(elev) / math.sqrt(2), d * math.sin(elev)))
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.resolution_x = rx
    scene.render.resolution_y = ry
    scene.render.resolution_percentage = 100
    return cam


def project(scene, cam, p, rx, ry):
    v = world_to_camera_view(scene, cam, Vector(p))
    return v.x * rx, (1 - v.y) * ry


def trim(path):
    """Crop the PNG to its alpha bounding box (+PAD); returns (x0, y0, w, h)."""
    img = bpy.data.images.load(path)
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    a = px.reshape(h, w, 4)[:, :, 3]
    a = a[::-1]  # Blender stores rows bottom-up
    ys, xs = np.nonzero(a > 0.02)
    if not len(xs):
        bpy.data.images.remove(img)
        return 0, 0, w, h
    x0, x1 = max(0, xs.min() - PAD), min(w, xs.max() + 1 + PAD)
    y0, y1 = max(0, ys.min() - PAD), min(h, ys.max() + 1 + PAD)
    rgba = px.reshape(h, w, 4)[::-1][y0:y1, x0:x1]
    out = bpy.data.images.new('trimmed', x1 - x0, y1 - y0, alpha=True, float_buffer=False)
    out.pixels.foreach_set(np.ascontiguousarray(rgba[::-1]).reshape(-1))
    out.filepath_raw = path
    out.file_format = 'PNG'
    out.save()
    bpy.data.images.remove(img)
    bpy.data.images.remove(out)
    return int(x0), int(y0), int(x1 - x0), int(y1 - y0)


def render_sprite(name, entry):
    clear_scene()
    scene = bpy.context.scene
    setup_render(scene)
    objs, lo, hi = place_parts(entry)
    fw, fh = entry.get('footprint', [1, 1])
    # the kits centre their models on the origin: the footprint centre is the
    # origin on the floor (offsets in the manifest move a model off it on purpose)
    centre = Vector((0.0, 0.0, max(lo.z, min(0.0, hi.z))))
    # camera frame: the footprint diamond plus the model's height, with margin
    span = max(2 * max(abs(lo.x), abs(hi.x)), fw, 0.5) + max(2 * max(abs(lo.y), abs(hi.y)), fh, 0.5)
    width_units = span / math.sqrt(2) * 1.15 + 0.4
    ppu = PPT / math.sqrt(2)
    rx = int(math.ceil(width_units * ppu))
    height_units = width_units * 0.5 + (hi.z - lo.z) * math.cos(math.asin(0.5)) + 0.6
    ry = int(math.ceil(height_units * ppu))
    rx += rx % 2
    ry += ry % 2
    target = centre + Vector((0, 0, (hi.z - lo.z) * 0.45))
    cam = setup_camera(scene, target, width_units, height_units, rx, ry)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.abspath(os.path.join(OUT, name + '.png'))
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    ax, ay = project(scene, cam, centre, rx, ry)
    extra = {}
    if entry.get('light'):
        lp = entry['light']
        if lp == 'top':
            lp = (centre.x, centre.y, hi.z - 0.05)
        else:
            lp = (centre.x + lp[0], centre.y + lp[1], lo.z + lp[2])
        extra['light'] = project(scene, cam, lp, rx, ry)
    if entry.get('door'):
        dp = entry['door']
        extra['door'] = project(scene, cam, (centre.x + dp[0], centre.y + dp[1], lo.z + dp[2]), rx, ry)
    x0, y0, w, h = trim(path)
    rec = {
        'file': name + '.png', 'w': w, 'h': h,
        'anchor': {'x': round((ax - x0) / w, 4), 'y': round((ay - y0) / h, 4)},
        'footprint': {'w': fw, 'h': fh},
        'bbox': [round(v, 3) for v in (hi.x - lo.x, hi.y - lo.y, hi.z - lo.z)]
    }
    for k, (px_, py_) in extra.items():
        rec[k] = {'x': round((px_ - x0) / w, 4), 'y': round((py_ - y0) / h, 4)}
    print('rendered %s %dx%d anchor %.3f,%.3f bbox %s' % (name, w, h, rec['anchor']['x'], rec['anchor']['y'], rec['bbox']), flush=True)
    return rec


def list_models(manifest):
    names = []
    if manifest:
        for name, entry in manifest['sprites'].items():
            parts = entry.get('parts') or [entry]
            for part in parts:
                src = part['src'] if isinstance(part['src'], list) else [part['src']]
                path = find_model(part['kit'], src)
                names.append((name, part['kit'], src[0], path))
    else:
        for kit in KITS:
            for path in all_models(kit):
                names.append((os.path.splitext(os.path.basename(path))[0], kit, os.path.basename(path), path))
    for name, kit, src, path in names:
        if not path:
            print('%-24s %-10s %-32s MISSING' % (name, kit, src))
            continue
        clear_scene()
        objs = import_model(path)
        bpy.context.view_layer.update()
        lo, hi = bbox_of(objs)
        print('%-24s %-10s %-32s size %.2f x %.2f x %.2f  min z %.2f' % (name, kit, os.path.basename(path), hi.x - lo.x, hi.y - lo.y, hi.z - lo.z, lo.z))


def main():
    manifest = json.load(open(MANIFEST)) if MANIFEST else None
    if LIST:
        list_models(manifest)
        return
    if not manifest:
        raise SystemExit('--manifest is required to render')
    out_json = os.path.join(OUT, 'cemetery.json')
    result = {'ppt': PPT, 'sprites': {}}
    if os.path.exists(out_json):
        try:
            result = json.load(open(out_json))
            result['ppt'] = PPT
        except Exception:
            pass
    for name, entry in manifest['sprites'].items():
        if ONLY and name not in ONLY:
            continue
        try:
            result['sprites'][name] = render_sprite(name, entry)
        except Exception as e:
            print('FAILED %s: %s' % (name, e), flush=True)
    os.makedirs(OUT, exist_ok=True)
    json.dump(result, open(out_json, 'w'), indent=1, sort_keys=True)
    print('wrote', out_json)


main()
