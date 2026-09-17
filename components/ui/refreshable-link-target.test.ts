import { describe, expect, it } from "vitest";
import { samePageAction } from "./refreshable-link-target";

describe("samePageAction", () => {
  it("navigates when the target is a different page", () => {
    expect(samePageAction("/biblioteca", "/despre-noi", "")).toBe("navigate");
  });

  it("refreshes when the target is exactly the current URL", () => {
    expect(samePageAction("/biblioteca", "/biblioteca", "")).toBe("refresh");
  });

  it("ignores a trailing slash when comparing paths", () => {
    expect(samePageAction("/biblioteca/", "/biblioteca", "")).toBe("refresh");
    expect(samePageAction("/", "/", "")).toBe("refresh");
  });

  it("resets the URL when the current page carries query params the link does not", () => {
    expect(samePageAction("/biblioteca", "/biblioteca", "?categorie=finantare&page=3")).toBe(
      "reset-and-refresh",
    );
  });

  it("refreshes when the link's own query matches the current one", () => {
    expect(samePageAction("/biblioteca?tab=noi", "/biblioteca", "?tab=noi")).toBe("refresh");
  });

  it("resets when the link carries a query the current page does not have", () => {
    expect(samePageAction("/biblioteca?tab=noi", "/biblioteca", "")).toBe("reset-and-refresh");
  });

  it("drops a hash before comparing paths", () => {
    expect(samePageAction("/biblioteca#sus", "/biblioteca", "")).toBe("refresh");
  });

  it("navigates for absolute and non-page addresses", () => {
    expect(samePageAction("https://exemplu.ro/biblioteca", "/biblioteca", "")).toBe("navigate");
    expect(samePageAction("mailto:contact@exemplu.ro", "/biblioteca", "")).toBe("navigate");
    expect(samePageAction("#sectiune", "/biblioteca", "")).toBe("navigate");
  });
});
