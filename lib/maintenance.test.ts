import { describe, expect, it } from "vitest";
import {
  MAINTENANCE_PATH,
  bypassTokenMatches,
  isMaintenanceMode,
  maintenanceAction,
} from "./maintenance";

describe("isMaintenanceMode", () => {
  it("is on only for ACTIVE", () => {
    expect(isMaintenanceMode("ACTIVE")).toBe(true);
  });

  it("is off for OFFLINE, a missing value, or anything unexpected", () => {
    expect(isMaintenanceMode("OFFLINE")).toBe(false);
    expect(isMaintenanceMode(undefined)).toBe(false);
    expect(isMaintenanceMode("true")).toBe(false);
    expect(isMaintenanceMode("active")).toBe(false);
  });
});

describe("maintenanceAction", () => {
  describe("when maintenance is on", () => {
    it("redirects pages to the maintenance page", () => {
      expect(maintenanceAction("/", true)).toEqual({ type: "redirect", to: MAINTENANCE_PATH });
      expect(maintenanceAction("/dashboard/profil", true)).toEqual({
        type: "redirect",
        to: MAINTENANCE_PATH,
      });
      expect(maintenanceAction("/o-pagina/din-cms", true)).toEqual({
        type: "redirect",
        to: MAINTENANCE_PATH,
      });
    });

    it("answers API calls as unavailable", () => {
      expect(maintenanceAction("/api/auth/login", true)).toEqual({ type: "unavailable" });
      expect(maintenanceAction("/api", true)).toEqual({ type: "unavailable" });
    });

    it("lets the maintenance page itself through", () => {
      expect(maintenanceAction(MAINTENANCE_PATH, true)).toEqual({ type: "pass" });
    });

    it("does not treat look-alike paths as the API", () => {
      expect(maintenanceAction("/apicultura", true)).toEqual({
        type: "redirect",
        to: MAINTENANCE_PATH,
      });
    });
  });

  describe("when maintenance is off", () => {
    it("sends the maintenance page home", () => {
      expect(maintenanceAction(MAINTENANCE_PATH, false)).toEqual({ type: "redirect", to: "/" });
    });

    it("lets everything else through", () => {
      expect(maintenanceAction("/", false)).toEqual({ type: "pass" });
      expect(maintenanceAction("/api/auth/login", false)).toEqual({ type: "pass" });
    });
  });
});

describe("bypassTokenMatches", () => {
  it("accepts the configured token", () => {
    expect(bypassTokenMatches("s3cr3t-lung", "s3cr3t-lung")).toBe(true);
  });

  it("rejects a wrong or missing candidate", () => {
    expect(bypassTokenMatches("s3cr3t-lunG", "s3cr3t-lung")).toBe(false);
    expect(bypassTokenMatches("s3cr3t", "s3cr3t-lung")).toBe(false);
    expect(bypassTokenMatches(undefined, "s3cr3t-lung")).toBe(false);
    expect(bypassTokenMatches("", "s3cr3t-lung")).toBe(false);
  });

  it("rejects everything while no token is configured", () => {
    expect(bypassTokenMatches("", "")).toBe(false);
    expect(bypassTokenMatches("", undefined)).toBe(false);
    expect(bypassTokenMatches("anything", undefined)).toBe(false);
  });
});

describe("maintenanceAction with a bypass", () => {
  it("grants the bypass when a valid token is presented", () => {
    expect(maintenanceAction("/", true, "requested")).toEqual({ type: "grant-bypass" });
    expect(maintenanceAction("/dashboard/profil", true, "requested")).toEqual({
      type: "grant-bypass",
    });
  });

  it("lets a bypassed visitor reach pages, the API and the maintenance page", () => {
    expect(maintenanceAction("/", true, "granted")).toEqual({ type: "pass" });
    expect(maintenanceAction("/api/auth/login", true, "granted")).toEqual({ type: "pass" });
    expect(maintenanceAction(MAINTENANCE_PATH, true, "granted")).toEqual({ type: "pass" });
  });

  it("ignores the bypass while maintenance is off", () => {
    expect(maintenanceAction("/", false, "requested")).toEqual({ type: "pass" });
    expect(maintenanceAction(MAINTENANCE_PATH, false, "granted")).toEqual({
      type: "redirect",
      to: "/",
    });
  });
});
