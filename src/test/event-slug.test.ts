import { describe, expect, it } from "vitest";
import { generateEventSlug } from "@/lib/event-slug";

describe("generateEventSlug", () => {
  it("creates a URL-friendly slug from the event name", () => {
    expect(generateEventSlug("Flytime Fest 2026")).toBe("flytime-fest-2026");
  });

  it("uses a fallback when the name contains no URL-friendly characters", () => {
    expect(generateEventSlug("!!!")).toBe("event");
  });
});
