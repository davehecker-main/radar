import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const command = readFileSync("profiles/shareview.md", "utf8");
const agent = readFileSync("claude/agents/shareview-radar.md", "utf8");
const codexAgent = readFileSync("codex/agents/shareview-radar.toml", "utf8");
const must = (text, patterns, label) => patterns.forEach((pattern) => assert.match(text.replace(/\s+/g, " "), pattern, label + ": " + pattern));

assert.equal(
  agent.split(/^---\n\n/m)[1],
  codexAgent.match(/developer_instructions = """\n([\s\S]*?)"""/)[1],
  "Claude and Codex ShareView agent bodies differ",
);

must(command, [
  /one compact planning snapshot/i, /parallelize\s+independent reads/i,
  /detailed.*discussions.*shortlisted/i, /includeArchived: true/, /issueFieldValues/,
  /IssueFieldSingleSelect/, /Do not re-fetch labels per issue/i,
  /scripts\/board-query\.sh 'is:open'/, /same collected lists/i,
  /MISSING-FROM-BOARD/, /BOARD-ONLY/, /footer.*parsed row count/i,
  /totalCount.*pageInfo/s, /Do not also run `scripts\/board-reconcile\.sh`/,
  /gh issue list --search 'is:open no:milestone'/,
  /Repository access is a hard prerequisite/, /failed, malformed, or incomplete/i,
  /do not spawn or consult Radar/i, /real error/i, /never reuse stale\s+results/i,
  /all five\s+tables/i, /no\s+candidate tasks/i, /no question box/i,
  /Agent\(subagent_type: "shareview-radar", run_in_background: false\)/,
  /SendMessage/, /agentId/, /ListAgents/, /changed state and removals only/i,
  /one hour/i, /verbatim/i, /unaltered/i,
  /Every invocation, before recommending/i, /chattr state/,
  /chattr who --repo --coverage/, /git ls-remote --heads origin/,
  /gh pr list --state open/,
  /its own claimed work can continue\s+within its existing authorization/,
  /for each shortlisted candidate.*`claims`.*branches.*PR.*issue comments/is,
  /full or rolled-over `broadcasts` window.*not an ownership gap/i,
  /free-text announcement.*sender.*current.*`chattr who --repo`/is,
  /absent or `gone`.*reserves nothing/is,
  /reaps gone owners from `claims`/i,
  /idle, unknown, or `stale` is\s+still held/,
  /A claim absent from the list is released/, /recommendation never transfers ownership/,
  /`chattr consult <session_id>`.*Blockers/s,
  /one consult.*one peer.*unclear claim/i,
  /Never propose a peer survey.*asking\s+Dave who owns/is,
  /coverage\.complete: false.*every table/is,
  /missing `claims` array.*every table/is,
  /git worktree list --porcelain/,
  /issue:<N>.*pr:<N>.*resource:<name>/s,
  /runs `chattr claim` first/, /repository milestone.*current phase/i,
  /board.*milestone.*index.*unreliable/is, /quote multi-word milestone values/i,
  /answer must appear in the main conversation thread/i,
  /transcript pane is not the user-visible reply/i,
  /emit one\s+assistant response in the parent session/i,
  /do not end the\s+slash-command turn until/i,
  // rex#18: selection-to-orchestration handoff is the parent's job.
  /1 Unattended batch; 2 Blockers; 3 Priority work; 4 Decisions; 5 Console work/,
  /AskUserQuestion/, /at most four options/i, /Other.*typed `5`/is,
  /never\s+silently drop a category/i, /one concise recommendation/i,
  /all five tables are empty, ask nothing/i, /No answer starts no work/i, /empty category.*No eligible work.*back to the question/is,
  /Deduplicate by issue or action/i, /dispatched once/i,
  /Refresh ownership, eligibility, and collision checks/i, /refused claim removes/i,
  /never substitute/i, /newly claimed/i,
  /session-title\.mjs/, /next user prompt/i, /Codex.*titles its own thread/is,
  /never claim an immediate.*rename/is, /private session storage/i,
  /Selection authorizes only the displayed scope/i,
  /Decisions starts the\s+decision discussion.*does not decide/is,
  /production mutations, credentials, external communications/i,
  /isolation: "worktree"/, /AGENTS\.md rule 16/, /migration/i, /one driver/i,
  /Lanes stop at open PRs and never merge/i, /integration\s+sequentially/i,
], "ShareView Radar workflow");

for (const stale of [/three output\s+sections/i, /Add nothing after it/i, /never starts the recommended work/i, /Primary blockers/]) {
  assert.doesNotMatch(command, stale, "ShareView Radar workflow keeps stale instruction: " + stale);
}

must(agent, [
  /Never run a command that writes/, /Always show all five tables/i,
  /\*\*Radar \(planning agent\)\*\*/, /execution order/i,
  /existing readiness and authorization/i,
  /recommendation and tradeoff/i, /preparation.*Unattended batch/i,
  /dependencies on external systems/i, /cross-phase dependencies/i,
  /`Verify` means.*already merged to staging/, /not another merge/,
  /No guessed durations/, /remove every mention of untriaged `New` cards and frozen `HOLD` cards/,
  /If a repository read fails or is incomplete, stop/i, /no\s+candidate tasks/i,
  /Do not prescribe credential or permission changes from an HTTP code/,
  /Remember.*deferred/i, /active claims, branch claims, and open PRs/i,
  /Occupied work.*never enters any table/i,
  /This session may continue its own claimed work within existing authorization/,
  /Active claims are the ownership record/,
  /withhold only the unresolved resource.*from every table/is,
  /coverage\.complete: false.*missing `claims` array.*every table/is,
  /name which condition failed/i, /Ready.*Verify.*missing.*risk:.*Priority/s,
  /brief missing-readiness blocker/i, /Never recommend implementation.*missing readiness/i,
  /Untriaged `New` cards.*do not list, assess,\s+rank, or suggest/i,
  /never run triage, analyze triage, or routinely recommend `\/triage`/i,
  /`Ready`.*starting implementation/i, /`HOLD`.*frozen/i,
  /dependencies.*resolved/i, /actor-specific permissions/i,
  /permission to\s+write is not permission to merge/i,
  /PR work.*linked issue.*same readiness/s, /Never put `PR #N` in.*Issue #/,
  /no linked issue.*`—`/, /never invent an issue number/i,
  // rex#18: five tables, quiet collision filtering, parent owns the question.
  /No eligible work\./, /more than one table/i, /no word limit/i,
  /including Blockers and Decisions/i, /Do not narrate other sessions/i,
  /no "already being worked on" list/i, /Missing or incomplete ownership evidence is not availability/i,
  /shared files, databases, migrations, dependencies, consoles, deployment state, branches, or PRs/,
  /name the surface and action/i, /The parent asks the selection question/i,
  /held claim, even idle or stale.*no row at all/i, /approvals and verifications belong here/i,
], "ShareView Radar agent");

for (const stale of [/200 words/, /three sections/i, /Needs human/, /Primary blockers/, /afterword/i]) {
  assert.doesNotMatch(agent, stale, "ShareView Radar agent keeps stale instruction: " + stale);
}

const tables = ["1. Unattended batch", "2. Blockers", "3. Priority work", "4. Decisions", "5. Console work"];
const at = tables.map((name) => agent.indexOf("### " + name));
at.forEach((index, i) => assert.ok(index >= 0, "missing output table " + tables[i]));
assert.deepEqual([...at].sort((a, b) => a - b), at, "output tables out of order");
assert.equal(agent.split("| Issue # | Description | Why suggested |").length - 1, 5, "each table needs Issue #, Description, Why suggested");
console.log("radar: ShareView contracts passed");
