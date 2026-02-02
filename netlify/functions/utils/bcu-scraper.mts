import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

const BCU_COTIZACIONES_URL = 'https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Cotizaciones.aspx';

/**
 * Scrapes BCU exchange rates using Playwright/Chromium
 * This bypasses SSL certificate issues by using a real browser
 *
 * Note: This scraper can only run in Netlify Functions (serverless),
 * not in Edge Functions due to Chromium's startup time.
 * The Edge Function reads cached data from Blobs instead.
 *
 * @returns USD exchange rates (interbancario)
 * @throws Error if USD quote not found
 */
export async function scrapeBcuRates(): Promise<ExchangeRate> {
  // Configure chromium for serverless environment
  const executablePath = await chromium.executablePath();

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Navigate to BCU cotizaciones page
    await page.goto(BCU_COTIZACIONES_URL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for the cotizaciones table to load
    // The BCU page loads data dynamically
    await page.waitForSelector('#tablaDolar', { timeout: 15000 });

    // Extract USD interbancario rates from the table
    // The table has columns: Moneda, Compra, Venta
    const rates = await page.evaluate(() => {
      const table = document.querySelector('#tablaDolar');
      if (!table) {
        throw new Error('USD table not found');
      }

      // Find the row with "Dólar USA" or "DOLAR INTERBANCARIO"
      const rows = table.querySelectorAll('tbody tr');
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const moneda = cells[0]?.textContent?.trim().toUpperCase() || '';

          // Look for USD interbancario billete
          if (moneda.includes('BILLETE') || moneda.includes('INTERBANCARIO')) {
            const compraText = cells[1]?.textContent?.trim() || '0';
            const ventaText = cells[2]?.textContent?.trim() || '0';

            // Parse numbers (handle comma as decimal separator)
            const compra = parseFloat(compraText.replace('.', '').replace(',', '.'));
            const venta = parseFloat(ventaText.replace('.', '').replace(',', '.'));

            if (!isNaN(compra) && !isNaN(venta) && compra > 0 && venta > 0) {
              return { buy: compra, sell: venta };
            }
          }
        }
      }

      throw new Error('USD interbancario rate not found in table');
    });

    const average = parseFloat(((rates.buy + rates.sell) / 2).toFixed(2));

    return {
      average,
      buy: rates.buy,
      sell: rates.sell,
      currency: USD_CURRENCY,
    };
  } finally {
    await browser.close();
  }
}
