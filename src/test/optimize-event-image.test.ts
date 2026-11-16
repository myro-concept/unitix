import { afterEach, describe, expect, it, vi } from "vitest";
import { getResizedImageDimensions, optimizeEventImage } from "@/lib/optimize-event-image";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

describe("optimizeEventImage", () => {
  it("falls back to the source image format when WebP encoding is unavailable", async () => {
    const image = { width: 1200, height: 800, close: vi.fn() };
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(image));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback, type) => {
      callback(new Blob(["image"], { type: type === "image/webp" ? "image/png" : type }));
    });

    const optimizedFile = await optimizeEventImage(new File(["image"], "poster.jpg", { type: "image/jpeg" }));

    expect(optimizedFile.name).toBe("poster.jpg");
    expect(optimizedFile.type).toBe("image/jpeg");
    expect(image.close).toHaveBeenCalled();
  });

  it("keeps WebP output when the browser supports it", async () => {
    const image = { width: 1200, height: 800, close: vi.fn() };
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(image));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback, type) => {
      callback(new Blob(["image"], { type }));
    });

    const optimizedFile = await optimizeEventImage(new File(["image"], "poster.png", { type: "image/png" }));

    expect(optimizedFile.name).toBe("poster.webp");
    expect(optimizedFile.type).toBe("image/webp");
  });
});
