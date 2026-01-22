// Tipos para la respuesta de scraping
export interface BrouRates {
  cotizacion_media: number;
  detalle: {
    compra: number;
    venta: number;
    moneda: string;
  };
  fecha: string;
}

/**
 * Función pura que hace scraping del sitio de BROU
 * @returns Cotizaciones del dólar eBROU
 * @throws Error si no se encuentra la cotización en el HTML
 */
export async function scrapeBrouRates(): Promise<BrouRates> {
  const url = 'https://www.brou.com.uy/c/portal/render_portlet?p_l_id=20593&p_p_id=cotizacionfull_WAR_broutmfportlet_INSTANCE_otHfewh1klyS&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view';

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const html = await response.text();
  const regex = /Dólar eBROU[\s\S]*?valor">([\d,.\s]+)<\/p>[\s\S]*?valor">([\d,.\s]+)<\/p>/;
  const match = html.match(regex);

  if (!match) {
    throw new Error('No se encontró cotización en HTML');
  }

  const compra = parseFloat(match[1].trim().replace(',', '.'));
  const venta = parseFloat(match[2].trim().replace(',', '.'));
  const media = parseFloat(((compra + venta) / 2).toFixed(2));

  return {
    cotizacion_media: media,
    detalle: { compra, venta, moneda: "Dólar eBROU" },
    fecha: new Date().toISOString()
  };
}
