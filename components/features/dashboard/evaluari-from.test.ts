import { describe, expect, it } from "vitest";
import { evaluariFromParam, evaluariFromTab, withEvaluariFrom } from "./evaluari-from";

describe("withEvaluariFrom", () => {
  it("carries the list URL, filters included, as one encoded param", () => {
    expect(
      withEvaluariFrom("/dashboard/organizatii/o1/evaluari/r1", "/dashboard/evaluari?tab=organizatii&page=2"),
    ).toBe("/dashboard/organizatii/o1/evaluari/r1?from=%2Fdashboard%2Fevaluari%3Ftab%3Dorganizatii%26page%3D2");
  });
});

describe("evaluariFromParam", () => {
  it("accepts the list with or without a query", () => {
    expect(evaluariFromParam("/dashboard/evaluari")).toBe("/dashboard/evaluari");
    expect(evaluariFromParam("/dashboard/evaluari?tab=utilizatori")).toBe(
      "/dashboard/evaluari?tab=utilizatori",
    );
  });

  it("rejects anything that is not the list", () => {
    expect(evaluariFromParam(undefined)).toBeNull();
    expect(evaluariFromParam(["/dashboard/evaluari"])).toBeNull();
    expect(evaluariFromParam("https://evil.example/dashboard/evaluari")).toBeNull();
    expect(evaluariFromParam("//evil.example")).toBeNull();
    expect(evaluariFromParam("/dashboard/evaluari-evil")).toBeNull();
    expect(evaluariFromParam("/dashboard/evaluari/overview")).toBeNull();
    expect(evaluariFromParam("/dashboard/organizatii")).toBeNull();
  });
});

describe("evaluariFromTab", () => {
  it("reads the tab, defaulting to the users tab like the list does", () => {
    expect(evaluariFromTab("/dashboard/evaluari?tab=organizatii")).toBe("organizatii");
    expect(evaluariFromTab("/dashboard/evaluari")).toBe("utilizatori");
  });
});
