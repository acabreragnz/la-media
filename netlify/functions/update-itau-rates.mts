import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { scrapeItauRates } from './utils/itau-scraper.mts';
import type { ExchangeRateRecord } from '../../shared/types/exchange-rates.mts';

/**
 * Scheduled function que actualiza cotizaciones en slots fijos: :00, :15, :30, :45
 */
export default async (req: Request) => {

  const { next_run } = await parseBody(req);
  const nextRunIso = next_run ? new Date(next_run).toISOString() : null;

  try {
    // Ejecutar scraping
    const rates = await scrapeItauRates();

    // Guardar en Netlify Blobs
    const store = getStore('rates');

    const dataToStore: ExchangeRateRecord = {
      ...rates,
      metadata: {
        scrapedAt: new Date().toISOString(),
        nextRunAt: nextRunIso,
        source: 'scheduled' as const
      }
    }

    await store.setJSON('itau-latest', dataToStore);

    console.log('✅ Cotización actualizada:', rates);
    console.log('Próxima ejecución:', nextRunIso ?? 'No programada');

    return new Response(JSON.stringify({
      success: true,
      rates
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Mantener datos anteriores - NO sobrescribir Blobs si falla
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error al actualizar cotización (manteniendo datos anteriores):', errorMessage);

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

const parseBody = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    console.log('No JSON body provided or parsing failed (expected for some triggers)');
    return { next_run: undefined };
  }
}

export const config: Config = {
  schedule: '0,15,30,45 11-22 * * 1-5'  // Cada 15 minutos, lunes a viernes, 8-19h Uruguay (UTC-3 → 11-22 UTC)
};
