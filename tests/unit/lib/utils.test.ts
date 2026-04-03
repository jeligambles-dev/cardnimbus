import { describe, it, expect } from "vitest";
import { formatCurrency, slugify, generateOrderNumber, clamp } from "@/lib/utils";

describe("utils", () => {
  describe("formatCurrency", () => {
    it("formats USD amounts", () => {
      expect(formatCurrency(19.99)).toBe("$19.99");
      expect(formatCurrency(0)).toBe("$0.00");
      expect(formatCurrency(1234.5)).toBe("$1,234.50");
    });
  });

  describe("slugify", () => {
    it("creates URL-safe slugs", () => {
      expect(slugify("Charizard VMAX - Shining Fates")).toBe("charizard-vmax-shining-fates");
      expect(slugify("Pokémon Base Set")).toBe("pokemon-base-set");
      expect(slugify("  Extra   Spaces  ")).toBe("extra-spaces");
    });
  });

  describe("generateOrderNumber", () => {
    it("generates order numbers with CN prefix", () => {
      const num = generateOrderNumber();
      expect(num).toMatch(/^CN-\d{8}-[A-Z0-9]{4}$/);
    });
  });

  describe("clamp", () => {
    it("clamps values to range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});
