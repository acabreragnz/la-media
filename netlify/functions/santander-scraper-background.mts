import { chromium } from "playwright-core";
import chromiumPack from "@sparticuz/chromium";

/**
 * Background function que realiza scraping de Santander
 * Timeout: 15 minutos (vs 30 segundos de scheduled functions)
 * Se invoca desde santander-scraper.mts (scheduled function)
 */
export default async (req: Request) => {
  const startTime = Date.now();

  console.log("=".repeat(60));
  console.log("🚀 INICIO DE SCRAPING - Santander (BACKGROUND)");
  console.log("🕐 Timestamp:", new Date().toISOString());
  console.log("⏱️  Timeout límite: 15 minutos");

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
      waitUntil: "load",
      timeout: 15000,
    });

    console.log(`✅ Página cargada en ${Date.now() - navStart}ms`);
    console.log("📍 URL actual:", page.url());

    // Esperar un poco para que JavaScript se ejecute
    console.log("\n⏳ Esperando 1 segundo para que JavaScript cargue el contenido...");
    await page.waitForTimeout(1000);

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

    console.log("\n✏️  Paso 3: Expandiendo formulario de login...");

    // El formulario está dentro de un Bootstrap collapse, usar JavaScript para expandirlo
    try {
      console.log("   → Expandiendo collapse con JavaScript...");
      await page.evaluate(() => {
        // Encontrar el elemento collapse
        const collapseElement = document.getElementById('collapseLogin');
        if (collapseElement) {
          // Remover la clase 'collapse' para que se muestre
          collapseElement.classList.remove('collapse');
          collapseElement.classList.add('show');
          console.log('Collapse expandido mediante manipulación de clases');
        } else {
          console.log('No se encontró #collapseLogin');
        }
      });
      console.log("   ✓ Collapse expandido");

      // Esperar un poco para que el DOM se actualice
      await page.waitForTimeout(500);

    } catch (error) {
      console.log("   ⚠️  Error al expandir formulario:", error);
    }

    console.log("\n✏️  Paso 4: Rellenando formulario de login (Paso 1/2 - Documento)...");

    // Ahora el formulario debería estar visible
    await page.waitForSelector("#santander-login-persona-form", { timeout: 5000, state: 'visible' });
    console.log("   ✓ Formulario de login detectado y visible");

    console.log("   → Ingresando documento...");
    await page.fill("#edit-document", DOCUMENTO);
    console.log("   ✓ Documento ingresado:", DOCUMENTO);

    console.log("\n🖱️  Paso 5: Haciendo click en botón Ingresar (primera pantalla)...");
    const supernetStart = Date.now();

    // DEBUG: Analizar el estado del formulario antes del click
    console.log("\n🔍 DEBUG: Analizando botones del formulario...");
    const formHtml = await page.$eval('#santander-login-persona-form', el => el.outerHTML);
    console.log("📄 HTML del formulario COMPLETO (length:", formHtml.length, "chars)");
    console.log(formHtml);

    // Buscar TODOS los botones en el formulario
    const allButtons = await page.$$eval('#santander-login-persona-form button', buttons =>
      buttons.map(btn => ({
        type: btn.getAttribute('type'),
        text: btn.textContent?.trim(),
        classes: btn.className,
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }))
    );
    console.log("   → Botones encontrados DENTRO del formulario:", JSON.stringify(allButtons, null, 2));

    // Buscar botones FUERA del formulario que puedan estar asociados
    console.log("\n🔍 DEBUG: Buscando botones fuera del formulario...");
    const allPageButtons = await page.$$eval('button', buttons =>
      buttons.map((btn, idx) => ({
        index: idx,
        type: btn.getAttribute('type'),
        text: btn.textContent?.trim(),
        form: btn.getAttribute('form'),
        classes: btn.className,
        visible: btn.offsetParent !== null
      })).filter(btn => btn.text?.includes('Ingresar') || btn.text?.includes('Continuar') || btn.text?.includes('Enviar'))
    );
    console.log("   → Botones en toda la página con texto relevante:", JSON.stringify(allPageButtons, null, 2));

    // Buscar también inputs de tipo submit
    const submitInputs = await page.$$eval('input[type="submit"]', inputs =>
      inputs.map(input => ({
        value: input.getAttribute('value'),
        form: input.getAttribute('form'),
        classes: input.className,
        visible: input.offsetParent !== null
      }))
    );
    console.log("   → Inputs submit encontrados:", JSON.stringify(submitInputs, null, 2));

    // Determinar qué elemento usar para submit
    console.log("\n   → Determinando cómo hacer submit...");

    let submitSuccess = false;
    let submitMethod = "";

    // Opción 1: Intentar botón submit dentro del formulario
    const submitBtn = await page.$('#santander-login-persona-form button[type="submit"]');
    if (submitBtn) {
      console.log("   → Opción 1: Botón submit encontrado en formulario");
      await submitBtn.click();
      submitMethod = "button[type=submit] dentro del form";
      submitSuccess = true;
    }

    // Opción 2: Input submit
    if (!submitSuccess) {
      const submitInput = await page.$('#santander-login-persona-form input[type="submit"]');
      if (submitInput) {
        console.log("   → Opción 2: Input submit encontrado");
        await submitInput.click();
        submitMethod = "input[type=submit]";
        submitSuccess = true;
      }
    }

    // Opción 3: Cualquier botón en el formulario
    if (!submitSuccess) {
      const anyBtn = await page.$('#santander-login-persona-form button');
      if (anyBtn) {
        console.log("   → Opción 3: Usando primer botón del formulario");
        await anyBtn.click();
        submitMethod = "primer button del form";
        submitSuccess = true;
      }
    }

    // Opción 4: Submit directo del formulario (sin botón)
    if (!submitSuccess) {
      console.log("   → Opción 4: Submit directo del formulario via JavaScript");
      await page.evaluate(() => {
        const form = document.getElementById('santander-login-persona-form') as HTMLFormElement;
        if (form) {
          form.submit();
        }
      });
      submitMethod = "form.submit() directo";
      submitSuccess = true;
    }

    console.log(`   ✓ Submit ejecutado via: ${submitMethod}`);

    console.log("\n   → Esperando redirect JavaScript a Supernet...");
    console.log("   → URL actual antes de esperar:", page.url());

    // Esperar a que JavaScript haga el redirect (monitorear cambio de URL)
    try {
      await page.waitForFunction(
        () => window.location.href.includes('supernet.santander.com.uy'),
        { timeout: 30000 }
      );
      console.log("   ✓ Redirect detectado");
    } catch (redirectError) {
      console.log("   ❌ No se detectó redirect a Supernet");
      console.log("   → URL actual:", page.url());

      // Capturar lo que haya en la página ahora
      const currentHtml = await page.content();
      console.log("   → HTML actual (primeros 1000 chars):");
      console.log(currentHtml.substring(0, 1000));

      // Buscar mensajes de error
      const hasError = currentHtml.toLowerCase().includes('error') || currentHtml.toLowerCase().includes('incorrecto');
      console.log("   → ¿Hay mensaje de error?:", hasError);

      throw new Error("No se pudo completar el redirect a Supernet");
    }

    // Esperar a que la página de Supernet cargue
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    console.log(`✅ Supernet cargado en ${Date.now() - supernetStart}ms`);
    console.log("📍 URL actual:", page.url());
    console.log("   ✓ Confirmado: Estamos en Supernet");

    console.log("\n✏️  Paso 6: Esperando formulario de contraseña en Supernet (SPA)...");
    // Supernet es una SPA (Single Page App), puede tardar en cargar el formulario
    console.log("   → Esperando a que la SPA cargue el formulario de password...");
    await page.waitForTimeout(3000);

    // DEBUG: Capturar el estado de la página de Supernet
    console.log("\n🔍 DEBUG: Analizando página de Supernet...");
    const supernetHtml = await page.content();
    console.log("📄 HTML de Supernet (length:", supernetHtml.length, "chars)");
    console.log("📄 HTML (primeros 2000 chars):");
    console.log(supernetHtml.substring(0, 2000));

    // Buscar todos los inputs en la página
    const allInputs = await page.$$eval('input', inputs =>
      inputs.map(input => ({
        type: input.getAttribute('type'),
        id: input.id,
        name: input.getAttribute('name'),
        placeholder: input.getAttribute('placeholder'),
        visible: input.offsetParent !== null
      }))
    );
    console.log("   → Todos los inputs encontrados:", JSON.stringify(allInputs, null, 2));

    console.log("\n   → Buscando campo de contraseña...");
    const passwordSelector = 'input[type="password"]';

    try {
      await page.waitForSelector(passwordSelector, { timeout: 10000 });
      console.log("   ✓ Campo de password encontrado");
    } catch (error) {
      console.log("   ❌ No se encontró input[type=password]");
      console.log("   → Intentando buscar por placeholder o name...");

      // Intentar otros selectores posibles
      const possibleSelectors = [
        'input[placeholder*="ontraseña"]',
        'input[placeholder*="assword"]',
        'input[name*="password"]',
        'input[name*="pass"]',
        'input[id*="password"]',
        'input[id*="pass"]',
      ];

      for (const selector of possibleSelectors) {
        const found = await page.$(selector);
        if (found) {
          console.log(`   ✓ Encontrado con selector alternativo: ${selector}`);
          break;
        }
      }

      throw error;
    }

    await page.fill(passwordSelector, PASSWORD);
    console.log("   ✓ Password ingresado");

    console.log("\n🖱️  Paso 7: Haciendo click en botón de login final...");
    const finalLoginStart = Date.now();
    const loginButtonSelector = 'button[type="submit"]';

    console.log("   → Haciendo click en login...");

    // Click y esperar navegación (puede tardar, la SPA carga el dashboard)
    await Promise.all([
      page.waitForNavigation({ timeout: 20000, waitUntil: 'domcontentloaded' }),
      page.click(loginButtonSelector)
    ]);

    console.log("   ✓ Login completado");
    console.log(`✅ Acceso a banca en ${Date.now() - finalLoginStart}ms`);
    console.log("📍 URL final:", page.url());

    console.log("\n✅ LOGIN EXITOSO");

    // TODO: Aquí implementar la lógica de captura
    console.log("\n📊 Paso 8: Extrayendo datos...");
    console.log("   ⚠️  TODO: Implementar extracción de saldo y transacciones");

    // TODO: Guardar en Blobs
    console.log("\n💾 Paso 9: Guardando en Netlify Blobs...");
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
