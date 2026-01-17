const API_URL = '/api/dolar';

let cotizacionMedia = 0;

const elements = {
    loading: document.getElementById('loading'),
    cotizacionInfo: document.getElementById('cotizacion-info'),
    error: document.getElementById('error'),
    compra: document.getElementById('compra'),
    venta: document.getElementById('venta'),
    media: document.getElementById('media'),
    fecha: document.getElementById('fecha'),
    refreshBtn: document.getElementById('refresh-btn'),
    usdInput: document.getElementById('usd-input'),
    uyuInput: document.getElementById('uyu-input'),
    uyuResult: document.getElementById('uyu-result'),
    usdResult: document.getElementById('usd-result')
};

async function obtenerCotizacion() {
    try {
        elements.loading.style.display = 'block';
        elements.cotizacionInfo.style.display = 'none';
        elements.error.style.display = 'none';
        elements.refreshBtn.disabled = true;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Error al obtener cotización');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        cotizacionMedia = data.cotizacion_media;

        elements.compra.textContent = `$ ${data.detalle.compra.toFixed(2)}`;
        elements.venta.textContent = `$ ${data.detalle.venta.toFixed(2)}`;
        elements.media.textContent = `$ ${data.cotizacion_media.toFixed(2)}`;

        const fecha = new Date(data.fecha);
        elements.fecha.textContent = `Actualizado: ${fecha.toLocaleString('es-UY')}`;

        elements.loading.style.display = 'none';
        elements.cotizacionInfo.style.display = 'block';

        actualizarConversiones();

    } catch (error) {
        elements.loading.style.display = 'none';
        elements.error.style.display = 'block';
        elements.error.textContent = `Error: ${error.message}`;
        console.error('Error:', error);
    } finally {
        elements.refreshBtn.disabled = false;
    }
}

function convertirUSDaUYU(usd) {
    if (!cotizacionMedia || usd < 0) return 0;
    return usd * cotizacionMedia;
}

function convertirUYUaUSD(uyu) {
    if (!cotizacionMedia || uyu < 0) return 0;
    return uyu / cotizacionMedia;
}

function actualizarConversiones() {
    const usdValue = parseFloat(elements.usdInput.value) || 0;
    const uyuValue = parseFloat(elements.uyuInput.value) || 0;

    const resultadoUYU = convertirUSDaUYU(usdValue);
    const resultadoUSD = convertirUYUaUSD(uyuValue);

    elements.uyuResult.textContent = `${resultadoUYU.toFixed(2)} UYU`;
    elements.usdResult.textContent = `${resultadoUSD.toFixed(2)} USD`;
}

elements.usdInput.addEventListener('input', () => {
    const usdValue = parseFloat(elements.usdInput.value) || 0;
    const resultadoUYU = convertirUSDaUYU(usdValue);
    elements.uyuResult.textContent = `${resultadoUYU.toFixed(2)} UYU`;
});

elements.uyuInput.addEventListener('input', () => {
    const uyuValue = parseFloat(elements.uyuInput.value) || 0;
    const resultadoUSD = convertirUYUaUSD(uyuValue);
    elements.usdResult.textContent = `${resultadoUSD.toFixed(2)} USD`;
});

elements.refreshBtn.addEventListener('click', obtenerCotizacion);

obtenerCotizacion();
