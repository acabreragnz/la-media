# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript multi-bank currency converter application that displays real-time USD/UYU exchange rates from multiple Uruguayan banks (BROU, Itaú, and more). The app is deployed on Netlify and uses Netlify Edge Functions to scrape exchange rates, with a consolidated scheduled function that updates all banks in parallel every 15 minutes.

## Essential Commands

```bash
# Install dependencies
pnpm install

# Development server (uses @netlify/vite-plugin, runs on localhost:5173)
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting (runs oxlint first, then eslint)
pnpm lint

# Format code
pnpm format

# Run unit tests (Vitest)
pnpm test:unit

# Run specific test file
pnpm test:unit src/composables/currency/__tests__/useBankCurrency.spec.ts

# Run E2E tests (Playwright)
pnpm test:e2e

# Manually invoke scheduled function (for testing, requires pnpm dev running)
# IMPORTANT: Must specify --port 5173 (Vite's port) instead of default 8888
netlify functions:invoke update-all-rates --port 5173

# View Netlify Blobs content (requires Netlify CLI authentication)
netlify blobs:get rates brou-latest
netlify blobs:get rates itau-latest
```

## Quick Reference: Project Structure

```
├── netlify/
│   ├── edge-functions/
│   │   ├── get-brou-rates.mts      # BROU API endpoint (/api/brou)
│   │   └── get-itau-rates.mts      # Itaú API endpoint (/api/itau)
│   └── functions/
│       ├── update-all-rates.mts    # Scheduled function (runs every 15 min)
│       └── utils/
│           ├── brou-scraper.mts    # BROU website scraper
│           ├── itau-scraper.mts    # Itaú website scraper
│           ├── scraper-registry.mts # Central registry of all scrapers
│           └── constants.mts       # Shared constants (USD_CURRENCY, etc.)
│
├── shared/
│   └── types/
│       └── exchange-rates.mts      # Types shared between frontend and backend
│
├── src/
│   ├── views/
│   │   ├── HomeView.vue            # Bank selection landing page
│   │   └── BankView.vue            # Bank-specific converter (orchestrates 10 components)
│   │
│   ├── components/
│   │   ├── bank/
│   │   │   ├── BankViewSkeleton.vue       # Loading states
│   │   │   ├── BankViewHeader.vue         # Logo + title
│   │   │   ├── BankAccentStripe.vue       # Decorative stripe
│   │   │   ├── ExchangeRatesDisplay.vue   # Buy/media/sell rates
│   │   │   ├── ErrorBanner.vue            # Error display with retry
│   │   │   ├── CurrencyInput.vue          # Formatted input
│   │   │   ├── SwapButton.vue             # Direction toggle
│   │   │   ├── ConversionResult.vue       # Output with animations
│   │   │   ├── BankFooter.vue             # Stats, timestamps, share
│   │   │   └── DisclaimerBanner.vue       # Legal notice
│   │   ├── CurrencyValue.vue       # Animated number display (@number-flow/vue)
│   │   └── ItauLogo.vue            # Itaú SVG logo component
│   │
│   ├── composables/
│   │   ├── currency/
│   │   │   ├── createCurrencyComposable.ts # Factory for bank composables
│   │   │   ├── useBankCurrency.ts          # Registry: maps bankId → composable
│   │   │   ├── useBrouCurrency.ts          # BROU-specific composable
│   │   │   └── useItauCurrency.ts          # Itaú-specific composable
│   │   └── useDeviceDetection.ts   # Mobile/desktop detection
│   │
│   ├── config/
│   │   ├── banks.ts                # Bank metadata (name, logo, URL, colors)
│   │   └── refresh.ts              # Query refetch intervals
│   │
│   ├── types/
│   │   ├── banks.ts                # BankId type + type guard
│   │   └── currency.ts             # ConversionDirection enum
│   │
│   ├── utils/
│   │   ├── formatters.ts           # Number/date formatting utilities
│   │   └── whatsappShare.ts        # WhatsApp share URL generator
│   │
│   ├── lib/
│   │   ├── posthog.ts              # PostHog analytics setup
│   │   └── sentry.ts               # Sentry error tracking setup
│   │
│   ├── assets/
│   │   ├── themes/
│   │   │   ├── brou.css            # BROU CSS variables (colors, gradients)
│   │   │   ├── itau.css            # Itaú CSS variables
│   │   │   ├── santander.css       # Santander CSS variables
│   │   │   ├── bbva.css            # BBVA CSS variables
│   │   │   └── bcu.css             # BCU CSS variables
│   │   └── main.css                # Global styles + theme imports
│   │
│   ├── App.vue                     # Root component (router-view)
│   ├── main.ts                     # App entry point (Vue, router, analytics)
│   └── router.ts                   # Vue Router config (routes for each bank)
│
├── public/
│   ├── assets/
│   │   ├── banks/                  # Bank logos (brou.webp, itau.svg, etc.)
│   │   ├── brand/                  # La Media branding assets
│   │   ├── icons/                  # App icons (PWA)
│   │   └── social/                 # Open Graph images
│   └── manifest.json               # PWA manifest
│
├── docs/
│   └── adding-new-bank.md          # Step-by-step guide for adding banks
│
├── e2e/
│   └── vue.spec.ts                 # Playwright E2E tests
│
├── vite.config.ts                  # Vite config (aliases, plugins)
├── netlify.toml                    # Netlify build config
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript config
```

## Development Guidelines

### Visual/Style Changes Validation

Always validate visual and style changes in a browser before completing the task:

1. Start dev server: `pnpm dev`
2. Open affected page(s) in a browser
3. Capture visual state before and after changes
4. For responsive changes, test viewport sizes: 375px, 768px, 1024px (use browser DevTools)
5. Check browser console for errors

## Architecture

### Frontend Structure

- **src/views/HomeView.vue**: Bank selection landing page
- **src/views/BankView.vue**: Bank-specific currency converter (~200 lines, orchestrates 10 components)
- **src/composables/currency/**:
  - `useBankCurrency.ts`: Bank selector (centralized registry)
  - `useBrouCurrency.ts`: BROU-specific composable
  - `useItauCurrency.ts`: Itaú-specific composable
  - `createCurrencyComposable.ts`: Shared factory for currency composables
  - Handles bidirectional conversion (USD↔UYU) and WhatsApp sharing
- **src/components/bank/**: 10 specialized bank components (see Multi-Bank Architecture section)
- **src/components/CurrencyValue.vue**: Animated number display using `@number-flow/vue`
- **src/types/currency.ts**: Frontend-specific types (`ConversionDirection`)
- **shared/types/exchange-rates.mts**: Shared types between frontend and backend (`ExchangeRate`, `ExchangeRateRecord`, `RateMetadata`)

### Backend Architecture (Netlify Functions + Edge Functions + Blobs)

The backend uses a **scheduled function + caching** architecture to minimize scraping load and improve response times:

**Three-Layer System:**

1. **Bank Scrapers** (`netlify/functions/utils/*-scraper.mts`): Pure scraping utilities
   - `brou-scraper.mts`: Scrapes BROU website
   - `itau-scraper.mts`: Scrapes Itaú website
   - Each exports `scrape{Bank}Rates()` function returning `ExchangeRate`
   - Parses HTML using regex to extract "compra" (buy) and "venta" (sell) rates
   - Registered in `scraper-registry.mts` for centralized management

2. **`netlify/functions/update-all-rates.mts`**: Consolidated Scheduled Function (TypeScript)
   - Runs every 15 minutes: Mon-Fri 8am-7pm Uruguay time (UTC-3 = 11am-10pm UTC)
   - Cron: `0,15,30,45 11-22 * * 1-5`
   - Updates **all active banks in parallel** using scraper registry
   - Stores results in **Netlify Blobs** (keys: `brou-latest`, `itau-latest`, etc. in store: `rates`)
   - Error handling: preserves previous data if scraping fails (doesn't overwrite Blobs)
   - Returns 207 Multi-Status for partial failures, 200 if all succeed
   - Receives `next_run` timestamp in request body

3. **Edge Functions** (`netlify/edge-functions/get-{bank}-rates.mts`): Bank-specific APIs
   - Exposed at `/api/brou`, `/api/itau`, etc.
   - **Primary**: Reads cached data from Netlify Blobs (fast, globally distributed)
   - **Fallback**: If Blobs empty, executes scraping directly (useful on first deploy)
   - Returns JSON response (no CORS headers needed - same origin)
   - May exceed 50ms limit on fallback, but acceptable for initialization

**Key Design Decisions:**
- Uses `.mts` extension (TypeScript ES modules) for all backend files
- Shared code between functions via `utils/` directory (Netlify bundler handles imports)
- Netlify Blobs provides eventual consistency (<60s propagation to all edges)
- Scheduled functions have 30s execution limit, edge functions have 50ms limit

## Multi-Bank Architecture

### Component Structure

After refactoring, BankView.vue (~200 lines, down from 535) orchestrates 10 specialized components:

**src/components/bank/**:
- `BankViewSkeleton.vue` - Loading states (eliminates 178 lines of duplication)
- `BankViewHeader.vue` - Logo + title (reusable across banks)
- `BankAccentStripe.vue` - Decorative stripe using CSS variables
- `ExchangeRatesDisplay.vue` - Buy/media/sell rates display
- `ErrorBanner.vue` - Error display with retry functionality
- `CurrencyInput.vue` - Input with formatting and currency display
- `SwapButton.vue` - Direction toggle button
- `ConversionResult.vue` - Output display with animated numbers
- `BankFooter.vue` - Stats, timestamps, and share button
- `DisclaimerBanner.vue` - Legal notice (feature-flagged)

All components use CSS variables for theming (no color props). Each bank's colors are defined in `src/assets/main.css` via `[data-bank='bankId']` selectors.

### Bank Selection System

**Centralized Composable Selector** (`src/composables/currency/useBankCurrency.ts`):
```typescript
const BANK_COMPOSABLE_MAP: Record<BankId, () => ReturnType<typeof useBrouCurrency>> = {
  brou: useBrouCurrency,
  itau: useItauCurrency,
  // Fallback for "coming soon" banks (dev mode only)
  santander: useBrouCurrency,  // Uses BROU data
  bbva: useItauCurrency,        // Uses Itaú data
  bcu: useBrouCurrency          // Uses BROU data
}
```

This eliminates switch statements from the view layer and centralizes bank selection logic.

### Backend Registry System

**Scraper Registry** (`netlify/functions/utils/scraper-registry.mts`):
```typescript
export const BANK_SCRAPER_MAP: Record<BankId, () => Promise<ExchangeRate>> = {
  brou: scrapeBrouRates,
  itau: scrapeItauRates,
  santander: async () => { throw new Error('Santander scraper not implemented') },
  bbva: async () => { throw new Error('BBVA scraper not implemented') },
  bcu: async () => { throw new Error('BCU scraper not implemented') }
}
```

**Consolidated Scheduled Function** (`netlify/functions/update-all-rates.mts`):
- Single function updates all active banks in parallel
- Each bank's data stored with key: `{bankId}-latest` (e.g., `brou-latest`, `itau-latest`)
- Partial failure support: if one bank fails, others still update
- Returns 207 Multi-Status for partial failures

### Adding a New Bank

**Time to add**: ~1 hour (down from ~4 hours with previous architecture)

The multi-bank architecture makes adding new banks straightforward through centralized registries and factory patterns.

**📖 Detailed Guide**: See [`docs/adding-new-bank.md`](docs/adding-new-bank.md) for complete step-by-step instructions with code examples, troubleshooting tips, and best practices.

**Quick Overview**:
- **Backend**: Create scraper → Register in `scraper-registry.mts` → Create edge function (copy template)
- **Frontend**: Add to `banks.ts` config → Create CSS theme → Create composable → Register composable → Add route
- **Automatic**: Scheduled function picks up new banks from registry and scrapes them every 15 minutes

### Styling

- Uses **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- Custom gradient background and glassmorphism design
- Responsive layout optimized for mobile (max-width: 440px)

### Development Tools

- **Linting**: Uses both `oxlint` (fast) and `eslint` (comprehensive) in sequence
- **Type Checking**: `vue-tsc` for Vue component type checking
- **Testing**: Vitest for unit tests, Playwright for E2E
- **DevTools**: `vite-plugin-vue-devtools` for Vue debugging
- **Netlify Emulation**: `@netlify/vite-plugin` emulates Netlify platform features locally (Blobs, Edge Functions, etc.)

## Important Implementation Details

### API Integration

The app fetches data from **bank-specific endpoints** during development:
- Development: `http://localhost:5173/api/brou`, `http://localhost:5173/api/itau` (via `@netlify/vite-plugin`)
- Production: The same paths work via Netlify Edge Functions

**Local Development Behavior:**
- Netlify Blobs is emulated in memory (empty at startup)
- First API call triggers scraping fallback (expected behavior)
- Data doesn't persist between dev server restarts
- Consolidated scheduled function updates all banks when invoked

### Conversion Logic

The `createCurrencyComposable` factory creates bank-specific composables that handle conversion logic:
- Uses `vue-currency-input` for formatted input with Uruguayan locale (`es-UY`)
- **Display rate**: Shows "media" (average) from API for informational purposes
- **Actual conversion**: Uses "media" rate for both directions (bidirectional conversion)
- **USD → UYU**: `inputAmount * rates.average`
- **UYU → USD**: `inputAmount / rates.average`
- Direction swap: Updates input value with converted amount when swapping currencies
- Direction state persisted per-bank using `useStorage` (e.g., `brou_direction`, `itau_direction`)

### Path Aliases

- `@/` maps to `./src/` via Vite configuration
- `@shared/` maps to `./shared/` for types shared between frontend and backend

## Testing

- Unit tests should be placed in `src/**/__tests__/*`
- E2E tests should be placed in `e2e/**/*.{test,spec}.{js,ts,jsx,tsx}`
- Test environment uses jsdom for component testing

## Deployment

This project is configured for **Netlify deployment**:
- Publishes from root directory (`dist/` after build)
- Dev server uses `@netlify/vite-plugin` for native Netlify emulation in Vite
- Edge Functions are automatically deployed from `netlify/edge-functions/*.mts`
- Scheduled Functions are automatically deployed from `netlify/functions/*.mts`
- Netlify Blobs is provisioned automatically (zero configuration)
- Schedule defined inline via `export const config: Config = { schedule: '0,15,30,45 11-22 * * 1-5' }`
- No CORS needed: frontend and backend share same origin (Netlify domain)

**Post-deployment testing:**
1. Check scheduled function logs: Netlify Dashboard → Functions → update-all-rates → Logs
2. Verify first scraping execution or manually trigger via "Run now" button
3. Confirm all edge functions respond quickly (should read from Blobs after first scrape)
4. Monitor that updates occur every 15 minutes for all active banks
5. Check that partial failures are handled gracefully (returns 207 status)
