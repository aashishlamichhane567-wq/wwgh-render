# Paper-theatre art direction

This is the look the user picked: paper puppets, era-styled cards, a real satellite map and a cut-out title.

## Layers, bottom to top

| Layer | Source | Notes |
|---|---|---|
| Era backdrop | `src/<Name>/era.tsx`, `Backdrop` | Five eras, listed below. Map each scene to one in `ERA_OF`. |
| Camera move | `RussiaVideo.tsx`, `camera()` | Each scene slowly pushes in or eases out with a drift, alternating. Nothing is ever static. |
| Scene | Puppets, props and satellite maps | |
| Generated inserts | `inserts.tsx` | |
| Paper texture | `PaperTexture op={0.3}` | Multiplied over the whole frame. |
| Captions | `Captions paper` | A torn cream strip; the current word turns red. They sit outside the camera move. |
| Paper wipe | Every scene cut | 18 frames, with a whoosh and a paper rustle. |

## Eras (era.tsx)

| Era | Covers | Backdrop |
|---|---|---|
| saga | Founding and early history | Sky, paper clouds, layered hills |
| chronicle | Medieval | Illuminated-manuscript parchment, gold arch, red and blue diamond border |
| empire | Early modern / imperial | Engraved-print lines, double-rule frame |
| soviet | Revolutionary / 20th century | Constructivist cream, black wedge, red halftone band |
| modern | Late 20th century to today | Newsprint columns |

Pick the equivalents for each country, e.g. for Japan: Jōmon/Yamato, Heian scroll, Edo woodblock, Meiji print,
modern.

## Puppets (src/Puppet/rig.tsx, src/<Name>/cast.tsx)

- `LOOK[who]` sets hats, hair, beards, moustaches, garments and glasses.
- `Person` renders a `Puppet`. It supports a lip flap with `talk`, a walk cycle, preset faces, and `ko` for closed eyes.
- Add new looks to `LOOK` rather than drawing one-off figures.

## Maps (src/<Name>/map.tsx, sat.tsx)

- **Base imagery:** NASA Blue Marble NG July, built by `episodes/russia/build_sat.py`.
- **Projection:** equirectangular, standard parallel 50°. Adjust `LON0`, `LAT1` and `K` for the region.
- **Borders:** historical-basemaps snapshots, built by `episodes/russia/build_maps.py` into `maps.json`.
- **Labels:** white, with an outline.

## Paper kit (src/Puppet/paper.tsx)

- `torn()` makes torn rectangles; `ridge()` makes cut-paper hills and ground.
- The `cut` / `cutSoft` drop-shadow filters come from `PaperDefs`.
- `Brad` draws fasteners; `PaperLabel`, `PaperBubble`, `NameCard`, `YearBadge` and `TitleCard` (ransom-note letters)
  cover the labels and cards.
- Fonts: Oswald for labels, Kalam for speech, Ruslan and Fraktur for titles. Load them with `usePaperFonts()`.

## Things to check on a contact sheet

- Puppets fit the stage and aren't cut off at the edges.
- Text is legible. Light text on dark panels needs a dark `stroke`.
- No prop is an opaque rectangle hiding the backdrop.
- Map labels don't collide with icons.
- Something moves in every 2.5 s window: run `master.sh`'s freeze report.
