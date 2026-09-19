#!/bin/bash
# Render and pack every cemetery monster sprite sheet.
#   ./render_all.sh [engine]           engine: eevee (fast, default) or cycles
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENGINE="${1:-eevee}"
PY="$ROOT/tools/art/.venv/bin/python"
OUT="$ROOT/www/assets/proto/iso/monsters"
mkdir -p "$OUT"
# id:motion:yaw (motion names match CemMonsters.MOTION)
for spec in \
  zombie:shamble:0 skeleton:shamble:0 ghost:hover:0 lost_soul:hover:0 banshee:hover:0 \
  pumpkin_man:waddle:0 spider:skitter:0 bat_swarm:flap:0 giant_rat:scurry:0 grim_reaper:glide:0
do
  id="${spec%%:*}"; rest="${spec#*:}"; motion="${rest%%:*}"; yaw="${rest##*:}"
  glb="$ROOT/www/assets/proto/fp/monsters/$id.glb"
  [ -f "$glb" ] || { echo "skip $id (no model)"; continue; }
  echo "== $id ($motion)"
  blender -b --python "$ROOT/tools/monsters3d/render_monster_iso.py" -- \
    "$glb" "/tmp/frames/$id" --motion "$motion" --yaw "$yaw" --engine "$ENGINE" --size 160 >/dev/null
  "$PY" "$ROOT/tools/owl3d/pack_sprites.py" "/tmp/frames/$id" "$OUT/$id" 8 --quant
done
"$PY" - <<'PYEOF'
import json, os
out = os.path.join(os.environ.get('ROOT', '.'), 'www/assets/proto/iso/monsters')
ids = sorted(f[:-5] for f in os.listdir(out) if f.endswith('.json') and f != 'index.json')
json.dump({'monsters': ids}, open(os.path.join(out, 'index.json'), 'w'), indent=1)
print('index:', ids)
PYEOF
