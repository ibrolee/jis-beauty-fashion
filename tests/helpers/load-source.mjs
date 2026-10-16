import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

// Run the real TS/TSX components in Node; replace only external boundaries.
export function loadSource(path, overrides = {}) {
  const cache = new Map();
  function load(filename) {
    const resolved = [filename, `${filename}.ts`, `${filename}.tsx`, `${filename}/index.ts`, `${filename}/index.tsx`].find((path) => existsSync(path) && statSync(path).isFile());
    if (!resolved) throw new Error(`Cannot resolve ${filename}`);
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const loadedModule = { exports: {} };
    cache.set(resolved, loadedModule);
    const compiled = ts.transpileModule(readFileSync(resolved, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const nativeRequire = createRequire(resolved);
    function requireSource(request) {
      if (Object.hasOwn(overrides, request)) return overrides[request];
      if (request.startsWith("@/")) return load(resolve(projectRoot, "src", request.slice(2)));
      if (request.startsWith(".")) return load(resolve(dirname(resolved), request));
      return nativeRequire(request);
    }
    const execute = vm.runInThisContext(`(function(module,exports,require){${compiled}\n})`, { filename: resolved });
    execute(loadedModule, loadedModule.exports, requireSource);
    return loadedModule.exports;
  }
  return load(resolve(projectRoot, path));
}
