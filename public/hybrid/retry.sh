# Every 15 min for up to 24 h: make the missing hybrid stills until all five exist.
cd /c/Users/user/disc-hook/public/hybrid
for i in $(seq 96); do
  python flux_stills.py >> retry.log 2>&1
  echo "$(date +%H:%M) stills=$(ls ?.webp 2>/dev/null | wc -l)" >> retry.log
  [ "$(ls ?.webp 2>/dev/null | wc -l)" -ge 5 ] && exit 0
  sleep 900
done
