#!/bin/bash
# master.sh <raw.mp4> <final.mp4> : two-pass loudnorm (-16 LUFS, -1.5 dBTP), x264 CRF 20 (keeps 11-12 min under 400 MB),
# then a freeze report (static >= 2.5 s) and a 16-frame contact sheet next to the output.
set -e
in=$1; out=$2
J=$(ffmpeg -hide_banner -i "$in" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$in" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -movflags +faststart "$out"
ffmpeg -hide_banner -i "$out" -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
ls -la "$out"
echo "freezes >= 2.5 s (start, duration):"
ffmpeg -hide_banner -i "$out" -vf "scale=480:-1,freezedetect=n=0.003:d=2.5" -map 0:v -f null - 2>&1 | grep -oE "freeze_(start|duration): [0-9.]+" | paste - - || true
ffmpeg -v error -y -i "$out" -vf "fps=1/43,scale=480:-1,tile=4x4:padding=4:color=white" -frames:v 1 "${out%.mp4}_sheet.jpg"
echo "${out%.mp4}_sheet.jpg"
