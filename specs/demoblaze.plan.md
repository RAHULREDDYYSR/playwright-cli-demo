# Demoblaze Store Test Plan

## Application Overview

Demoblaze (https://www.demoblaze.com/) is a demo e-commerce store selling Phones, Laptops and Monitors. Users can browse categories from the homepage, view product details (price, description), add products to cart via alert confirmation, manage cart contents (view total, delete items), place orders through a checkout modal, and interact with navbar modals for Contact, About us (video), Log in and Sign up. The plan covers catalog navigation, product detail, cart persistence, authentication modal validation, contact/about flows and end-to-end checkout.

## Test Scenarios

### 1. Catalog and Navigation

**Seed:** `tests/seed.spec.ts`

#### 1.1. filter-by-phone-category

**File:** `tests/catalog/filter-by-phone-category.spec.ts`

**Steps:**
  1. Click link "Phones" in categories sidebar
    - expect: link "Phones" becomes active, product grid shows only phone products including "Samsung galaxy s6", "Nokia lumia 1520", "Nexus 6"
    - expect: heading "$360" and "Samsung galaxy s6" link visible, heading "$820" for "Nokia lumia 1520" visible
  2. Click link "Monitors" in categories sidebar
    - expect: link "Monitors" becomes active, grid shows only "Apple monitor 24" ($400) and "ASUS Full HD" ($230)
    - expect: phone product "Samsung galaxy s6" is no longer visible

#### 1.2. filter-by-laptop-category

**File:** `tests/catalog/filter-by-laptop-category.spec.ts`

**Steps:**
  1. Click link "Laptops" in categories sidebar
    - expect: link "Laptops" becomes active, grid shows "Sony vaio i5", "Sony vaio i7", "MacBook air", "Dell i7 8gb"
    - expect: heading "$1100" with link "MacBook Pro" visible
  2. Click link "Home" in navbar to reset filter
    - expect: page URL is "https://www.demoblaze.com/index.html" or "/", category filter cleared, "Samsung galaxy s6" visible again

#### 1.3. navigate-to-product-details

**File:** `tests/catalog/navigate-to-product-details.spec.ts`

**Steps:**
  1. Click link "Samsung galaxy s6" on homepage
    - expect: navigates to URL containing "prod.html?idp_=1", heading "Samsung galaxy s6" (level 2) visible
    - expect: heading "$360 *includes tax" visible, paragraph contains "1.5GHz octa-core Samsung Exynos 7420"
    - expect: link "Add to cart" visible
  2. Click link "Home" or browser back
    - expect: navigates back to homepage with "CATEGORIES" and product grid visible

#### 1.4. carousel-navigation

**File:** `tests/catalog/carousel-navigation.spec.ts`

**Steps:**
  1. Verify carousel image "First slide" is visible on load
    - expect: image with alt "First slide" visible, button "Next" visible, button "Previous" visible
  2. Click button "Next" in carousel
    - expect: image with alt "Second slide" becomes visible (or "Third slide" after second click)
  3. Click button "Previous" in carousel
    - expect: image with alt "First slide" visible again

### 2. Cart Operations

**Seed:** `tests/seed.spec.ts`

#### 2.1. add-single-product-to-cart

**File:** `tests/cart/add-single-product-to-cart.spec.ts`

**Steps:**
  1. Click link "Samsung galaxy s6" on homepage
    - expect: page URL contains "prod.html?idp_=1"
  2. Click link "Add to cart"
    - expect: native alert dialog appears with message "Product added"
  3. Accept alert dialog
    - expect: alert dismissed, remains on product page "prod.html?idp_=1"
  4. Click link "Cart" in navbar
    - expect: navigates to "cart.html", table shows row with cell "Samsung galaxy s6" and cell "360", heading "360" under "Total" visible

#### 2.2. remove-product-from-cart

**File:** `tests/cart/remove-product-from-cart.spec.ts`

**Steps:**
  1. Add "Samsung galaxy s6" to cart (open prod.html?idp_=1, click Add to cart, accept "Product added" alert)
    - expect: alert "Product added" accepted
  2. Click link "Cart"
    - expect: row "Samsung galaxy s6" with "Delete" link visible, total "360"
  3. Click link "Delete" in the product row
    - expect: row "Samsung galaxy s6" is removed from table, cart table body empty
    - expect: total heading no longer shows "360" (empty or 0)

#### 2.3. cart-persistence-after-reload

**File:** `tests/cart/cart-persistence-after-reload.spec.ts`

**Steps:**
  1. Add "Nexus 6" to cart (open prod.html?idp_=3, click Add to cart, accept alert) then go to Cart
    - expect: alert "Product added" accepted, cart shows "Nexus 6" with price "650"
  2. Reload the page
    - expect: cart still shows row "Nexus 6" and price "650", total "650" persists (localStorage)
  3. Click link "Home" then click link "Cart" again
    - expect: cart still shows "Nexus 6" (persistence across navigation)

### 3. Authentication Modals

**Seed:** `tests/seed.spec.ts`

#### 3.1. signup-validation-empty-fields

**File:** `tests/auth/signup-validation-empty-fields.spec.ts`

**Steps:**
  1. Click link "Sign up" in navbar
    - expect: dialog with heading "Sign up" visible, textboxes "Username:" and "Password:" visible, button "Sign up" visible
  2. Click button "Sign up" without filling fields
    - expect: native alert with message "Please fill out Username and Password." appears
  3. Accept alert
    - expect: dialog "Sign up" remains open, no navigation

#### 3.2. login-validation-empty-fields

**File:** `tests/auth/login-validation-empty-fields.spec.ts`

**Steps:**
  1. Click link "Log in" in navbar
    - expect: dialog with heading "Log in" visible, textboxes "Username:" and "Password:" visible
  2. Click button "Log in" with empty fields
    - expect: native alert with message "Please fill out Username and Password." appears
  3. Accept alert then click button "Close" (×) to dismiss modal
    - expect: alert dismissed, after closing dialog is hidden, homepage grid visible

#### 3.3. open-and-close-auth-modals

**File:** `tests/auth/open-and-close-auth-modals.spec.ts`

**Steps:**
  1. Click link "Log in"
    - expect: dialog "Log in" visible
  2. Click button "Close" in Log in modal
    - expect: dialog hidden, link "Log in" still visible in navbar
  3. Click link "Sign up"
    - expect: dialog "Sign up" visible
  4. Click button "Close" (×) in Sign up modal header
    - expect: dialog hidden, homepage content visible

### 4. Contact and About

**Seed:** `tests/seed.spec.ts`

#### 4.1. send-contact-message

**File:** `tests/misc/send-contact-message.spec.ts`

**Steps:**
  1. Click link "Contact" in navbar
    - expect: dialog with heading "New message" visible, textboxes "Contact Email:", "Contact Name:", "Message:" visible, button "Send message" visible
  2. Type "test@example.com" into textbox "Contact Email:" and "Test User" into "Contact Name:" and "Hello from Playwright" into "Message:"
    - expect: textboxes contain typed values
  3. Click button "Send message"
    - expect: native alert with message "Thanks for the message!!" appears
  4. Accept alert
    - expect: dialog closes, homepage grid still visible

#### 4.2. about-us-video-modal

**File:** `tests/misc/about-us-video-modal.spec.ts`

**Steps:**
  1. Click link "About us" in navbar
    - expect: dialog with heading "About us" visible, region "Video Player" visible, button "Play Video" visible, button "Close" visible
  2. Click button "Play Video"
    - expect: video playback starts (Play button state changes or video element not error)
  3. Click button "Close" in About us modal
    - expect: dialog hidden, homepage visible, navbar links still interactable

### 5. Checkout

**Seed:** `tests/seed.spec.ts`

#### 5.1. place-order-success-flow

**File:** `tests/checkout/place-order-success-flow.spec.ts`

**Steps:**
  1. Add "Samsung galaxy s6" to cart (open prod.html?idp_=1, click Add to cart, accept "Product added") and go to Cart
    - expect: cart shows "Samsung galaxy s6" and total "360", button "Place Order" visible
  2. Click button "Place Order"
    - expect: dialog "Place order" visible with text "Total: 360", textboxes "Name:", "Country:", "City:", "Credit card:", "Month:", "Year:" visible, buttons "Close" and "Purchase" visible
  3. Type "Test User" into textbox "Name:", "USA" into "Country:", "NYC" into "City:", "1234567890123456" into "Credit card:", "12" into "Month:", "2026" into "Year:"
    - expect: textboxes contain typed values
  4. Click button "Purchase"
    - expect: success modal with heading "Thank you for your purchase!" visible, paragraph contains "Amount: 360 USD" and "Card Number: 1234567890123456" and "Name: Test User", button "OK" visible
  5. Click button "OK"
    - expect: success modal closes, redirects to index.html, cart table empty on next visit to cart.html

#### 5.2. place-order-validation-missing-fields

**File:** `tests/checkout/place-order-validation-missing-fields.spec.ts`

**Steps:**
  1. Add "Apple monitor 24" to cart (open prod.html?idp_=10, click Add to cart, accept alert) and go to Cart and click "Place Order"
    - expect: dialog "Place order" visible with Total "400"
  2. Leave "Name:" and "Credit card:" empty, click button "Purchase"
    - expect: native alert with message "Please fill out Name and Creditcard." appears
  3. Accept alert
    - expect: dialog "Place order" remains open, Purchase button still visible
  4. Click button "Close" in Place order modal
    - expect: dialog hidden, cart still shows "Apple monitor 24" and total "400"
