# Adding a New Bank to La Media

Quick reference guide for adding a new bank to the currency converter.

**Time Estimate**: ~1 hour

## Prerequisites

- Node.js & pnpm installed
- Dev server running (`pnpm dev`)
- Bank's website URL with USD/UYU rates
- Bank logo (SVG or WebP)
- Bank brand colors (primary, accent)

## Architecture

```
Backend:  Scraper → Registry → Scheduled Function (every 15min) → Blobs → Edge Function → /api/newbank
Frontend: Types → Config → CSS Theme → Composable → Registry → Router → /newbank
```

---

## Steps

### 1. Add Bank ID Type

**File**: `src/types/banks.ts`

```typescript
export type BankId = 'brou' | 'itau' | 'santander' | 'bbva' | 'bcu' | 'newbank'

export function isBankId(value: string): value is BankId {
  return ['brou', 'itau', 'santander', 'bbva', 'bcu', 'newbank'].includes(value)
}
```

### 2. Create Scraper

**File**: `netlify/functions/utils/newbank-scraper.mts`

```typescript
import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

export async function scrapeNewBankRates(): Promise<ExchangeRate> {
  const url = 'https://www.newbank.com.uy/cotizaciones';
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await response.text();

  // Adjust regex to match bank's HTML
  const regex = /Dólar[\s\S]*?Compra[:\s]*([\d,.\s]+)[\s\S]*?Venta[:\s]*([\d,.\s]+)/i;
  const match = html.match(regex);

  if (!match) throw new Error('USD exchange rate not found');

  const buy = parseFloat(match[1].trim().replace(',', '.'));
  const sell = parseFloat(match[2].trim().replace(',', '.'));
  const average = parseFloat(((buy + sell) / 2).toFixed(2));

  return { average, buy, sell, currency: USD_CURRENCY };
}
```

**Regex tips**:
- View page source, search for "USD", "Dólar", "Compra", "Venta"
- Test regex at https://regex101.com
- Adjust decimal/thousands separator handling as needed

### 3. Register Scraper

**File**: `netlify/functions/utils/scraper-registry.mts`

```typescript
import { scrapeNewBankRates } from './newbank-scraper.mts';

export const BANK_SCRAPER_MAP: Record<BankId, () => Promise<ExchangeRate>> = {
  brou: scrapeBrouRates,
  itau: scrapeItauRates,
  newbank: scrapeNewBankRates, // ADD
  // ...
}

export function getActiveBanks(): BankId[] {
  return ['brou', 'itau', 'newbank'] // ADD
}
```

### 4. Create Edge Function

**File**: `netlify/edge-functions/get-newbank-rates.mts`

Copy `get-brou-rates.mts` and change:
1. Import: `scrapeNewBankRates`
2. Blobs key: `'newbank-latest'` (2 places)
3. Path: `'/api/newbank'`

```typescript
import { scrapeNewBankRates } from '../functions/utils/newbank-scraper.mts';

// ... (same structure as get-brou-rates.mts)

const cachedRates = await store.get('newbank-latest', { type: 'json' });
// ...
await store.setJSON('newbank-latest', dataToStore);

export const config: Config = {
  path: '/api/newbank',
  cache: 'manual',
};
```

### 5. Add Frontend Config

**File**: `src/config/banks.ts`

```typescript
export const BANKS: Record<string, BankConfig> = {
  // ...
  newbank: {
    id: 'newbank',
    name: 'New Bank',
    displayName: 'La Media New Bank',
    logoUrl: '/assets/banks/newbank.webp', // Add to public/assets/banks/
    websiteUrl: 'https://www.newbank.com.uy',
    route: '/newbank'
  }
}
```

### 6. Create CSS Theme

**File**: `src/assets/themes/newbank.css`

```css
[data-bank="newbank"] {
  --bank-primary: #1e3a8a;
  --bank-primary-light: #2563eb;
  --bank-primary-rgb: 30, 58, 138;
  --bank-primary-light-rgb: 37, 99, 235;

  --bank-accent: #fbbf24;
  --bank-accent-rgb: 251, 191, 36;

  --bank-gradient-from: #0a0e1f;
  --bank-gradient-stop1: #0f1a2e;
  --bank-gradient-via: #1e3a8a;
  --bank-gradient-to: #2563eb;
}
```

**Import** in `src/assets/main.css`:

```css
@import "./themes/newbank.css";
```

**Color extraction**:
- Use browser DevTools → Inspect → Computed → background-color
- Search "[Bank Name] brand guidelines"
- Use ColorZilla extension

### 7. Create Composable

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

### 8. Register Composable

**File**: `src/composables/currency/useBankCurrency.ts`

```typescript
import { useNewBankCurrency } from './useNewBankCurrency';

const BANK_COMPOSABLE_MAP: Record<BankId, () => ReturnType<typeof useBrouCurrency>> = {
  brou: useBrouCurrency,
  itau: useItauCurrency,
  newbank: useNewBankCurrency, // ADD
  // ...
}
```

### 9. Add Route

**File**: `src/router.ts`

```typescript
{
  path: '/newbank',
  name: 'newbank',
  component: BankView,
  props: { bankId: 'newbank' as BankId }
}
```

---

## Testing

### Local

```bash
# Type check, lint, build
pnpm type-check
pnpm lint
pnpm build

# Start dev server
pnpm dev

# Test scraper (in another terminal)
netlify functions:invoke update-all-rates --port 5173

# Check stored data
netlify blobs:get rates newbank-latest

# Test edge function
curl http://localhost:5173/api/newbank | jq
```

Visit `http://localhost:5173/newbank` and verify:
- Logo and colors load correctly
- Conversion works (USD → UYU and UYU → USD)
- Swap button works
- Share button generates WhatsApp link
- Error handling (stop scraper, check error banner appears)

### Production

After deploying to Netlify:

1. **Netlify Dashboard → Functions → update-all-rates → Logs**: Verify newbank appears
2. **Trigger**: Click "Run now", check for errors
3. **Test API**: Visit `https://your-site.netlify.app/api/newbank`
4. **Test UI**: Visit `https://your-site.netlify.app/newbank`
5. **Monitor**: Ensure updates every 15 minutes

---

## Quick Reference

### File Checklist

```
Backend:
✓ netlify/functions/utils/newbank-scraper.mts
✓ netlify/functions/utils/scraper-registry.mts (2 changes)
✓ netlify/edge-functions/get-newbank-rates.mts

Frontend:
✓ src/types/banks.ts (2 changes)
✓ src/config/banks.ts
✓ src/assets/themes/newbank.css
✓ src/assets/main.css (import)
✓ src/composables/currency/useNewBankCurrency.ts
✓ src/composables/currency/useBankCurrency.ts
✓ src/router.ts
✓ public/assets/banks/newbank.webp (logo file)
```

### Common Regex Patterns

```typescript
// Comma as decimal separator
const buy = parseFloat(match[1].trim().replace(',', '.'));

// Dot as thousands, comma as decimal
const buy = parseFloat(match[1].trim().replace(/\./g, '').replace(',', '.'));

// HTML table structure
const regex = /USD<\/td>\s*<td>([\d,.]+)<\/td>\s*<td>([\d,.]+)<\/td>/i;

// Text with labels
const regex = /Compra:\s*([\d,.]+).*?Venta:\s*([\d,.]+)/is;
```

### Key Points

- **Blobs key**: Must be `{bankId}-latest` consistently
- **Edge function path**: Must match composable endpoint exactly (`/api/newbank`)
- **Active banks**: Add to `getActiveBanks()` or scheduled function won't scrape it
- **CSS import**: Theme won't apply if not imported in main.css
- **Type assertion**: Router needs `as BankId` in props

---

For architecture details, see [CLAUDE.md](../CLAUDE.md).
