# Adding a New Bank to La Media

This guide walks you through adding support for a new Uruguayan bank to the La Media currency converter application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Overview](#architecture-overview)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Tips & Best Practices](#tips--best-practices)

---

## Overview

**Time Estimate**: ~1 hour (down from ~4 hours with the previous architecture)

Adding a new bank involves:
- **Backend**: Creating a scraper and registering it
- **Frontend**: Adding configuration, styling, and a composable
- **Integration**: Connecting the pieces through routing

The multi-bank architecture uses centralized registries and factory patterns, making the process straightforward and repetitive.

---

## Prerequisites

Before you begin, ensure you have:

- [ ] **Node.js & pnpm** installed
- [ ] **Development server running** (`pnpm dev`)
- [ ] **Bank's website URL** with exchange rates (USD/UYU)
- [ ] **Bank's logo** (SVG or WebP format recommended)
- [ ] **Bank's brand colors** (primary, accent)
- [ ] **Basic understanding** of Vue 3, TypeScript, and regex

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Netlify)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Scraper (utils/newbank-scraper.mts)                    │
│     └─> Fetches HTML and extracts rates                    │
│                                                             │
│  2. Registry (utils/scraper-registry.mts)                  │
│     └─> Maps 'newbank' → scrapeNewBankRates()             │
│                                                             │
│  3. Scheduled Function (update-all-rates.mts)              │
│     └─> Runs scrapers every 15 min → Stores in Blobs      │
│                                                             │
│  4. Edge Function (get-newbank-rates.mts)                  │
│     └─> Serves cached data from Blobs at /api/newbank     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vue 3)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Types (src/types/banks.ts)                             │
│     └─> Add 'newbank' to BankId union                      │
│                                                             │
│  2. Config (src/config/banks.ts)                           │
│     └─> Bank metadata (name, logo, URL)                    │
│                                                             │
│  3. CSS Theme (src/assets/themes/newbank.css)              │
│     └─> CSS variables for colors and gradients            │
│                                                             │
│  4. Composable (src/composables/currency/useNewBankCurrency.ts) │
│     └─> Wraps createCurrencyComposable with /api/newbank  │
│                                                             │
│  5. Registry (src/composables/currency/useBankCurrency.ts) │
│     └─> Maps 'newbank' → useNewBankCurrency()             │
│                                                             │
│  6. Router (src/router.ts)                                 │
│     └─> Route /newbank → BankView with bankId prop        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Implementation

### Step 1: Add Bank ID to Type Definition

**File**: `src/types/banks.ts`

```typescript
/**
 * Bank identifier union type
 * This is the canonical frontend type definition
 * Must match backend definition in netlify/functions/utils/scraper-registry.mts
 */
export type BankId = 'brou' | 'itau' | 'santander' | 'bbva' | 'bcu' | 'newbank'

/**
 * Type guard to check if a string is a valid BankId
 */
export function isBankId(value: string): value is BankId {
  return ['brou', 'itau', 'santander', 'bbva', 'bcu', 'newbank'].includes(value)
}
```

**What to change**:
- Add `'newbank'` to the `BankId` union type
- Add `'newbank'` to the `isBankId` array

---

### Step 2: Create the Backend Scraper

**File**: `netlify/functions/utils/newbank-scraper.mts`

```typescript
import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

/**
 * Pure function that scrapes New Bank's website for USD exchange rates
 * @returns USD exchange rates
 * @throws Error if exchange rate not found in HTML
 */
export async function scrapeNewBankRates(): Promise<ExchangeRate> {
  const url = 'https://www.newbank.com.uy/cotizaciones';

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const html = await response.text();

  // TODO: Adjust regex to match New Bank's HTML structure
  // Look for patterns like: "Compra: 39.50" and "Venta: 40.20"
  const regex = /Dólar[\s\S]*?Compra[:\s]*([\d,.\s]+)[\s\S]*?Venta[:\s]*([\d,.\s]+)/i;
  const match = html.match(regex);

  if (!match) {
    throw new Error('USD exchange rate not found in HTML');
  }

  const buy = parseFloat(match[1].trim().replace(',', '.'));
  const sell = parseFloat(match[2].trim().replace(',', '.'));
  const average = parseFloat(((buy + sell) / 2).toFixed(2));

  return {
    average,
    buy,
    sell,
    currency: USD_CURRENCY
  };
}
```

**How to find the right regex**:

1. Visit the bank's exchange rates page in your browser
2. Right-click → "View Page Source"
3. Search for the USD rates (usually labeled "Dólar", "USD", or "Dólar Estadounidense")
4. Look for patterns around "Compra" (buy) and "Venta" (sell)
5. Create a regex that captures the two numbers

**Example** from BROU:
```html
<p class="valor">39,50</p>  <!-- Compra -->
<p class="valor">40,20</p>  <!-- Venta -->
```

**Regex breakdown**:
- `Dólar[\s\S]*?` - Find "Dólar" followed by any characters (non-greedy)
- `([\d,.\s]+)` - Capture group: digits, commas, dots, whitespace
- `[\s\S]*?` - Any characters between buy and sell
- `([\d,.\s]+)` - Second capture group for sell rate

---

### Step 3: Register Scraper in Backend Registry

**File**: `netlify/functions/utils/scraper-registry.mts`

Add your scraper to the map:

```typescript
import { scrapeBrouRates } from './brou-scraper.mts';
import { scrapeItauRates } from './itau-scraper.mts';
import { scrapeNewBankRates } from './newbank-scraper.mts'; // ADD THIS

export const BANK_SCRAPER_MAP: Record<BankId, () => Promise<ExchangeRate>> = {
  brou: scrapeBrouRates,
  itau: scrapeItauRates,
  newbank: scrapeNewBankRates, // ADD THIS
  santander: async () => { throw new Error('Santander scraper not implemented') },
  bbva: async () => { throw new Error('BBVA scraper not implemented') },
  bcu: async () => { throw new Error('BCU scraper not implemented') }
}
```

Add the bank to the active banks list:

```typescript
/**
 * Returns list of banks that should be actively scraped
 * Excludes "coming soon" banks that don't have real scrapers
 */
export function getActiveBanks(): BankId[] {
  return ['brou', 'itau', 'newbank'] // ADD 'newbank' HERE
}
```

**What happens now**:
- The scheduled function (`update-all-rates.mts`) will automatically pick up your bank
- Every 15 minutes, it will run `scrapeNewBankRates()` in parallel with other banks
- Results will be stored in Netlify Blobs with key `newbank-latest`

---

### Step 4: Create the Edge Function

**File**: `netlify/edge-functions/get-newbank-rates.mts`

Copy `get-brou-rates.mts` and make these changes:

```typescript
import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { scrapeNewBankRates } from '../functions/utils/newbank-scraper.mts'; // CHANGE
import type { ExchangeRateRecord } from '../../shared/types/exchange-rates.mts';

export default async (_request: Request, _context: Context) => {
  try {
    const store = getStore('rates');
    const cachedRates = await store.get('newbank-latest', { type: 'json' }) as ExchangeRateRecord | null; // CHANGE KEY

    if (cachedRates) {
      return new Response(JSON.stringify(cachedRates), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, max-age=0, must-revalidate'
        }
      });
    }

    // Fallback: if Blobs is empty, scrape directly
    console.warn('⚠️ Blobs empty, executing fallback scraping');
    const rates = await scrapeNewBankRates(); // CHANGE
    const dataToStore: ExchangeRateRecord = {
      ...rates,
      metadata: {
        scrapedAt: new Date().toISOString(),
        nextRunAt: null,
        source: 'fallback' as const
      }
    }

    await store.setJSON('newbank-latest', dataToStore); // CHANGE KEY

    return new Response(JSON.stringify(dataToStore), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

export const config: Config = {
  path: '/api/newbank', // CHANGE PATH
  cache: 'manual',
};
```

**Changes summary**:
1. Import `scrapeNewBankRates` instead of `scrapeBrouRates`
2. Change Blobs key from `'brou-latest'` to `'newbank-latest'` (2 places)
3. Change path from `'/api/brou'` to `'/api/newbank'`

---

### Step 5: Add Frontend Configuration

**File**: `src/config/banks.ts`

```typescript
export const BANKS: Record<string, BankConfig> = {
  // ...existing banks
  newbank: {
    id: 'newbank',
    name: 'New Bank',
    displayName: 'La Media New Bank',
    logoUrl: '/assets/banks/newbank.webp', // Place in public/assets/banks/
    websiteUrl: 'https://www.newbank.com.uy',
    route: '/newbank'
  }
}
```

**Logo requirements**:
- Place the logo file in `public/assets/banks/` directory
- Recommended formats: `.svg` (scalable) or `.webp` (compressed)
- Recommended size: 200x200px minimum
- Transparent background preferred

---

### Step 6: Create CSS Theme

**File**: `src/assets/themes/newbank.css`

```css
/* New Bank Theme */
[data-bank="newbank"] {
  --bank-primary: #1e3a8a;
  --bank-primary-light: #2563eb;
  --bank-primary-rgb: 30, 58, 138;
  --bank-primary-light-rgb: 37, 99, 235;

  --bank-accent: #fbbf24;
  --bank-accent-rgb: 251, 191, 36;

  /* Gradient stops (dark blue → primary blue) */
  --bank-gradient-from: #0a0e1f;    /* 0% - dark background */
  --bank-gradient-stop1: #0f1a2e;   /* 30% */
  --bank-gradient-via: #1e3a8a;     /* 60% - primary color */
  --bank-gradient-to: #2563eb;      /* 100% - primary light */
}
```

**Import the theme** in `src/assets/main.css`:

```css
@import "./themes/brou.css";
@import "./themes/itau.css";
@import "./themes/santander.css";
@import "./themes/bbva.css";
@import "./themes/bcu.css";
@import "./themes/newbank.css";  /* ADD THIS LINE */
```

**CSS Variables explained**:

| Variable | Purpose | Example |
|----------|---------|---------|
| `--bank-primary` | Main brand color (buttons, borders) | `#1e3a8a` |
| `--bank-primary-light` | Lighter variant (hovers, highlights) | `#2563eb` |
| `--bank-primary-rgb` | RGB values for opacity effects | `30, 58, 138` |
| `--bank-primary-light-rgb` | RGB values for lighter variant | `37, 99, 235` |
| `--bank-accent` | Accent color (icons, highlights) | `#fbbf24` |
| `--bank-accent-rgb` | RGB values for accent | `251, 191, 36` |
| `--bank-gradient-from` | Gradient start (dark) | `#0a0e1f` |
| `--bank-gradient-stop1` | Gradient 30% stop | `#0f1a2e` |
| `--bank-gradient-via` | Gradient 60% stop | `#1e3a8a` |
| `--bank-gradient-to` | Gradient end (light) | `#2563eb` |

**How to extract brand colors**:
1. Visit the bank's website
2. Use browser DevTools → Inspect Element
3. Look for common UI elements (buttons, headers)
4. Copy the color values from CSS
5. Alternative: Search "[Bank Name] brand colors" online

---

### Step 7: Create Frontend Composable

**File**: `src/composables/currency/useNewBankCurrency.ts`

```typescript
import { createCurrencyComposable } from "./createCurrencyComposable";

export function useNewBankCurrency() {
  return createCurrencyComposable({
    endpoint: '/api/newbank',
    bankName: 'New Bank'
  })
}
```

**That's it!** The factory handles:
- Fetching exchange rates from `/api/newbank`
- Bidirectional USD ↔ UYU conversion
- Input formatting with Uruguayan locale
- WhatsApp sharing functionality
- Error handling and retry logic

---

### Step 8: Register Composable in Frontend Registry

**File**: `src/composables/currency/useBankCurrency.ts`

```typescript
import { useBrouCurrency } from './useBrouCurrency'
import { useItauCurrency } from './useItauCurrency'
import { useNewBankCurrency } from './useNewBankCurrency' // ADD THIS

const BANK_COMPOSABLE_MAP: Record<BankId, () => ReturnType<typeof useBrouCurrency>> = {
  brou: useBrouCurrency,
  itau: useItauCurrency,
  newbank: useNewBankCurrency, // ADD THIS
  santander: useBrouCurrency,
  bbva: useItauCurrency,
  bcu: useBrouCurrency
}
```

---

### Step 9: Add Router Configuration

**File**: `src/router.ts`

```typescript
const routes: RouteRecordRaw[] = [
  // ...existing routes
  {
    path: '/newbank',
    name: 'newbank',
    component: BankView,
    props: { bankId: 'newbank' as BankId }
  },
  // ...catch-all route
]
```

**What this does**:
- Maps URL `/newbank` to the BankView component
- Passes `bankId: 'newbank'` as a prop
- BankView automatically uses the right composable via `useBankCurrency('newbank')`

---

### Step 10: Update Tests (Optional but Recommended)

**File**: `src/types/__tests__/banks.spec.ts`

If tests exist, update them to include the new bank:

```typescript
describe('BankId type', () => {
  it('should include all expected bank IDs', () => {
    const validBanks: BankId[] = ['brou', 'itau', 'santander', 'bbva', 'bcu', 'newbank']
    // Test logic...
  })
})
```

---

## Testing & Verification

### Local Testing Checklist

- [ ] **Type Checking**: Run `pnpm type-check` (should pass without errors)
- [ ] **Linting**: Run `pnpm lint` (should pass without errors)
- [ ] **Build**: Run `pnpm build` (should succeed)
- [ ] **Dev Server**: Start `pnpm dev`
- [ ] **Navigate**: Visit `http://localhost:5173/newbank`
- [ ] **Verify UI**: Check that logo, colors, and theme load correctly
- [ ] **Test Scraper**: Manually invoke scheduled function:
  ```bash
  netlify functions:invoke update-all-rates --port 5173
  ```
- [ ] **Check Blobs**: Verify data was stored:
  ```bash
  netlify blobs:get rates newbank-latest
  ```
- [ ] **Test Conversion**: Enter USD amount, verify UYU calculation
- [ ] **Swap Direction**: Click swap button, verify UYU → USD works
- [ ] **Share Button**: Test WhatsApp share functionality
- [ ] **Error Handling**: Stop scraper (simulate error), verify error banner appears
- [ ] **Retry**: Click retry button, verify it re-fetches data

### Manual Scraper Testing

Test your scraper function directly:

```typescript
// In browser console or Node.js REPL
import { scrapeNewBankRates } from './netlify/functions/utils/newbank-scraper.mts'

const rates = await scrapeNewBankRates()
console.log(rates)
// Expected: { buy: 39.5, sell: 40.2, average: 39.85, currency: 'USD' }
```

### Production Deployment Checklist

After deploying to Netlify:

- [ ] **Check Scheduled Function Logs**:
  - Netlify Dashboard → Functions → `update-all-rates` → Logs
  - Verify "newbank" appears in successful scraping logs
- [ ] **Trigger Manual Run**:
  - Click "Run now" button in Netlify dashboard
  - Verify no errors for newbank
- [ ] **Test Edge Function**:
  - Visit `https://your-site.netlify.app/api/newbank`
  - Should return JSON with rates
- [ ] **Test Frontend**:
  - Visit `https://your-site.netlify.app/newbank`
  - Verify all functionality works
- [ ] **Monitor for 30 Minutes**:
  - Ensure scheduled function runs every 15 minutes
  - Check that newbank data updates

---

## Troubleshooting

### Common Issues

#### 1. Type Error: "Type 'newbank' is not assignable to type 'BankId'"

**Cause**: Forgot to add `'newbank'` to `BankId` union type

**Solution**: Update `src/types/banks.ts` (Step 1)

---

#### 2. Scraper Error: "USD exchange rate not found in HTML"

**Cause**: Regex doesn't match the bank's HTML structure

**Debug steps**:

1. Log the HTML to see what you're working with:
   ```typescript
   const html = await response.text();
   console.log(html); // Inspect the structure
   ```

2. Use an online regex tester: https://regex101.com/
   - Paste the HTML
   - Test your regex pattern
   - Adjust until both buy and sell rates are captured

3. Common variations:
   ```typescript
   // If rates use "." as decimal separator:
   const buy = parseFloat(match[1].trim());

   // If rates use "," as decimal separator:
   const buy = parseFloat(match[1].trim().replace(',', '.'));

   // If rates have thousands separator:
   const buy = parseFloat(match[1].trim().replace(/\./g, '').replace(',', '.'));
   ```

---

#### 3. Edge Function Returns 500: "scrapeNewBankRates is not a function"

**Cause**: Import path is incorrect or function not exported

**Solution**:
- Verify export in scraper: `export async function scrapeNewBankRates()`
- Check import path in edge function: `'../functions/utils/newbank-scraper.mts'`
- Ensure `.mts` extension (not `.ts`)

---

#### 4. Frontend Shows Loading Forever

**Possible causes**:

**A) Edge function path mismatch**
- Check `config.path` in edge function: `'/api/newbank'`
- Check composable endpoint: `endpoint: '/api/newbank'`
- Both must match exactly

**B) Blobs key mismatch**
- Scheduled function stores: `await store.setJSON('newbank-latest', data)`
- Edge function reads: `await store.get('newbank-latest', { type: 'json' })`
- Keys must match exactly (including the `-latest` suffix)

**C) CORS error (unlikely)**
- Check browser console for errors
- Edge functions should return `Content-Type: application/json` header

**Debug**:
```bash
# Check what's in Blobs
netlify blobs:get rates newbank-latest

# Check edge function response
curl http://localhost:5173/api/newbank
```

---

#### 5. CSS Theme Not Applied

**Cause**: Theme file not imported in `main.css`

**Solution**:
- Add `@import "./themes/newbank.css";` in `src/assets/main.css`
- Ensure `[data-bank="newbank"]` selector matches exactly
- Check BankView.vue sets `data-bank` attribute correctly

**Debug**:
```javascript
// In browser console
document.querySelector('[data-bank]').getAttribute('data-bank')
// Should return: "newbank"
```

---

#### 6. Router Shows 404 or Redirects to Home

**Cause**: Route not registered or `bankId` type assertion missing

**Solution**:
- Verify route in `src/router.ts` (Step 9)
- Ensure `props: { bankId: 'newbank' as BankId }` includes the type assertion
- Check that path `/newbank` doesn't conflict with other routes

---

#### 7. Scheduled Function Doesn't Pick Up New Bank

**Cause**: Bank not added to `getActiveBanks()` in registry

**Solution**:
```typescript
// netlify/functions/utils/scraper-registry.mts
export function getActiveBanks(): BankId[] {
  return ['brou', 'itau', 'newbank'] // Must include 'newbank'
}
```

**Verify**:
```bash
# Trigger scheduled function manually
netlify functions:invoke update-all-rates --port 5173

# Check logs for "newbank" in the output
```

---

## Tips & Best Practices

### Finding Exchange Rates on Bank Websites

Most Uruguayan banks publish exchange rates on their homepage or a dedicated "Cotizaciones" page:

1. **Check common paths**:
   - `/cotizaciones`
   - `/home` (usually has a rates widget)
   - `/portal` (for portal pages)

2. **Look for API endpoints**:
   - Some banks serve rates via XML or JSON endpoints
   - Example (Itaú): `https://www.itau.com.uy/inst/aci/cotiz.xml`
   - Parsing XML/JSON is often easier than HTML

3. **Inspect the HTML**:
   - Right-click → "View Page Source"
   - Search for: "USD", "Dólar", "Compra", "Venta"
   - Look for structured data (tables, divs with IDs/classes)

4. **Use browser DevTools**:
   - Network tab → Filter by "Fetch/XHR"
   - Reload the page
   - Look for API calls that might return rates

### Color Extraction Tips

1. **Official brand guidelines** (best source):
   - Search: "[Bank Name] brand guidelines PDF"
   - Example: "Banco Itaú brand guidelines"

2. **Use browser DevTools**:
   - Right-click on a colored element (button, header)
   - Inspect → Computed tab
   - Copy the `background-color` value

3. **Use color picker extensions**:
   - Install "ColorZilla" (Chrome/Firefox)
   - Click the eyedropper tool
   - Pick colors from the bank's website

4. **Gradient generation**:
   - Start with dark backgrounds: `#0a0e1f`, `#0f1a2e`
   - Transition to primary color: `--bank-primary`
   - End with lighter variant: `--bank-primary-light`

### Testing Locally Without Deploying

1. **Use Netlify CLI emulation**:
   - `pnpm dev` automatically emulates Edge Functions and Blobs
   - No need to deploy for basic testing

2. **Trigger scheduled function manually**:
   ```bash
   netlify functions:invoke update-all-rates --port 5173
   ```

3. **Check Blobs content**:
   ```bash
   netlify blobs:get rates newbank-latest
   ```

4. **Test edge function directly**:
   ```bash
   curl http://localhost:5173/api/newbank | jq
   ```

### Deployment Best Practices

1. **Test locally first**:
   - Run all checks before deploying
   - Manually invoke scheduled function
   - Verify Blobs are populated

2. **Deploy during off-hours**:
   - Uruguayan banks close ~6pm (UTC-3)
   - Deploy after hours to avoid peak traffic

3. **Monitor first 30 minutes**:
   - Check Netlify Function logs
   - Verify scheduled function runs every 15 minutes
   - Ensure no errors in logs

4. **Verify data freshness**:
   - Check `metadata.scrapedAt` timestamp
   - Ensure it updates every 15 minutes
   - Compare rates with bank's website

---

## Complete Example: Adding Santander

Here's a complete example showing how to add Banco Santander Uruguay.

### 1. Type Definition (`src/types/banks.ts`)

```typescript
export type BankId = 'brou' | 'itau' | 'santander' | 'bbva' | 'bcu'
//                                      ^^^^^^^^^^^ Already added
```

### 2. Scraper (`netlify/functions/utils/santander-scraper.mts`)

```typescript
import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

export async function scrapeSantanderRates(): Promise<ExchangeRate> {
  const url = 'https://www.santander.com.uy/cotizaciones';

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const html = await response.text();

  // Santander's HTML structure (hypothetical):
  // <td>Dólar Estadounidense</td><td>39.50</td><td>40.20</td>
  const regex = /Dólar Estadounidense<\/td>\s*<td>([\d,.]+)<\/td>\s*<td>([\d,.]+)<\/td>/i;
  const match = html.match(regex);

  if (!match) {
    throw new Error('USD exchange rate not found in HTML');
  }

  const buy = parseFloat(match[1].replace(',', '.'));
  const sell = parseFloat(match[2].replace(',', '.'));
  const average = parseFloat(((buy + sell) / 2).toFixed(2));

  return {
    average,
    buy,
    sell,
    currency: USD_CURRENCY
  };
}
```

### 3. Registry (`netlify/functions/utils/scraper-registry.mts`)

```typescript
import { scrapeSantanderRates } from './santander-scraper.mts';

export const BANK_SCRAPER_MAP: Record<BankId, () => Promise<ExchangeRate>> = {
  brou: scrapeBrouRates,
  itau: scrapeItauRates,
  santander: scrapeSantanderRates, // Changed from stub
  // ...rest
}

export function getActiveBanks(): BankId[] {
  return ['brou', 'itau', 'santander']
}
```

### 4. Edge Function (`netlify/edge-functions/get-santander-rates.mts`)

```typescript
import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { scrapeSantanderRates } from '../functions/utils/santander-scraper.mts';
import type { ExchangeRateRecord } from '../../shared/types/exchange-rates.mts';

export default async (_request: Request, _context: Context) => {
  try {
    const store = getStore('rates');
    const cachedRates = await store.get('santander-latest', { type: 'json' }) as ExchangeRateRecord | null;

    if (cachedRates) {
      return new Response(JSON.stringify(cachedRates), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, max-age=0, must-revalidate'
        }
      });
    }

    console.warn('⚠️ Blobs empty, executing fallback scraping');
    const rates = await scrapeSantanderRates();
    const dataToStore: ExchangeRateRecord = {
      ...rates,
      metadata: {
        scrapedAt: new Date().toISOString(),
        nextRunAt: null,
        source: 'fallback' as const
      }
    }

    await store.setJSON('santander-latest', dataToStore);

    return new Response(JSON.stringify(dataToStore), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

export const config: Config = {
  path: '/api/santander',
  cache: 'manual',
};
```

### 5. Config (`src/config/banks.ts`)

```typescript
santander: {
  id: 'santander',
  name: 'Santander',
  displayName: 'La Media Santander',
  logoUrl: 'https://cdn.brandfetch.io/idWPmUE5JO/w/399/h/399/theme/dark/icon.jpeg',
  websiteUrl: 'https://www.santander.com.uy',
  route: '/santander',
  comingSoon: false // Change from true to false
}
```

### 6. CSS Theme (`src/assets/themes/santander.css`)

```css
/* Santander Theme */
[data-bank="santander"] {
  --bank-primary: #ec0000;
  --bank-primary-light: #ff1a1a;
  --bank-primary-rgb: 236, 0, 0;
  --bank-primary-light-rgb: 255, 26, 26;

  --bank-accent: #ffffff;
  --bank-accent-rgb: 255, 255, 255;

  /* Gradient (dark → Santander red) */
  --bank-gradient-from: #1a0000;
  --bank-gradient-stop1: #330000;
  --bank-gradient-via: #ec0000;
  --bank-gradient-to: #ff1a1a;
}
```

Import in `src/assets/main.css`:

```css
@import "./themes/santander.css";
```

### 7. Composable (`src/composables/currency/useSantanderCurrency.ts`)

```typescript
import { createCurrencyComposable } from "./createCurrencyComposable";

export function useSantanderCurrency() {
  return createCurrencyComposable({
    endpoint: '/api/santander',
    bankName: 'Santander'
  })
}
```

### 8. Registry (`src/composables/currency/useBankCurrency.ts`)

```typescript
import { useSantanderCurrency } from './useSantanderCurrency'

const BANK_COMPOSABLE_MAP: Record<BankId, () => ReturnType<typeof useBrouCurrency>> = {
  brou: useBrouCurrency,
  itau: useItauCurrency,
  santander: useSantanderCurrency, // Changed from useBrouCurrency
  // ...rest
}
```

### 9. Router (`src/router.ts`)

```typescript
{
  path: '/santander',
  name: 'santander',
  component: BankView,
  props: { bankId: 'santander' as BankId }
}
```

---

## Summary

By following this guide, you should now be able to:

- ✅ Create a backend scraper for any Uruguayan bank
- ✅ Register the scraper in the backend registry
- ✅ Create an edge function to serve cached data
- ✅ Add frontend configuration and styling
- ✅ Connect everything through routing
- ✅ Test locally before deploying
- ✅ Troubleshoot common issues

**Time saved**: ~3 hours per bank (from ~4 hours to ~1 hour)

For questions or issues, check:
- [CLAUDE.md](../CLAUDE.md) - Technical architecture reference
- [GitHub Issues](https://github.com/your-org/media-brou/issues) - Report bugs
- Netlify Dashboard → Functions → Logs - Monitor scraping

Happy coding! 🚀
