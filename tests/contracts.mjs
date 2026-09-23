import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const command = readFileSync("profiles/shareview.md", "utf8");
const agent = readFileSync("claude/agents/shareview-radar.md", "utf8");
const must = (text, patterns, label) => patterns.forEach((pattern) => assert.match(text, pattern, label + ": " + pattern));

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
  /all three output\s+sections/i, /no\s+candidate tasks/i,
  /Agent\(subagent_type: "shareview-radar", run_in_background: false\)/,
  /SendMessage/, /agentId/, /ListAgents/, /changed state and removals only/i,
  /one hour/i, /verbatim/i, /unaltered/i,
  /Every invocation, before recommending/i, /chattr state/,
  /chattr who --repo --coverage/, /git ls-remote --heads origin/,
  /gh pr list --state open/, /Do not routinely interrogate.*peer/i,
  /its own claimed work can continue within its existing authorization/,
  /Ownership comes from `claims` in `chattr state`/,
  /idle, unknown, or `stale` is\s+still held/,
  /A claim absent from the list is released/, /recommendation never transfers ownership/,
  /runs `chattr claim` first/, /repository milestone.*current phase/i,
  /board.*milestone.*index.*unreliable/is, /quote multi-word milestone values/i,
  /answer must appear in the main conversation thread/i,
  /transcript pane is not the user-visible reply/i,
  /emit one\s+assistant response in the parent session/i,
  /do not end the\s+slash-command turn until/i,
], "ShareView Radar workflow");

must(agent, [
  /Never run a command that writes/, /Always show all three sections/i,
  /\*\*Radar \(planning agent\)\*\*/, /execution order/i,
  /existing readiness and authorization/i, /30 words/i,
  /decision, approval, verification/i, /preparation.*Unattended/i,
  /sessions and external systems/i, /cross-phase dependencies/i,
  /`Verify` means.*already merged to staging/, /not another merge/,
  /No guessed durations/, /remove every mention of untriaged `New` cards and frozen `HOLD` cards/,
  /If a repository read fails or is incomplete, stop/i, /no\s+candidate tasks/i,
  /Do not prescribe credential or permission changes from an HTTP code/,
  /Remember.*deferred/i, /active claims, branch claims, and open PRs/i,
  /Occupied work.*never.*Unattended/i,
  /This session may continue its own claimed work within existing authorization/,
  /unknown coverage.*Primary blockers/i, /Active claims are the ownership record/,
  /report ownership unavailable/i, /Ready.*Verify.*missing.*risk:.*Priority/s,
  /brief missing-readiness blocker/i, /Never recommend implementation.*missing readiness/i,
  /Untriaged `New` cards.*do not list, assess,\s+rank, or suggest/i,
  /never run triage, analyze triage, or routinely recommend `\/triage`/i,
  /`Ready`.*starting implementation/i, /`HOLD`.*frozen/i,
  /dependencies.*resolved/i, /actor-specific permissions/i,
  /permission to\s+write is not permission to merge/i,
  /PR work.*linked issue.*same readiness/s, /Never put `PR #N` in.*Issue #/,
  /no linked issue.*`—`/, /never invent an issue number/i,
], "ShareView Radar agent");

for (const name of ["Unattended", "Needs human", "Primary blockers"]) {
  assert.ok(agent.includes("### " + name), "missing output section " + name);
}
console.log("radar: ShareView contracts passed");
