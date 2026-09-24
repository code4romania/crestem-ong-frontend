import { describe, expect, it } from "vitest";
import { loginPathFor, safeReturnTo } from "./return-to";

describe("safeReturnTo", () => {
  it("keeps a dashboard path, query string included", () => {
    expect(safeReturnTo("/dashboard/ong-1/evaluari/eval-1?tab=1")).toBe(
      "/dashboard/ong-1/evaluari/eval-1?tab=1",
    );
  });

  it("keeps the dashboard root", () => {
    expect(safeReturnTo("/dashboard")).toBe("/dashboard");
  });

  it("drops a missing value", () => {
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo(undefined)).toBeNull();
  });

  it("drops an absolute URL", () => {
    // Anything off-origin would turn the login form into an open redirect.
    expect(safeReturnTo("https://evil.example/dashboard")).toBeNull();
  });

  it("drops a protocol-relative path", () => {
    // `//evil.example` is off-origin too, despite the leading slash — and its
    // backslash variant is read the same way by some browsers.
    expect(safeReturnTo("//evil.example/dashboard")).toBeNull();
    expect(safeReturnTo("/\\evil.example/dashboard")).toBeNull();
  });

  it("drops a path outside the dashboard", () => {
    // The proxy only ever sets this for a protected page, and keeping the
    // allowed set that narrow also rules out `/autentificare` pointing at
    // itself, which would loop.
    expect(safeReturnTo("/autentificare")).toBeNull();
    expect(safeReturnTo("/biblioteca")).toBeNull();
  });

  it("keeps the admin-transfer invitation page with its token (US-3 step 2)", () => {
    expect(safeReturnTo("/transfer-admin?token=abc_-123")).toBe("/transfer-admin?token=abc_-123");
  });

  it("drops a path that merely starts with transfer-admin", () => {
    expect(safeReturnTo("/transfer-admin-evil")).toBeNull();
  });

  it("drops a path that merely starts with the word dashboard", () => {
    expect(safeReturnTo("/dashboards-evil")).toBeNull();
  });
});

describe("loginPathFor", () => {
  it("carries the protected path the visitor was heading for", () => {
    expect(loginPathFor("/dashboard/ong-1/evaluari/eval-1")).toBe(
      "/autentificare?returnTo=%2Fdashboard%2Fong-1%2Fevaluari%2Feval-1",
    );
  });

  it("sends a visitor who came on their own to the bare login page", () => {
    // Nothing to return to — the destination then stays the role's own landing
    // page, exactly as before.
    expect(loginPathFor("/biblioteca")).toBe("/autentificare");
  });
});
