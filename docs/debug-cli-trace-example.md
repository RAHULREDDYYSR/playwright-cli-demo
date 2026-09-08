# `tracing-start/stop` + `console` + `requests` inside `--debug=cli`

> Deep-dive companion to `DEBUG_CLI_GUIDE.md §4`. References `references/tracing.md:1-139` and live repo paths.

## When to use

- Flaky add-to-cart (`tests/cart/add-single-product-to-cart.spec.ts:21-25` alert race)
- Cart-total mismatch (`pages/CartPage.ts:49` `toHaveText`)
- Order validation alert not firing (`tests/checkout/place-order-validation-missing-fields.spec.ts:14`)

## Minimal session

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli &
playwright-cli attach tw-XXXX
playwright-cli resume
playwright-cli tracing-start
# ... actions ...
playwright-cli tracing-stop
playwright-cli console
playwright-cli requests
playwright-cli close
kill %1; wait %1 2>/dev/null || true
```

## Example: cart add-to-cart with tracing + console + requests

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli &
playwright-cli attach tw-XXXX
playwright-cli resume
playwright-cli tracing-start

# Navigate to product (pages/HomePage.ts:47)
playwright-cli click e18   # Samsung galaxy s6 → prod.html?idp_=1
playwright-cli snapshot    # confirm h2 + Add to cart visible (pages/ProductPage.ts:15)

# Add to cart — capture dialog correctly (tests/cart/add-single-product-to-cart.spec.ts:21-25)
playwright-cli run-code "async page => { globalThis._dialog = null; page.once('dialog', d => globalThis._dialog = d.message()); }"
playwright-cli click e22   # Add to cart
playwright-cli console     # expect no error; earlier bug was missing waitForEvent
playwright-cli requests    # Demoblaze add-to-cart is client-side (no network), then localStorage write

playwright-cli tracing-stop
# → .playwright-cli/traces/trace-*.trace
# → .playwright-cli/traces/trace-*.network
# → .playwright-cli/traces/resources/
```

Inspect after:

```bash
ls -lh .playwright-cli/traces/
npx playwright show-trace .playwright-cli/traces/trace-*.trace
playwright-cli request 3   # detail for a specific request if any
```

## What each artifact contains

| File | Contains |
|------|----------|
| `trace-*.trace` | Every action, DOM before/after, screenshots, timing, console, source locations (`references/tracing.md:24-32`) |
| `trace-*.network` | All HTTP requests/responses, headers, bodies, timing (`references/tracing.md:34-43`) |
| `resources/` | Cached images/fonts/scripts for replay (`references/tracing.md:45-48`) |
| `playwright-cli console` | Live `console.log/warn/error` from the page — faster than opening the trace |
| `playwright-cli requests` | Live network table — faster than parsing `.network` |

## Second example: order validation (negative flow)

```bash
playwright-cli tracing-start
playwright-cli click e10   # Cart — pages/HomePage.ts:26
playwright-cli click e30   # Place Order — pages/CartPage.ts:14
playwright-cli snapshot    # Place order modal — pages/Modals.ts:138
# Leave Name + Card empty, click Purchase
playwright-cli click e35   # Purchase — pages/Modals.ts:124
playwright-cli console     # alert() is native, not console — check dialog instead
playwright-cli eval "document.querySelector('#orderModal').outerHTML.slice(0,400)"
playwright-cli tracing-stop
```

Expected native alert: `Please fill out Name and Creditcard.` (`tests/checkout/place-order-validation-missing-fields.spec.ts:14`). If missing, `tracing-stop` + Trace Viewer shows whether Purchase click was dispatched before modal fully visible.

## Combining with video (inside same tw-XXXX)

```bash
playwright-cli tracing-start
playwright-cli video-start traces/checkout.webm
playwright-cli video-chapter "Checkout" --description="Placing order" --duration=2000
# ... actions ...
playwright-cli video-stop
playwright-cli tracing-stop
```

## Best practices

1. **Start tracing before the problem** (`references/tracing.md:116-123`) — whole flow, not just the failing step.
2. **Clean up** — `find .playwright-cli/traces -mtime +7 -delete` ( `references/tracing.md:129` ).
3. **Use live `console`/`requests` for quick triage**, `trace/*.trace` for durable evidence in CI.
4. **Do not `networkidle`** — this repo forbids it (`references/test-generation.md:405`).
