import { XMLParser } from "fast-xml-parser";
import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

// BCU SOAP Web Service endpoint (official API)
const BCU_SOAP_ENDPOINT = 'https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcucotizaciones';

// BCU currency code for USD Interbancario Billete
const BCU_USD_CODE = 2225;

/**
 * Formats a date as YYYY-MM-DD for BCU SOAP API
 */
function formatDateForSoap(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates the SOAP envelope for BCU cotizaciones request
 */
function createSoapEnvelope(fechaDesde: string, fechaHasta: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cot="Cotizaciones">
  <soapenv:Header/>
  <soapenv:Body>
    <cot:Execute>
      <cot:Entrada>
        <cot:Moneda>
          <cot:item>${BCU_USD_CODE}</cot:item>
        </cot:Moneda>
        <cot:FechaDesde>${fechaDesde}</cot:FechaDesde>
        <cot:FechaHasta>${fechaHasta}</cot:FechaHasta>
        <cot:Grupo>0</cot:Grupo>
      </cot:Entrada>
    </cot:Execute>
  </soapenv:Body>
</soapenv:Envelope>`;
}

interface SoapCotizacion {
  Fecha: string;
  Moneda: string;
  CodigoISO: string;
  Emisor: string;
  TCC: number;
  TCV: number;
  ArbsCompra: number;
  ArbsVenta: number;
  FormaArbitraje: number;
}

interface SoapResponse {
  'SOAP-ENV:Envelope': {
    'SOAP-ENV:Body': {
      'ns1:ExecuteResponse': {
        Salida: {
          respuestastatus?: {
            status: number;
            mensaje?: string;
          };
          datoscotizaciones?: {
            datoscotizaciones?: {
              Fecha: string;
              Moneda: string;
              CodigoISO: string;
              Emisor: string;
              TCC: number;
              TCV: number;
              ArbsCompra: number;
              ArbsVenta: number;
              FormaArbitraje: number;
            } | SoapCotizacion[];
          };
        };
      };
    };
  };
}

/**
 * Pure function that fetches BCU's SOAP endpoint for USD exchange rates
 * BCU provides the official interbancario (interbank) exchange rate
 * @returns USD exchange rates (interbancario)
 * @throws Error if USD quote not found
 */
export async function scrapeBcuRates(): Promise<ExchangeRate> {
  const today = new Date();
  return fetchBcuRatesForDate(today);
}

/**
 * Fetch rates for a specific date (with retry for weekends/holidays)
 */
async function fetchBcuRatesForDate(date: Date, attempts = 5): Promise<ExchangeRate> {
  if (attempts <= 0) {
    throw new Error('No BCU data available for the last 5 days');
  }

  const dateStr = formatDateForSoap(date);
  const soapEnvelope = createSoapEnvelope(dateStr, dateStr);

  const response = await fetch(BCU_SOAP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'Cotizaciones',
      'User-Agent': 'Mozilla/5.0'
    },
    body: soapEnvelope
  });

  if (!response.ok) {
    throw new Error(`BCU SOAP API responded with status ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: true,
    removeNSPrefix: true
  });

  const parsed = parser.parse(xml) as SoapResponse;

  // Navigate through SOAP response structure
  const envelope = parsed['SOAP-ENV:Envelope'] || parsed['Envelope'];
  const body = envelope?.['SOAP-ENV:Body'] || envelope?.['Body'];
  const executeResponse = body?.['ns1:ExecuteResponse'] || body?.['ExecuteResponse'];
  const salida = executeResponse?.Salida;

  // Check if we got data
  const status = salida?.respuestastatus?.status;
  if (status === 1) {
    // No data for this date, try previous day
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return fetchBcuRatesForDate(previousDay, attempts - 1);
  }

  const datosWrapper = salida?.datoscotizaciones;
  const datos = datosWrapper?.datoscotizaciones;

  if (!datos) {
    // No data, try previous day
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return fetchBcuRatesForDate(previousDay, attempts - 1);
  }

  // Handle both single object and array responses
  const cotizaciones = Array.isArray(datos) ? datos : [datos];

  if (cotizaciones.length === 0) {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return fetchBcuRatesForDate(previousDay, attempts - 1);
  }

  // Get the first (and usually only) USD quote
  const usdQuote = cotizaciones[0];

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
