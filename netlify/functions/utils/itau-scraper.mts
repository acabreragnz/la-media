import { XMLParser } from "fast-xml-parser";
import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

const ITAU_USD_CURRENCY = 'LINK';

interface ParsedXmlResponse {
  root: {
    fecha: string;
    cotizacion: Array<{
      moneda: string;
      compra: string;
      venta: string;
    }>;
  };
}

const stringToFloat = (value: string) => parseFloat(value.replace(',', '.'));

/**
 * Pure function that scrapes Itaú's XML endpoint for USD exchange rates
 * @returns USD exchange rates
 * @throws Error if USD quote not found in XML
 */
export async function scrapeItauRates(): Promise<ExchangeRate> {
  const response = await fetch('https://www.itau.com.uy/inst/aci/cotiz.xml');
  const xml = await response.text();
  const parser = new XMLParser();
  const parsed = parser.parse(xml) as ParsedXmlResponse;

  const usdQuote = parsed.root.cotizacion.find(quote => quote.moneda === ITAU_USD_CURRENCY);
  if (!usdQuote) {
    throw new Error('USD quote not found in XML');
  }

  const buy = stringToFloat(usdQuote.compra);
  const sell = stringToFloat(usdQuote.venta);
  const average = parseFloat(((buy + sell) / 2).toFixed(2));

  return {
    average,
    buy,
    sell,
    currency: USD_CURRENCY
  };
}
