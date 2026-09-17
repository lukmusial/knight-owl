import bpy, sys, math, mathutils
argv = sys.argv[sys.argv.index('--') + 1:]
src, out = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
mn = mathutils.Vector((1e9,)*3); mx = mathutils.Vector((-1e9,)*3)
tris = 0
for o in meshes:
    tris += sum(len(p.vertices) - 2 for p in o.data.polygons)
    for v in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(v)
        mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
print('MESHES', len(meshes), 'TRIS', tris, 'BBOX', tuple(round(x,3) for x in mn), tuple(round(x,3) for x in mx))
for o in meshes:
    for m in o.data.materials:
        print('MAT', m.name, [n.type for n in m.node_tree.nodes] if m.use_nodes else '')
c = (mn + mx) / 2; size = max(mx - mn)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'; scene.cycles.samples = 16; scene.cycles.device = 'CPU'
scene.render.resolution_x = 400; scene.render.resolution_y = 400
scene.render.film_transparent = False
world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[1].default_value = 1.2
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = size * 1.15
# glTF import: +Y up in file -> Blender Z up; front of model faces -Y in Blender usually
for name, ang in [('front', 0), ('left', 90), ('back', 180), ('three', 35)]:
    a = math.radians(ang)
    d = size * 3
    cam.location = (c.x + d * math.sin(a), c.y - d * math.cos(a), c.z + size * 0.15)
    direction = c - cam.location
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = out + '_' + name + '.png'
    bpy.ops.render.render(write_still=True)
