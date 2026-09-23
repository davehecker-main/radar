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

Ownership comes from `claims` in `chattr state`: every active claim in this repository,
however old, each with its resource (`issue:<N>`, `pr:<N>`, `resource:<name>`), note,
`owner_status`, `stale`, and `mine`. Combine them with issue-number branch claims and PR
declarations (`Part-of:`/`Finishes:`). A claim whose owner is idle, unknown, or `stale` is
still held; a branch without a PR can still claim work, and a released claim does not release
its branch or PR. A claim absent from the list is released, however it ended: drop it from
follow-up context. A `claim` or `release` line in `broadcasts` is only the echo of this list
and reserves nothing. A free-text announcement from a live peer that holds no claim still
occupies the work it names; that peer predates claims.

Do not routinely interrogate every peer. Resolve only a shortlisted ambiguous claim with
its owner when necessary; a recommendation never transfers ownership. The session that takes
recommended work runs `chattr claim` first, and a refused claim means it was taken after this
snapshot. Distinguish this session (`mine`) from peers:
its own claimed work can continue within its existing authorization.

**Claim coverage:** missing, stale, truncated, or failed coverage means unknown, not unclaimed;
withhold affected work from Unattended and report the uncertainty. Require both
`coverage.complete: true` from `chattr who --repo --coverage` and a `claims` array in
`chattr state`; neither alone proves coverage. A `state` without a `claims` array is a bus
that predates claims: ownership is unavailable, so name that blocker rather than asking
every peer or asking Dave to reconstruct it. Check peer freshness; unknown session status
is not idle.

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
