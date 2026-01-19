import { boot } from "https://v2-17-1--edge.netlify.com/bootstrap/index-combined.ts";

const functions = {}; const metadata = { functions: {} };


      try {
        const { default: func } = await import("file:///home/acabreragnz/dev/brou-media/netlify/edge-functions/get-brou-media.js");

        if (typeof func === "function") {
          functions["get-brou-media"] = func;
          metadata.functions["get-brou-media"] = {"url":"file:///home/acabreragnz/dev/brou-media/netlify/edge-functions/get-brou-media.js"}
        } else {
          console.log("\u001b[91m⬥\u001b[39m \u001b[31mFailed\u001b[39m to load Edge Function \u001b[33mget-brou-media\u001b[39m. The file does not seem to have a function as the default export.");
        }
      } catch (error) {
        console.log("\u001b[91m⬥\u001b[39m \u001b[31mFailed\u001b[39m to run Edge Function \u001b[33mget-brou-media\u001b[39m:");
        console.error(error);
      }
      

boot(() => Promise.resolve(functions));