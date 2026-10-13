#!/bin/sh
# Stops and removes stretchbud. Your data in ~/Library/Application Support/Stretchbud is kept;
# delete that folder to erase it.
set -u
PREFIX="${1:-$HOME/.local}"
LABEL="dev.stretchbud.agent"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist" "$PREFIX/bin/stretchbud" "$PREFIX/bin/stretchbud-hook"
rm -rf "$PREFIX/share/stretchbud"
python3 "$(dirname "$0")/claude_hooks.py" remove >/dev/null 2>&1 || true
echo "stretchbud removed. Data kept in ~/Library/Application Support/Stretchbud"
