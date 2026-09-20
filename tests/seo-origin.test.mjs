import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const utils = readFileSync(new URL("../src/lib/utils.ts", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
const CANONICAL = "https://www.jisbeautyfashion.com";

function moduleFor(siteUrl) {
  const js = ts.transpileModule(utils, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(js, {
    module: mod,
    exports: mod.exports,
    require: (name) => { throw new Error(`Unexpected module ${name}`); },
    process: { env: { NEXT_PUBLIC_SITE_URL: siteUrl } },
    URL,
    Intl,
    Date,
  }, { timeout: 2000 });
  return mod.exports;
}

test("the mistakenly configured Vercel git-main alias never becomes the canonical store URL", () => {
  const { publicSiteOrigin, absoluteUrl } = moduleFor("https://jis-beauty-fashion-git-main-alliibrahim3-1786s-projects.vercel.app");
  assert.equal(publicSiteOrigin(), CANONICAL);
  assert.equal(absoluteUrl("/product/genies-collection-parfums"), `${CANONICAL}/product/genies-collection-parfums`);
});

test("a valid custom domain can still override the default site origin", () => {
  const { publicSiteOrigin, absoluteUrl } = moduleFor("https://shop.example.com/");
  assert.equal(publicSiteOrigin(), "https://shop.example.com");
  assert.equal(absoluteUrl("faq"), "https://shop.example.com/faq");
});

test("missing, insecure or invalid site URL safely falls back to the official JIS domain", () => {
  for (const candidate of [undefined, "not-a-url", "http://random.example.com"]) {
    const { publicSiteOrigin } = moduleFor(candidate);
    assert.equal(publicSiteOrigin(), CANONICAL);
  }
});

test("metadata and sitemap use the same normalized origin as product/WhatsApp links", () => {
  assert.match(layout, /metadataBase: new URL\(publicSiteOrigin\(\)\)/);
  assert.match(sitemap, /url: absoluteUrl\(path\)/);
  assert.match(sitemap, /url: absoluteUrl\(`\/product\/\$\{p\.slug\}`\)/);
});
