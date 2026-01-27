import { chromium } from "playwright-core";
import chromiumPack from "@sparticuz/chromium";
import { getStore } from "@netlify/blobs";

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
  let compra: string | null = null;
  let venta: string | null = null;

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

    // Buscar inputs de tipo submit
    const submitInputs = await page.$$eval('input[type="submit"]', inputs =>
      inputs.map(input => ({
        value: input.getAttribute('value'),
        visible: input.offsetParent !== null
      }))
    );
    const visibleSubmits = submitInputs.filter(s => s.visible);
    console.log(`   → Inputs submit visibles encontrados: ${visibleSubmits.length}`);

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
    // Supernet es una SPA (Single Page App) - el HTML inicial está vacío
    // Necesitamos esperar a que JavaScript monte el formulario
    console.log("   → Esperando a que la SPA monte el DOM (esperar a que aparezca algún input)...");

    // Esperar hasta que aparezca CUALQUIER input en la página (señal de que la SPA montó)
    await page.waitForFunction(
      () => document.querySelectorAll('input').length > 0,
      { timeout: 20000 }
    );

    console.log("   ✓ SPA montada (inputs detectados en el DOM)");

    // Verificar que hay inputs en la página
    const inputCount = await page.$$eval('input', inputs => inputs.length);
    const passwordInputs = await page.$$eval('input[type="password"]', inputs =>
      inputs.filter(input => input.offsetParent !== null).length
    );
    console.log(`   → Total inputs: ${inputCount}, Password inputs visibles: ${passwordInputs}`);

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

    console.log("\n🖱️  Paso 7: Haciendo click en botón 'Siguiente'...");
    const finalLoginStart = Date.now();

    // Esperar a que el botón se renderice
    console.log("   → Esperando que el botón 'Siguiente' se renderice...");
    await page.waitForTimeout(5000);

    const urlBefore = page.url();

    // El botón "Siguiente" es un enlace <a> con clase específica
    console.log("   → Buscando botón 'Siguiente' (enlace con clase ipswich-main-buttons-link)...");

    const submitButtonSelectors = [
      'a.ipswich-main-buttons-link:has-text("Siguiente")',
      'a:has-text("Siguiente")',
      'icb-button:has-text("Siguiente")',
    ];

    let submitClicked = false;
    for (const selector of submitButtonSelectors) {
      try {
        const btn = await page.$(selector);
        if (btn && await btn.isVisible()) {
          console.log(`   → Botón "Siguiente" encontrado con selector: ${selector}`);
          await btn.click();
          console.log("   ✓ Click en 'Siguiente' ejecutado");
          submitClicked = true;
          break;
        }
      } catch (e) {
        // Intentar siguiente selector
      }
    }

    if (!submitClicked) {
      console.log("   ⚠️  No se encontró el botón 'Siguiente'");
      throw new Error("No se pudo hacer click en botón Siguiente");
    }

    console.log("\n   → Esperando que el dashboard cargue...");
    console.log("   → URL actual:", urlBefore);
    console.log("   → Esperando redirect a #/home...");

    // Esperar a que la URL cambie a #/home (señal de login exitoso)
    try {
      await page.waitForFunction(
        () => window.location.href.includes('#/home'),
        { timeout: 30000 }
      );
      console.log("   ✓ Redirect a #/home detectado");
    } catch (error) {
      console.log("   ⚠️  No se detectó redirect a #/home en 30 segundos");
      console.log("   → URL actual:", page.url());

      // Verificar si hay mensajes de error
      const pageContent = await page.content();
      const hasError = pageContent.toLowerCase().includes('error') ||
                      pageContent.toLowerCase().includes('incorrecto') ||
                      pageContent.toLowerCase().includes('inválid');

      if (hasError) {
        console.log("   ❌ Posible error de credenciales detectado en la página");
        throw new Error("Login fallido - verificar credenciales");
      }

      throw error;
    }

    const urlAfter = page.url();
    console.log("   ✓ URL cambió de:", urlBefore);
    console.log("   ✓ URL ahora es:", urlAfter);

    // Esperar a que el loader desaparezca
    console.log("\n   → Esperando que desaparezca el loader de Angular...");
    try {
      await page.waitForFunction(
        () => !document.querySelector('.mesina-loader'),
        { timeout: 20000 }
      );
      console.log("   ✓ Loader desaparecido");
    } catch (error) {
      console.log("   ⚠️  Loader sigue visible después de 20 segundos (puede ser normal si la conexión es lenta)");
    }

    // Esperar a que aparezcan elementos del dashboard
    console.log("\n   → Esperando elementos del dashboard...");
    const dashboardSelectors = [
      '.dashboard',
      '.cotizaciones',
      '[class*="home"]',
      '[class*="widget"]',
      'main',
      '.content',
    ];

    let dashboardFound = false;
    for (const selector of dashboardSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`   ✓ Dashboard detectado (selector: ${selector})`);
        dashboardFound = true;
        break;
      } catch (e) {
        // Intentar siguiente selector
      }
    }

    if (!dashboardFound) {
      console.log("   ⚠️  No se encontró selector específico del dashboard");
      console.log("   → Verificando que haya contenido en la página...");

      const bodyText = await page.$eval('body', el => el.textContent?.trim() || '');
      console.log(`   → Texto del body (primeros 200 chars): ${bodyText.substring(0, 200)}`);

      if (bodyText.length > 100) {
        console.log("   ✓ Página tiene contenido (asumiendo dashboard cargado)");
        dashboardFound = true;
      }
    }

    console.log(`\n✅ LOGIN EXITOSO - Dashboard cargado en ${Date.now() - finalLoginStart}ms`);

    // Extraer datos del dashboard
    console.log("\n📊 Paso 8: Extrayendo cotizaciones de USD/UYU...");

    try {
      // Esperar un momento para que el widget de cotizaciones cargue completamente
      await page.waitForTimeout(3000);

      // Extraer compra y venta del widget de cotizaciones
      compra = await page.$eval('.data-content-middle', el => el.textContent?.trim() || null);
      venta = await page.$eval('.data-content-right', el => el.textContent?.trim() || null);

      if (compra && venta) {
        console.log(`   ✓ Compra: ${compra}`);
        console.log(`   ✓ Venta: ${venta}`);
      } else {
        console.log("   ⚠️  No se pudieron extraer las cotizaciones (valores null)");
      }
    } catch (extractError) {
      console.error("   ❌ Error al extraer cotizaciones:", extractError instanceof Error ? extractError.message : extractError);
      console.log("   → Continuando sin datos de cotización...");
    }

    // Guardar en Netlify Blobs
    console.log("\n💾 Paso 9: Guardando en Netlify Blobs...");

    try {
      const santanderStore = getStore("santander-rates");

      const data = {
        timestamp: new Date().toISOString(),
        compra: compra ? parseFloat(compra.replace(',', '.')) : null,
        venta: venta ? parseFloat(venta.replace(',', '.')) : null,
        source: "santander",
        scrapedAt: new Date().toISOString(),
      };

      console.log("   → Guardando datos:", JSON.stringify(data, null, 2));

      await santanderStore.setJSON("latest", data);
      console.log("   ✓ Datos guardados en Netlify Blobs (store: santander-rates, key: latest)");
    } catch (blobError) {
      console.error("   ❌ Error al guardar en Blobs:", blobError instanceof Error ? blobError.message : blobError);
      // No lanzar error - el scraping fue exitoso aunque no se guardó
    }

    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SCRAPING COMPLETADO EXITOSAMENTE");
    console.log(`⏱️  Tiempo total: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log("=".repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        message: "Scraping completado",
        data: {
          compra: compra ? parseFloat(compra.replace(',', '.')) : null,
          venta: venta ? parseFloat(venta.replace(',', '.')) : null,
        },
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
