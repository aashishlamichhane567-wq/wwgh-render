---
name: history-video
description: Make a full-length (10–13 min) faceless YouTube history explainer ("The Entire History of <Country> in 12 Minutes") in this repo's paper-theatre style — cut-paper puppets on era backdrops, NASA satellite maps, a directed AI narrator, coded music and sound effects, optional Gemini/Veo inserts — from script to mastered mp4, thumbnail and YouTube metadata. Use when the user asks for a new history episode, a new country/topic in this format, to re-voice, retime, re-render or improve an existing episode, or mentions the Russia video as the template.
---

# History video pipeline (paper-theatre style)

The Russia episode is the working reference implementation. Copy its structure for a new topic; every path below is
`russia`/`Russia` — substitute the new slug (`japan`/`Japan`, ...).

```
episodes/<slug>/script.txt     narration, one "## scene" per chapter, one line = one TTS take
episodes/<slug>/delivery.txt   emotion direction per scene and per line (drives the narrator's acting)
episodes/<slug>/make_vo.py     voice (qwen), word timing (timing), cue checks
episodes/<slug>/veo_shots.md   prompts for generated video inserts (user makes them in Google Flow)
src/<Name>/timing.ts           GENERATED: scene starts + per-word frames (CAPS)
src/<Name>/scenes*.tsx         one component per scene, every event keyed to a spoken word
src/<Name>/sound.tsx           music per era (ducked under speech) + word-keyed SFX cues
src/<Name>/inserts.tsx         generated clips, cut in from one spoken word to another
src/<Name>/RussiaVideo.tsx     assembly: era backdrop, camera move, scene, inserts, captions, VO, paper wipes
src/Puppet/                    shared cut-paper kit: puppet rig, torn(), ridge(), PaperDefs, fonts
episodes/sfx, episodes/music   coded SFX (numpy) and music (mido + FluidSynth) — reusable as is
```

## The golden rule: everything is keyed to spoken words

Never place an event at a hand-picked frame. Scenes call `W("word", n)` (via `useW("scene")`), which reads the word's
frame from `timing.ts`. Re-voicing then only needs `make_vo.py timing` — animation, captions, SFX and inserts all
follow. After any script or voice change run the cue checker (`episodes/<slug>/check_cues.py`, 0 problems required) and
`npx tsc --noEmit -p .`.

## Workflow

1. **Script** (`script.txt`) — see [references/script-and-hook.md](references/script-and-hook.md). ~1,700–1,900 words
   for ~11.5 min. Hook in the first 25 s: a strange true quote/fact, the punchline, the scale, "Let's go." Write years as
   `1480{fourteen eighty}` (caption shows digits, narrator speaks words). Blank line = longer pause.
2. **Delivery** (`delivery.txt`) — a default direction per scene plus per-line overrides
   (`<start of line> | direction`). Write a direction for every punchline, grim fact and climax: deadpan, grave and
   quiet, thrilled, mock-official... Flat narration was the #1 complaint; directions fix it.
3. **Voice** — `bash .claude/skills/history-video/scripts/setup_env.sh` once per container, then
   `VO_BATCH=2 $QW episodes/<slug>/make_vo.py qwen` (≈80–90 min on 4 CPUs; resumable — finished lines are cached in
   `episodes/<slug>/vo_lines/`). For the hook: `VO_TAKES=3 ... qwen hook` keeps the liveliest of 3 takes per line.
   Details, gotchas and alternatives: [references/voice.md](references/voice.md).
4. **Timing** — `$TTS episodes/<slug>/make_vo.py timing` (per-line alignment). Then
   `python3 .claude/skills/history-video/scripts/check_sync.py <slug> <Name>` — every scene's first caption must be at
   ~0 s and only a handful of words may start in silence.
5. **Scenes** — build/adjust in `src/<Name>/`; art direction in [references/style.md](references/style.md). Preview with
   `bash .claude/skills/history-video/scripts/sheet.sh <out-name> <Comp> <frames...>` (contact sheet; view the jpg).
   Check every scene at ~30 % and ~75 % before a full render.
6. **Sound** — `sound.tsx`: map scenes to music cues, add `[word, n, fx, vol, offset]` cues per scene. Music is ducked
   to 50 % under speech automatically; keep `MUSIC_VOL` ≈ 0.10, `SFX_GAIN` ≈ 0.7.
7. **Generated inserts (optional)** — write `veo_shots.md` (5 shots, 8 s, 16:9, same style suffix on every prompt,
   timestamps from `timing.ts`). The user generates them in Google Flow / Gemini on their own plan (a Google AI
   subscription gives no API access; the API is separate and paid) and shares a Drive folder — it must be
   "Anyone with the link" (download with `gdown <folder-url>`). Put clips in `public/gemini/`, list them in `inserts.tsx`.
8. **Render** (~60–110 min, run in background; or run everything in 4K on free runners: `gh workflow run history.yml --ref <branch>`):
   `npx remotion render <Comp> out/raw.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --concurrency=4 --pixel-format=yuv420p --jpeg-quality=95`
   Test a short range first after any audio-code change: add `--frames=1300-1500`.
9. **Master + QA** — `bash .claude/skills/history-video/scripts/master.sh out/raw.mp4 out/<Name>_final.mp4`
   (two-pass loudnorm to −16 LUFS / −1.5 dBTP, x264 CRF 20 so it stays under the 400 MB send limit, freeze report,
   contact sheet). Zero freezes ≥ 2.5 s is the bar.
10. **Thumbnail + metadata** — `<Name>Thumb` composition (split "then | today" map, two puppets, torn "HOW?!" banner);
    `youtube.py` writes title, description, chapters from `timing.ts`, credits, tags. Update `CREDITS.md`.
11. Commit + push after each milestone (the stop hook insists). Deliver with SendUserFile.

## Hard-won lessons (read before starting)

- **Whole-scene whisper alignment drifts**: it lost the first 25 s of two scenes, freezing their animation and
  desyncing captions. Always use the per-line `timing` (already in make_vo.py) and run `check_sync.py`.
- **Memory**: 16 GB total. Qwen 1.7B fp32 + batch 4 on long lines OOM-kills; use `VO_BATCH=2`, `VO_TAKES≤3`, and never
  render stills or video while TTS runs.
- **Disk** is ~13 GB free at start: delete `~/.cache/pip`, unused HF models and old `out/raw*.mp4`. Each full render is
  ~250–500 MB.
- **Never `pkill -f`/`pgrep -f` a pattern that appears in your own command line** — it kills/matches your own shell.
  Wait on a PID (`while ps -p $PID ...`) or bracket a letter (`make_v[o].py`).
- Remotion `volume={(f) => ...}` is called with **fractional** frames — round before indexing arrays, or the render
  crashes with "returned NaN".
- Whisper writes spoken numbers as digits and can't spell foreign words ("Poyekhali"): the QA ignores number words;
  read the transcript of any line still flagged before regenerating it.
- Light text on dark panels needs `stroke=` override on `T` (default stroke is the light paper colour).
- You cannot hear audio. Measure (loudness, pitch spread, words-in-silence), then send
  a short labelled comparison video (`A`, `B`, `C` cards) and let the user pick voices/emotion before a 2-hour render.

## Licences to keep clean

Satellite: NASA Blue Marble (PD). Borders: historical-basemaps (GPL-3.0, keep derived maps.json under it). Natural
Earth (PD). Fonts: OFL (texts in public/fonts). Voice: Qwen3-TTS (Apache-2.0), designed voice — never clone a real
person. Music: composed in code, FluidR3_GM (MIT); only public-domain melodies (e.g. folk songs). Do **not** use
open-weight Fish Speech/OpenAudio for a monetised channel (CC BY-NC-SA); Fish Audio's paid API is fine with the user's
key (`FISH_API_KEY`).
