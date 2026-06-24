import { describe, it, expect } from "vitest";
import { cloneArrayBuffer } from "@/lib/documents/ocr-client";

describe("cloneArrayBuffer", () => {
  it("copies buffer so original can be detached independently", () => {
    const original = new Uint8Array([1, 2, 3, 4]).buffer;
    const copy = cloneArrayBuffer(original);

    expect(copy.byteLength).toBe(original.byteLength);
    expect(new Uint8Array(copy)).toEqual(new Uint8Array(original));

    // Simule le détachement PDF.js sur la copie uniquement
    const view = new Uint8Array(copy);
    view.set([9, 9, 9, 9]);
    expect(new Uint8Array(original)).toEqual(new Uint8Array([1, 2, 3, 4]));
  });
});
