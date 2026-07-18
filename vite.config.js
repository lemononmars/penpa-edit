import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const metadataPath = resolve(process.cwd(), "variant_metadata.json");

function readMetadata() {
  return JSON.parse(readFileSync(metadataPath, "utf8"));
}

function devApiPlugin() {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url || "/", "http://localhost").pathname.replace(/\/+$/, "");
        const sendJson = (status, payload) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(payload));
        };

        if (pathname === "/api/variant-metadata" && req.method === "GET") {
          try {
            sendJson(200, readMetadata());
          } catch (err) {
            sendJson(500, { error: "Could not read variant_metadata.json: " + err.message });
          }
          return;
        }

        if (pathname === "/api/variant-metadata" && req.method === "PUT") {
          let body = "";
          req.on("data", chunk => { body += chunk.toString(); });
          req.on("end", () => {
            try {
              const metadata = JSON.parse(body);
              if (!metadata || typeof metadata !== "object" || Array.isArray(metadata) ||
                  !Array.isArray(metadata.variants)) {
                sendJson(400, { error: 'Metadata must be a JSON object containing a "variants" array.' });
                return;
              }
              writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + "\n", "utf8");
              sendJson(200, { message: "variant_metadata.json saved. Reload the wiki to apply it." });
            } catch (err) {
              sendJson(400, { error: "Could not save metadata: " + err.message });
            }
          });
          return;
        }

        if (req.url === "/api/add-variant" && req.method === "POST") {
          let body = "";
          req.on("data", chunk => { body += chunk.toString(); });
          req.on("end", () => {
            try {
              const data = JSON.parse(body);
              const metadata = readMetadata();

              if (metadata.variants.some(v => v.id === data.id)) {
                res.statusCode = 400;
                res.end("Variant ID already exists");
                return;
              }

              metadata.variants.push({
                id: data.id,
                name: data.name,
                rules: { "9x9": data.rule },
                status: data.status,
                scratchGeneratable: false,
                inputType: {
                  categories: [data.inputType],
                  instructions: []
                },
                tags: data.tags
              });

              writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Variant added successfully!" }));
            } catch (err) {
              res.statusCode = 500;
              res.end("Error adding variant");
            }
          });
          return;
        }

        if (req.url === "/api/save-example" && req.method === "POST") {
          let body = "";
          req.on("data", chunk => { body += chunk.toString(); });
          req.on("end", () => {
            try {
              const data = JSON.parse(body);
              const { variantId, problemDataUrl, solutionDataUrl, link } = data;

              const imagesDir = resolve(process.cwd(), "docs/images/examples");
              mkdirSync(imagesDir, { recursive: true });

              const problemImageName = `${variantId.replace(/[^a-z0-9]/g, "")}_problem.png`;
              const solutionImageName = `${variantId.replace(/[^a-z0-9]/g, "")}_solution.png`;

              const problemBase64Data = problemDataUrl.replace(/^data:image\/png;base64,/, "");
              const solutionBase64Data = solutionDataUrl.replace(/^data:image\/png;base64,/, "");

              writeFileSync(resolve(imagesDir, problemImageName), problemBase64Data, 'base64');
              writeFileSync(resolve(imagesDir, solutionImageName), solutionBase64Data, 'base64');

              const metadata = readMetadata();
              let updated = false;

              for (const variant of metadata.variants) {
                if (variant.id === variantId) {
                  variant.example = {
                    problemImage: `images/examples/${problemImageName}`,
                    solutionImage: `images/examples/${solutionImageName}`,
                    link: link
                  };
                  updated = true;
                  break;
                }
              }

              if (updated) {
                writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ message: "Example saved successfully!" }));
              } else {
                res.statusCode = 404;
                res.end("Variant not found in metadata");
              }
            } catch (err) {
              res.statusCode = 500;
              res.end("Error saving example: " + err.message);
            }
          });
          return;
        }
        next();
      });
    }
  };
}

function variantDetailPages() {
  const metadata = readMetadata();
  const ids = Array.from(new Set(metadata.variants
    .filter((variant) => variant.status !== "hidden")
    .map((variant) => variant.id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase())
    .filter(Boolean)));
  return {
    name: "variant-detail-pages",
    writeBundle(options) {
      const outputDirectory = options.dir || resolve(process.cwd(), "dist");
      const template = readFileSync(resolve(outputDirectory, "list.html"), "utf8");
      const pageDirectory = resolve(outputDirectory, "list");
      mkdirSync(pageDirectory, { recursive: true });
      ids.forEach((id) => {
        const source = template
          .replace("<head>", "<head><base href=\"../../\">")
          .replace('data-catalog-page="variants"', `data-catalog-page="detail" data-variant-id="${id}"`);
        const idDirectory = resolve(pageDirectory, id);
        mkdirSync(idDirectory, { recursive: true });
        writeFileSync(resolve(idDirectory, "index.html"), source, "utf8");
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
