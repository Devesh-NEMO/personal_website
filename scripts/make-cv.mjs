#!/usr/bin/env node
/**
 * Build public/cv.pdf from scripts/cv.html.
 *
 * The CV is a hand-written print stylesheet rather than a PDF library: the
 * layout is one A4 page of text, and a headless Chromium prints it with the
 * same CSS the file uses, so what you see in a browser is what ships.
 *
 * Edit the copy in scripts/cv.html, then run `npm run cv`.
 */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "scripts/cv.html");
const output = resolve(root, "public/cv.pdf");

/** Chromium builds that can print to PDF, in the order we prefer them. */
const browsers = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const browser = browsers.find((path) => existsSync(path));

if (!browser) {
  console.error(
    "No Chromium-based browser found. Set CHROME_PATH to a Chrome, Brave,\n" +
      "Chromium or Edge binary and run `npm run cv` again.",
  );
  process.exit(1);
}

if (!existsSync(source)) {
  console.error(`Missing ${source}`);
  process.exit(1);
}

try {
  await run(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    `--print-to-pdf=${output}`,
    pathToFileURL(source).href,
  ]);
} catch (error) {
  console.error(error.stderr || error.message);
  process.exit(1);
}

console.log(`Wrote ${output}`);
