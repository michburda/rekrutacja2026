import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Vue application and deployable Worker", async () => {
  const [html, appSource, worker] = await Promise.all([
    readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/App.vue", import.meta.url), "utf8"),
    import(new URL(`../dist/server/index.js?test=${Date.now()}`, import.meta.url)),
  ]);

  assert.match(html, /<title>GiardDesign — nowoczesne ogrody<\/title>/);
  assert.match(appSource, /Nowoczesna aranżacja/);
  assert.match(appSource, /v-for="\(service, index\) in services"/);
  assert.match(appSource, /adRespect\.pl/);
  assert.equal(typeof worker.default.fetch, "function");
});
