import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { scrapeItauRates } from '../functions/utils/itau-scraper.mts';
import type { ExchangeRateRecord } from '../../shared/types/exchange-rates.mts';

/**
 * Edge function que sirve las cotizaciones desde Netlify Blobs
 * Fallback: scraping directo si Blobs está vacío
 *
 * Estrategia de caching:
 * - Respuestas exitosas desde Blobs: 5 minutos (s-maxage=300)
 * - Respuestas de fallback: sin cache (pueden ser errores temporales)
 * - Respuestas de error: sin cache
 *
 * Los datos se actualizan cada 15 minutos, así que un cache de 5 min
 * balancea performance con frescura de datos.
 */
export default async (_request: Request, _context: Context) => {
  try {
    // Intentar leer desde Blobs (rápido, cached en edge)
    const store = getStore('rates');
    const cachedRates = await store.get('itau-latest', { type: 'json' }) as ExchangeRateRecord | null;

    if (cachedRates) {
      return new Response(JSON.stringify(cachedRates), {
        headers: {
          'Content-Type': 'application/json',
          // Cache por 5 minutos en el edge (datos se actualizan cada 15 min)
          'Cache-Control': 'public, s-maxage=300, max-age=0, must-revalidate'
        }
      });
    }

    // Fallback: si Blobs está vacío, hacer scraping directo
    console.warn('⚠️ Blobs vacío, ejecutando scraping de fallback');
    const rates = await scrapeItauRates();
    const dataToStore: ExchangeRateRecord = {
      ...rates,
      metadata: {
        scraped_at: new Date().toISOString(),
        next_run: null,
        source: 'fallback' as const
      }
    }

    await store.setJSON('itau-latest', dataToStore);

    return new Response(JSON.stringify(dataToStore), {
      headers: {
        'Content-Type': 'application/json',
        // No cachear respuestas de fallback (pueden ser errores temporales)
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        // No cachear respuestas de error
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

export const config: Config = {
  path: '/api/itau',
  cache: 'manual', // Habilitar control manual de cache mediante headers
};
