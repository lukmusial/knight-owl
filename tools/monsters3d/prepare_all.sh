#!/bin/bash
# Prepare TRELLIS meshes for the game: every <id>.glb in this folder becomes
# www/assets/proto/fp/monsters/<id>.glb (loose blobs dropped, base on the
# floor, centred, decimated, 512 px JPEG texture).
#   ./prepare_all.sh [id,id,...]        default: every glb that has no prepared copy
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HERE="$ROOT/tools/monsters3d"
OUT="$ROOT/www/assets/proto/fp/monsters"
TRIS="${TRIS:-9000}"
TEX="${TEX:-512}"
mkdir -p "$OUT"

if [ -n "$1" ]; then
  ids="${1//,/ }"
else
  ids=""
  for f in "$HERE"/*.glb; do
    id="$(basename "$f" .glb)"
    [ -f "$OUT/$id.glb" ] || ids="$ids $id"
  done
fi

for id in $ids; do
  src="$HERE/$id.glb"
  [ -f "$src" ] || { echo "skip $id (no mesh)"; continue; }
  echo "== $id"
  blender -b --python "$HERE/prepare.py" -- "$src" "$OUT/$id.glb" "$TRIS" "$TEX" >/dev/null
  ls -la "$OUT/$id.glb" | awk '{print "   " $5 " bytes"}'
done
