"""Render the rigged Mr Owl (mr_owl.blend from rig.py) as isometric sprite frames.

    blender -b mr_owl.blend --python render_iso.py -- <out_dir> [size] [facings]

Camera: orthographic, 2:1 dimetric (elevation atan(1/2)) like the isometric
view's 128x64 tiles. Five facings are rendered - down, down_right, right,
up_right and up - and the game mirrors them for the other three, so Mr Owl
faces whichever of the eight screen directions he is walking in.
Clips: Walk (8 frames over one stride) and Idle (6 frames over the breath loop).
Writes <facing>_<clip>_<n>.png plus pivot.json (feet position as a fraction of
the frame) for pack_sprites.py.
"""
import bpy, sys, math, json, os
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]
SIZE = int(argv[1]) if len(argv) > 1 else 192
os.makedirs(OUT, exist_ok=True)

scene = bpy.context.scene
rig = bpy.data.objects['OwlRig']
owl = bpy.data.objects['MrOwl']

# materials: the TRELLIS texture with a little sheen on the armour
for m in owl.data.materials:
    if m.use_nodes:
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            bsdf.inputs['Metallic'].default_value = 0.25
            bsdf.inputs['Roughness'].default_value = 0.55

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = SIZE
scene.render.resolution_y = SIZE
scene.view_settings.view_transform = 'Standard'

world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs[1].default_value = 0.9

def aim(obj, from_pos):
    # sun lights shine along their local -Z: point it from `from_pos` toward the owl
    obj.rotation_euler = (-Vector(from_pos)).to_track_quat('-Z', 'Y').to_euler()

sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
sun.data.energy = 4.0
aim(sun, (1.0, -2.0, 2.6))          # key light from the camera side, above
scene.collection.objects.link(sun)
fill = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'SUN'))
fill.data.energy = 1.4
aim(fill, (-2.0, -0.5, 1.0))        # soft fill from the left
scene.collection.objects.link(fill)
rim = bpy.data.objects.new('rim', bpy.data.lights.new('rim', 'SUN'))
rim.data.energy = 1.5
aim(rim, (0.5, 2.0, 1.5))           # warm rim from behind (torchlight)
rim.data.color = (1.0, 0.8, 0.55)
scene.collection.objects.link(rim)
scene.view_settings.exposure = 0.35

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = 'ORTHO'
cam.data.ortho_scale = 1.2
elev = math.atan(0.5)
target = Vector((0.05, 0.02, -0.04))
d = 10
cam.location = target + Vector((d * math.cos(elev) / math.sqrt(2), -d * math.cos(elev) / math.sqrt(2), d * math.sin(elev)))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()

tracks = rig.animation_data.nla_tracks
# Mr Owl faces -Y at rotation 0, which this camera shows as down-left. Turning
# him in 45 degree steps gives the eight screen directions; three of them are
# the mirror image of another, so only five are rendered.
ALL_FACINGS = {
    'down_left': 0.0,
    'down': math.pi * 0.25,
    'down_right': math.pi * 0.5,
    'right': math.pi * 0.75,
    'up_right': math.pi,
    'up': math.pi * 1.25,
    'up_left': math.pi * 1.5,
    'left': math.pi * 1.75,
}
want = argv[2].split(',') if len(argv) > 2 else ['down', 'down_right', 'right', 'up_right', 'up']
FACINGS = dict((n, ALL_FACINGS[n]) for n in want)
CLIPS = {'Walk': (20, 8), 'Idle': (48, 6)}

scene.frame_set(0)
feet = world_to_camera_view(scene, cam, Vector((0.05, -0.02, -0.49)))
pivot = {'x': round(feet.x, 4), 'y': round(1 - feet.y, 4)}

for facing, rot in FACINGS.items():
    rig.rotation_mode = 'XYZ'
    rig.rotation_euler = (0, 0, rot)
    for clip, (length, count) in CLIPS.items():
        for t in tracks: t.mute = (t.name != clip)
        for i in range(count):
            scene.frame_set(int(round(i * length / count)))
            scene.render.filepath = os.path.join(OUT, '%s_%s_%d.png' % (facing, clip.lower(), i))
            bpy.ops.render.render(write_still=True)

with open(os.path.join(OUT, 'pivot.json'), 'w') as f:
    json.dump({'size': SIZE, 'pivot': pivot, 'clips': {c.lower(): n for c, (l, n) in CLIPS.items()}, 'facings': list(FACINGS)}, f)
print('PIVOT', pivot)
