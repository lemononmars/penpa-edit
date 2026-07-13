import { cpSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const docsDir = join(root, "docs");
const distDir = join(root, "dist");

const directories = ["css", "fonts", "js", "penpa", "variants"];
const files = ["csp.html", "favicon.svg", "identity.js", "points.md"];

mkdirSync(distDir, { recursive: true });

for (const directory of directories) {
  const target = join(distDir, directory);
  rmSync(target, { force: true, recursive: true });
  cpSync(join(docsDir, directory), target, { recursive: true });
}

for (const file of files) {
  copyFileSync(join(docsDir, file), join(distDir, file));
}
