"""Model a wall torch in Blender and render it for the isometric view.

    blender -b --python render_torch.py -- <out.png> [px]

Iron wall plate, curved bracket arm with a ring, tapered wooden handle and a
pitch-soaked cloth wrap. Camera: orthographic 2:1 dimetric like the tiles.
The torch hangs on a wall facing the viewer's down-left (an 'n' wall in the
isometric grid); the game mirrors it for 'w' walls. Writes <out>.json with
the wall mount point and the top of the wrap (where the flame sits) as
fractions of the image.
"""
import bpy, bmesh, sys, math, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]
PX = int(argv[1]) if len(argv) > 1 else 160

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, color, metal=0.0, rough=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = color + (1,)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    return m


IRON = mat('iron', (0.09, 0.09, 0.1), 0.8, 0.45)
IRON_EDGE = mat('iron_edge', (0.22, 0.2, 0.19), 0.9, 0.35)
WOOD = mat('wood', (0.33, 0.18, 0.08), 0.0, 0.7)
CLOTH = mat('cloth', (0.45, 0.34, 0.2), 0.0, 0.9)
PITCH = mat('pitch', (0.03, 0.02, 0.018), 0.0, 0.85)


def add(obj, m):
    obj.data.materials.append(m)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


# The wall runs along X at y=0 and faces -Y (toward the camera side).
# Wall plate: hexagonal iron plate with rivets
bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.075, depth=0.02, location=(0, -0.01, 0.0),
                                    rotation=(math.radians(90), 0, math.radians(30)))
plate = add(bpy.context.object, IRON)
bev = plate.modifiers.new('bevel', 'BEVEL')
bev.width = 0.006
bev.segments = 2
for dx, dz in [(-0.04, 0.035), (0.04, 0.035), (0, -0.05)]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.011, location=(dx, -0.022, dz))
    add(bpy.context.object, IRON_EDGE)

# Curved arm from the plate out to the ring
curve = bpy.data.curves.new('arm', 'CURVE')
curve.dimensions = '3D'
curve.bevel_depth = 0.012
curve.bevel_resolution = 3
sp = curve.splines.new('BEZIER')
sp.bezier_points.add(2)
for bp, co in zip(sp.bezier_points, [(0, -0.02, -0.02), (0, -0.09, -0.07), (0, -0.16, -0.02)]):
    bp.co = co
    bp.handle_left_type = bp.handle_right_type = 'AUTO'
arm = bpy.data.objects.new('arm', curve)
scene.collection.objects.link(arm)
arm.data.materials.append(IRON)

# Ring holding the handle
bpy.ops.mesh.primitive_torus_add(major_radius=0.034, minor_radius=0.009, location=(0, -0.17, 0.0))
ring = add(bpy.context.object, IRON_EDGE)
ring.rotation_euler = (math.radians(22), 0, 0)

# Handle: tapered wooden cylinder tilted away from the wall
tilt = math.radians(22)
axis = Vector((0, -math.sin(tilt), math.cos(tilt)))
base = Vector((0, -0.10, -0.17))   # passes through the ring at (0, -0.17, 0)
L = 0.36
bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.02, radius2=0.03, depth=L,
                                location=base + axis * (L / 2), rotation=(tilt, 0, 0))
add(bpy.context.object, WOOD)

# Wrap: lumpy cloth cylinder with a dark pitch cap and two cords
top = base + axis * L
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.05, depth=0.11, location=top + axis * 0.03, rotation=(tilt, 0, 0))
wrap = add(bpy.context.object, CLOTH)
bm = bmesh.new()
bm.from_mesh(wrap.data)
for v in bm.verts:
    a = math.atan2(v.co.y, v.co.x)
    k = 1 + 0.12 * math.sin(a * 5 + v.co.z * 60)
    v.co.x *= k
    v.co.y *= k
bm.to_mesh(wrap.data)
bm.free()
wrap.modifiers.new('subsurf', 'SUBSURF').levels = 1
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.052, location=top + axis * 0.085)
cap = add(bpy.context.object, PITCH)
cap.scale = (1, 1, 0.55)
cap.rotation_euler = (tilt, 0, 0)
for k in (-0.03, 0.02):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.054, minor_radius=0.006, location=top + axis * (0.03 + k), rotation=(tilt, 0, 0))
    add(bpy.context.object, IRON_EDGE)

flame_anchor = top + axis * 0.11

# Lights: warm point light where the flame burns, soft fill from the camera side
key = bpy.data.objects.new('flame', bpy.data.lights.new('flame', 'POINT'))
key.data.energy = 5
key.data.color = (1.0, 0.62, 0.3)
key.data.shadow_soft_size = 0.05
key.location = flame_anchor + Vector((0, -0.04, 0.12))
scene.collection.objects.link(key)
fill = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'SUN'))
fill.data.energy = 2.2
fill.rotation_euler = (-Vector((0.6, -1.0, 0.8))).to_track_quat('-Z', 'Y').to_euler()
scene.collection.objects.link(fill)
world = bpy.data.worlds.new('w')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[1].default_value = 0.35

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = 'ORTHO'
cam.data.ortho_scale = 0.62
elev = math.atan(0.5)
target = Vector((0, -0.14, 0.07))
d = 5
cam.location = target + Vector((d * math.cos(elev) / math.sqrt(2), -d * math.cos(elev) / math.sqrt(2), d * math.sin(elev)))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 48
scene.render.film_transparent = True
scene.render.resolution_x = PX
scene.render.resolution_y = PX
scene.view_settings.view_transform = 'Standard'
scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)


def frac(p):
    v = world_to_camera_view(scene, cam, p)
    return {'x': round(v.x, 4), 'y': round(1 - v.y, 4)}


meta = {'size': PX, 'mount': frac(Vector((0, 0, 0))), 'flame': frac(flame_anchor)}
json.dump(meta, open(OUT[:-4] + '.json', 'w'))
print('TORCH', meta)
