# Automation Practice Site

A self-contained site to practice end-to-end test automation, similar to [automationexercise.com](https://automationexercise.com/) but framework-agnostic. Built with Vite + React + TypeScript. No real database — UI settings use `localStorage`; eCommerce auth/cart/checkout use an in-memory mock REST API on the dev server.

## Stack

- Vite + React 18 + TypeScript
- React Router v6
- Handsontable v17 (data grid)

## Quick start

```bash
npm install
npm start
```

The site is served at `http://localhost:3000`.

## Sections (in the hamburger menu)

- **eCommerce** - Products, Product detail, Cart, Login/Signup, Checkout, Contact.
- **Blog** - Post list, post detail with comment form.
- **HandsOnTable** - Editable data grid with sort/filter/validation, context menu, clear-all button and CSV/XLSX/XLS upload (appends rows). Expected columns: `id, name, email, age, country, active, salary`.
- **Playground**
  - **Alerts** - JS `alert`, `confirm`, `prompt`.
  - **Iframes** - content rendered inside an iframe.
  - **Shadow DOM** - content rendered inside a shadow root.
  - **Flaky** - random delays and dynamic test ids when difficulty is `flaky`.
  - **Files** (`/playground/files`) - upload `.txt`, `.json`, `.pdf` (max 2 MB, client-side) and download sample or generated files.

### Files page selectors

| `data-testid` | Purpose |
|---------------|---------|
| `playground-nav-files` | Tab link to Files page |
| `files-choose-btn` | Opens file picker (triggers hidden input) |
| `files-file-input` | Hidden `<input type="file">` — use `setInputFiles` in tests |
| `files-pending-name` / `files-pending-size` | Selected file before upload |
| `files-submit-btn` | Confirm upload after choosing a file |
| `files-clear-pending-btn` | Cancel current selection |
| `files-upload-success` / `files-upload-error` | Upload feedback |
| `files-download-txt` / `files-download-json` / `files-download-pdf` | Static downloads |
| `files-download-generated-btn` | Client-generated `.txt` download |

Sample assets: [`public/samples/`](public/samples/).

## Environment toggles (settings panel, top-right)

| Setting     | Values                  | Effect                                                            |
|-------------|-------------------------|-------------------------------------------------------------------|
| Theme       | `light`, `dark`         | Switches `data-theme` on `<html>` and `<body>`                    |
| Language    | `en` (default), `es`    | Single UI language at a time; toggle via header **EN** / **ES** or Settings |
| Currency    | `USD` (default), `EUR`, `MXN` | Reformats all prices using `Intl.NumberFormat` + fixed conversion rate |
| Auth        | `anon`, `user`, `admin` | Simulates role in Settings (calls login API). Real login is on `/ecommerce/login` and is required for checkout. Session token in `localStorage`. |
| Cart / login in header | — | Shown only on `/ecommerce/*` routes. Cart is stored on the mock API (guest session or user token). |
| Data        | `populated`, `empty`    | Products / posts / table rows are present or empty (stored via `PATCH /api/settings`) |
| Difficulty  | `stable`, `flaky`       | Adds random delays and dynamic test ids in the Flaky page         |

All settings are persisted via **`/api/settings`** (per browser session) and exposed as `data-*` attributes on `<body>`:

```html
<body data-theme="dark" data-lang="en" data-currency="USD" data-auth="user" data-difficulty="stable" data-mode="populated">
```

Prices are stored in USD base in [`src/data/products.ts`](src/data/products.ts) and converted on render via [`src/i18n/currency.ts`](src/i18n/currency.ts).

Product images are local SVGs in [`public/products/`](public/products/) (offline-friendly, no external image CDN).

## Stable selectors

Every interactive element exposes a `data-testid` with the convention `<section>-<element>`. Example:

```html
<button data-testid="product-add-1">Add to cart</button>
<a data-testid="cart-checkout-btn">Proceed to Checkout</a>
```

## REST API (mock backend)

eCommerce and blog content use a **mock REST API** on the same dev server (`http://localhost:3000/api/*`). State lives in memory and resets when the server restarts. The UI calls these endpoints via `fetch`; you can also call them with curl, Postman, or any HTTP client.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | Session | `{ email, password }` → `{ token, email, role, items }` |
| `POST` | `/api/auth/signup` | Session | `{ name, email, password }` → `{ token, email, role, items }` |
| `POST` | `/api/auth/logout` | Bearer | Invalidates token |
| `GET` | `/api/auth/me` | Bearer | Current user `{ email, role }` |
| `GET` | `/api/cart` | Bearer or `X-Session-Id` | `{ items: [{ productId, qty }] }` |
| `POST` | `/api/cart/items` | Bearer or `X-Session-Id` | `{ productId, qty }` → updated cart |
| `DELETE` | `/api/cart/items/:id` | Bearer or `X-Session-Id` | Remove line item |
| `DELETE` | `/api/cart` | Bearer or `X-Session-Id` | Clear cart |
| `GET` | `/api/orders` | Bearer (required) | Order history for logged-in user |
| `POST` | `/api/orders` | Bearer (required) | `{ address, cardName, cardNumber }` → `{ orderId }` |
| `GET` | `/api/products` | — | Catalog; query `?search=&category=&brand=` |
| `GET` | `/api/products/:id` | — | Single product |
| `GET` | `/api/posts` | — | Blog post list (summaries) |
| `GET` | `/api/posts/:id` | — | Post detail with comments |
| `POST` | `/api/posts/:id/comments` | — | `{ author, text }` → `{ comments }` |
| `POST` | `/api/contact` | Session | `{ name, email, subject, message }` |
| `GET` | `/api/settings` | Session | UI prefs `{ theme, lang, currency, difficulty, dataMode }` |
| `PATCH` | `/api/settings` | Session | Partial update of UI prefs |
| `GET` | `/api/table-rows` | Session | Grid rows; query `?search=` |
| `DELETE` | `/api/table-rows` | Session | Clear all rows |
| `POST` | `/api/table-rows/bulk` | Session | Append `{ rows: [...] }` |
| `GET` | `/api/files` | Session | Uploaded file metadata list |
| `POST` | `/api/files` | Session | `{ name, size, type, lastModified, preview }` |
| `POST` | `/api/dev/reset` | Session | Clears mock state for current session tenant |

**Guest cart:** send header `X-Session-Id: <uuid>` on cart routes. The browser stores one automatically. On login, the guest cart merges into the user cart.

**Login rules:** email must contain `@`, password min 4 chars. Email containing `admin` → role `admin`.

**Session header:** most routes below `/api/products` and `/api/posts` require `X-Session-Id` (any string; the UI stores a UUID in `localStorage`). Example:

```bash
curl -X POST http://localhost:3000/api/dev/reset -H "X-Session-Id: my-session"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" -H "X-Session-Id: my-session" \
  -d '{"email":"user@example.com","password":"password"}'
```

## Programmatic API: `window.__app`

The site exposes a global helper so tests can force UI prefs or call through to the REST API:

```js
await window.__app.setTheme('dark');
await window.__app.setLang('en');
await window.__app.setCurrency('EUR'); // 'USD' | 'EUR' | 'MXN'
await window.__app.setAuth('admin'); // logs in via API (password: "password")
await window.__app.setDataMode('empty');
await window.__app.setDifficulty('flaky');
await window.__app.addToCart(1, 2);
await window.__app.reset(); // resets API + UI prefs
```

Call these helpers from your test runner’s browser context (e.g. `page.evaluate`, `cy.window()`, or a JS executor). All methods return Promises.

## Running tests

### Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

In `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: { baseURL: 'http://localhost:3000' },
});
```

Start the site (`npm start`), then run `npx playwright test`. Put specs in the folder you set as `testDir` (for example `tests/playwright/`).

For API-only checks against the mock backend, use Playwright’s `request` fixture with the same `baseURL` and an `X-Session-Id` header on session-scoped routes.

### Cypress

```bash
npm install -D cypress
npx cypress open
```

In `cypress.config.js`:

```js
const { defineConfig } = require('cypress');
module.exports = defineConfig({
  e2e: { baseUrl: 'http://localhost:3000' },
});
```

Put specs under `tests/cypress/`.

### WebdriverIO

```bash
npm install -D @wdio/cli
npx wdio config
```

Set `baseUrl: 'http://localhost:3000'` in `wdio.conf.js`.

### Selenium / Robot Framework / Karate / anything else

Start the site (`npm start`), then point your tool at `http://localhost:3000`. Use the `data-testid` attributes documented above for stable selectors.

## NPM scripts

| Script              | What it does                          |
|---------------------|---------------------------------------|
| `npm start`         | Run dev server on port 3000           |
| `npm run build`     | Type-check and build to `dist/`       |
| `npm run preview`   | Serve the production build on 3000    |

## Project layout

```
src/
  main.tsx, App.tsx, index.css
  context/AppContext.tsx
  api/client.ts
  layout/{Layout,HamburgerMenu,SettingsPanel}.tsx
  pages/
    Home.tsx
    ecommerce/{Products,ProductDetail,Cart,SignupLogin,Checkout,Orders,Contact}.tsx
    blog/{BlogList,BlogPost}.tsx
    handsontable/HandsOnTablePage.tsx
    playground/{Alerts,Iframes,ShadowDom,Flaky,Files,PlaygroundNav}.tsx
  public/samples/{sample.txt,sample.json,sample.pdf}
  data/{products,posts,tableRows}.ts
  i18n/index.ts
server/
  mockApi.ts
vite.config.ts
tsconfig.json
index.html
package.json
```
