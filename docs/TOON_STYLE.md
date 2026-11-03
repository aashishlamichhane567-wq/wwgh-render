# Toon Ray v2: Cognalyst house animation style

The test piece is `src/AttnToon/` (the attention hook). The rig is `src/Toon/Ray.tsx`, and the original look test is `psych-channel-renders/src/Toon/KitchenTest.tsx`.
Each rule below replaces something that made the ink/paper Attention cut look like a web page.

## World
- **Night interiors in deep navy** (`#0E1B33` to `#1A2C48`), with one warm practical light (a lamp) and one cool light (a screen). Every set is a real place with at least 3 props, never a UI mock-up.
- **Fixed colour meanings.** Ray, and focus, is teal `#1E9C93`. Attention and time are amber `#FFB45E`. Distraction is red-orange `#E4572E`. Everything else stays desaturated navy or plum.
- **Grade:** a vignette on every shot, light grain at about 0.03, and depth through parallax layers (wall 0.7, mid 1.0, foreground 1.15).

## Character
- **Ray fills the frame.** He is at least 35% of frame height in every shot that includes him, and his face is at least 25% of frame height on emotional beats.
- **Expressions change on spoken words:** gaze, brows, lids and mouth blend with springs. He is never frozen: he breathes, blinks every 2–4 s, and makes saccades.
- **Every big move has an anticipation.** Hands travel on arcs, and the head lags the body by about 6 frames.
- **The screen is a light source.** A cool glow on the face whenever he holds a phone.

## Camera and edit
- **A shot is 1.5–4 s.** Never put two consecutive shots at the same size; cycle close, mid and wide.
- **Cuts land on sentence starts.** Inside a shot, the camera eases (push, pull or reveal), plus a slow drift.
- **Ideas become physical objects in the world** (a progress bar people fall off, a building of viewers), not labels.

## Text
- **At most one big diegetic number or word per idea**, for example "23.7%" rolling up in amber. No explanatory labels.
- **Captions** sit in a navy pill at the bottom, in white Oswald, with the spoken word in amber (`Captions toon`).

## Sound
- Each visual event that has a cause gets a sound effect, kept quiet.
- Music sits about 20 dB under the voice.
