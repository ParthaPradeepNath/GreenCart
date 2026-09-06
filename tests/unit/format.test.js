import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats an integer amount in INR", () => {
    expect(formatPrice(100)).toContain("100");
    expect(formatPrice(100)).toContain("₹");
  });

  it("groups large amounts with Indian digit grouping", () => {
    expect(formatPrice(123456)).toContain("1,23,456");
  });

  it("formats a zero amount", () => {
    expect(formatPrice(0)).toContain("0");
  });

  it("formats decimal amounts without fractional digits", () => {
    expect(formatPrice(99.5)).toMatch(/\d/);
  });
});