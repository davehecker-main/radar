# Changelog

## Unreleased

- Resolve ShareView ownership from claims, remote issue evidence, and live sessions; limit uncertainty to affected resources.
- ShareView: report five numbered tables (Unattended batch, Blockers, Priority work, Decisions, Console work) with quiet collision filtering; the parent asks for a 1–5 selection (four buttons plus a typed `5` where the host allows four), rechecks and claims the work, records the session title honestly, and orchestrates it (sempervire/rex#18).

## 1.1.0 - 2026-09-21

- Add an exact ShareView profile while retaining the general Radar profile.
- Test profile selection in main checkouts, worktrees, unrelated repositories, and non-repositories.
- Move ShareView Radar contract assertions into this repository.

## 1.0.0 - 2026-09-21

- Add natural-language Codex skill discovery, SVG identity artwork, documentation, backup-aware installation, and smoke tests.
- Keep the existing read-only Radar planning behavior.
