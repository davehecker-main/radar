# /radar

`claude/agents/shareview-radar.md` owns judgment and output. Pass Dave's argument verbatim;
without one, use the available planning context, time, and current actor's permissions.

## Collect once, reuse deliberately

Build one compact planning snapshot with timestamps and completeness results. Parallelize
independent reads; sequence pagination and shortlist follow-ups. No cache, service, or new
collector. Consume existing readiness decisions; do not run a triage procedure.

**Every invocation, before recommending**, refresh these together:

```sh
chattr state
chattr who --repo --coverage
git worktree list --porcelain
git ls-remote --heads origin
gh pr list --state open --limit 500 --json number,title,headRefName,baseRefName,body,statusCheckRollup
```

For each shortlisted candidate, resolve ownership in this order: `claims` in `chattr state`,
then issue-number branches and PR `Part-of:`/`Finishes:` declarations, then the issue comments.
A candidate settled by any step is settled. Each active claim in this repository has a resource
(`issue:<N>`, `pr:<N>`, `resource:<name>`), note, `owner_status`, `stale`, and `mine`. The bus
reaps gone owners from `claims`; a claim whose owner is idle, unknown, or `stale` is still held.
A branch without a PR can still claim work, and releasing a claim does not release its branch
or PR. A claim absent from the list is released, however it ended: drop it from follow-up
context. A `claim` or `release` line in `broadcasts` only echoes the claims list and reserves
nothing. A free-text announcement occupies work only when its sender is present in the current,
coverage-complete `chattr who --repo` list. An announcement from a session absent or `gone`
reserves nothing. A full or rolled-over `broadcasts` window is not an ownership gap.

One consult, one peer, only for an unclear claim: if the claims, branch/PR declarations, and
issue comments leave the named resource's owner or scope unresolved, name exactly one `chattr
consult <session_id>` addressed to that claim's `session_id` as the one Blockers row for that
resource. Never propose a peer survey, a poll, or asking Dave who owns the work. A
recommendation never transfers ownership. The session that takes recommended work runs `chattr
claim` first, and a refused claim means it was taken after this snapshot. Distinguish this
session (`mine`) from peers: its own claimed work can continue within its existing
authorization.

**Claim coverage:** require both `coverage.complete: true` from
`chattr who --repo --coverage` and a `claims` array in `chattr state`. If
`coverage.complete: false` or a missing `claims` array leaves all ownership unavailable,
withhold ownership-dependent work from every table and name the failed condition briefly as
the prerequisite. Otherwise, attach uncertainty to each named resource (`issue:<N>`, `pr:<N>`,
or `resource:<name>`) and withhold only that resource from every table. Check peer freshness;
unknown session status is not idle. Incomplete ownership evidence is unknown, not free work.

Collect the repository snapshot on first use; refresh after known changes (including other
sessions), a phase change, or when one hour old. Before presenting shortlisted work, confirm
its live issue/PR state and full discussions if not already current. The fresh PR/branch/peer
reads above also invalidate affected snapshot entries; never describe a merged PR as open.

Read `.github/current-phase`. In parallel collect:

- `scripts/board-query.sh 'is:open'` once, for reconciliation. This deliberately widens the
  lightweight membership read across phases; recommendations still default to the current phase.
- One paginated GraphQL `repository.issues(states: OPEN)` summary: number, title, state,
  updatedAt, milestone title, labels, projectItems with `includeArchived: true` (project identity
  and Status), and
  `issueFieldValues` (Priority via `... on IssueFieldSingleSelectValue { name field {
  ... on IssueFieldSingleSelect { name } } }`). Request `totalCount` and `pageInfo` on
  connections; page outer issues and any clipped nested labels, projects, fields, or values.
  Do not fetch every body or comment. Read detailed bodies and discussions only for shortlisted
  work, including dependencies or approvals that determine availability; read every comment
  for those issues, respecting later corrections. Uncollected discussion is not an absent plan.
- `gh issue list --search 'is:open no:milestone' --state open --limit 500 --json number,title`
  for issues that never reached the board.
- Current branch, `git status --short`, and `git log --oneline -10` for warm context.

Default to issues whose repository milestone equals the current phase; the board's
`milestone:` index is unreliable. For any additional board filter, use `scripts/board-query.sh`
and quote multi-word milestone values; never pass board filters to `gh issue list --search`.
Widen detailed reads only for a named cross-phase dependency or Dave's explicit question.
Omit untriaged `New` and frozen `HOLD` cards from the compact handoff; retain their exclusion
when checking availability. Do not re-fetch labels per issue, count the same scope again, or
collect repeated untriaged lists.

**Validate before comparing.** Check exits, GraphQL errors/nulls, `totalCount`, `pageInfo`, and
returned row counts. A CLI list at its limit is potentially truncated: complete it through
pagination or stop. Board footer must match parsed row count, including non-issue rows;
more than 100 board rows is incomplete. Resolve numbered board rows as Issue or PullRequest
using the collected repository/PR data (targeted reads for unresolved rows), so a PR is never
mistaken for an issue. Reconcile issue numbers from the same collected lists: report
`MISSING-FROM-BOARD` and `BOARD-ONLY` individually. Do not also run `scripts/board-reconcile.sh`:
its two source reads would repeat these reads. A complete discrepancy is a blocker, not an
access failure; do not claim full board coverage or recommend affected work until resolved.

**Repository access is a hard prerequisite.** On a failed, malformed, or incomplete required
repository read, stop the command immediately: do not spawn or consult Radar; never reuse stale
results or manufacture a recommendation. Name the failed read and real error in one line, then
show all five tables, each “No eligible work — repository state unavailable”. There are no
candidate tasks, so show no question box.

## Consult and relay

Once per session, spawn `Agent(subagent_type: "shareview-radar", run_in_background: false)` with the
compact snapshot, read failures/discrepancies, question, and actor permissions. Keep its `agentId`;
follow-ups use `SendMessage` to that ID, never the bare name. Recover a lost ID with `ListAgents`.
Always synchronous. Send changed state and removals only on follow-ups, plus fresh claims,
coverage, timestamps, and the question; do not resend unchanged instructions or discussions.

**The answer must appear in the main conversation thread.** The transcript pane is not the user-visible reply.
After the call returns, emit one assistant response in the parent session with Radar's answer
unaltered, header included, then the question box below. Do not end the
slash-command turn until that response has been sent. Radar advises; only this parent may
carry a selection forward.

## Question box

Immediately after the five tables, ask one question in the host's question UI:
`1 Unattended batch; 2 Blockers; 3 Priority work; 4 Decisions; 5 Console work`. Put all five in
the question text with one concise recommendation; never renumber. Claude's `AskUserQuestion`
allows at most four options: offer 1–4 as the options and say in the question that Console
work is chosen by picking Other with a typed `5`. Codex without a question tool asks the same
numbered question in plain text. Keep every number selectable even when its table is empty;
never silently drop a category.

Wait for an explicit number. No answer starts no work; any other reply is a new request.
An empty category gets “No eligible work” and goes back to the question.
Deduplicate by issue or action, so an item listed in several tables is dispatched once.

## Orchestrate the selection

1. Refresh ownership, eligibility, and collision checks with the reads above, then
   `chattr claim` each selected resource. Drop newly claimed, remotely reserved, or colliding
   work; a refused claim removes that item. Never race its owner and never substitute unrelated
   work; if nothing remains, say so and ask again.
2. Name the session for the category and task. Claude: run
   `node "$HOME/.claude/hooks/session-title.mjs" "<category>: <task>"`; the title publishes on
   the next user prompt, so say it is recorded, not applied. Codex titles its own thread; do
   nothing. Never claim an immediate or verified rename, and never edit private session storage.
3. State the bounded plan and stopping points. Selection authorizes only the displayed scope
   under existing permissions and gates; never infer authority for production mutations,
   credentials, external communications, or prohibited merges. Choosing Decisions starts the
   decision discussion with Radar's recommendation; it does not decide for Dave or approve
   implementation.
4. Delegate independent work to subagents with concrete ownership, context, expected result,
   and verification. Follow AGENTS.md rule 16: implementation lanes use `isolation: "worktree"`;
   judge independence across shared state, not only files; shared-file work stays sequential;
   never dispatch a batch containing a migration; the parent does not implement while lanes run.
5. Keep each console or operational surface under one driver; read-only research and review
   subagents may support Decisions and Console work. Lanes stop at open PRs and never merge.
   Collect results, handle authorized integration sequentially, and report the outcome.
