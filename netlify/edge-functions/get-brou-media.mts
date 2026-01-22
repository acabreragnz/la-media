import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { scrapeBrouRates, type BrouRates } from '../functions/utils/brou-scraper.mts';

/**
 * Edge function que sirve las cotizaciones desde Netlify Blobs
 * Fallback: scraping directo si Blobs está vacío
 */
export default async (_request: Request, _context: Context) => {
  try {
    // Intentar leer desde Blobs (rápido, cached en edge)
    const store = getStore('brou-rates');
    const cachedRates = await store.get('latest', { type: 'json' }) as BrouRates | null;

    if (cachedRates) {
      return new Response(JSON.stringify(cachedRates), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback: si Blobs está vacío, hacer scraping directo
    console.warn('⚠️ Blobs vacío, ejecutando scraping de fallback');
    const rates = await scrapeBrouRates();

    return new Response(JSON.stringify(rates), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: '/api/brou-media',
};
