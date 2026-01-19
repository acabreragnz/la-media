# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript currency converter application that displays real-time USD/UYU exchange rates from BROU (Banco de la República Oriental del Uruguay). The app is deployed on Netlify and uses Netlify Edge Functions to scrape exchange rates from the BROU website.

## Essential Commands

```bash
# Install dependencies
pnpm install

# Development server (runs on localhost:8888 via Netlify Dev)
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

### Backend (Netlify Edge Functions)

- **netlify/edge-functions/get-brou-media.js**: Edge function that scrapes BROU's website for current exchange rates
  - Exposed at `/api/brou-media`
  - Parses HTML using regex to extract "compra" (buy) and "venta" (sell) rates
  - Calculates "media" (average) rate
  - Returns JSON response with CORS headers

### Styling

- Uses **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- Custom gradient background and glassmorphism design
- Responsive layout optimized for mobile (max-width: 440px)

### Development Tools

- **Linting**: Uses both `oxlint` (fast) and `eslint` (comprehensive) in sequence
- **Type Checking**: `vue-tsc` for Vue component type checking
- **Testing**: Vitest for unit tests, Playwright for E2E
- **DevTools**: `vite-plugin-vue-devtools` for Vue debugging

## Important Implementation Details

### API Integration

The app fetches data from a **local endpoint** during development:
- Development: `http://localhost:8888/api/brou-media`
- Production: The same path works via Netlify Edge Functions

### Conversion Logic

- **USD → UYU**: Uses the "venta" (sell) rate
- **UYU → USD**: Uses the "compra" (buy) rate
- Display uses the "media" (average) rate for informational purposes

### Path Aliases

- `@/` maps to `./src/` via Vite configuration

## Testing

- Unit tests should be placed in `src/**/__tests__/*`
- E2E tests should be placed in `e2e/**/*.{test,spec}.{js,ts,jsx,tsx}`
- Test environment uses jsdom for component testing

## Deployment

This project is configured for **Netlify deployment**:
- Publishes from root directory
- Dev server runs on port 8888
- Edge Functions are automatically deployed from `netlify/edge-functions/`
