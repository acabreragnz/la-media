import { USD_CURRENCY, type ExchangeRate } from "./constants.mts";

/**
 * Pure function that scrapes BROU's website for USD exchange rates
 * @returns USD exchange rates (eBROU)
 * @throws Error if exchange rate not found in HTML
 */
export async function scrapeBrouRates(): Promise<ExchangeRate> {
  const url = 'https://www.brou.com.uy/c/portal/render_portlet?p_l_id=20593&p_p_id=cotizacionfull_WAR_broutmfportlet_INSTANCE_otHfewh1klyS&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view';

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const html = await response.text();
  const regex = /Dólar eBROU[\s\S]*?valor">([\d,.\s]+)<\/p>[\s\S]*?valor">([\d,.\s]+)<\/p>/;
  const match = html.match(regex);

  if (!match) {
    throw new Error('USD exchange rate not found in HTML');
  }

  const buy = parseFloat(match[1].trim().replace(',', '.'));
  const sell = parseFloat(match[2].trim().replace(',', '.'));
  const average = parseFloat(((buy + sell) / 2).toFixed(2));

  return {
    average,
    buy,
    sell,
    currency: USD_CURRENCY
  };
}
