// Opens every lesson (and the dashboard) in headless Chromium at each viewport width and fails
// if the page scrolls sideways, naming the elements that stick out past the right edge.
// Content inside a scrolling or clipping box (overflow-x: auto/hidden, e.g. a wide table in
// its own scroller) is fine; only the page itself must not overflow.
//
//   node scripts/check-overflow.mjs --base http://localhost:5802/academy/ [--widths 390,1300] [--only id1,id2] [--pages 4]
//
// --base is any running copy of the app: a served build (scripts/serve.mjs, as
// ../scripts/verify.sh does) or the Vite dev server (http://localhost:5173/). Only each lesson's initial state is checked, not every state its
// widget can be clicked into. Playwright is found via NODE_PATH (see playwright.mjs).
import { arg, loadPlaywright } from "./playwright.mjs";

const base = arg("base", "http://localhost:5173/").replace(/\/?$/, "/");
const widths = arg("widths", "390,1300").split(",").map(Number);
const only = arg("only", "").split(",").filter(Boolean);
const pageCount = Number(arg("pages", "4"));

const navPath = "content/lessons.json";
const nav = await fetch(new URL(navPath, base)).then((r) => {
  if (!r.ok) throw new Error(`GET ${navPath}: ${r.status}`);
  return r.json();
});
const items = nav.filter((n) => only.length === 0 || only.includes(n.id));
const unknown = only.filter((id) => !nav.some((n) => n.id === id));
if (unknown.length) throw new Error(`Unknown lesson id(s): ${unknown.join(", ")}`);
console.log(`${items.length} lessons x ${widths.join("px, ")}px`);

// Runs in the page: how far the document scrolls sideways, plus the outermost elements in
// the main column that end past the viewport without a clipping/scrolling ancestor.
function measure() {
  const vw = document.documentElement.clientWidth;
  const main = document.querySelector(".main-content") ?? document.body;
  const offenders = [];
  for (const el of main.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.right <= vw + 1) continue;
    let clipped = false;
    for (let a = el.parentElement; a && a !== main.parentElement; a = a.parentElement) {
      if (getComputedStyle(a).overflowX !== "visible") {
        clipped = true;
        break;
      }
    }
    if (!clipped && !offenders.some((o) => o.contains(el))) offenders.push(el);
  }
  const describe = (el) =>
    `<${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? ` class="${el.className}"` : ""}> ` +
    `right edge ${Math.round(el.getBoundingClientRect().right)}px`;
  return {
    overflow: document.documentElement.scrollWidth - vw,
    offenders: offenders.slice(0, 3).map(describe),
  };
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const failures = [];
let checked = 0;

for (const width of widths) {
  const queue = [{ id: null, title: null }, ...items];
  const worker = async () => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(base);
    await page.waitForSelector(".main-content");
    for (let item = queue.shift(); item; item = queue.shift()) {
      const name = item.id ?? "(dashboard)";
      try {
        if (item.id) {
          await page.evaluate((id) => window.dispatchEvent(new CustomEvent("academy:open-lesson", { detail: id })), item.id);
          await page.waitForFunction(
            (title) => [...document.querySelectorAll(".main-content h1")].some((h) => h.textContent === title),
            item.title,
            { timeout: 15000 },
          );
        }
        await page.waitForTimeout(300); // let widgets lay out (fonts, measured canvases)
        const { overflow, offenders } = await page.evaluate(measure);
        checked++;
        if (overflow > 1 || offenders.length) {
          failures.push(`${width}px ${name}: page scrolls ${overflow}px sideways${offenders.length ? `; ${offenders.join(", ")}` : ""}`);
          process.stdout.write("x");
        } else process.stdout.write(".");
      } catch (err) {
        failures.push(`${width}px ${name}: ${err.message.split("\n")[0]}`);
        process.stdout.write("E");
      }
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: pageCount }, worker));
  console.log(` ${width}px done`);
}
await browser.close();

console.log(`${checked} page views checked`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("No horizontal overflow.");
