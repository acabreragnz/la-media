export default async (request, context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = 'https://www.brou.com.uy/c/portal/render_portlet?p_l_id=20593&p_p_id=cotizacionfull_WAR_broutmfportlet_INSTANCE_otHfewh1klyS&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view';

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await response.text();

    const regex = /Dólar eBROU[\s\S]*?valor">([\d,.\s]+)<\/p>[\s\S]*?valor">([\d,.\s]+)<\/p>/;
    const match = html.match(regex);

    if (match) {
      const compra = parseFloat(match[1].trim().replace(',', '.'));
      const venta = parseFloat(match[2].trim().replace(',', '.'));
      const media = parseFloat(((compra + venta) / 2).toFixed(2));

      return new Response(
        JSON.stringify({
          cotizacion_media: media,
          detalle: { compra, venta, moneda: "Dólar eBROU" },
          fecha: new Date().toISOString()
        }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: "No se encontró cotización" }),
      { status: 404, headers: corsHeaders }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config = {
  path: '/api/brou-media',
}