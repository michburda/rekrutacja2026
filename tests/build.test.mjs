import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds an optimized static Vue application", async () => {
  const [html, appSource, robots, sitemap] = await Promise.all([
    readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/App.vue", import.meta.url), "utf8"),
    readFile(new URL("../dist/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8"),
  ]);

  assert.match(html, /<title>GiardDesign — nowoczesne ogrody<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.michalburda\.pl\/"/);
  assert.doesNotMatch(html, /rel="stylesheet"/);
  assert.match(appSource, /Nowoczesna aranżacja/);
  assert.match(appSource, /v-for="\(service, index\) in services"/);
  assert.match(appSource, /adRespect\.pl/);
  assert.match(robots, /https:\/\/www\.michalburda\.pl\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.michalburda\.pl\/<\/loc>/);
});
