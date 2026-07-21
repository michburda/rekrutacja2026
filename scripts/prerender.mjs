import { readFile, writeFile } from "node:fs/promises";

const templatePath = new URL("../dist/index.html", import.meta.url);
const serverEntry = await import("../dist-ssr/entry-server.js");
const appHtml = await serverEntry.render();
const template = await readFile(templatePath, "utf8");

if (!template.includes('<div id="app"></div>')) {
  throw new Error("Nie znaleziono kontenera aplikacji do prerenderowania.");
}

await writeFile(
  templatePath,
  template.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`),
  "utf8",
);
