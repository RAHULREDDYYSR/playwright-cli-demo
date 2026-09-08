# `npx playwright test --debug=cli` — Cheat Sheet

> Copy-paste commands for `playwright-cli-demo` (`baseURL https://www.demoblaze.com`). All `npx playwright test` invocations use `PLAYWRIGHT_HTML_OPEN=never`.

## Lifecycle (5 steps)

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli &
# wait for "Debugging Instructions" → tw-XXXX
playwright-cli attach tw-XXXX
playwright-cli resume                 # seed runs: tests/fixtures.ts:6 → goto('/')
playwright-cli snapshot               # inventory
# ... interact ...
playwright-cli close
kill %1; wait %1 2>/dev/null || true
```

`--debug=cli` on a specific test: `npx playwright test tests/cart/add-single-product-to-cart.spec.ts:9 --debug=cli`

## Session

| Action | Command |
|--------|---------|
| List sessions | `playwright-cli list` |
| Close one | `playwright-cli close` |
| Close all | `playwright-cli close-all` |
| Kill all | `playwright-cli kill-all` |

## Discovery

```bash
playwright-cli snapshot
playwright-cli snapshot --depth=4
playwright-cli snapshot e12
playwright-cli snapshot --boxes
playwright-cli snapshot --filename=after-click.yaml
playwright-cli find "Add to cart"
playwright-cli find --regex "/add to cart/i"
playwright-cli find --regex "\\$[0-9]+\\.[0-9]{2}"
```

## Interaction (each emits `Ran Playwright code:`)

```bash
playwright-cli click e5
playwright-cli dblclick e7
playwright-cli fill e3 "Test User"
playwright-cli fill e3 "Test User" --submit   # fill + Enter
playwright-cli press Enter
playwright-cli press ArrowDown
playwright-cli hover e4
playwright-cli drag e2 e8
playwright-cli select e9 "USA"
playwright-cli check e12
playwright-cli uncheck e12
playwright-cli upload ./document.pdf
playwright-cli drop e4 --path=./image.png
```

Targeting alternatives: `playwright-cli click "#main > button.submit"` · `playwright-cli click "getByRole('button',{name:'Submit'})"` · `playwright-cli click "getByTestId('submit-button')"`

## Locator & Eval

```bash
playwright-cli --raw generate-locator e5
playwright-cli --raw eval "el => el.textContent" e5
playwright-cli --raw eval "el => el.value" e5
playwright-cli eval "location.href"
playwright-cli eval "document.title"
playwright-cli eval "el => el.getAttribute('data-testid')" e5
playwright-cli highlight e5
playwright-cli highlight e5 --style="outline: 3px dashed red"
playwright-cli highlight e5 --hide
playwright-cli highlight --hide
```

Assertion pattern: `generate-locator` → locator for `expect()` · `eval textContent/value` → expected · `snapshot e5` → `toMatchAriaSnapshot`

## DevTools

```bash
playwright-cli console
playwright-cli console warning
playwright-cli requests
playwright-cli request 5
playwright-cli run-code "async page => await page.context().grantPermissions(['geolocation'])"
playwright-cli run-code --filename=script.js
playwright-cli --raw eval "JSON.stringify(performance.timing)" | jq '.loadEventEnd - .navigationStart'
```

## Tracing

```bash
playwright-cli tracing-start
playwright-cli click e5
playwright-cli tracing-stop
# → .playwright-cli/traces/trace-*.trace + trace-*.network + resources/
# view: npx playwright show-trace .playwright-cli/traces/trace-*.trace
```

## Video

```bash
playwright-cli video-start demo.webm
playwright-cli video-chapter "Checkout" --description="Placing order" --duration=2000
playwright-cli video-show-actions --duration=600 --position=top-right
playwright-cli video-hide-actions
playwright-cli video-stop
```

## Storage

```bash
playwright-cli state-save auth.json
playwright-cli state-load auth.json
playwright-cli cookie-list
playwright-cli cookie-get session_id
playwright-cli localstorage-list
playwright-cli localstorage-get theme
playwright-cli sessionstorage-list
```

## Navigation & Tabs

```bash
playwright-cli goto https://www.demoblaze.com/cart.html
playwright-cli go-back
playwright-cli reload
playwright-cli tab-list
playwright-cli tab-new https://www.demoblaze.com
playwright-cli tab-select 0
```

## Raw / JSON output

```bash
playwright-cli --raw snapshot > before.yml
playwright-cli --raw generate-locator e5 | pbcopy
playwright-cli --json list
```

## Healing quick-fix

```bash
# 1. repro
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/catalog/filter-by-phone-category.spec.ts --debug=cli &
playwright-cli attach tw-XXXX; playwright-cli resume; playwright-cli snapshot
# 2. diagnose
playwright-cli find "\\$360"          # drift?
playwright-cli console                # app error?
playwright-cli requests               # net failure?
# 3. fix
playwright-cli --raw generate-locator e14   # new locator
playwright-cli --raw eval "el => el.textContent" e14  # new expectation
# 4. edit file, then:
kill %1; PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/catalog/filter-by-phone-category.spec.ts
```

## Files

`tests/seed.spec.ts:5` · `tests/fixtures.ts:5` · `playwright.config.ts:11` · `pages/HomePage.ts:26` (`cartLink`) · `pages/ProductPage.ts:15` · `pages/CartPage.ts:14` · `pages/Modals.ts:125` · `DEBUG_CLI_GUIDE.md` · `DEBUG_CLI_DEMO.sh` · `debug-cli-trace-example.md`
