#!/usr/bin/env python3
"""Install or remove Stretchbud's Claude Code hooks by merging into a settings.json.

Never overwrites other hooks. Backs the file up before changing it. Hooks are async,
so they can't slow Claude down. Usage:
  claude_hooks.py install /path/to/stretchbud-hook [--settings PATH]
  claude_hooks.py remove [--settings PATH]
"""
import json
import shutil
import sys
import time
from pathlib import Path

MARK = "stretchbud-hook"
EVENTS = {
    "UserPromptSubmit": ("prompt", None),
    "Stop": ("stop", None),
    "Notification": ("notify", "permission_prompt|idle_prompt|elicitation_dialog|agent_needs_input"),
    "SessionStart": ("start", None),
    "SessionEnd": ("end", None),
}


def load(path: Path) -> dict:
    return json.loads(path.read_text()) if path.exists() and path.read_text().strip() else {}


def strip(settings: dict) -> dict:
    hooks = settings.get("hooks", {})
    for event in list(hooks):
        groups = []
        for g in hooks[event]:
            g = dict(g)
            g["hooks"] = [h for h in g.get("hooks", []) if MARK not in h.get("command", "")]
            if g["hooks"]:
                groups.append(g)
        if groups:
            hooks[event] = groups
        else:
            del hooks[event]
    if not hooks:
        settings.pop("hooks", None)
    return settings


def main() -> int:
    args = sys.argv[1:]
    settings_path = Path.home() / ".claude" / "settings.json"
    if "--settings" in args:
        i = args.index("--settings")
        settings_path = Path(args[i + 1]).expanduser()
        del args[i:i + 2]
    if not args or args[0] not in ("install", "remove"):
        print(__doc__)
        return 2

    settings = load(settings_path)
    if settings_path.exists():
        backup = settings_path.with_name(settings_path.name + f".stretchbud-backup-{int(time.time())}")
        shutil.copy2(settings_path, backup)
        print(f"backup: {backup}")
    settings = strip(settings)

    if args[0] == "install":
        hook = Path(args[1]).expanduser().resolve()
        hooks = settings.setdefault("hooks", {})
        for event, (kind, matcher) in EVENTS.items():
            group = {"hooks": [{"type": "command", "command": f"'{hook}' {kind}", "async": True, "timeout": 5}]}
            if matcher:
                group = {"matcher": matcher, **group}
            hooks.setdefault(event, []).append(group)

    settings_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = settings_path.with_suffix(".tmp-stretchbud")
    tmp.write_text(json.dumps(settings, indent=2) + "\n")
    json.loads(tmp.read_text())  # refuse to write a file that does not parse
    tmp.replace(settings_path)
    print(f"{args[0]}ed Stretchbud hooks in {settings_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
