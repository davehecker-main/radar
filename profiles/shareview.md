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
issue comments leave the named resource's owner or scope unresolved, name exactly one
`chattr consult <session_id>` addressed to that claim's `session_id` in Primary blockers as
the parent's next action for that resource. Never propose a peer survey, a poll, or asking
Dave who owns the work. A recommendation never transfers ownership. The session that takes
recommended work runs `chattr claim` first, and a refused claim means it was taken after this
snapshot. Distinguish this session (`mine`) from peers: its own claimed work can continue
within its existing authorization.

**Claim coverage:** require both `coverage.complete: true` from
`chattr who --repo --coverage` and a `claims` array in `chattr state`. If
`coverage.complete: false` or a missing `claims` array leaves all ownership unavailable,
withhold the whole Unattended list and name the failed condition in a Primary blockers row.
Otherwise, attach uncertainty to each named resource (`issue:<N>`, `pr:<N>`, or
`resource:<name>`), withhold only its row from Unattended, and name its unresolved evidence
in Primary blockers. Check peer freshness; unknown session status is not idle.

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
results or manufacture a recommendation. Report the read and real error using all three output
sections: Unattended = “None available — repository state unavailable”; Needs human = the exact
human action only if known, otherwise “None established”; Primary blockers = failed read, error,
owner/next step if known, and trustworthy planning as the unlock. There are no candidate tasks.

## Consult and relay

Once per session, spawn `Agent(subagent_type: "shareview-radar", run_in_background: false)` with the
compact snapshot, read failures/discrepancies, question, and actor permissions. Keep its `agentId`;
follow-ups use `SendMessage` to that ID, never the bare name. Recover a lost ID with `ListAgents`.
Always synchronous. Send changed state and removals only on follow-ups, plus fresh claims,
coverage, timestamps, and the question; do not resend unchanged instructions or discussions.

**The answer must appear in the main conversation thread.** The transcript pane is not the user-visible reply.
After the call returns, emit one assistant response in the parent session with Radar's answer
unaltered, header included. Do not end the slash-command turn until that response has been sent.
Add nothing after it except a necessary factual correction. Radar advises; this command never
starts the recommended work or changes project state.
