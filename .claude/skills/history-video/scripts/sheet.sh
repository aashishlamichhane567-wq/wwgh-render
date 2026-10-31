#!/bin/bash
# sheet.sh <name> <Comp> <frames...> : render frames and tile them 4 wide into $SCRATCH/<name>.jpg (view it with Read).
# Run from the repo root. SCRATCH defaults to /tmp/history-video.
set -e
S=${SCRATCH:-/tmp/history-video}; name=$1; comp=$2; shift 2
d=$S/st_$name; rm -rf "$d"; mkdir -p "$d"
node "$(dirname "$0")/stills.mjs" "$d" "$comp" "$@" 2>&1 | grep -vE "^\s*$" | tail -2
n=$(ls "$d"/*.jpeg | wc -l); rows=$(( (n + 3) / 4 ))
ffmpeg -v error -y -pattern_type glob -i "$d/*.jpeg" -vf "scale=480:-1,tile=4x${rows}:padding=4:color=white" -frames:v 1 "$S/$name.jpg"
echo "$S/$name.jpg"
