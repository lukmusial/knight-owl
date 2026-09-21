#!/bin/bash
# Render the encounter-card sprite sheets: every monster with a prepared model,
# seen almost head on (the card shows a painted room, not the isometric map)
# and at more than twice the map sheet's resolution - the map draws a monster
# a few dozen pixels tall, the card fills half the picture with it.
#
#   ./render_cards.sh [engine] [id,id,...]      engine: eevee (default) | cycles
#
# Only the combinations the card plays are rendered (idle in every facing, so
# the figure can turn round, but the full loop only facing the player; attack
# and hit facing the player; walk with its back turned as it leaves).
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENGINE="${1:-eevee}"
ONLY="${2:-}"
PY="$ROOT/tools/art/.venv/bin/python"
MODELS="$ROOT/www/assets/proto/fp/monsters"
OUT="$ROOT/www/assets/proto/card"
SIZE="${SIZE:-448}"
ELEV="${ELEV:-12}"
EXPOSURE="${EXPOSURE:-0.5}"
CONTRAST="${CONTRAST:-1}"
# The card shows a monster ten times the size the map does, so it is rendered
# from a finely prepared copy of the mesh (60k triangles, 1024 px texture)
# rather than from the 9k/512 px model the game downloads.
HI="/tmp/cardmodels"
mkdir -p "$OUT" "$HI"

# id:motion:yaw - motion is a render_monster_iso.py motion (CemMonsters.MOTION's
# names plus flap and scurry); yaw turns a model whose front is off-axis toward
# the camera, and has to match render_all.sh for the monsters in both
SPECS="
goblin:waddle:0 giant_rat:scurry:0 slime:bounce:180 bat_swarm:flap:0 zombie:shamble:0
mimic:bounce:0 wolf:scurry:-45 giant_snake:glide:-30 vampire_bunny:bounce:-60
hobgoblin:waddle:0 skeleton:shamble:0 spider:skitter:0 ghost:hover:-45 orc:waddle:0
skeleton_king:shamble:0 skeleton_queen:glide:0 lost_soul:hover:90 demilich:hover:0
dwarf:waddle:0 beholder:hover:0 gog:bounce:0
troll:shamble:0 golem:shamble:0 dark_knight:shamble:0 witch:waddle:0 lich:glide:0
spirit_of_the_mine:hover:0 vampire_lord:glide:0 frankenstein:shamble:0 minotaur:shamble:0
pumpkin_man:waddle:0 will_o_wisp:hover:0 banshee:hover:0 clown:bounce:0 grim_reaper:glide:0
dragon:flap:0
"

for spec in $SPECS; do
  id="${spec%%:*}"; rest="${spec#*:}"; motion="${rest%%:*}"; yaw="${rest##*:}"
  if [ -n "$ONLY" ] && [[ ",$ONLY," != *",$id,"* ]]; then continue; fi
  glb="$MODELS/$id.glb"
  [ -f "$glb" ] || { echo "skip $id (no model)"; continue; }
  raw="$ROOT/tools/monsters3d/$id.glb"
  # rebuild the fine copy when the generator has produced a newer mesh
  if [ -f "$raw" ] && [ "$raw" -nt "$HI/$id.glb" ]; then rm -f "$HI/$id.glb"; fi
  if [ -f "$raw" ] && [ ! -f "$HI/$id.glb" ]; then
    # how far a piece may float from the body and still belong to the model:
    # the swarm is nothing but separate pieces and the clown holds a balloon
    case "$id" in
      bat_swarm) gap=2.0 ;;
      clown) gap=0.6 ;;
      witch|dark_knight) gap=0.2 ;;     # the cauldron, the sword
      *) gap=0.03 ;;
    esac
    blender -b --python "$ROOT/tools/monsters3d/prepare.py" -- "$raw" "$HI/$id.glb" 60000 1024 "$gap" >/dev/null
  fi
  [ -f "$HI/$id.glb" ] && glb="$HI/$id.glb"
  echo "== $id ($motion)"
  rm -rf "/tmp/cardframes/$id"
  blender -b --python "$ROOT/tools/monsters3d/render_monster_iso.py" -- \
    "$glb" "/tmp/cardframes/$id" --motion "$motion" --yaw "$yaw" --engine "$ENGINE" \
    --size "$SIZE" --elev "$ELEV" --exposure "$EXPOSURE" --contrast "$CONTRAST" \
    --clip-facings 'idle:*,attack:down,hit:down,walk:up' >/dev/null
  # The turn-around only ever shows the first idle frame of the four facings
  # it passes through (MonsterStage.turn); only the facing the fight is played
  # in needs the whole loop. Dropping the rest takes a sheet from 48 frames to
  # 28, about 40% less to download and to decode.
  for f in down_right right up_right up; do rm -f "/tmp/cardframes/$id/${f}_idle_"[1-9].png; done
  "$PY" "$ROOT/tools/owl3d/pack_sprites.py" "/tmp/cardframes/$id" "$OUT/$id" 8 --quant 192
done

ROOT="$ROOT" "$PY" - <<'PYEOF'
import json, os
out = os.path.join(os.environ['ROOT'], 'www/assets/proto/card')
ids = sorted(f[:-5] for f in os.listdir(out) if f.endswith('.json') and f != 'index.json')
json.dump({'monsters': ids}, open(os.path.join(out, 'index.json'), 'w'), indent=1)
print('index:', ids)
PYEOF
