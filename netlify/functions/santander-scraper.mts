import type { Config } from "@netlify/functions";
import { chromium } from "playwright-core";
import chromiumPack from "@sparticuz/chromium";

/**
 * Scheduled function que realiza scraping de Santander
 * Se ejecuta todos los días a las 08:00 UTC
 * También se puede invocar manualmente desde Netlify Dashboard
 */
export default async (req: Request) => {
  const startTime = Date.now();

  console.log("=".repeat(60));
  console.log("🚀 INICIO DE SCRAPING - Santander");
  console.log("🕐 Timestamp:", new Date().toISOString());

  try {
    const body = await req.json();
    if (body.next_run) {
      console.log("📅 Próxima ejecución programada:", body.next_run);
    } else {
      console.log("⚡ Ejecución manual detectada");
    }
  } catch {
    console.log("⚡ Ejecución manual detectada (sin body JSON)");
  }

  let browser;

  // Variables de entorno
  const DOCUMENTO = process.env.SANTANDER_DOC || "34628547";
  const PASSWORD = process.env.SANTANDER_PASS ?? "Amoamihijo27";

  console.log("🔑 Documento configurado:", DOCUMENTO.substring(0, 3) + "****" + DOCUMENTO.slice(-2));

  if (!PASSWORD) {
    console.error("❌ FALLO: SANTANDER_PASS no está configurado");
    console.log("=".repeat(60));
    return new Response(
      JSON.stringify({ error: "Credenciales no configuradas" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  console.log("🔑 Password configurado: ✓");

  try {
    console.log("\n📦 Paso 1: Lanzando navegador Chromium...");
    const launchStart = Date.now();

    browser = await chromium.launch({
      args: [
        ...chromiumPack.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-dev-shm-usage",
      ],
      executablePath: await chromiumPack.executablePath(),
      headless: chromiumPack.headless,
    });

    console.log(`✅ Navegador lanzado en ${Date.now() - launchStart}ms`);

    console.log("\n🌐 Paso 2: Navegando a www.santander.com.uy/home...");

    // Crear contexto de navegador con configuración anti-bot
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'es-UY',
      timezoneId: 'America/Montevideo',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-UY,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
    });

    // Ocultar que estamos usando webdriver
    await context.addInitScript(() => {
      // Ocultar webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Simular plugins reales
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin' },
          { name: 'Chrome PDF Viewer' },
          { name: 'Native Client' },
        ],
      });

      // Configurar idiomas
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-UY', 'es', 'en-US'],
      });

      // Agregar chrome object
      if (!window.chrome) {
        window.chrome = {
          runtime: {},
        };
      }

      // Ocultar automation
      delete navigator.__proto__.webdriver;

      // Simular permisos
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    });

    const page = await context.newPage();
    console.log("   ✓ Contexto de navegador configurado (User-Agent, locale, headers)");

    const navStart = Date.now();

    await page.goto("https://www.santander.com.uy/home", {
      waitUntil: "networkidle",
      timeout: 20000,
    });

    console.log(`✅ Página cargada en ${Date.now() - navStart}ms`);
    console.log("📍 URL actual:", page.url());

    // Esperar un poco más para que JavaScript se ejecute
    console.log("\n⏳ Esperando 3 segundos para que JavaScript cargue el contenido...");
    await page.waitForTimeout(3000);

    // DEBUG: Capturar HTML de la página para ver qué elementos existen
    console.log("\n🔍 DEBUG: Analizando estructura de la página...");
    const pageContent = await page.content();
    console.log("📄 HTML length:", pageContent.length, "caracteres");

    // Si el HTML es pequeño, mostrarlo completo
    if (pageContent.length < 500) {
      console.log("\n⚠️  HTML COMPLETO (página muy pequeña):");
      console.log(pageContent);
      console.log("\n");
    }

    // Buscar el formulario en el HTML
    const hasForm = pageContent.includes('santander-login-persona-form');
    const hasDocField = pageContent.includes('edit-document');
    console.log("   → ¿Existe #santander-login-persona-form?", hasForm);
    console.log("   → ¿Existe #edit-document?", hasDocField);

    // Extraer y mostrar algunos IDs de formularios que existan
    const formIdMatches = pageContent.match(/id=["']([^"']*form[^"']*)["']/gi);
    if (formIdMatches) {
      console.log("   → Formularios encontrados:", formIdMatches.slice(0, 5));
    }

    // Extraer inputs de tipo text
    const inputMatches = pageContent.match(/input[^>]*id=["']([^"']*)["'][^>]*type=["']text["']/gi);
    if (inputMatches) {
      console.log("   → Inputs de texto encontrados:", inputMatches.slice(0, 3));
    }

    console.log("\n✏️  Paso 3: Rellenando formulario de login (Paso 1/2 - Documento)...");

    // Esperar a que el formulario de login esté visible
    await page.waitForSelector("#santander-login-persona-form", { timeout: 5000 });
    console.log("   ✓ Formulario de login detectado");

    console.log("   → Ingresando documento...");
    await page.fill("#edit-document", DOCUMENTO);
    console.log("   ✓ Documento ingresado:", DOCUMENTO);

    console.log("\n🖱️  Paso 4: Haciendo click en botón Ingresar (primera pantalla)...");
    await page.click("#santander-login-persona-form button[type='submit']");
    console.log("   ✓ Click ejecutado en submit");

    console.log("\n⏳ Paso 5: Esperando carga de Supernet...");
    const supernetStart = Date.now();

    // Esperar navegación a Supernet (puede ser https://supernet.santander.com.uy o similar)
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    console.log(`✅ Página cargada en ${Date.now() - supernetStart}ms`);
    console.log("📍 URL actual:", page.url());

    console.log("\n✏️  Paso 6: Esperando formulario de contraseña en Supernet...");
    // TODO: Necesito ver el HTML de la página de Supernet para los selectores correctos
    // Por ahora espero 3 segundos para que cargue el formulario dinámico
    await page.waitForTimeout(3000);

    console.log("   → Buscando campo de contraseña...");
    // TODO: Ajustar este selector cuando veas el HTML de Supernet
    const passwordSelector = 'input[type="password"]';
    await page.waitForSelector(passwordSelector, { timeout: 5000 });
    console.log("   ✓ Campo de password encontrado");

    await page.fill(passwordSelector, PASSWORD);
    console.log("   ✓ Password ingresado");

    console.log("\n🖱️  Paso 7: Haciendo click en botón de login final...");
    // TODO: Ajustar este selector cuando veas el HTML de Supernet
    const loginButtonSelector = 'button[type="submit"]';
    await page.click(loginButtonSelector);
    console.log("   ✓ Click ejecutado en login final");

    console.log("\n⏳ Paso 8: Esperando acceso a la banca...");
    const finalLoginStart = Date.now();
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    console.log(`✅ Login completado en ${Date.now() - finalLoginStart}ms`);
    console.log("📍 URL final:", page.url());

    console.log("\n✅ LOGIN EXITOSO");

    // TODO: Aquí implementar la lógica de captura
    console.log("\n📊 Paso 9: Extrayendo datos...");
    console.log("   ⚠️  TODO: Implementar extracción de saldo y transacciones");

    // TODO: Guardar en Blobs
    console.log("\n💾 Paso 10: Guardando en Netlify Blobs...");
    console.log("   ⚠️  TODO: Implementar guardado en Blobs");

    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SCRAPING COMPLETADO EXITOSAMENTE");
    console.log(`⏱️  Tiempo total: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log("=".repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        message: "Scraping completado",
        executionTime: totalTime,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    const errorStack = error instanceof Error ? error.stack : "";

    console.error("\n" + "❌".repeat(30));
    console.error("💥 ERROR EN SCRAPING");
    console.error("📝 Mensaje:", errorMessage);
    console.error("📚 Stack:", errorStack);
    console.error("⏱️  Tiempo hasta el error:", Date.now() - startTime, "ms");
    console.error("❌".repeat(30));

    return new Response(
      JSON.stringify({
        error: errorMessage,
        stack: errorStack,
        executionTime: Date.now() - startTime
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (browser) {
      console.log("\n🧹 Cerrando navegador...");
      await browser.close();
      console.log("✅ Navegador cerrado");
    }
  }
};

// Configuración de programación: Todos los días a las 08:00 UTC
export const config: Config = {
  schedule: "0 8 * * *", // Cron expression: min hour day month weekday
};
