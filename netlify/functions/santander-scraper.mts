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
      args: [...chromiumPack.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: await chromiumPack.executablePath(),
      headless: true,
    });

    console.log(`✅ Navegador lanzado en ${Date.now() - launchStart}ms`);

    console.log("\n🌐 Paso 2: Navegando a login.santander.com.uy...");
    const page = await browser.newPage();
    const navStart = Date.now();

    await page.goto("https://login.santander.com.uy/", {
      waitUntil: "networkidle",
      timeout: 20000,
    });

    console.log(`✅ Página cargada en ${Date.now() - navStart}ms`);
    console.log("📍 URL actual:", page.url());

    console.log("\n✏️  Paso 3: Rellenando formulario de login...");
    console.log("   → Buscando campo de documento...");
    await page.fill("input#doc", DOCUMENTO);
    console.log("   ✓ Documento ingresado");

    console.log("   → Buscando campo de password...");
    await page.fill('input[type="password"]', PASSWORD);
    console.log("   ✓ Password ingresado");

    console.log("\n🖱️  Paso 4: Haciendo click en botón de login...");
    await page.click("button#btn-login");
    console.log("   ✓ Click ejecutado");

    console.log("\n⏳ Paso 5: Esperando redirección a /home...");
    const loginStart = Date.now();
    await page.waitForURL("**/home", { timeout: 5000 });
    console.log(`✅ Redirección completada en ${Date.now() - loginStart}ms`);
    console.log("📍 URL final:", page.url());

    console.log("\n✅ LOGIN EXITOSO");

    // TODO: Aquí implementar la lógica de captura
    console.log("\n📊 Paso 6: Extrayendo datos...");
    console.log("   ⚠️  TODO: Implementar extracción de saldo y transacciones");

    // TODO: Guardar en Blobs
    console.log("\n💾 Paso 7: Guardando en Netlify Blobs...");
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
