# Handover: new premium channel + "Glass Mind" animation style

Paste this whole file into a new Claude Code chat on the desktop (or point Claude at it). It summarises a cloud chat from 7–8 Nov 2026.

## 1. Who / what
- I run the YouTube channel **Cognalyst** (@Cognalyst). I want to start a **new channel** with premium, long-form animated videos made in code.
- This repo (`wwgh-render`) is a render-only copy of my earlier stick-figure explainer *"Why Animals Get Drunk Too"* (Remotion + Blender shots rendered in GitHub Actions + AI voice). Don't use the stick-figure style for the new channel.

## 2. What we found about Cognalyst (public data, 8 Nov 2026)
- 22.4K subscribers. 60 Shorts, about 5.5M views in total. One Short (*"Watch, Observe And Then Talk"*, a Jordan Peterson clip) has 4.3M views, about 78% of all views. The median Short gets about 15K views.
- Almost every Short is reused celebrity-clip motivation (Peterson, Goggins, McGregor, Rogan…). That creates a risk of being refused monetisation for "reused content".
- 2 long-form animated videos: *"You Don't Have a Discipline Problem"* (425 views, uploaded 2 Nov 2026) and *"I Bet You Can't Finish This Video"* (364 views). The subscribers don't watch long-form.
- **Decision:** start a new channel. Keep Cognalyst alive (don't delete it). Move or remake the two animated long videos on the new channel.

## 3. Niche research (yt-dlp metadata, ~840 long videos uploaded in 2026, 4–20 min)
| Niche | Median views, 2026 uploads |
|---|---|
| History, animated | 491K (big but research-heavy, a few dominant channels) |
| How things work / weird science | 154K |
| Animated psychology | 51K (hit-or-miss) |
| Self-improvement animated | 48 (saturated) |
| Dark psychology | 396 (saturated) |
| Philosophy | 264 |

Breakout proof:
- **Brainosophy:** 3 videos, 52K subs. *"Every Reality Glitch You Can't Explain"* 6.6M views, *"Every Feeling You Can't Name Explained"* 4.7M.
- **Dumb Doggo:** 18 videos, median 5.8M.
- **PsychToons:** its "Psychology of X" videos have a ~5K median, despite one 4.9M hit.

**Chosen niche:** *the strange science of your own brain and body*. Curiosity, not self-help. The viewer is the subject. Videos run 9–12 minutes.

Title ideas: Every Brain Glitch That Happens While You Sleep · Why Your Brain Deletes Most of Your Day · Every Weird Thing Your Body Does Without Asking · What Happens in Your Brain the Moment You Procrastinate · Why Time Feels Faster Every Year · Every Type of Déjà Vu, Explained · Why Your Brain Thinks a Phone Buzz Is an Emergency · What Your Brain Does in the First 10 Seconds of Meeting Someone. Don't copy Brainosophy's titles or look.

## 4. Tool: Lemo-Opuscar
- An open-source Claude Code plugin with **66 code-made film styles**: https://github.com/lemomo-ai/lemo-opuscar. Code is MIT; their demo art and films are CC BY 4.0. Tuned for Claude Opus 5.5.
- Install on the desktop:
  ```
  claude plugin marketplace add lemomo-ai/lemo-opuscar
  claude plugin install lemo-opuscar@lemolab
  ```
- Needs Node 20+, **ffmpeg 7+** (6.x breaks its muxing) and Python 3.11+. A GPU matters: in the cloud (software WebGL) one 3D frame took ~40 s.
- Workflow guides inside the library: `DIRECTOR.md`, `TECHNIQUE.md`, `MY-STYLES.md` ("make a style your own").

## 5. Chosen style: "Glass Mind" (玻璃心智), based on the library's *Glass Product Render* (`glass-product`)
A clear glass human bust in profile on a frosted, glowing plinth, in a black studio lit by strip lights. Inside is an opaque graphite brain; thoughts are ice-blue → violet comet pulses running along neural pathways.

Changes from the base (round 1, see `glass-mind-test/style/CHANGES.md`):
1. **§1 Subject:** a fictional glass human bust with a brain inside (not a product). "The invisible thing it does" is always a thought.
2. **§8 New native move, "Misfire":** one pathway's pulse stalls and splits into R/G/B copies with a 2-frame stutter. It's the only place colour channels separate. This is the channel's signature glitch.
3. **§3 Colour:** same accent as the base (ice blue → violet); rainbow only at thick glass edges, in caustics and in the Misfire.
4. **§4 Type:** a chapter kicker plus a one-word ultra-thin chapter title (Inter Tight 200, wide tracking), the frosted-glass subtitle bar, and Dark Tech Keynote's single giant number for key facts.
5. **§7 Voice:** a calm narrator throughout (long-form); music ducks under it; minimal electronic score.

Size 1920×1080, 24 fps.

Status: **the style frame is done** (`glass-mind-test/style/styleframe.jpg`, plus `styleframe-vs-base.jpg`). I haven't approved it or asked for changes yet.

## 6. Files in this folder (`handover/glass-mind-test/`)
| File | What it is |
|---|---|
| `index.html`, `main.js` | the style-frame page: camera, studio lighting, title + subtitle overlay. `window.render(t)` |
| `mind.js` | glass head (built from a sculpted profile), brain hemispheres with folds, 22 neural pathways, the 3-channel Misfire, `fire()` |
| `studio.js` | strip-light studio, floor and caustics (copied from the library's glass-product demo, MIT) |
| `still-slow.mjs` | still renderer with no screenshot timeout (the library's `still.mjs` timed out on a GPU-less machine) |
| `fonts/` | Inter Tight (OFL). The library's glass-product demo is missing this file; it needs it too |
| `style/` | `styleframe.jpg`, `styleframe-vs-base.jpg`, `CHANGES.md`, `style.json` |
| `CREDITS` | licences |

To render it on the desktop: copy `glass-mind-test/` into the library as `films/glass-mind-test/` (the page loads `/core/...` and `/node_modules/three/...` from the library root), run `npm install` in the library, then:
```
node films/glass-mind-test/still-slow.mjs films/glass-mind-test out 1.2
```
Add `Q="notext=1"` to hide the text, or `Q="mis=0"` to turn off the misfire. On a GPU machine the library's own `node core/render/still.mjs films/glass-mind-test 1.2` should also work.

## 7. Next steps
1. Approve the Glass Mind look or give notes (head angle, colour, more or less glow…).
2. Finish `MY-STYLES.md` §3: write the full `STYLE.md` (a copy of glass-product's with the 5 changes written in).
3. §5: make a 15–30 s demo clip (music + SFX, no voice), with the Misfire visible.
4. §6: keep it in `~/lemo-my-styles/glass-mind/`.
5. Then the pilot episode: probably *"Why Your Brain Deletes Most of Your Day"* or *"What Happens in Your Brain the Moment You Procrastinate"*. Build it chapter by chapter; a 10-minute film is far more work than the library's 30–60 s demos.
6. Later: set up the new channel (name, banner, thumbnails in the same dark glass look, with a 2–4 word headline).
