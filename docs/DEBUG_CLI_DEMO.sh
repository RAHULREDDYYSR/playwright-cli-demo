#!/usr/bin/env bash
# DEBUG_CLI_DEMO.sh — executable demo of --debug=cli lifecycle
# Project: playwright-cli-demo (https://www.demoblaze.com)
# Seed: tests/seed.spec.ts:5 · Fixtures: tests/fixtures.ts:5 · Config: playwright.config.ts:11
# References: .opencode/skills/playwright-cli/references/playwright-tests.md:16-32
#             .opencode/skills/playwright-cli/references/test-generation.md:204-221
# Usage: ./DEBUG_CLI_DEMO.sh           # dry-run (echo) by default
#        ./DEBUG_CLI_DEMO.sh --live     # actually runs npx playwright test --debug=cli
# Requires: npx, playwright-cli (via npx playwright cli or global), timeout, bash
set -euo pipefail

MODE="${1:-dry-run}"
if [[ "$MODE" == "--live" ]]; then
  DRY_RUN=0
else
  DRY_RUN=1
fi

info()  { echo -e "\033[1;34m[demo]\033[0m $*"; }
ok()    { echo -e "\033[0;32m  ✓\033[0m $*"; }
warn()  { echo -e "\033[0;33m  !\033[0m $*"; }

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

info "Root: $ROOT"
info "Mode: $([ $DRY_RUN -eq 1 ] && echo 'DRY-RUN (no browser launched)' || echo 'LIVE')"

# Detect playwright-cli binary
if command -v playwright-cli >/dev/null 2>&1; then
  CLI="playwright-cli"
elif npx --no-install playwright cli --help >/dev/null 2>&1; then
  CLI="npx playwright cli"
else
  CLI="npx --no-install playwright cli"
  warn "playwright-cli not found globally; using $CLI"
fi
info "CLI: $CLI"

# ─────────────────────────────────────────────────────────────────
# Step 1 — Start debug session in background
# ─────────────────────────────────────────────────────────────────
info "Step 1 — Start background debug session"
echo '  $ PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli &'

SESSION="tw-XXXX"
if [[ $DRY_RUN -eq 1 ]]; then
  # Simulate session name without launching browser
  SESSION="tw-9c12ab"
  echo "  (dry-run) Simulated session: $SESSION"
  echo "  (dry-run) Would print: Debugging Instructions: $CLI attach $SESSION"
else
  # Live: start and wait for tw-XXXX (with timeout guard)
  info "Launching (timeout 30s guard)..."
  set +e
  PLAYWRIGHT_HTML_OPEN=never timeout 30 npx playwright test tests/seed.spec.ts --debug=cli > /tmp/pw-debug-cli.log 2>&1 &
  BG_PID=$!
  set -e
  # Poll for session name
  for i in {1..30}; do
    if grep -qE "tw-[0-9a-f]{4,}" /tmp/pw-debug-cli.log 2>/dev/null; then
      SESSION="$(grep -oE "tw-[0-9a-f]{4,}" /tmp/pw-debug-cli.log | head -1)"
      ok "Found session: $SESSION (after ${i}s)"
      break
    fi
    sleep 1
  done
  if [[ "$SESSION" == "tw-XXXX" ]]; then
    warn "No session found in 30s — showing log head:"
    head -n 50 /tmp/pw-debug-cli.log 2>/dev/null || true
    # cleanup and exit
    kill %1 2>/dev/null || true
    wait %1 2>/dev/null || true
    exit 1
  fi
fi

# ─────────────────────────────────────────────────────────────────
# Step 2 — Attach
# ─────────────────────────────────────────────────────────────────
info "Step 2 — Attach to session"
echo "  \$ $CLI attach $SESSION"
if [[ $DRY_RUN -eq 0 ]]; then
  $CLI attach "$SESSION" || true
fi
ok "attach $SESSION"

# ─────────────────────────────────────────────────────────────────
# Step 3 — Resume (run seed: tests/fixtures.ts:6 → goto('/'))
# ─────────────────────────────────────────────────────────────────
info "Step 3 — Resume (seed runs → https://www.demoblaze.com)"
echo "  \$ $CLI resume"
if [[ $DRY_RUN -eq 0 ]]; then
  $CLI resume || true
fi
ok "seed resumed — page at baseURL (playwright.config.ts:11)"

# ─────────────────────────────────────────────────────────────────
# Step 4 — Snapshot & discovery
# ─────────────────────────────────────────────────────────────────
info "Step 4 — Snapshot & find"
echo "  \$ $CLI snapshot"
echo "  \$ $CLI find \"Add to cart\""
echo "  \$ $CLI find --regex \"/phones/i\""
if [[ $DRY_RUN -eq 0 ]]; then
  $CLI snapshot || true
  $CLI find "Add to cart" || true
fi
ok "snapshot refs e1..eN available; find returns grep -C context"

# ─────────────────────────────────────────────────────────────────
# Step 5 — Interactions (emit Ran Playwright code)
# ─────────────────────────────────────────────────────────────────
info "Step 5 — Interactions (each emits Playwright TS)"
cat <<'CMDS'
  $ playwright-cli click e12
    # Ran: await page.getByRole('link', { name: 'Phones', exact: true }).click();
    #   → pages/HomePage.ts:30

  $ playwright-cli click e18
    # Ran: await page.getByRole('link', { name: 'Samsung galaxy s6', exact: true }).click();
    #   → pages/HomePage.ts:47

  $ playwright-cli fill e3 "Test User"
    # Ran: await page.getByRole('textbox', { name: 'Name:' }).fill('Test User');
CMDS
if [[ $DRY_RUN -eq 0 ]]; then
  $CLI click e12 2>/dev/null || true
fi

# ─────────────────────────────────────────────────────────────────
# Step 6 — Locator / Eval / Highlight
# ─────────────────────────────────────────────────────────────────
info "Step 6 — Locator & eval (for assertions)"
cat <<'CMDS'
  $ playwright-cli --raw generate-locator e5
    # → getByRole('button', { name: 'Purchase' })   # pages/Modals.ts:124

  $ playwright-cli --raw eval "el => el.textContent" e7
    # → "360"

  $ playwright-cli --raw eval "el => el.value" e3
    # → "Test User"

  $ playwright-cli highlight e5 --style="outline: 3px dashed red"
CMDS

# ─────────────────────────────────────────────────────────────────
# Step 7 — DevTools: console / requests / run-code
# ─────────────────────────────────────────────────────────────────
info "Step 7 — DevTools"
cat <<'CMDS'
  $ playwright-cli console
  $ playwright-cli console warning
  $ playwright-cli requests
  $ playwright-cli request 5
  $ playwright-cli run-code "async page => await page.evaluate(() => localStorage.getItem('cart'))"
CMDS

# ─────────────────────────────────────────────────────────────────
# Step 8 — Tracing & Video inside same tw-XXXX
# ─────────────────────────────────────────────────────────────────
info "Step 8 — Tracing & Video (composable inside debug)"
cat <<'CMDS'
  $ playwright-cli tracing-start
  $ playwright-cli video-start demo.webm
  $ playwright-cli click e12
  $ playwright-cli fill e3 "Hello"
  $ playwright-cli video-chapter "Done" --description="Finished" --duration=2000
  $ playwright-cli video-stop
  $ playwright-cli tracing-stop
  # → traces/trace-*.trace + trace-*.network + resources/   (references/tracing.md:22-48)
  # → demo.webm                                             (references/video-recording.md:11-28)
CMDS
if [[ $DRY_RUN -eq 0 ]]; then
  $CLI tracing-start 2>/dev/null || true
  $CLI tracing-stop 2>/dev/null || true
fi

# ─────────────────────────────────────────────────────────────────
# Step 9 — Heal example (dialog race — tests/cart/add-single-product-to-cart.spec.ts:21-25)
# ─────────────────────────────────────────────────────────────────
info "Step 9 — Heal preview (dialog race)"
cat <<'CMDS'
  # Fragile:
  # await product.addToCartLink.click();

  # Healed (rehearsed via CLI + run-code):
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('link', { name: 'Add to cart' }).click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toBe('Product added');
  await dialog.accept();
CMDS

# ─────────────────────────────────────────────────────────────────
# Step 10 — Cleanup
# ─────────────────────────────────────────────────────────────────
info "Step 10 — Cleanup"
cat <<'CMDS'
  $ playwright-cli close
  $ kill %1
  $ wait %1 2>/dev/null || true
  $ playwright-cli close-all 2>/dev/null || true
CMDS
if [[ $DRY_RUN -eq 0 ]]; then
  $CLI close 2>/dev/null || true
  kill %1 2>/dev/null || true
  wait %1 2>/dev/null || true
fi

ok "Demo complete. Dry-run: no browser was launched."
info "For a live run: ./DEBUG_CLI_DEMO.sh --live"
info "Then re-run a healed test: PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/catalog/filter-by-phone-category.spec.ts"
