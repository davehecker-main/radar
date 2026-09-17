#!/bin/sh
set -eu

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
codex_home=${CODEX_HOME:-"$HOME/.codex"}
claude_home=${CLAUDE_HOME:-"$HOME/.claude"}

install_file() {
  src=$1
  dest=$2
  mkdir -p "$(dirname -- "$dest")"
  cp "$src" "$dest"
  printf 'installed %s\n' "$dest"
}

install_file "$repo_dir/codex/agents/radar.toml" "$codex_home/agents/radar.toml"

install_file "$repo_dir/claude/agents/radar.md" "$claude_home/agents/radar.md"
install_file "$repo_dir/claude/commands/radar.md" "$claude_home/commands/radar.md"
