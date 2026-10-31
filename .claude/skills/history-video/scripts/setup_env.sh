#!/bin/bash
# One-time per container: Python envs for narration (qwen) and timing (tts), in $SCRATCH (default /tmp/history-video).
# qw: qwen-tts + faster-whisper + librosa (~6 GB with CUDA torch; the model downloads ~4.3 GB to ~/.cache/huggingface).
# tts: faster-whisper + soundfile + numpy for timing and checks. Frees pip cache afterwards (disk is tight).
set -e
S=${SCRATCH:-/tmp/history-video}; mkdir -p "$S"
[ -x "$S/qw/bin/python" ] || { python3 -m venv "$S/qw"; "$S/qw/bin/pip" install -q --no-cache-dir qwen-tts faster-whisper librosa soundfile; }
[ -x "$S/tts/bin/python" ] || { python3 -m venv "$S/tts"; "$S/tts/bin/pip" install -q --no-cache-dir faster-whisper soundfile numpy gdown; }
rm -rf ~/.cache/pip
which fluidsynth >/dev/null || echo "note: fluidsynth missing (only needed to re-compose music): apt-get install -y fluidsynth fluid-soundfont-gm"
echo "QW=$S/qw/bin/python"; echo "TTS=$S/tts/bin/python"
df -h / | tail -1
