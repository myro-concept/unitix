import { describe, expect, it } from "vitest";
import { getResizedImageDimensions } from "@/lib/optimize-event-image";

describe("getResizedImageDimensions", () => {
  it("resizes oversized landscape images without changing their proportions", () => {
    expect(getResizedImageDimensions(3840, 2160)).toEqual({ width: 1920, height: 1080 });
  });

  it("resizes oversized portrait images without changing their proportions", () => {
    expect(getResizedImageDimensions(1200, 2400)).toEqual({ width: 960, height: 1920 });
  });

  it("does not enlarge images that are already within the limit", () => {
    expect(getResizedImageDimensions(1200, 800)).toEqual({ width: 1200, height: 800 });
  });

  it("rejects invalid dimensions", () => {
    expect(() => getResizedImageDimensions(0, 800)).toThrow("Image dimensions are invalid.");
  });
});
