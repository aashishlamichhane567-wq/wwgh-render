# Handover: "The Entire History of Russia", plus the channel's video pipeline

**Date:** 31 October 2026
**Branch:** `claude/instagram-reel-feasibility-jzsd10` on `aashishlamichhane567-wq/wwgh-render`.

---

## 1. What's in this folder

| File | What it is |
|---|---|
| `The_Entire_History_of_Russia.mp4` | **Final video.** 11:29, 1080p30, H.264/AAC, −16 LUFS (YouTube's loudness), 333 MB. **Not in git** (GitHub rejects files over 100 MB). Keep the copy sent in chat; this one disappears with the cloud machine. |
| `thumbnails/1_B_vikings_did_this.jpg` | Thumbnail B, the recommended one: giant shocked Viking over red Russia, "VIKINGS DID THIS?" |
| `thumbnails/2_A_how.jpg` | Thumbnail A: 862 vs today split map, "HOW?!" |
| `thumbnails/3_C_lineup.jpg` | Thumbnail C: Viking, Mongol, Tsar and Soviet cards, "1,100 YEARS" |
| `YOUTUBE_UPLOAD.md` | Titles, description with chapters, tags, settings checklist. Paste into YouTube Studio. |
| `HANDOVER.md` | This document. |

---

## 2. The video

**Format:** a faceless animated history explainer in the "entire history of X" niche.

**Style:** "paper theatre":
- Cut-paper puppets on backdrops styled for each era: saga, illuminated manuscript, engraved print, Soviet poster,
  newsprint.
- Real NASA satellite maps with historical borders.
- Ransom-note cut-out title, torn-paper captions with the spoken word in red.
- A slow camera move on every scene, and torn-paper wipes between scenes.

**Sound:**
- **Narrator:** an AI British documentary voice, "voice A", which you chose. It's designed from a text description, so no
  real person is cloned. Each of its 126 lines has a written acting direction (deadpan, grave, thrilled…), and the hook
  uses the best of 3–4 takes per line.
- **Music:** composed in code for each era. Korobeiniki, the Tetris folk tune, is public domain; everything else is
  original. The music automatically dips under the voice.
- **Sound effects:** 31 synthesized effects, each timed to a spoken word.

**Gemini inserts:** five 8-second clips you made in Google Flow (Vikings, Moscow burning, the winter retreat, Gagarin's
launch, the Berlin Wall). Each one cuts in exactly on its spoken cue.

**Checks passed:**
- Captions line up with the voice. Each line is aligned separately, and only 1.4% of words start on a pause, all of them
  soft sounds.
- No frozen footage: freeze detection finds nothing of 2.5 s or longer.
- Loudness is −16.0 LUFS, true peak −2.0 dBTP.
- Every animation cue finds its word, and the code typechecks.

**Not verified by Claude:** how it *sounds*. Claude can't hear audio. Voice choice, emotion and mix level were measured
and then judged by you.

---

## 3. How the video evolved (decisions you made)

1. **First version:** stick figures on flat maps, 12 min.
2. **Satellite maps:** NASA Blue Marble imagery replaced the flat maps.
3. **Style research:** a style lab compared looks; you picked option A, paper puppets.
4. **Pilot:** a 30-second pilot in the new style.
5. **Full paper video** with a deep voice (Kokoro "Onyx"), music and SFX. *Rejected: "the voice isn't nice".*
6. **Voice research:** a comparison of seven voices. **You picked A**, the British narrator (Qwen3-TTS).
7. **Emotion test** of three options. **You picked 2**: per-line acting directions on the same voice.
8. **Fixes from your feedback:**
   - The voice was buried, so the music now ducks, the effects are 30% lower and the voice chain is fuller.
   - Caption desync and frozen scenes: a timing bug in the Mongols and Stalin scenes, fixed.
   - Hard cuts became camera moves and paper wipes.
   - The hook was re-voiced with best-of-takes.
9. **Gemini clips** cut in.
10. **Three thumbnails** for Test & Compare.

---

## 4. Everything installed or used

The cloud machine is temporary: installed tools vanish when the session ends. **Everything is reproducible.** One
command reinstalls it: `bash .claude/skills/history-video/scripts/setup_env.sh` (section 6).

### System (already on the machine)

| Tool | Version | Used for |
|---|---|---|
| Node.js | 22.22 | Remotion (renders the video in code) |
| Remotion | 4.0.515 (`package.json`) | Every frame of the video |
| Chromium headless shell | `/opt/pw-browsers/chromium_headless_shell-1243` | Remotion's renderer |
| ffmpeg | 6.1.1 | Mastering, compression, checks, test videos |
| Python | 3.13 | Voice, timing, music, SFX, map building |
| FluidSynth + FluidR3_GM soundfont (MIT) | system package | Turning the coded music into audio |

### Python environments

These live in the session's scratch folder and are recreated by `setup_env.sh`.

| Env | Packages | Used for |
|---|---|---|
| `qw` | qwen-tts 0.1.1, torch 2.15, transformers 4.57, faster-whisper 1.2.1, librosa 1.0 | Narration (Qwen3-TTS) and QA |
| `tts` | faster-whisper 1.2.1, kokoro-onnx 0.6.1, chatterbox-tts 0.1.7, gdown 6.5 | Word timing, older voice tests, Drive downloads |

### AI models (downloaded to `~/.cache/huggingface`, not in git)

| Model | Licence | Role |
|---|---|---|
| Qwen3-TTS 12Hz 1.7B **Base** | Apache-2.0 | Speaks every line by cloning `episodes/russia/voice_ref.wav`, following `delivery.txt` directions |
| Qwen3-TTS 1.7B **VoiceDesign** | Apache-2.0 | Created voice A once from a text description. Deleted afterwards to save disk; re-downloads with `make_vo.py design` |
| faster-whisper base.en / small.en | MIT | Checks each voice take; word-level caption timing |
| Chatterbox, Kokoro (am_onyx, bm_george…) | MIT / Apache-2.0 | Earlier voice tests; still available as fallbacks |

### Outside services

| Service | Status |
|---|---|
| **Google AI Plus** (your plan) | You generate clips by hand in Flow from Claude's prompts. Your subscription gives **no API access**, so Claude can't drive it. |
| **Gemini API** | Not set up. It's separate and paid; it would let Claude generate and insert clips itself. Needs a `GEMINI_API_KEY` secret and network access to `generativelanguage.googleapis.com`. |
| **Fish Audio API** | Not set up. Paid; your suggested upgrade for the hook voice. Needs a `FISH_API_KEY` secret; Claude would clone voice A there to keep one narrator. Don't use Fish's free open-source weights: their licence is non-commercial. |
| **ElevenLabs** | Not used. It's what most competitor channels use, and also paid with a key. |
| **GitHub** | Everything is pushed to the branch above. |

---

## 5. Where everything lives in the repo

```
.claude/skills/history-video/   THE SKILL: the full pipeline playbook + helper scripts (start here for the next episode)
delivery/russia/                this folder (video ignored by git)
episodes/russia/
  script.txt                    narration (19 scenes)            delivery.txt   acting direction per line
  make_vo.py                    voice (qwen/design), timing      voice_ref.wav  voice A reference clip
  check_cues.py                 every animation cue finds its word
  veo_shots.md                  the 5 Gemini prompts             youtube.py/.md title, description, chapters
  build_sat.py, build_maps.py   satellite tiles, historical borders
episodes/music/compose.py       music per era (mido + FluidSynth) -> public/music
episodes/sfx/make_sfx.py        31 synthesized effects -> public/sfx
src/Russia/                     the video: scenes1-4, era backdrops, cast, map, sound, inserts, captions, thumbnails
src/Puppet/                     reusable cut-paper puppet rig and paper kit
public/                         vo_russia (narration), music, sfx, sat (NASA tiles), gemini (your clips), fonts (OFL)
thumbnail/                      all thumbnails made so far
CREDITS.md                      every source and licence
```

**Licences in short:**
- NASA imagery and Natural Earth: public domain.
- Historical borders: GPL-3.0 (`maps.json` stays under it).
- Fonts: OFL.
- Voice: Qwen3-TTS (Apache-2.0); the voice is synthetic, no real person.
- Music: original, plus a public-domain folk tune; FluidR3 soundfont under MIT.

---

## 6. How to make the next video (or change this one)

In a new Claude Code session on this repo, ask for it: *"Make The Entire History of Japan."* The
**`history-video` skill** loads automatically, or type `/history-video`. It contains the full workflow, the hook
formula, the art direction and every lesson learned.

Common commands, run from the repo root:

```bash
bash .claude/skills/history-video/scripts/setup_env.sh                 # once per machine (prints $QW and $TTS)
VO_BATCH=2 $QW episodes/russia/make_vo.py qwen                         # re-voice changed lines (~1.5 h for all)
$TTS episodes/russia/make_vo.py timing                                 # retime captions and animation
python3 .claude/skills/history-video/scripts/check_sync.py russia Russia
npx remotion render Russia out/raw.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --concurrency=4 --pixel-format=yuv420p --jpeg-quality=95
bash .claude/skills/history-video/scripts/master.sh out/raw.mp4 out/final.mp4
npx remotion still RussiaThumbB out/thumb.png --browser-executable=...   # thumbnails: RussiaThumb (A), B, C
```

**Timings on this machine (4 CPUs, 16 GB):**

| Step | Time |
|---|---|
| Full narration | ~1.5 h |
| Retiming | ~10 min |
| Full render | ~1–1.5 h |
| Mastering | ~20 min |

---

## 7. Open items and suggestions

1. **Upload:** follow `YOUTUBE_UPLOAD.md`. Run Test & Compare with all three thumbnails.
2. **Hook voice:** if it still isn't right, add `FISH_API_KEY` and Claude will A/B a Fish Audio version of voice A.
3. **Automating the Gemini clips:** add a Gemini API key (paid) and the 5 clips per video need no manual steps.
4. **Title promise:** the video is 11:29, while the title says "12 Minutes". That's fine, and slightly under-promising
   helps retention.
5. **Next episode:** the skill makes the next one mostly mechanical. The slow steps are the script, new puppets and
   props for the new country, and new era backdrops.

---

## 8. Upgrade, 1 November 2026 (branch `claude/russia-quality-upgrade`)

- **Voice:** all 126 lines re-voiced as best-of-3 takes (before, only the hook was), keeping the liveliest take that passes
  QA. A line where no take passes now gets retried, where before it was silently kept. Lines ending mid-sentence ("said:")
  pause 0.22 s instead of 0.42 s. Same voice A. Two lines never "passed": "Then a dog named Laika." and the Alaska price line.
  Both scored the same on every try, so it's whisper mis-spelling Laika and "7.2", not a bad take. Listen to both anyway.
- **Picture:** rendered at 4K (`--scale=2`), so vector art stays sharp. H.264 level 5.1, standard range, bt709.
  It's 1.44 GB and 11:31.
- **Checks:** 0 cue problems; every first caption at 0.00 s; 1.7 % of words start in silence, all soft; −16.0 LUFS, −2.1 dBTP;
  no freezes of 2.5 s or longer.
- **How:** `.github/workflows/history.yml` runs the whole pipeline on free public-repo runners: 9 voice shards → timing,
  committed → 10 render shards + an audio-only render → concat and loudnorm. It took 2 h 42 m. Run it with
  `gh workflow run history.yml --ref <branch>`, or add `-f voice=false` to render only.
