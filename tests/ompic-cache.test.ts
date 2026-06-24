import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import {
  clearOmpicCache,
  getCachedOmpicFetch,
  ompicCacheKey,
  setCachedOmpicFetch,
  waitForOmpicRateLimit,
} from "@/lib/surveillance/ompic-cache";

describe("ompic-cache", () => {
  beforeEach(() => {
    clearOmpicCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null on cache miss", () => {
    expect(getCachedOmpicFetch("/path", "q=foo")).toBeNull();
  });

  it("stores and retrieves successful responses", () => {
    const result = { ok: true as const, html: "<html/>", url: "http://x" };
    setCachedOmpicFetch("/path", "q=foo", result);
    expect(getCachedOmpicFetch("/path", "q=foo")).toEqual(result);
  });

  it("expires entries after TTL", () => {
    const result = { ok: true as const, html: "<html/>", url: "http://x" };
    setCachedOmpicFetch("/path", "q=foo", result);
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    expect(getCachedOmpicFetch("/path", "q=foo")).toBeNull();
  });

  it("uses shorter TTL for errors", () => {
    const result = { ok: false as const, error: "timeout", tried: [] };
    setCachedOmpicFetch("/path", "q=foo", result);
    vi.advanceTimersByTime(61_000);
    expect(getCachedOmpicFetch("/path", "q=foo")).toBeNull();
  });

  it("builds distinct keys for different bodies", () => {
    expect(ompicCacheKey("/a", "x=1")).not.toBe(ompicCacheKey("/a", "x=2"));
  });

  it("serializes rate limit waits", async () => {
    const p1 = waitForOmpicRateLimit();
    await vi.runAllTimersAsync();
    await p1;

    const p2 = waitForOmpicRateLimit();
    vi.advanceTimersByTime(1999);
    let done = false;
    void p2.then(() => {
      done = true;
    });
    await Promise.resolve();
    expect(done).toBe(false);

    vi.advanceTimersByTime(2);
    await vi.runAllTimersAsync();
    await p2;
    expect(done).toBe(true);
  });
});
