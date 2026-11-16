import { describe, expect, it } from "vitest";
import { formatEditHistoryValue } from "@/lib/event-edit-history";

describe("formatEditHistoryValue", () => {
  it("summarizes gallery changes without exposing storage URLs", () => {
    expect(formatEditHistoryValue("gallery_urls", [
      "https://example.com/first.webp",
      "https://example.com/second.webp",
    ])).toBe("2 photos");
  });

  it("formats ticket changes as readable details instead of JSON", () => {
    expect(formatEditHistoryValue("ticket_type", {
      name: "VIP Gold",
      price: 50000,
      quantity: 100,
    })).toBe("VIP Gold · ₦50,000 · 100 tickets");
  });

  it("formats flyer and date values without displaying raw URLs or timestamps", () => {
    expect(formatEditHistoryValue("background_image_url", "https://example.com/flyer.webp")).toBe("Flyer present");
    expect(formatEditHistoryValue("event_date", "2026-12-25T19:30:00.000Z")).not.toContain("T19:30");
  });
});
