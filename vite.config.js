import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const metadataPath = resolve(process.cwd(), "variant_metadata.json");

function readMetadata() {
  return JSON.parse(readFileSync(metadataPath, "utf8"));
}

function variantDetailPages() {
  const metadata = readMetadata();
  const ids = Array.from(new Set(metadata.variants
    .filter((variant) => variant.status !== "hidden")
    .map((variant) => metadata.aliases[variant.id] || variant.id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase())
    .filter(Boolean)));
  return {
    name: "variant-detail-pages",
    writeBundle(options) {
      const outputDirectory = options.dir || resolve(process.cwd(), "dist");
      const template = readFileSync(resolve(outputDirectory, "list.html"), "utf8");
      const pageDirectory = resolve(outputDirectory, "variant-pages");
      mkdirSync(pageDirectory, { recursive: true });
      ids.forEach((id) => {
        const source = template
          .replace("<head>", "<head><base href=\"../\">")
          .replace('data-catalog-page="variants"', `data-catalog-page="detail" data-variant-id="${id}"`);
        writeFileSync(resolve(pageDirectory, `${encodeURIComponent(id)}.html`), source, "utf8");
      });
    }
  };
}

function devApiPlugin() {
  return {
    name: "dev-api-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== "/api/add-variant" || req.method !== "POST") return next();
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (!data.id || !data.name) {
              res.statusCode = 400;
              return res.end("Missing id or name");
            }
            const metadata = readMetadata();
            const id = data.id.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
            const variant = {
              id,
              name: data.name,
              rules: { "9x9": data.rule },
              status: data.status || "planned",
              scratchGeneratable: false,
              inputType: { categories: [data.inputType || "shape"], instructions: [] },
              tags: data.tags || []
            };
            const index = metadata.variants.findIndex((item) => item.id === id);
            if (index === -1) metadata.variants.push(variant);
            else metadata.variants[index] = variant;
            metadata.variants.sort((first, second) => first.name.localeCompare(second.name));
            writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, message: `Successfully saved ${id} to variant_metadata.json` }));
          } catch (error) {
            res.statusCode = 500;
            res.end(error.message);
          }
        });
      });
    }
  };
}

export default defineConfig({
  root: "docs",
  plugins: [variantDetailPages(), devApiPlugin(), svelte({ preprocess: vitePreprocess() })],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "docs/index.html"),
        list: resolve(process.cwd(), "docs/list.html")
      }
    }
  }
});
