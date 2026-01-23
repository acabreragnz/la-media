import type { Config } from "@netlify/functions";

/**
 * Scheduled function que invoca la background function de Santander
 * Se ejecuta todos los días a las 08:00 UTC
 *
 * Esta función es liviana (<30s) y solo dispara la background function
 * que tiene 15 minutos de timeout para completar el scraping
 */
export default async (req: Request) => {
  const startTime = Date.now();

  console.log("=".repeat(60));
  console.log("🚀 INICIO DE SCRAPING SCHEDULED - Santander");
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

  try {
    console.log("\n🔄 Invocando background function...");

    // Obtener la URL base de la función (puede ser localhost en dev o Netlify en prod)
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const backgroundFunctionUrl = `${baseUrl}/.netlify/functions/santander-scraper-background`;

    console.log("📍 URL de background function:", backgroundFunctionUrl);

    // Invocar la background function mediante POST
    const response = await fetch(backgroundFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        triggered_by: "scheduled-function",
        timestamp: new Date().toISOString(),
      }),
    });

    console.log(`✅ Background function invocada - Status: ${response.status}`);

    if (response.status === 202) {
      console.log("✓ Background function aceptada y ejecutándose en segundo plano");
    } else if (response.ok) {
      console.log("✓ Background function completada exitosamente");
      const result = await response.json();
      console.log("📊 Resultado:", result);
    } else {
      console.error("❌ Error en background function:", response.status, response.statusText);
    }

    const totalTime = Date.now() - startTime;
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SCHEDULED FUNCTION COMPLETADA");
    console.log(`⏱️  Tiempo total: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log("=".repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        message: "Background function invocada correctamente",
        backgroundFunctionStatus: response.status,
        executionTime: totalTime,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    const errorStack = error instanceof Error ? error.stack : "";

    console.error("\n" + "❌".repeat(30));
    console.error("💥 ERROR AL INVOCAR BACKGROUND FUNCTION");
    console.error("📝 Mensaje:", errorMessage);
    console.error("📚 Stack:", errorStack);
    console.error("⏱️  Tiempo hasta el error:", Date.now() - startTime, "ms");
    console.error("❌".repeat(30));

    return new Response(
      JSON.stringify({
        error: errorMessage,
        stack: errorStack,
        executionTime: Date.now() - startTime,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Configuración de programación: Todos los días a las 08:00 UTC
export const config: Config = {
  schedule: "0 8 * * *", // Cron expression: min hour day month weekday
};
