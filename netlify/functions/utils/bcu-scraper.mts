import https from 'https';
import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

const BCU_ENDPOINT = 'https://www.bcu.gub.uy/_layouts/BCU.Cotizaciones/handler/CotizacionesHandler.ashx?op=getcotizaciones';

// BCU currency code for USD
const BCU_USD_CODE = '2222';
const BCU_USD_ISO = 'USD';

interface BcuCotizacion {
  CodigoISO: string;
  TCC: number; // Tipo de cambio compra
  TCV: number; // Tipo de cambio venta
  Fecha: string;
  Moneda: string;
}

interface BcuResponse {
  cotizacionesoutlist: {
    RespuestaStatus: {
      status: number;
      message: string;
    };
    Cotizaciones: BcuCotizacion[];
  };
}

/**
 * Formats a date as dd/mm/yyyy for BCU API
 */
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Fetch with SSL certificate validation disabled
 * BCU's certificate has issues (UnknownIssuer) so we bypass SSL validation
 */
async function fetchWithoutSSL(url: string, options: { method: string; headers: Record<string, string>; body: string }): Promise<BcuResponse> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = options.body;

    const req = https.request({
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method,
      headers: {
        ...options.headers,
        'Content-Length': Buffer.byteLength(postData)
      },
      // Disable SSL certificate validation for BCU
      rejectUnauthorized: false
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data) as BcuResponse;
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Pure function that fetches BCU's JSON endpoint for USD exchange rates
 * BCU provides the official interbancario (interbank) exchange rate
 *
 * Note: Uses custom HTTPS request with SSL validation disabled because BCU's
 * certificate has issues (UnknownIssuer). This only works in Node.js runtime
 * (Netlify Functions), not in Deno (Edge Functions).
 *
 * @returns USD exchange rates (interbancario)
 * @throws Error if USD quote not found
 */
export async function scrapeBcuRates(): Promise<ExchangeRate> {
  const today = new Date();
  const dateStr = formatDate(today);

  const payload = {
    KeyValuePairs: {
      Monedas: [{ Val: BCU_USD_CODE, Text: "DOLAR USA" }],
      FechaDesde: dateStr,
      FechaHasta: dateStr,
      Grupo: "1"
    }
  };

  const data = await fetchWithoutSSL(BCU_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    },
    body: JSON.stringify(payload)
  });

  // Check response status
  if (data.cotizacionesoutlist?.RespuestaStatus?.status === 0) {
    // Status 0 means no data for today, try previous business day
    // This can happen on weekends or holidays
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return fetchBcuRatesForDate(yesterday);
  }

  const cotizaciones = data.cotizacionesoutlist?.Cotizaciones;
  if (!cotizaciones || cotizaciones.length === 0) {
    throw new Error('No cotizaciones found in BCU response');
  }

  const usdQuote = cotizaciones.find(c => c.CodigoISO === BCU_USD_ISO);
  if (!usdQuote) {
    throw new Error('USD quote not found in BCU response');
  }

  const buy = usdQuote.TCC;
  const sell = usdQuote.TCV;
  const average = parseFloat(((buy + sell) / 2).toFixed(2));

  return {
    average,
    buy,
    sell,
    currency: USD_CURRENCY
  };
}

/**
 * Fetch rates for a specific date (used for fallback on weekends/holidays)
 */
async function fetchBcuRatesForDate(date: Date, attempts = 5): Promise<ExchangeRate> {
  if (attempts <= 0) {
    throw new Error('No BCU data available for the last 5 days');
  }

  const dateStr = formatDate(date);

  const payload = {
    KeyValuePairs: {
      Monedas: [{ Val: BCU_USD_CODE, Text: "DOLAR USA" }],
      FechaDesde: dateStr,
      FechaHasta: dateStr,
      Grupo: "1"
    }
  };

  const data = await fetchWithoutSSL(BCU_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    },
    body: JSON.stringify(payload)
  });

  if (data.cotizacionesoutlist?.RespuestaStatus?.status === 0) {
    // Try previous day
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return fetchBcuRatesForDate(previousDay, attempts - 1);
  }

  const cotizaciones = data.cotizacionesoutlist?.Cotizaciones;
  if (!cotizaciones || cotizaciones.length === 0) {
    // Try previous day
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return fetchBcuRatesForDate(previousDay, attempts - 1);
  }

  const usdQuote = cotizaciones.find(c => c.CodigoISO === BCU_USD_ISO);
  if (!usdQuote) {
    throw new Error('USD quote not found in BCU response');
  }

  const buy = usdQuote.TCC;
  const sell = usdQuote.TCV;
  const average = parseFloat(((buy + sell) / 2).toFixed(2));

  return {
    average,
    buy,
    sell,
    currency: USD_CURRENCY
  };
}
