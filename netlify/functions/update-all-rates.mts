import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { getActiveBanks, BANK_SCRAPER_MAP, getBlobsKey } from './utils/scraper-registry.mts'
import type { ExchangeRateRecord } from '../../shared/types/exchange-rates.mts'

/**
 * Multi-bank scheduled function
 * Updates all active banks in parallel every 15 minutes
 */
export default async (req: Request) => {
  const { next_run } = await parseBody(req)
  const nextRunIso = next_run ? new Date(next_run).toISOString() : null

  const store = getStore('rates')
  const results = await Promise.allSettled(
    getActiveBanks().map(async (bankId) => {
      try {
        // Execute scraper
        const scraper = BANK_SCRAPER_MAP[bankId]
        const rates = await scraper()

        // Prepare data with metadata
        const dataToStore: ExchangeRateRecord = {
          ...rates,
          metadata: {
            scrapedAt: new Date().toISOString(),
            nextRunAt: nextRunIso,
            source: 'scheduled' as const
          }
        }

        // Store in Blobs
        await store.setJSON(getBlobsKey(bankId), dataToStore)

        console.log(`✅ ${bankId.toUpperCase()} cotización actualizada:`, rates)
        return { bankId, success: true, rates }

      } catch (error) {
        // Preserve old data - don't overwrite on failure
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.error(`❌ ${bankId.toUpperCase()} error (manteniendo datos anteriores):`, errorMessage)
        return { bankId, success: false, error: errorMessage }
      }
    })
  )

  // Aggregate results
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - successful

  console.log(`📊 Resumen: ${successful}/${results.length} bancos actualizados`)
  console.log('Próxima ejecución:', nextRunIso ?? 'No programada')

  return new Response(JSON.stringify({
    success: successful > 0,
    updated: successful,
    failed,
    nextRun: nextRunIso
  }), {
    status: failed > 0 ? 207 : 200, // 207 Multi-Status for partial failures
    headers: { 'Content-Type': 'application/json' }
  })
}

const parseBody = async (req: Request) => {
  try {
    return await req.json()
  } catch {
    console.log('No JSON body provided (expected for some triggers)')
    return { next_run: undefined }
  }
}

export const config: Config = {
  schedule: '0,15,30,45 11-22 * * 1-5' // Every 15 min, Mon-Fri, 8am-7pm Uruguay (UTC-3 → 11-22 UTC)
}
