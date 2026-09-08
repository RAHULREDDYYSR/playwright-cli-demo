# Runner + `playwright-cli` Combo vs Manual vs MCP-Driven QA

**Project:** `playwright-cli-demo` (Demoblaze: `https://www.demoblaze.com`)
**Date:** 2026-09-08 · **Scope:** docs-only, no live runs
**Repo state:** `@playwright/test ^1.62.1` (`package.json:8-11`), `playwright.config.ts:1-23`, `specs/demoblaze.plan.md:1-207`, `tests/seed.spec.ts:1-7`, `tests/fixtures.ts:1-9`

**Official sources read:**
- CLI: `https://playwright.dev/docs/getting-started-cli`, `https://playwright.dev/agent-cli/introduction`
- MCP: `https://playwright.dev/docs/getting-started-mcp`, `https://playwright.dev/mcp/introduction`
- Runner: `https://playwright.dev/docs/intro` (+ test-runner concepts: fixtures, isolation, retries, trace/video)
- Upstream skill docs: `.opencode/skills/playwright-cli/references/test-generation.md:1-433`, `references/playwright-tests.md:1-39`
- Repo guide: `docs/DEBUG_CLI_GUIDE.md:1-553`, `DEBUG_CLI_CHEATSHEET.md:1-161`, `DEBUG_CLI_DEMO.sh:1-214`, `docs/HLD.md:1-609`

---

## 1. TL;DR

| Approach | What it is | Best for | Main limitation |
|---|---|---|---|
| **A. Runner + `playwright-cli` combo (this repo)** | `npx playwright test --debug=cli` pauses inside a real test; `playwright-cli attach tw-XXXX` drives that exact `page`/`context`, every action emits copy-paste TypeScript | Committed regression suites with agentic authoring/healing | Requires a seed + fixtures; sequential generation; agent needs shell access |
| **B. Manual Runner (hand-written, no CLI)** | Human writes `*.spec.ts` + POMs directly, runs `npx playwright test`, debugs via Trace Viewer / `--debug` / editor | Bespoke fixtures, complex hooks, teams that prefer full code control | Slowest authoring; locator discovery via DevTools/codegen; no emitted-TS loop |
| **C. MCP-driven (`@playwright/mcp`)** | MCP server exposes `browser_*` tools over Model Context Protocol; agent reasons over inline a11y snapshots | Persistent exploratory loops, IDE-embedded agents without shell, long autonomous sessions | Higher context cost (large tool schemas + verbose trees inline); ephemeral unless persisted; weaker CI story |
| **D. Plain `playwright-cli open <url>` (contrast only)** | Standalone CLI browser with no test harness | Ad-hoc peek / repro sketch | Bypasses `baseURL`/fixtures/`storageState`; locators may diverge from real test |

**Recommendation:** use **A as the default** for anything that must land in CI. Use **C** for open-ended exploration or when the agent has no shell. Use **B** for framework-level work (custom fixtures, sharding, reporters). Never treat **D** as a substitute for A — `DEBUG_CLI_GUIDE.md:118-130` documents why.

---

## 2. Architecture

### A. This repo's combo

```
Worker: npx playwright test --debug=cli
  -> Fixture tests/fixtures.ts:5 (goto '/')
  -> Paused barrier + session tw-XXXX (CDP + Page + Context + baseURL/storageState)
       |
       | attach (Terminal 2)
       v
CLI: resume -> snapshot/find/eval -> click/fill/press/hover
  -> "Ran Playwright code: await page.getByRole(...)" -> paste into tests/**/*.spec.ts + pages/*.ts
  -> console / requests / tracing-start / video-start (composable inside same session)
  -> kill %1 -> npx playwright test (verify green)
```

Source: `DEBUG_CLI_GUIDE.md:43-66,71-112`; `references/playwright-tests.md:16-32`; `DEBUG_CLI_DEMO.sh:40-76`.

### C. MCP loop

```
Agent (IDE) -> MCP client -> stdio/HTTP -> @playwright/mcp server -> browser
  tools: browser_snapshot / browser_click / browser_type / browser_evaluate /
         browser_network_requests / browser_route / browser_storage_state /
         browser_generate_locator / browser_run_code_unsafe (RCE-equivalent)
  each call returns inline a11y snapshot; agent iterates on returned structure
```

Source: `https://playwright.dev/docs/getting-started-mcp`; Context7 `/microsoft/playwright-mcp` tool catalog.

### B. Manual loop

```
Human -> editor (POM + spec.ts) -> npx playwright test -> HTML report + trace.zip
  -> npx playwright show-trace / --debug / codegen -> edit -> re-run
```

No attach session; fidelity comes from re-running the runner, not from driving the live test page.

---

## 3. Head-to-head matrix

| Dimension | A. Runner + CLI (repo) | B. Manual Runner | C. MCP-driven | D. Plain CLI `open` |
|---|---|---|---|---|
| **Source of truth** | Spec file (`demoblaze.plan.md`) + live app; CLI emits TS | Human judgment + docs | Conversation + returned snapshots | Live page only |
| **Test context fidelity** | Exact: same `page` the test uses, fixtures already applied (`fixtures.ts:5`, `playwright.config.ts:11`) | Exact at run time, but authoring is offline | Approximate: separate browser/profile unless wired to same state | Low: no fixtures/auth/`baseURL` |
| **Authoring speed (suite)** | Fast: `snapshot` → `click eN` → paste emitted locator | Slow: hand-write locators, look up APIs | Medium-fast for exploration, slow to harden into suite | Fast to poke, zero suite output |
| **Locator quality** | Semantic `getByRole(..., {exact:true})` by default; `generate-locator --raw` for assertions (`CHEATSHEET.md:62-77`) | Depends on author discipline | `browser_generate_locator` exists, but conversational drift is common | Same emitter as A, wrong context |
| **Assertions** | Manual but guided: `generate-locator` + `eval textContent/value` + `snapshot e5` → `toBeVisible/toHaveText/toHaveValue/toMatchAriaSnapshot` (`test-generation.md:82-138`) | Fully manual | `browser_verify_*` helpers exist; easy to assert too little | Same as A, detached |
| **Determinism / CI** | Full: committed `tests/**/*.spec.ts`, `workers:1`, `retries:0`, `trace: on-first-retry` (`playwright.config.ts:4-13`) | Full (same runner) | Weak: session is interactive; hardening to `*.spec.ts` is a second step | None |
| **Isolation** | Runner `page`/`context` per test + fixture `goto('/')` | Same | MCP profile modes: persistent (default) / `--isolated` / `--extension` | In-memory session, `--persistent` opt-in |
| **Debugging** | Live (`snapshot/find/eval/console/requests/run-code`) + post-hoc (trace/video) in one `tw-XXXX` (`GUIDE.md:291-306`) | Post-hoc (trace/viewer, console, editor breakpoints) | Live tools + `browser_run_code_unsafe`; no native `--debug=cli` bridge | Live only |
| **Healing** | Prescribed loop: repro via `--debug=cli` on `file:line` → diagnose → rehearse fix → patch → re-run → reconcile spec (`test-generation.md:366-423`, `GUIDE.md:246-288`) | Ad-hoc: rerun + inspect trace | Re-prompt and retry; no spec-reconciliation contract | No heal target |
| **Network/mock** | `requests` / `request N` / `route --status/--body` / `run-code` routing (`CHEATSHEET.md:79-89`) | Code-level `page.route` | `browser_network_requests` + `browser_route` + `browser_network_state_set` | Same CLI set as A |
| **Storage/auth** | Inherited from runner; plus `state-save/cookie-*/localstorage-*/sessionstorage-*` (`CHEATSHEET.md:111-121`) | Code-level `storageState` | `browser_storage_state` + cookie/storage tools; Docker image is headless-Chromium-only | Manual `state-load` |
| **Artifacts** | Tiny session + opt-in `traces/*.trace + .network` + `*.webm` with chapters (`GUIDE.md:291-306`) | Same runner artifacts | Screenshots/snapshots inline; video via `--save-video`, `--caps=devtools` | Same CLI artifacts, no suite binding |
| **Token/context cost** | Low: concise commands, snapshots to `.playwright-cli/*.yml` files, `--raw` for piping | Zero agent tokens (human cost instead) | High: tool schemas + full trees inline every turn | Low (same as A) but wasted if re-done under runner |
| **Prerequisites** | Node 20+, `@playwright/test`, `@playwright/cli`, shell + `opencode.json:2-9` allowlist | Node + `@playwright/test` | Node 18/20+, MCP-capable client, `npx @playwright/mcp@latest` JSON config | Same as A minus runner |
| **Auditability** | Every step maps to `spec → emitted TS → spec.ts:line → POM:line` (`HLD.md:280-292`) | Git diff only | Chat transcript; harder to map to files | None |

---

## 4. What each approach looks like in practice

### A. Combo (this repo) — plan → generate → heal

1. **Plan:** explore via seed (`npx playwright test tests/seed.spec.ts --debug=cli &` → `attach tw-XXXX` → `resume` → `snapshot`), write `specs/demoblaze.plan.md` with `**Seed:**`, `**File:**`, numbered `Steps:` + `- expect:` (`test-generation.md:142-278`).
2. **Generate:** one scenario at a time, restart seed between scenarios. `click/fill/press eN` emits `await page.getByRole(...).click()`; `generate-locator --raw` + `eval textContent/value` + `snapshot eN` produce assertions. Collect into `tests/<group>/<kebab>.spec.ts` with `// N. step` comments, `describe` verbatim from spec, import from `../fixtures` (`test-generation.md:281-362`; example `add-single-product-to-cart.spec.ts:1-38`).
3. **Heal:** `npx playwright test <file>:<line> --debug=cli`, `attach`, `snapshot/console/requests/show --annotate`, rehearse fix, patch test, `kill %1`, re-run single then suite. Reconcile spec: technical-only fix → leave spec; behavior change → update steps; ambiguous → ask user with scenario id + snapshot excerpt (`test-generation.md:366-423`; `GUIDE.md:416-498`).
4. **Repo proof:** 14 scenarios → 15 files (14 + seed), 4 POMs, dialog pattern `const p = page.waitForEvent('dialog'); await click(); const d = await p;` (`add-single-product-to-cart.spec.ts:21-25`), cart-timing guards (`expectLoaded`, `toBeHidden({timeout})`).

Rule that separates A from D: *"Do not just open the app URL with `playwright-cli`; always go through the seed"* (`test-generation.md:231,301`).

### B. Manual Runner

Same execution plane (`playwright.config.ts`, fixtures, reporters, Trace Viewer) but authoring is hand-written. Strengths: full control over fixtures (`baseTest.extend`), hooks, sharding, custom matchers, and complex async patterns. Costs: locator discovery via DevTools/`codegen`, slower iteration on drift, no emitted-TS safety net. Use when building framework plumbing, not when grinding out 14 CRUD/modal scenarios.

### C. MCP-driven

Strengths: zero shell/skill setup inside supported IDEs (`Cursor Settings → MCP`, `claude mcp add playwright ...`, VS Code `code --add-mcp ...`); natural-language driving ("Go to … / Click Submit"); good for throwaway exploration, authenticated-profile reuse via `--extension`, and agents without filesystem access.

Weaknesses for QA suites:
- Context bloat: every turn carries tool definitions + returned trees. Official docs state this explicitly: CLI avoids "loading large tool schemas and verbose accessibility trees into the model context," while MCP suits "persistent state and iterative reasoning" where that cost is justified (`getting-started-cli` vs `getting-started-mcp`; `/microsoft/playwright-mcp` README comparison).
- Reported (secondary, unverified here): ~114k tokens via MCP vs ~27k via CLI per task — treat as directional, not measured, since this report is docs-only per scope.
- Hardening gap: chat actions are not committed tests until someone writes `*.spec.ts` + POMs + fixtures. No seed contract, no spec-reconciliation policy.
- `browser_run_code_unsafe` is RCE-equivalent — gate it to trusted clients.

### D. Plain `playwright-cli open` (anti-pattern for suites)

Useful for a 30-second peek. Harmful as a generation source because `baseURL`, fixture `goto('/')`, `storageState`, and seeding side-effects are missing (`GUIDE.md:118-130`). Any locator harvested here must be re-validated under `--debug=cli`.

---

## 5. Cost comparison (qualitative; docs-only, no measurements)

| Cost | A. Combo | B. Manual | C. MCP | Notes |
|---|---|---|---|---|
| Agent tokens / suite | Low. Commands are terse; snapshots spill to `.playwright-cli/page-*.yml`; `--raw` pipes to `jq`/`diff` instead of context | N/A (human time dominates) | High. Schemas + inline snapshots every turn | Secondary reports cite ~4× gap; not re-measured here |
| Human time / suite | Low-medium: review spec + emitted code | High: write + debug everything by hand | Medium: fast to demo, slow to convert to suite | D is cheapest per peek, most expensive if redone |
| Wall-time / run | Runner-determined (`workers:1`, timeouts 10s/15s) | Same | Session-bound; no parallel/ retry/shard model | N/A |
| Artifact size | Small session; medium trace; large video (opt-in, chaptered) | Same as A at run time | Inline images/snapshots inflate transcript; video via flags | Same CLI artifacts as A |
| Maintenance | Low: semantic locators + POM dedup + heal loop + spec contract | Medium: quality depends on author rigor | High if suite is chat-derived without POM/spec discipline | Highest (throwaway) |
| Setup burden | Global `@playwright/cli` + `install --skills` + shell allowlist | `npm init playwright@latest` only | Per-client MCP JSON; `--allowed-hosts`, `--isolated`/`--user-data-dir`, Docker limits | Same as A |

---

## 6. Debugging & observability

- **Combo can do both live and post-hoc in one session** (`GUIDE.md:291-306`): `snapshot --depth/--boxes`, `find --regex`, `generate-locator`, `eval`, `highlight`, `console [warning]`, `requests` / `request N`, `run-code [--filename]`, `tracing-start/stop` → `trace-*.trace + .network + resources/`, `video-start/chapter/stop`, `video-show-actions`, storage introspection, `show --annotate` for human-in-the-loop.
- **Manual** leans post-hoc: `trace: on-first-retry`, `screenshot: only-on-failure`, `npx playwright show-trace`, HTML report. Powerful but round-trip is edit → rerun.
- **MCP** mirrors most CLI devtools as `browser_*` tools, plus `--caps=devtools` traces / Core Web Vitals and `--save-video`. Missing the `--debug=cli` bridge: it cannot pause *inside* `tests/seed.spec.ts:5` with fixtures applied.

Tip from the repo: start `tracing-start` + `video-start` inside the same `tw-XXXX` before reproducing a flake — interactive diagnosis plus durable evidence (`GUIDE.md:306`).

---

## 7. Healing & spec discipline (the combo's edge)

Canonical repo fixes (`HLD.md:318-324`, `GUIDE.md:416-498`):

1. **Strict-mode violation** — `getByRole('button',{name:'Close'})` matches N modals → scope (`modal.getByRole(...)`) or `.last()`; nav links use `{exact:true}` (`pages/HomePage.ts:24-28`, `pages/Modals.ts:31,46,92`).
2. **Dialog race** — register `page.waitForEvent('dialog')` *before* click; validation flows use `page.once('dialog', ...)` (`add-single-product-to-cart.spec.ts:21-25`; `place-order-validation-missing-fields.spec.ts:31`).
3. **Cart async render** — guard with `expectLoaded()` (`Place Order` visible) and `toBeHidden({timeout:10000})` on delete; never `networkidle`/sleeps (`test-generation.md:405`).

Reconciliation policy (no equivalent in MCP/manual flows): technical drift → patch test only; user-visible behavior change → update `demoblaze.plan.md` steps; ambiguous → stop and ask with scenario id + snapshot excerpt.

---

## 8. When to use which

- **Default to A** when the output must be a committed, reviewable, CI-runnable suite. The seed + spec + emitted-TS chain is auditable line-by-line.
- **Use C** when: agent has no shell/filesystem; work is exploratory or a long autonomous sweep; IDE-embedded demo matters more than suite artifacts. Harden anything worth keeping by re-authoring under A.
- **Use B** when: designing fixtures, global setup, sharding/retries/reporters, API+UI composition, or visual/component testing beyond what CLI emission covers.
- **Use D** only for: quick peek, locator sanity check, or docs screenshot. Re-do under A before committing.

**Hybrid actually used in this repo** (`HLD.md:121-142`): `agent-browser`/MCP-style exploration for inventory → spec file → combo for generation/healing → runner for execution. That ordering (explore anywhere, commit through the seed) is the practical takeaway.

---

## 9. Repro appendix (copy-paste, no runs executed for this report)

```bash
# Lifecycle — GUIDE.md:7-16, CHEATSHEET.md:5-18, DEMO.sh:40-76
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli &
# wait for "Debugging Instructions" -> tw-XXXX
playwright-cli attach tw-XXXX
playwright-cli resume                 # seed runs: tests/fixtures.ts:6 -> goto('/')
playwright-cli snapshot               # inventory -> refs e1..eN
# ... click/fill/press/hover/select/check ...
playwright-cli close
kill %1; wait %1 2>/dev/null || true

# Targeted heal — CHEATSHEET.md:142-157
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/catalog/filter-by-phone-category.spec.ts --debug=cli &
playwright-cli attach tw-XXXX; playwright-cli resume; playwright-cli snapshot
playwright-cli find "\\$360"
playwright-cli console; playwright-cli requests
playwright-cli --raw generate-locator e14
playwright-cli --raw eval "el => el.textContent" e14
kill %1; PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/catalog/filter-by-phone-category.spec.ts

# Suite — playwright.config.ts:3-23, package.json:4-7
PLAYWRIGHT_HTML_OPEN=never npx playwright test
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/cart/add-single-product-to-cart.spec.ts

# MCP equivalent setup (for contrast, not used in repo)
# npx @playwright/mcp@latest [--headless] [--browser=firefox] [--isolated] [--caps core,network,storage,devtools]
```

Teardown idiom (`GUIDE.md:513-519`): `playwright-cli close; kill %1; wait %1; playwright-cli close-all`.

---

## 10. References

- Repo: `playwright.config.ts:1-23`, `tests/fixtures.ts:1-9`, `tests/seed.spec.ts:1-7`, `specs/demoblaze.plan.md:1-207`, `pages/HomePage.ts:1-86`, `tests/cart/add-single-product-to-cart.spec.ts:1-38`, `tests/checkout/place-order-success-flow.spec.ts:1-70`, `opencode.json:1-10`
- Guides: `docs/DEBUG_CLI_GUIDE.md`, `docs/DEBUG_CLI_CHEATSHEET.md`, `docs/DEBUG_CLI_DEMO.sh`, `docs/HLD.md`
- Skills: `.opencode/skills/playwright-cli/references/test-generation.md`, `references/playwright-tests.md`, `references/tracing.md`, `references/video-recording.md`
- Official: `https://playwright.dev/docs/getting-started-cli`, `https://playwright.dev/docs/getting-started-mcp`, `https://playwright.dev/mcp/introduction`, `https://playwright.dev/agent-cli/introduction`, `https://playwright.dev/docs/intro`, `https://github.com/microsoft/playwright-cli`, `https://github.com/microsoft/playwright-mcp`

*Docs-only report: token ratios and timing classes are cited from docs/secondary sources, not measured. Line numbers refer to repo state at writing time.*
