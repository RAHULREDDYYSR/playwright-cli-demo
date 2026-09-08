# AGENTS.md — agent operating contract for this repo

You are an agentic QA engineer in this repo. The method below works on **any public website**;
the Demoblaze store (`https://www.demoblaze.com`) is the worked example already committed here.
Follow this file strictly. When a user prompt conflicts with it, follow the file and say so.

## 1. Stack facts (verify with `read`, do not assume)

- Runner: `@playwright/test` (`package.json`), config `playwright.config.ts:1-23`
  (`testDir: ./tests`, `workers: 1`, `retries: 0`, `baseURL`, `trace: on-first-retry`).
- Skill: `.opencode/skills/playwright-cli/` — `SKILL.md` (command catalog) + `references/`
  (`test-generation.md` = plan → generate → heal contract, `playwright-tests.md` = `--debug=cli`
  mechanics, plus tracing / video / session / storage / request-mocking / running-code refs).
  Load the reference matching the task before acting.
- Layout: `specs/*.plan.md` (test plans) · `pages/*.ts` (POMs — the ONLY place selectors live) ·
  `tests/` (`fixtures.ts`, `seed.spec.ts`, one spec file per scenario) · `docs/` (guides, HLD, comparison).
- Permissions for shell-driven browsers are pre-approved in `opencode.json`.

## 2. Hard rules (no exceptions without asking the user)

1. `PLAYWRIGHT_HTML_OPEN=never` on every `npx playwright test` invocation.
2. Generate and heal **only** through `tests/seed.spec.ts --debug=cli` + `playwright-cli attach tw-XXXX`.
   Never author from bare `playwright-cli open <url>` — it skips fixtures/`baseURL`/`storageState`.
3. One scenario at a time; restart the seed between scenarios; always
   `playwright-cli close` + `kill %1; wait %1 2>/dev/null || true` afterwards.
4. **POM-first healing:** selectors live once in `pages/*.ts` constructors. Test files hold flow +
   assertions only. Fix the POM, never scatter selector edits across specs.
5. No `networkidle`, no sleeps. Use web-first assertions (`toBeVisible`, `toHaveText`,
   `toHaveValue`, `toBeHidden`, `toMatchAriaSnapshot`); `page.waitForEvent('dialog')` BEFORE the click.
6. Spec reconciliation after every heal: technical drift → leave `specs/*.plan.md` alone;
   user-visible behavior change → update Steps/expects; ambiguous → STOP and ask with scenario id +
   snapshot excerpt.
7. Close every finding loop: single-spec re-run green, then full suite green, then report the diff.

## 3. Which skill reference to load

| Task | Load |
|---|---|
| Explore / plan a feature | `references/test-generation.md` §1 (seed concept, spec format) |
| Generate a scenario | `references/test-generation.md` §0–§2 (emission mechanics, one-file rules) |
| Heal a failure | `references/test-generation.md` §3 + `references/playwright-tests.md` |
| Trace / video evidence | `references/tracing.md`, `references/video-recording.md` |
| Auth / storage / mocking | `references/storage-state.md`, `references/request-mocking.md`, `references/running-code.md` |

## 4. Recipes

### Explore → plan (new site or feature)

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli &
playwright-cli attach tw-XXXX
playwright-cli resume                   # fixture navigates to baseURL
playwright-cli snapshot                 # inventory refs e1..eN
playwright-cli click eN / fill eN "..." # walk flows; note URLs, texts, prices
playwright-cli eval "location.href"
playwright-cli close
kill %1; wait %1 2>/dev/null || true
```

Write `specs/<feature>.plan.md`: `## Application Overview` + per-group `**Seed:**` + per-scenario
`#### <n>. <kebab-name>`, `**File:** tests/<group>/<kebab-name>.spec.ts`, numbered user-level
`Steps:` with `- expect:` per observable. Example: `specs/demoblaze.plan.md:1-60`.

### Scaffold (new site: change `baseURL`, keep the shape)

`playwright.config.ts` (`testDir`, `workers: 1` when state is shared, `retries: 0`, trace/screenshot) ·
`tests/fixtures.ts` (`page.goto('/')` + re-export `expect`) · `tests/seed.spec.ts` (empty anchor test).

### POMs (harvest, then harden)

```bash
playwright-cli --raw generate-locator eN              # candidate locator
playwright-cli --raw eval "el => el.textContent" eN   # expected value
```

Prefer `getByRole(..., { exact: true })`; scope duplicates to a region
(`page.locator('#id').getByRole(...)`, `.last()` as escape hatch); put reusable behavior in methods
(`addToCartAndAcceptAlert`, `expectLoaded`, `fillOrder`). Example: `pages/HomePage.ts:20-56`,
`pages/ProductPage.ts:24-36`, `pages/CartPage.ts:22-25`, `pages/Modals.ts:31,46,92`.

### Generate (per scenario)

Drive the spec's steps in the seed session, collect `Ran Playwright code`, add manual assertions
(`generate-locator` → locator, `eval textContent/value` → expected, `snapshot eN` →
`toMatchAriaSnapshot`). Write the file with `// spec:` + `// seed:` headers, `// N. <step>` comments,
verbatim `describe`, import from `../fixtures`. Run it immediately. Example:
`tests/cart/add-single-product-to-cart.spec.ts:1-38`.

### Heal (POM-first)

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test <file>:<line> --debug=cli &
playwright-cli attach tw-XXXX
playwright-cli resume
playwright-cli snapshot                 # moved / renamed?
playwright-cli find "<text>"            # grep with context
playwright-cli console                  # app error?
playwright-cli requests                 # failed payload?
playwright-cli snapshot --boxes         # visibility?
playwright-cli --raw generate-locator eN
playwright-cli --raw eval "el => el.textContent" eN
# patch pages/*.ts, then:
kill %1; wait %1 2>/dev/null || true
PLAYWRIGHT_HTML_OPEN=never npx playwright test <file>
PLAYWRIGHT_HTML_OPEN=never npx playwright test
```

Canonical fixes: scope duplicates / add `exact: true` · `waitForEvent('dialog')` before click ·
guard async renders (`expectLoaded`, `toBeHidden({ timeout })`). Worked cases: `README.md` §5,
`docs/DEBUG_CLI_GUIDE.md:416-498`.

## 5. Invocation note (OpenCode / Claude Code / Copilot CLI)

The commands above are identical on every host. Only the trigger differs: name the
`playwright-cli` skill explicitly in OpenCode (no `AGENTS.md` router is assumed by the caller —
this file IS the router: if the task matches §3, load that reference). Claude Code may auto-invoke
via the skill description or `/playwright-cli`; Copilot CLI via explicit skill mention.
`--raw` output is for piping (`jq`, `diff`, capture to variables), never paste raw dumps into chat.

## 6. Done criteria (check before replying)

- [ ] Seed session closed, background job killed (`close-all` if unsure).
- [ ] Single spec green, then full suite green (or failure quoted with console/requests evidence).
- [ ] `git diff --stat` shows POM-only change for technical heals; spec updated only for behavior change.
- [ ] New files follow one-test-per-file, `// spec:`/`// seed:` headers, `// N.` step comments.
