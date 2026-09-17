"""Prepare a TRELLIS monster mesh for the first-person view (headless Blender).

    blender -b --python prepare.py -- <in.glb> <out.glb> [target_tris] [texture_px] [gap]

Bakes the import transform, centres the model on its footprint with the base
at y=0 (so the game only scales it), decimates to ~target_tris with smooth
shading, sets a non-metallic material (glTF defaults to full metal), shrinks
the texture and exports a JPEG-textured GLB. The model keeps TRELLIS's
orientation: facing +Z in glTF, which the game turns toward the player.
"""
import bpy, sys, mathutils

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = argv[0], argv[1]
TARGET = int(argv[2]) if len(argv) > 2 else 9000
TEX = int(argv[3]) if len(argv) > 3 else 512

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in bpy.context.scene.objects:
    o.select_set(o in meshes)
bpy.context.view_layer.objects.active = meshes[0]
for o in meshes:
    if o.parent:
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
if len(meshes) > 1:
    bpy.ops.object.join()
mesh = bpy.context.view_layer.objects.active
for o in list(bpy.context.scene.objects):
    if o != mesh: bpy.data.objects.remove(o, do_unlink=True)

# Drop loose pieces floating free of the figure (stray paint blobs the
# generator turned into geometry). TRELLIS meshes consist of many touching
# islands, so islands closer than TOUCH are merged into clusters first; any
# cluster other than the biggest that holds under MAX_SHARE of the vertices
# and stays further than GAP from the biggest one is removed.
GAP = float(argv[4]) if len(argv) > 4 else 0.03
TOUCH, MAX_SHARE = 0.006, 0.12
import bmesh
from mathutils import kdtree
bm = bmesh.new(); bm.from_mesh(mesh.data); bm.verts.ensure_lookup_table()
n = len(bm.verts)
island = [-1] * n
count = 0
for v in bm.verts:
    if island[v.index] != -1: continue
    stack = [v]; island[v.index] = count
    while stack:
        cur = stack.pop()
        for e in cur.link_edges:
            o = e.other_vert(cur)
            if island[o.index] == -1:
                island[o.index] = count; stack.append(o)
    count += 1
co = [v.co.copy() for v in bm.verts]
lo = mathutils.Vector((min(c.x for c in co), min(c.y for c in co), min(c.z for c in co)))
hi = mathutils.Vector((max(c.x for c in co), max(c.y for c in co), max(c.z for c in co)))
size = max(hi - lo)
tree = kdtree.KDTree(n)
for i, c in enumerate(co): tree.insert(c, i)
tree.balance()
parent = list(range(count))
def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]; a = parent[a]
    return a
for i in range(0, n, 3):
    for (_, j, _) in tree.find_range(co[i], TOUCH * size):
        a, b2 = find(island[i]), find(island[j])
        if a != b2: parent[a] = b2
cluster = [find(island[i]) for i in range(n)]
sizes = {}
for c in cluster: sizes[c] = sizes.get(c, 0) + 1
main = max(sizes, key=sizes.get)
main_tree = kdtree.KDTree(sizes[main])
k = 0
for i in range(n):
    if cluster[i] == main: main_tree.insert(co[i], i); k += 1
main_tree.balance()
doomed = []
for c, cnt in sizes.items():
    if c == main or cnt > MAX_SHARE * n: continue
    members = [i for i in range(n) if cluster[i] == c]
    nearest = min(main_tree.find(co[i])[2] for i in members[::max(1, len(members) // 60)])
    if nearest > GAP * size:
        doomed.extend(members)
bmesh.ops.delete(bm, geom=[bm.verts[i] for i in doomed], context='VERTS')
bm.to_mesh(mesh.data); bm.free()
print('LOOSE_REMOVED', len(doomed), 'verts of', n, 'clusters', len(sizes))

for p in mesh.data.polygons: p.use_smooth = True
tris = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
if tris > TARGET:
    mod = mesh.modifiers.new('dec', 'DECIMATE'); mod.ratio = TARGET / tris
    bpy.ops.object.modifier_apply(modifier='dec')

# base on the floor, centred on the footprint (Blender Z up)
vs = [mesh.matrix_world @ v.co for v in mesh.data.vertices]
mn = mathutils.Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
mx = mathutils.Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
shift = mathutils.Vector((-(mn.x + mx.x) / 2, -(mn.y + mx.y) / 2, -mn.z))
for v in mesh.data.vertices: v.co += shift

for m in mesh.data.materials:
    if m.use_nodes:
        b = m.node_tree.nodes.get('Principled BSDF')
        if b:
            b.inputs['Metallic'].default_value = 0.0
            b.inputs['Roughness'].default_value = 0.75
for img in bpy.data.images:
    if img.size[0] > TEX:
        img.scale(TEX, TEX)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True,
                          export_image_format='JPEG', export_jpeg_quality=85, export_yup=True)
tris = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
print('PREPARED', OUT, 'tris', tris, 'size', tuple(round(x, 3) for x in (mx - mn)))
