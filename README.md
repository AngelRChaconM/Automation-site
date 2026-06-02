# Automation Practice Site

A self-contained site to practice end-to-end test automation, similar to [automationexercise.com](https://automationexercise.com/) but framework-agnostic. Built with Vite + React + TypeScript. No backend, no database, everything runs client-side.

## Stack

- Vite + React 18 + TypeScript
- React Router v6
- Handsontable v17 (data grid)
- Playwright (sample tests; the site itself does not depend on any test runner)

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
| Auth        | `anon`, `user`, `admin` | Simulates role in Settings (for tests). Real login is on `/ecommerce/login` and is required for checkout. Session persists in `localStorage` across pages. |
| Cart / login in header | — | Shown only on `/ecommerce/*` routes. Cart contents persist when you leave and return to the store. |
| Data        | `populated`, `empty`    | Products / posts / table rows are present or empty                |
| Difficulty  | `stable`, `flaky`       | Adds random delays and dynamic test ids in the Flaky page         |

All settings are persisted in `localStorage` and exposed as `data-*` attributes on `<body>`:

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

## Programmatic API: `window.__app`

The site exposes a global helper so tests can force state without going through the UI:

```js
window.__app.setTheme('dark');
window.__app.setLang('en');
window.__app.setCurrency('EUR'); // 'USD' | 'EUR' | 'MXN'
window.__app.setAuth('admin');
window.__app.setDataMode('empty');
window.__app.setDifficulty('flaky');
window.__app.addToCart(1, 2);
window.__app.reset(); // back to defaults
```

Use it from any framework:

```js
// Playwright
await page.evaluate(() => window.__app.setAuth('admin'));

// Cypress
cy.window().then((w) => w.__app.setAuth('admin'));

// Selenium (JS executor)
driver.executeScript("window.__app.setAuth('admin')");
```

## Running tests

### Playwright (included)

```bash
npm start            # in one terminal
npm run test:pw      # in another
# or just:
npm run test:pw      # uses webServer: { reuseExistingServer: true }
```

Specs live in [`tests/playwright/`](tests/playwright/).

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
| `npm run test:pw`   | Run Playwright tests                  |
| `npm run test:pw:ui`| Run Playwright tests in UI mode       |

## Project layout

```
src/
  main.tsx, App.tsx, index.css
  context/AppContext.tsx
  layout/{Layout,HamburgerMenu,SettingsPanel}.tsx
  pages/
    Home.tsx
    ecommerce/{Products,ProductDetail,Cart,SignupLogin,Checkout,Contact}.tsx
    blog/{BlogList,BlogPost}.tsx
    handsontable/HandsOnTablePage.tsx
    playground/{Alerts,Iframes,ShadowDom,Flaky,Files,PlaygroundNav}.tsx
  public/samples/{sample.txt,sample.json,sample.pdf}
  data/{products,posts,tableRows}.ts
  i18n/index.ts
tests/
  playwright/
    {ecommerce,blog,handsontable,playground}.spec.ts
playwright.config.ts
vite.config.ts
tsconfig.json
index.html
package.json
```
