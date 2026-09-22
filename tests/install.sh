#!/bin/sh
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT HUP INT TERM

CLAUDE_HOME="$tmp_dir/claude" CODEX_HOME="$tmp_dir/codex" XDG_STATE_HOME="$tmp_dir/state" "$repo_dir/scripts/install.sh" >/dev/null
command_file="$tmp_dir/claude/commands/radar.md"
skill_file="$tmp_dir/codex/skills/radar/SKILL.md"
test -s "$command_file"
test -s "$skill_file"
test -s "$tmp_dir/codex/agents/radar.toml"
test -s "$tmp_dir/claude/agents/radar.md"
test -s "$tmp_dir/codex/agents/shareview-radar.toml"
test -s "$tmp_dir/claude/agents/shareview-radar.md"

grep -F "$repo_dir/workflow.md" "$command_file" >/dev/null
grep -F "$repo_dir/workflow.md" "$skill_file" >/dev/null
grep -F '## How to consult him' "$repo_dir/profiles/general.md" >/dev/null
test "$(sed -n '1p' "$command_file")" = '---'
test "$(sed -n '1p' "$skill_file")" = '---'
CLAUDE_HOME="$tmp_dir/claude" CODEX_HOME="$tmp_dir/codex" XDG_STATE_HOME="$tmp_dir/state" "$repo_dir/scripts/install.sh" >/dev/null
printf 'local conflict\n' >> "$command_file"
CLAUDE_HOME="$tmp_dir/claude" CODEX_HOME="$tmp_dir/codex" XDG_STATE_HOME="$tmp_dir/state" "$repo_dir/scripts/install.sh" >/dev/null
find "$tmp_dir/state/personal-tools/backups/radar" -type f -name 'commands-radar.md' | grep . >/dev/null
printf 'radar: install smoke test passed\n'
