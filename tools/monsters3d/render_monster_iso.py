"""Render a prepared monster GLB as isometric sprite frames.

    blender -b --python render_monster_iso.py -- <id.glb> <out_dir>
        [--size 192] [--motion shamble] [--yaw 0] [--engine cycles|eevee]
        [--samples 32] [--clips idle,walk,attack,hit]

Same camera as tools/owl3d/render_iso.py (orthographic, 2:1 dimetric) so the
frames sit in the isometric view next to Mr Owl. The models have no rig, so
the life comes from object-level motion per character type: a zombie shambles,
a ghost floats, bats flap, a spider skitters, the reaper glides with a bend in
its robe. Attack leans and stretches without travelling (the game moves the
sprite toward Mr Owl itself); hit recoils and ends on the idle pose.

Writes <facing>_<clip>_<n>.png plus pivot.json for tools/owl3d/pack_sprites.py.
"""
import bpy, sys, os, json, math
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:]
SRC = argv[0]
OUT = argv[1]


def opt(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default


SIZE = int(opt('--size', 192))
MOTION = opt('--motion', 'shamble')
YAW = math.radians(float(opt('--yaw', 0)))
ENGINE = opt('--engine', 'cycles')
SAMPLES = int(opt('--samples', 32))
CLIPS = {'idle': 6, 'walk': 8, 'attack': 6, 'hit': 4}
only = opt('--clips')
if only:
    keep = only.split(',')
    CLIPS = dict((k, v) for k, v in CLIPS.items() if k in keep)
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# --- import and normalise: height 1, feet at z = 0, centred on the origin ---
bpy.ops.import_scene.gltf(filepath=SRC)
meshes = [o for o in bpy.context.view_layer.objects if o.type == 'MESH']
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
bpy.ops.object.join()
body = bpy.context.view_layer.objects.active
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

lo = Vector((1e9, 1e9, 1e9))
hi = Vector((-1e9, -1e9, -1e9))
for c in body.bound_box:
    w = body.matrix_world @ Vector(c)
    lo = Vector((min(lo.x, w.x), min(lo.y, w.y), min(lo.z, w.z)))
    hi = Vector((max(hi.x, w.x), max(hi.y, w.y), max(hi.z, w.z)))
height = max(1e-4, hi.z - lo.z)
k = 1.0 / height
body.scale = (k, k, k)
bpy.context.view_layer.update()
bpy.ops.object.transform_apply(scale=True)
lo2 = Vector((1e9, 1e9, 1e9))
hi2 = Vector((-1e9, -1e9, -1e9))
for c in body.bound_box:
    w = body.matrix_world @ Vector(c)
    lo2 = Vector((min(lo2.x, w.x), min(lo2.y, w.y), min(lo2.z, w.z)))
    hi2 = Vector((max(hi2.x, w.x), max(hi2.y, w.y), max(hi2.z, w.z)))
body.location = (-(lo2.x + hi2.x) / 2, -(lo2.y + hi2.y) / 2, -lo2.z)
bpy.context.view_layer.update()
bpy.ops.object.transform_apply(location=True)

# a soft bend for robes and tails (the reaper, the spectres)
bend = None
if MOTION in ('glide', 'hover'):
    vg = body.vertex_groups.new(name='lower')
    idx = [v.index for v in body.data.vertices if v.co.z < 0.6]
    vg.add(idx, 1.0, 'REPLACE')
    bend = body.modifiers.new('bend', 'SIMPLE_DEFORM')
    bend.deform_method = 'BEND'
    bend.deform_axis = 'Y'
    bend.vertex_group = 'lower'
    bend.angle = 0

for m in body.data.materials:
    if m and m.use_nodes:
        b = m.node_tree.nodes.get('Principled BSDF')
        if b:
            b.inputs['Metallic'].default_value = 0.0
            b.inputs['Roughness'].default_value = 0.7

# --- render settings: the owl's look ---------------------------------------
scene.render.engine = 'CYCLES' if ENGINE == 'cycles' else 'BLENDER_EEVEE_NEXT'
if ENGINE == 'cycles':
    scene.cycles.device = 'CPU'
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
else:
    scene.eevee.taa_render_samples = max(16, SAMPLES)
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.exposure = 0.35
scene.render.resolution_x = SIZE
scene.render.resolution_y = SIZE

world = bpy.data.worlds.new('w')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.6, 0.75, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35


def sun(name, direction, energy, color):
    light = bpy.data.lights.new(name, 'SUN')
    light.energy = energy
    light.color = color
    light.angle = math.radians(14)
    obj = bpy.data.objects.new(name, light)
    scene.collection.objects.link(obj)
    obj.rotation_euler = (-Vector(direction).normalized()).to_track_quat('-Z', 'Y').to_euler()


sun('key', (-1.0, -1.6, 2.4), 3.2, (1, 0.97, 0.92))
sun('fill', (1.8, 0.5, 1.0), 1.1, (0.82, 0.88, 1.0))
sun('rim', (0.4, 1.6, 0.8), 1.6, (1.0, 0.8, 0.55))

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = 'ORTHO'
cam.data.ortho_scale = 1.55
elev = math.atan(0.5)
d = 10.0
target = Vector((0, 0, 0.45))
cam.location = target + Vector((d * math.cos(elev) / math.sqrt(2), -d * math.cos(elev) / math.sqrt(2), d * math.sin(elev)))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()

# --- motion tables ----------------------------------------------------------
TAU = math.pi * 2


def pose(motion, clip, u):
    """Object transform for one frame: (loc, rot, scale, bend angle)."""
    loc = [0.0, 0.0, 0.0]
    rot = [0.0, 0.0, 0.0]
    scl = [1.0, 1.0, 1.0]
    ang = 0.0
    walking = clip == 'walk'
    s = math.sin(TAU * u)
    s2 = math.sin(TAU * u * 2)

    if motion == 'hover' or motion == 'float':
        loc[2] = 0.05 + (0.06 if walking else 0.04) * s
        rot[1] = math.radians(5 if walking else 3) * math.sin(TAU * u * 0.5)
        scl[2] = 1 + 0.03 * s2
        ang = math.radians(6 if walking else 3) * s
        if walking:
            rot[0] = math.radians(-6)
    elif motion == 'flap':
        loc[2] = 0.05 + 0.05 * abs(math.sin(TAU * u * (3 if walking else 2)))
        rot[0] = math.radians(8) * s2
        rot[1] = math.radians(6 if walking else 3) * s
    elif motion == 'waddle':
        rot[1] = math.radians(8 if walking else 3) * s
        scl[1] = 1 - (0.04 if walking else 0.02) * abs(s)
        scl[0] = 1 + (0.03 if walking else 0.015) * abs(s)
        loc[2] = 0.02 * abs(s) if walking else 0
    elif motion == 'bounce':
        hop = abs(math.sin(TAU * u))
        loc[2] = (0.10 if walking else 0.02) * hop
        scl[2] = 1 + (0.08 if walking else 0.03) * hop
        scl[0] = scl[1] = 1 - (0.05 if walking else 0.02) * hop
    elif motion == 'skitter':
        loc[0] = (0.015 if walking else 0.005) * math.sin(TAU * u * 3)
        loc[2] = (0.012 if walking else 0.006) * abs(math.sin(TAU * u * 4))
        rot[2] = math.radians(4 if walking else 2) * s2
    elif motion == 'scurry':
        loc[2] = 0.03 * abs(math.sin(TAU * u * 3)) if walking else 0.01 * s
        rot[0] = math.radians(-8 if walking else -2)
        rot[1] = math.radians(3) * s2
    elif motion == 'glide':
        loc[2] = 0.03 + 0.02 * math.sin(TAU * u * 0.8)
        scl[0] = 1 + 0.02 * math.sin(TAU * u * 0.7)
        ang = math.radians(10 if walking else 6) * s
        if walking:
            rot[0] = math.radians(-3)
    else:   # shamble
        rot[1] = math.radians(6 if walking else 2) * s
        rot[2] = math.radians(4) * s2 if walking else 0
        scl[2] = 1 + (0.03 if walking else 0.015) * s2
        loc[2] = 0.03 * abs(s) if walking else 0
        if walking:
            rot[0] = math.radians(-4)

    if clip == 'attack':
        # wind up, snap forward, settle; the game supplies the travel
        if u < 0.34:
            t = u / 0.34
            rot[0] += math.radians(10) * t
            scl[2] *= 1 - 0.06 * t
        elif u < 0.67:
            t = (u - 0.34) / 0.33
            rot[0] += math.radians(10 - 28 * t)
            scl[2] *= 0.94 + 0.18 * t
            scl[0] *= 1 - 0.05 * t
            loc[2] += 0.05 * t
        else:
            t = (u - 0.67) / 0.33
            rot[0] += math.radians(-18 + 18 * t)
            scl[2] *= 1.12 - 0.12 * t
            loc[2] += 0.05 * (1 - t)
    elif clip == 'hit':
        # recoil and shiver, ending exactly on the idle pose
        t = min(1.0, u / 0.85)
        f = math.sin(math.pi * t)
        rot[0] += math.radians(12) * f
        rot[1] += math.radians(6) * math.sin(TAU * u * 3) * (1 - t)
        scl[2] *= 1 - 0.08 * f

    return loc, rot, scl, ang


FACINGS = {'front': 0.0, 'back': math.pi}
pivot_world = Vector((0, 0, 0))
pivot = None

for facing, base in FACINGS.items():
    for clip, count in CLIPS.items():
        for i in range(count):
            u = i / float(count)
            loc, rot, scl, ang = pose(MOTION, clip, u)
            body.location = Vector(loc)
            body.rotation_euler = (rot[0], rot[1], base + YAW + rot[2])
            body.scale = Vector(scl)
            if bend:
                bend.angle = ang
            bpy.context.view_layer.update()
            scene.render.filepath = os.path.join(OUT, '%s_%s_%d.png' % (facing, clip, i))
            bpy.ops.render.render(write_still=True)
            if pivot is None:
                v = world_to_camera_view(scene, cam, pivot_world)
                pivot = {'x': round(v.x, 4), 'y': round(1 - v.y, 4)}
            print('  %s %s %d' % (facing, clip, i), flush=True)

json.dump({'size': SIZE, 'pivot': pivot, 'clips': CLIPS, 'facings': list(FACINGS.keys()), 'motion': MOTION},
          open(os.path.join(OUT, 'pivot.json'), 'w'))
print('wrote', OUT)
