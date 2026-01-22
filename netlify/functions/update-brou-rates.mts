import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { scrapeBrouRates } from './utils/brou-scraper.mts';

/**
 * Scheduled function que actualiza cotizaciones en slots fijos: :00, :15, :30, :45
 */
export default async (req: Request) => {

  const { next_run } = await parseBody(req);

  try {
    // Ejecutar scraping
    const rates = await scrapeBrouRates();

    // Guardar en Netlify Blobs
    const store = getStore('brou-rates');
    await store.setJSON('latest', rates);

    console.log('✅ Cotización actualizada:', rates);
    console.log('Próxima ejecución:', next_run);

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
  schedule: '0,15,30,45 * * * *'  // Cada 15 minutos - SYNC: debe coincidir con src/config/refresh.ts (REFRESH_INTERVAL_MINUTES=15)
};
