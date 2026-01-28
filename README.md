# La Media - Multi-Bank Currency Converter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Vue 3 + TypeScript application that displays real-time USD/UYU exchange rates from multiple Uruguayan banks (BROU, Itaú, and more).

🔗 **Live Site:** [media-brou.tonicabrera.dev](https://media-brou.tonicabrera.dev)

## ⚠️ Disclaimer

**This is an unofficial, independent project.** It is not affiliated with, associated with, or endorsed by any of the banks whose data it displays. Bank names, logos, and trademarks are property of their respective owners and are used here solely for informational purposes.

This tool:
- ✅ Displays publicly available exchange rate data
- ✅ Does NOT collect user credentials or personal information
- ✅ Does NOT have login forms or authentication
- ✅ Is NOT a phishing site - it's a read-only comparison tool

## 🚀 Features

- Real-time USD/UYU exchange rates from multiple Uruguayan banks
- Responsive design optimized for mobile and desktop
- Automatic updates every 15 minutes via Netlify Scheduled Functions
- Bidirectional currency conversion (USD ↔ UYU)
- WhatsApp sharing functionality
- PWA support for offline access

## 🏗️ Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Vue Composition API
- **Backend:** Netlify Edge Functions + Scheduled Functions
- **Caching:** Netlify Blobs
- **Deployment:** Netlify
- **Testing:** Vitest + Playwright
- **Analytics:** PostHog + Sentry

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

## Netlify Functions

### Manually Invoke Scheduled Function

To test the consolidated scheduled function that updates all bank rates:

```sh
# IMPORTANT: pnpm dev must be running first
# Must specify --port 5173 (Vite's port) instead of default 8888
netlify functions:invoke update-all-rates --port 5173
```

### View Netlify Blobs

To inspect the cached exchange rates:

```sh
netlify blobs:get rates brou-latest
netlify blobs:get rates itau-latest
```

## 🤝 Contributing

Contributions are welcome! This is an open source project maintained by [@acabreragnz](https://github.com/acabreragnz).

If you'd like to add a new bank, see the guide: [`docs/adding-new-bank.md`](docs/adding-new-bank.md)

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Agustín Cabrera**
- GitHub: [@acabreragnz](https://github.com/acabreragnz)

## ⚖️ Legal

This project is provided "as is" without warranty of any kind. Exchange rate data may contain errors or be temporarily outdated. Always verify rates on official bank websites before making financial decisions.

Bank names, logos, and trademarks are property of their respective owners. Their use in this project is solely for informational purposes and does not imply endorsement.
