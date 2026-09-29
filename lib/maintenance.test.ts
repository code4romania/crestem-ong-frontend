import { describe, expect, it } from "vitest";
import { MAINTENANCE_PATH, maintenanceAction } from "./maintenance";

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
