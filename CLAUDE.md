# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript currency converter application that displays real-time USD/UYU exchange rates from BROU (Banco de la República Oriental del Uruguay). The app is deployed on Netlify and uses Netlify Edge Functions to scrape exchange rates from the BROU website.

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

# Run E2E tests (Playwright)
pnpm test:e2e

# Manually invoke scheduled function (for testing)
netlify functions:invoke update-brou-rates

# View Netlify Blobs content (requires Netlify CLI authentication)
netlify blobs:get brou-rates latest
```

## Architecture

### Frontend Structure

- **App.vue**: Main application component containing the entire currency converter UI
- **src/composables/useCurrency.ts**: Core composable managing currency conversion state and logic
  - Fetches exchange rates from `/api/brou-media` endpoint
  - Handles bidirectional conversion (USD↔UYU)
  - Provides WhatsApp sharing functionality
- **src/components/CurrencyValue.vue**: Animated number display using `@number-flow/vue`
- **src/types/currency.ts**: TypeScript type definitions for exchange rates and API responses

### Backend Architecture (Netlify Functions + Edge Functions + Blobs)

The backend uses a **scheduled function + caching** architecture to minimize scraping load and improve response times:

**Three-Layer System:**

1. **`netlify/functions/utils/brou-scraper.mts`**: Shared scraping utility (TypeScript)
   - Pure function that scrapes BROU website
   - Exports `BrouRates` interface and `scrapeBrouRates()` function
   - Used by both scheduled function and edge function (DRY principle)
   - Parses HTML using regex to extract "compra" (buy) and "venta" (sell) rates

2. **`netlify/functions/update-brou-rates.mts`**: Scheduled Function (TypeScript)
   - Runs automatically every 15 minutes (`*/15 * * * *` cron in UTC)
   - Scrapes BROU website using shared utility
   - Stores results in **Netlify Blobs** (key: `'latest'`, store: `'brou-rates'`)
   - Error handling: preserves previous data if scraping fails (doesn't overwrite Blobs)
   - Receives `next_run` timestamp in request body

3. **`netlify/edge-functions/get-brou-media.mts`**: Edge Function API (TypeScript)
   - Exposed at `/api/brou-media`
   - **Primary**: Reads cached data from Netlify Blobs (fast, globally distributed)
   - **Fallback**: If Blobs empty, executes scraping directly (useful on first deploy)
   - Returns JSON response (no CORS headers needed - same origin)
   - May exceed 50ms limit on fallback, but acceptable for initialization

**Key Design Decisions:**
- Uses `.mts` extension (TypeScript ES modules) for all backend files
- Shared code between functions via `utils/` directory (Netlify bundler handles imports)
- Netlify Blobs provides eventual consistency (<60s propagation to all edges)
- Scheduled functions have 30s execution limit, edge functions have 50ms limit

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

The app fetches data from a **local endpoint** during development:
- Development: `http://localhost:5173/api/brou-media` (via `@netlify/vite-plugin`)
- Production: The same path works via Netlify Edge Functions

**Local Development Behavior:**
- Netlify Blobs is emulated in memory (empty at startup)
- First API call triggers scraping fallback (expected behavior)
- Data doesn't persist between dev server restarts

### Conversion Logic

The `useCurrency` composable handles all conversion logic:
- Uses `vue-currency-input` for formatted input with Uruguayan locale (`es-UY`)
- **Display rate**: Shows "media" (average) from API for informational purposes
- **Actual conversion**: Uses "media" rate for both directions (bidirectional conversion)
- **USD → UYU**: `inputAmount * rates.media`
- **UYU → USD**: `inputAmount / rates.media`
- Direction swap: Updates input value with converted amount when swapping currencies

### Path Aliases

- `@/` maps to `./src/` via Vite configuration

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
- Schedule defined inline via `export const config: Config = { schedule: '*/15 * * * *' }`
- No CORS needed: frontend and backend share same origin (Netlify domain)

**Post-deployment testing:**
1. Check scheduled function logs: Netlify Dashboard → Functions → update-brou-rates → Logs
2. Verify first scraping execution or manually trigger via "Run now" button
3. Confirm edge function responds quickly (should read from Blobs after first scrape)
4. Monitor that updates occur every 15 minutes
