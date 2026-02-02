import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import type { ExchangeRateRecord } from '../../shared/types/exchange-rates.mts';

/**
 * Edge function que sirve las cotizaciones del BCU desde Netlify Blobs
 *
 * IMPORTANTE: A diferencia de otros bancos, BCU NO tiene fallback de scraping directo.
 * El scraper de BCU usa Playwright/Chromium que no puede ejecutarse en Edge Functions
 * debido a las limitaciones de tiempo y recursos.
 *
 * Los datos son actualizados por el scheduled function (update-all-rates.mts)
 * que corre cada 15 minutos y usa Chromium para scrapear la página del BCU.
 *
 * Estrategia de caching:
 * - Respuestas exitosas desde Blobs: 5 minutos (s-maxage=300)
 * - Si no hay datos en Blobs: retorna error 503 (datos no disponibles aún)
 */
export default async (_request: Request, _context: Context) => {
  try {
    // Leer desde Blobs (rápido, cached en edge)
    const store = getStore('rates');
    const cachedRates = await store.get('bcu-latest', { type: 'json' }) as ExchangeRateRecord | null;

    if (cachedRates) {
      return new Response(JSON.stringify(cachedRates), {
        headers: {
          'Content-Type': 'application/json',
          // Cache por 5 minutos en el edge (datos se actualizan cada 15 min)
          'Cache-Control': 'public, s-maxage=300, max-age=0, must-revalidate'
        }
      });
    }

    // No hay fallback para BCU - el scraper usa Chromium que no puede correr en Edge
    // Los datos serán poblados por el scheduled function
    return new Response(JSON.stringify({
      error: 'BCU rates not available yet. Data will be populated by scheduled function.',
      retryAfter: 900 // 15 minutes
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '900',
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
  path: '/api/bcu',
  cache: 'manual',
};
