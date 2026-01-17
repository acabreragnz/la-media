import { boot } from "https://v2-17-1--edge.netlify.com/bootstrap/index-combined.ts";

const functions = {}; const metadata = { functions: {} };


      try {
        const { default: func } = await import("file:///home/acabreragnz/dev/brou-media/netlify/edge-functions/get-cotizacion/get-cotizacion.js");

        if (typeof func === "function") {
          functions["get-cotizacion"] = func;
          metadata.functions["get-cotizacion"] = {"url":"file:///home/acabreragnz/dev/brou-media/netlify/edge-functions/get-cotizacion/get-cotizacion.js"}
        } else {
          console.log("⬥ Failed to load Edge Function get-cotizacion. The file does not seem to have a function as the default export.");
        }
      } catch (error) {
        console.log("⬥ Failed to run Edge Function get-cotizacion:");
        console.error(error);
      }
      

boot(() => Promise.resolve(functions));