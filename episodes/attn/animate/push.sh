#!/usr/bin/env bash
# Usage: push.sh a b c ...   (shot keys; "all" = every key in motion.json)
# Pushes run.py as a Kaggle GPU script kernel. Fetch with:
#   python -m kaggle kernels status USER/attn-animate
#   python -m kaggle kernels output USER/attn-animate -p <dir>
set -e
here="$(cd "$(dirname "$0")" && pwd)"
user=$(python -c "from kaggle.api.kaggle_api_extended import KaggleApi as K;a=K();a.authenticate();print(a.config_values['username'])")
[ "$1" = all ] && set -- $(python -c "import json;print(' '.join(json.load(open('$here/motion.json'))))")
keys=$(printf '"%s",' "$@"); keys="[${keys%,}]"
k="$(mktemp -d)"
sed "s/^KEYS = .*/KEYS = $keys/" "$here/run.py" > "$k/run.py"
cat > "$k/kernel-metadata.json" <<EOF
{"id": "$user/attn-animate", "title": "attn-animate", "code_file": "run.py", "language": "python",
 "kernel_type": "script", "is_private": true, "enable_gpu": true, "enable_internet": true,
 "machine_shape": "NvidiaTeslaT4", "dataset_sources": [], "competition_sources": [], "kernel_sources": []}
EOF
python -m kaggle kernels push -p "$k"
echo "pushed $user/attn-animate with $keys"
