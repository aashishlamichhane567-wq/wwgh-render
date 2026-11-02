"""history.yml commits youtube.md: the reel's upload sheet is hand-written, so leave it alone if it exists."""
import os
p = os.path.join(os.path.dirname(__file__), "youtube.md")
if not os.path.exists(p):
    open(p, "w").write("# Faith reel (upload sheet pending)\n")
