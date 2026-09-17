import bpy, sys, math
argv = sys.argv[sys.argv.index('--') + 1:]
out = argv[0]
scene = bpy.context.scene
rig = bpy.data.objects['OwlRig']
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'TEXTURE'
scene.render.resolution_x = 300; scene.render.resolution_y = 300
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 1.3
views = {'front': ((0.05, -3, -0.02), (math.radians(90), 0, 0)), 'side': ((3, 0, -0.02), (math.radians(90), 0, math.radians(90)))}
plan = {'Idle': [0, 12, 36], 'Walk': [0, 5, 10, 15], 'Flap': [0, 4, 8], 'Attack': [0, 5, 8]}
tracks = rig.animation_data.nla_tracks
for act, frames in plan.items():
    for t in tracks: t.mute = (t.name != act)
    for f in frames:
        scene.frame_set(f)
        for v, (loc, rot) in views.items():
            cam.location = loc; cam.rotation_euler = rot
            scene.render.filepath = '%s_%s_%02d_%s.png' % (out, act, f, v)
            bpy.ops.render.render(write_still=True)
