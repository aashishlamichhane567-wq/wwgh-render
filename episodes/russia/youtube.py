"""Writes episodes/russia/youtube.md: title, description with chapters (from src/Russia/timing.ts), credits, tags."""
import os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHAPTERS = {
    "hook": "Come and rule over us", "rus": "Vikings and Kievan Rus", "faith": "Vladimir picks a religion", "mongols": "The Mongols",
    "moscow": "Moscow, the tax collector", "terrible": "Ivan the Terrible", "siberia": "Siberia", "troubles": "The Time of Troubles",
    "peter": "Peter the Great", "catherine": "Catherine the Great", "napoleon": "Napoleon", "reform": "Serfs, Alaska and a bomb",
    "nicholas": "Nicholas II and Rasputin", "revolution": "1917", "stalin": "Stalin and World War II", "coldwar": "The Cold War and space",
    "collapse": "The collapse", "modern": "Russia since 1991", "end": "So that's Russia",
}

src = open(os.path.join(ROOT, "src/Russia/timing.ts")).read()
scenes = re.findall(r'"(\w+)": \{ "start": (\d+), "dur": (\d+)', src)
total = int(re.search(r"TOTAL_FRAMES = (\d+)", src).group(1))
fmt = lambda fr: f"{fr // 30 // 60}:{fr // 30 % 60:02d}"
chapters = "\n".join(f"{fmt(int(st))} {CHAPTERS[k]}" for k, st, _ in scenes)

md = f"""# The Entire History of Russia in 12 Minutes

**Length:** {fmt(total)}

## Description

Vikings who were invited in, Mongols who outsourced their tax collection, tsars who killed their own sons, a parade of fake royals,
a revolution in the wrong month, the first human in space… and a pizza commercial. This is the entire history of Russia.

{chapters}

Maps: satellite imagery NASA Blue Marble (public domain); historical borders from historical-basemaps by André Ourednik (GPL-3.0); coastlines from Natural Earth (public domain).
Narration is AI-generated (Qwen3-TTS); five short illustrated clips were generated with Google Flow. Music and sound effects are composed in code; \"Korobeiniki\" is a public-domain folk song. Dates and figures are rounded for time; estimates such as war deaths are the commonly cited ones.

Which country should we do next? Tell me in the comments.

## Tags
history, russia, russian history, entire history, history of russia, animated history, vikings, mongols, ivan the terrible,
peter the great, catherine the great, napoleon, russian revolution, soviet union, ussr, stalin, cold war, gagarin, gorbachev
"""
open(os.path.join(os.path.dirname(__file__), "youtube.md"), "w").write(md)
print(md)
