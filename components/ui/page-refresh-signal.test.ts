import { describe, expect, it, vi } from "vitest";
import { emitPageRefresh, onPageRefresh } from "./page-refresh-signal";

describe("page refresh signal", () => {
  it("calls every subscriber when a refresh is emitted", () => {
    const first = vi.fn();
    const second = vi.fn();
    const stopFirst = onPageRefresh(first);
    const stopSecond = onPageRefresh(second);

    emitPageRefresh();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    stopFirst();
    stopSecond();
  });

  it("stops calling a subscriber once it unsubscribes", () => {
    const listener = vi.fn();
    const stop = onPageRefresh(listener);

    emitPageRefresh();
    stop();
    emitPageRefresh();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("emits without subscribers", () => {
    expect(() => emitPageRefresh()).not.toThrow();
  });
});
