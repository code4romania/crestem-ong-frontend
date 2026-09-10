// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { runScripts } from "./inject";

/**
 * Injected code runs in the document's own realm, which does not share
 * `globalThis` with this module — so the probe is DOM state, which both sides
 * genuinely share. `mark('x')` appends to `data-probe` on <body>.
 */
const MARK = "window.__chbMark = function (name) { document.body.dataset.probe = (document.body.dataset.probe || '') + name + ','; };";

function marks(): string {
  return document.body.dataset.probe ?? "";
}

function host(): HTMLElement {
  const element = document.createElement("div");
  document.body.append(element);
  return element;
}

beforeEach(() => {
  document.body.innerHTML = "";
  document.body.removeAttribute("data-probe");
});

describe("runScripts", () => {
  it("executes inline code", () => {
    const cleanup = runScripts(host(), [
      { cod: `${MARK} window.__chbMark('rulat');` },
    ]);

    expect(marks()).toBe("rulat,");
    cleanup();
  });

  /**
   * Pasted page code hangs its setup on `DOMContentLoaded`, which has long
   * since fired by the time a block mounts. Without the shim the handler would
   * never run and the section would render inert.
   */
  it("runs a DOMContentLoaded handler the pasted code registers", () => {
    const cleanup = runScripts(host(), [
      {
        cod: `${MARK} document.addEventListener('DOMContentLoaded', function () { window.__chbMark('gata'); });`,
      },
    ]);

    expect(marks()).toBe("gata,");
    cleanup();
  });

  it("removes listeners the pasted code added when cleaned up", () => {
    const cleanup = runScripts(host(), [
      {
        cod: `${MARK} document.addEventListener('click', function () { window.__chbMark('clic'); });`,
      },
    ]);

    document.dispatchEvent(new Event("click"));
    expect(marks()).toBe("clic,");

    cleanup();
    document.dispatchEvent(new Event("click"));
    expect(marks()).toBe("clic,");
  });
});

describe("runScripts, external scripts", () => {
  it("appends an external script with its src, ordered", () => {
    const element = host();

    const cleanup = runScripts(element, [{ src: "https://cdn.example/a.js" }]);

    const script = element.querySelector("script");
    expect(script?.getAttribute("src")).toBe("https://cdn.example/a.js");
    expect(script?.async).toBe(false);
    cleanup();
  });

  it("removes its script elements when cleaned up", () => {
    const element = host();
    const cleanup = runScripts(element, [
      { src: "https://cdn.example/a.js" },
      { cod: "void 0;" },
    ]);
    expect(element.querySelectorAll("script")).toHaveLength(2);

    cleanup();

    expect(element.querySelectorAll("script")).toHaveLength(0);
  });

  it("runs scripts in the order given", () => {
    const cleanup = runScripts(host(), [
      { cod: `${MARK} window.__chbMark('unu');` },
      { cod: "window.__chbMark('doi');" },
    ]);

    expect(marks()).toBe("unu,doi,");
    cleanup();
  });
});

describe("runScripts, listeners belonging to other code", () => {
  /**
   * The patch is global while the block is mounted, so it must be able to tell
   * the pasted code's registrations from everyone else's. Removing a listener
   * the app or a library installed would break the page around the block.
   */
  it("leaves a listener registered outside the pasted scripts alone", () => {
    const cleanup = runScripts(host(), [{ cod: MARK }]);
    const outsider = () =>
      (document.body.dataset.probe =
        (document.body.dataset.probe ?? "") + "extern,");
    document.addEventListener("click", outsider);

    cleanup();
    document.dispatchEvent(new Event("click"));

    expect(marks()).toBe("extern,");
    document.removeEventListener("click", outsider);
  });
});
