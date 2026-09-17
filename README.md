# Radar

<img src="assets/radar.jpg" alt="Gary Burghoff as Radar O'Reilly in M*A*S*H" width="360">

Portable planning-agent definition for Codex and Claude-style agent setups.

**Radar** is a read-only planning aide. He helps you choose the next task, batch related work, fit
work to the time you actually have, and avoid needless context switching. Like his namesake, he
tries to have the next thing ready before you ask for it.

Radar is intentionally read-only. He inspects and advises; he never edits files, posts comments,
labels or closes issues, or merges pull requests.

Companion to [sheldon-debbie](https://github.com/davehecker-main/sheldon-debbie).

## Install

Clone the repo and run:

```sh
./scripts/install.sh
```

That installs:

- The Codex agent into `~/.codex/agents/`
- The Claude agent into `~/.claude/agents/`
- The Claude slash command into `~/.claude/commands/`

You can override the destination homes:

```sh
CODEX_HOME=/path/to/.codex CLAUDE_HOME=/path/to/.claude ./scripts/install.sh
```

## Files

```text
codex/agents/
  radar.toml

claude/
  agents/
    radar.md
  commands/
    radar.md
```

## Usage

In Codex, select or invoke the installed agent definition where your client exposes custom agents.

In Claude-style setups, use:

```text
/radar <what should I do next, or how should I spend this time block?>
```

Examples:

```text
/radar I have 45 minutes before a meeting
/radar what should I batch this afternoon?
/radar
```

Radar answers with one table of candidate tasks in execution order: issue number, a short
description, and why it belongs there.

The command file assumes a subagent-capable environment with `Agent` and `SendMessage` semantics.
If your local harness differs, keep the agent file and adapt only the command wiring.

## How Radar Gets Context

Radar plans from the real state of the repository, not from memory. Before the first consult,
the command runs read-only checks (open issues, open pull requests with check status, the current
branch, recent commits) and passes the results in. If any read fails, the consult stops rather
than producing a plausible-looking plan from stale state.

Adapt those checks to your tracker. If your repository has a triage or prioritization process,
Radar treats unevaluated work as something to name, not something to rank.

## Notes

This definition was extracted from a project-local setup and cleaned for general use. Review it
before installing if your repository has strict rules about agents, shell access, or issue
tracker writes.

## Image credit

Photo of Gary Burghoff as Radar O'Reilly in *M\*A\*S\*H* (1975), CBS publicity still, public
domain via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gary_Burghoff_Radar_MASH_1975.JPG).
