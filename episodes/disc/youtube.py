"""Style test only: history.yml commits youtube.md, so write a placeholder."""
import os
open(os.path.join(os.path.dirname(__file__), "youtube.md"), "w").write("# Discipline hook style test (no upload metadata)\n")
