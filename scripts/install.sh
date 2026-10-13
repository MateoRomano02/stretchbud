#!/bin/sh
# Installs stretchbud into PREFIX (default ~/.local) and starts it at login via a LaunchAgent.
set -eu
PREFIX="${1:-$HOME/.local}"
LABEL="dev.stretchbud.agent"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$PREFIX/bin" "$PREFIX/share/stretchbud" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
install -m 755 "$ROOT/build/stretchbud" "$PREFIX/bin/stretchbud"
install -m 755 "$ROOT/bin/stretchbud-hook" "$PREFIX/bin/stretchbud-hook"
rm -rf "$PREFIX/share/stretchbud/web"
cp -R "$ROOT/web" "$PREFIX/share/stretchbud/web"

cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$PREFIX/bin/stretchbud</string><string>run</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><dict><key>SuccessfulExit</key><false/></dict>
  <key>ProcessType</key><string>Interactive</string>
  <key>LimitLoadToSessionType</key><string>Aqua</string>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/stretchbud.log</string>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/stretchbud.log</string>
</dict></plist>
PL

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "stretchbud installed in $PREFIX and running (menu bar: 🌱)."
echo "Claude Code integration (optional): make claude-hooks"
