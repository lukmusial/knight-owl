"""Rig and animate the TRELLIS owl knight, export a GLB for three.js.
Blender coordinates: Z up, owl faces -Y, owl's right (sword) is -X."""
import bpy, bmesh, sys, math, mathutils
from mathutils import Vector, Quaternion

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = argv[0], argv[1]
DECIMATE = float(argv[2]) if len(argv) > 2 else 0.5

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
mesh = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
# bake the import transform so vertex coords are world coords
bpy.context.view_layer.objects.active = mesh
for o in list(bpy.context.scene.objects):
    o.select_set(o == mesh)
if mesh.parent:
    mw = mesh.matrix_world.copy(); mesh.parent = None; mesh.matrix_world = mw
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.context.scene.objects):
    if o != mesh: bpy.data.objects.remove(o, do_unlink=True)
mesh.name = 'MrOwl'

# smooth shading (TRELLIS meshes come flat-shaded; facets show up close behind the owl)
for p in mesh.data.polygons: p.use_smooth = True
if DECIMATE < 1:
    mod = mesh.modifiers.new('dec', 'DECIMATE'); mod.ratio = DECIMATE
    bpy.ops.object.modifier_apply(modifier='dec')

# --- skeleton -------------------------------------------------------------
BONES = {
    # name: (head, tail, parent)
    'root':   ((0.05, 0.02, -0.49), (0.05, 0.02, -0.40), None),
    'hips':   ((0.05, 0.02, -0.36), (0.05, 0.02, -0.20), 'root'),
    'spine':  ((0.05, 0.02, -0.20), (0.05, 0.01, -0.06), 'hips'),
    'head':   ((0.05, 0.01, -0.06), (0.05, 0.01, 0.30), 'spine'),
    'leg.R':  ((-0.05, 0.02, -0.32), (-0.05, 0.01, -0.45), 'hips'),
    'foot.R': ((-0.05, 0.01, -0.45), (-0.05, -0.08, -0.48), 'leg.R'),
    'leg.L':  ((0.16, 0.02, -0.32), (0.16, 0.01, -0.45), 'hips'),
    'foot.L': ((0.16, 0.01, -0.45), (0.16, -0.08, -0.48), 'leg.L'),
    'arm.R':  ((-0.09, 0.01, -0.10), (-0.20, -0.03, -0.21), 'spine'),
    'hand.R': ((-0.20, -0.03, -0.21), (-0.27, -0.05, -0.25), 'arm.R'),
    'arm.L':  ((0.17, 0.01, -0.10), (0.24, -0.06, -0.19), 'spine'),
    'hand.L': ((0.24, -0.06, -0.19), (0.29, -0.12, -0.24), 'arm.L'),
    'tail':   ((0.05, 0.14, -0.30), (0.05, 0.24, -0.42), 'hips'),
}
arm_data = bpy.data.armatures.new('OwlRig')
rig = bpy.data.objects.new('OwlRig', arm_data)
bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
for name, (h, t, p) in BONES.items():
    b = arm_data.edit_bones.new(name); b.head = h; b.tail = t
for name, (h, t, p) in BONES.items():
    if p: arm_data.edit_bones[name].parent = arm_data.edit_bones[p]
bpy.ops.object.mode_set(mode='OBJECT')

# --- skin weights (region gated, distance falloff) -------------------------
def seg_dist(p, a, b):
    a, b = Vector(a), Vector(b); ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length

groups = {n: mesh.vertex_groups.new(name=n) for n in BONES if n != 'root'}
stats = {n: 0 for n in groups}
for v in mesh.data.vertices:
    p = v.co
    x, y, z = p
    # rigid props: sword (+ gripping wing-hand) and shield
    if x < -0.17 and z < 0.15 and (z > -0.345 or x < -0.235):  # sword + wing-hand, not the hip feather tuft
        groups['hand.R'].add([v.index], 1.0, 'REPLACE'); stats['hand.R'] += 1; continue
    if x > 0.13 and y < -0.12 and z < -0.045:
        groups['hand.L'].add([v.index], 1.0, 'REPLACE'); stats['hand.L'] += 1; continue
    allowed = ['hips', 'spine', 'head']
    if z < -0.28: allowed += ['leg.R', 'foot.R', 'leg.L', 'foot.L']
    if x < -0.11 and -0.32 < z < 0.0: allowed += ['arm.R', 'hand.R']
    if x > 0.20 and -0.32 < z < 0.0: allowed += ['arm.L', 'hand.L']
    if y > 0.10 and z < -0.25: allowed += ['tail']
    if z > -0.02: allowed = ['head']
    elif z > -0.10: allowed = [a for a in allowed if a in ('head', 'spine', 'arm.R', 'arm.L')]
    w = []
    for n in allowed:
        h, t, _ = BONES[n]
        d = seg_dist(p, h, t)
        # legs: side of the body decides which leg
        if n.endswith('.R') and n[:3] in ('leg', 'foo') and x > 0.07: continue
        if n.endswith('.L') and n[:3] in ('leg', 'foo') and x < 0.03: continue
        w.append((1.0 / (d + 0.015) ** 4, n))
    w.sort(reverse=True); w = w[:3]
    s = sum(a for a, _ in w)
    for a, n in w:
        groups[n].add([v.index], a / s, 'REPLACE'); stats[n] += 1
print('WEIGHTS', stats)

# Faces that bridge a rigid prop (sword/shield) to the body with a long edge are
# reconstruction webbing; they stretch into sticks once the wings move
rigid = {}
gi = {g.index: g.name for g in mesh.vertex_groups}
for v in mesh.data.vertices:
    for g in v.groups:
        if gi[g.group] in ('hand.R', 'hand.L') and g.weight > 0.99:
            rigid[v.index] = gi[g.group]
bm = bmesh.new(); bm.from_mesh(mesh.data); bm.verts.ensure_lookup_table()
kill = []
for f in bm.faces:
    owners = set(rigid.get(v.index, 'body') for v in f.verts)
    if len(owners) > 1:
        longest = max(e.calc_length() for e in f.edges)
        if longest > 0.035:
            kill.append(f)
bmesh.ops.delete(bm, geom=kill, context='FACES_ONLY')
bm.to_mesh(mesh.data); bm.free()
print('BRIDGES_REMOVED', len(kill))

mesh.parent = rig
mod = mesh.modifiers.new('Armature', 'ARMATURE'); mod.object = rig

# --- animation helpers -----------------------------------------------------
FPS = 24
bpy.context.scene.render.fps = FPS
pb = rig.pose.bones
for b in pb: b.rotation_mode = 'QUATERNION'

def local_axis(name, world_axis):
    m = rig.data.bones[name].matrix_local.to_3x3()
    return (m.inverted() @ Vector(world_axis)).normalized()

def key_rot(name, frame, world_axis, deg, extra=None):
    q = Quaternion(local_axis(name, world_axis), math.radians(deg))
    if extra: q = q @ Quaternion(local_axis(name, extra[0]), math.radians(extra[1]))
    pb[name].rotation_quaternion = q
    pb[name].keyframe_insert('rotation_quaternion', frame=frame)

def key_loc(name, frame, world_offset):
    m = rig.data.bones[name].matrix_local.to_3x3()
    pb[name].location = m.inverted() @ Vector(world_offset)
    pb[name].keyframe_insert('location', frame=frame)

def new_action(name):
    for b in pb:
        b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
    act = bpy.data.actions.new(name)
    rig.animation_data_create(); rig.animation_data.action = act
    return act

def finish(act, length):
    for fc in act.fcurves:
        for k in fc.keyframe_points: k.interpolation = 'BEZIER'
    act.frame_range = (0, length)
    act.use_frame_range = True
    tr = rig.animation_data.nla_tracks.new(); tr.name = act.name
    st = tr.strips.new(act.name, 0, act); st.name = act.name
    rig.animation_data.action = None

X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)
# forward swing of a leg = rotation about world X (toes toward -Y): negative angle
# --- Idle (2 s) ---
act = new_action('Idle')
for f, s in [(0, 0), (12, 1), (24, 0), (36, -1), (48, 0)]:
    key_loc('hips', f, (0, 0, -0.006 * abs(s)))
    key_rot('spine', f, X, 2.5 * s)
    key_rot('head', f, Y, 4 * s, (X, -2 * abs(s)))
    key_rot('arm.R', f, Y, -3 * s)
    key_rot('arm.L', f, Y, 3 * s)
    key_rot('tail', f, Z, 6 * s)
finish(act, 48)

# --- Walk (20 frames, one full stride) ---
act = new_action('Walk')
for f in range(0, 21, 5):
    ph = f / 20 * 2 * math.pi
    s = math.sin(ph); c = math.cos(ph)
    key_rot('leg.R', f, X, -30 * s)
    key_rot('foot.R', f, X, 20 * max(0, s))
    key_rot('leg.L', f, X, 30 * s)
    key_rot('foot.L', f, X, -20 * min(0, s))
    key_loc('hips', f, (0, 0, 0.018 * abs(c) - 0.01))
    key_rot('hips', f, Y, 5 * s)
    key_rot('spine', f, Z, -6 * s, (X, 4))
    key_rot('head', f, Z, 5 * s)
    # wings swing against the legs and lift a little on each step
    key_rot('arm.R', f, X, 18 * s, (Y, 28 * abs(c)))
    key_rot('arm.L', f, X, -18 * s, (Y, -28 * abs(c)))
    key_rot('tail', f, Z, -10 * s)
finish(act, 20)

# --- Flap (16 frames, two wing beats: arms spread up and down) ---
act = new_action('Flap')
for f, up in [(0, 0), (4, 1), (8, 0.1), (12, 1), (16, 0)]:
    # right wing is on -X: a positive turn about +Y lifts it; the hands stay
    # rigid with the wings so the sword and shield never shear off
    key_rot('arm.R', f, Y, 55 * up, (X, -10 * up))
    key_rot('arm.L', f, Y, -55 * up, (X, -10 * up))
    key_loc('root', f, (0, 0, 0.05 * up))
    key_rot('leg.R', f, X, 15 * up)
    key_rot('leg.L', f, X, 15 * up)
    key_rot('tail', f, X, -20 * up)
finish(act, 16)

# --- Attack (14 frames, sword chop) ---
act = new_action('Attack')
for f, a, b in [(0, 0, 0), (5, 1, 0), (8, 0, 1), (14, 0, 0)]:
    key_rot('arm.R', f, X, -70 * a + 45 * b, (Y, 25 * a))
    key_rot('spine', f, Z, 12 * a - 15 * b)
    key_rot('arm.L', f, X, -15 * b)
finish(act, 14)

# --- textures down to phone size ----------------------------------------------
for img in bpy.data.images:
    if img.size[0] > 1024:
        img.scale(1024, 1024)

bpy.ops.object.select_all(action='SELECT')
tris = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
print('TRIS', tris)
bpy.ops.export_scene.gltf(
    filepath=OUT, export_format='GLB', use_selection=True,
    export_animations=True, export_animation_mode='NLA_TRACKS',
    export_skins=True, export_image_format='JPEG', export_jpeg_quality=85,
    export_apply=False, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT.replace('.glb', '.blend'))
print('EXPORTED', OUT)
