import { describe, it, expect } from "vitest";
import { slugify } from "../lib/slug";

describe("slugify", () => {
  it("strips Vietnamese diacritics", () => {
    expect(slugify("Bức tranh kinh tế Việt Nam 2026")).toBe("buc-tranh-kinh-te-viet-nam-2026");
  });

  it("collapses punctuation and whitespace into single hyphens", () => {
    expect(slugify("  AME:  Marketing & Branding!  ")).toBe("ame-marketing-branding");
  });

  it("truncates long titles on a word boundary", () => {
    const slug = slugify(
      "Người tiêu dùng Việt Nam trong nền kinh tế số: Hành trình mua hàng đã thay đổi ra sao?",
    );
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug).toBe("nguoi-tieu-dung-viet-nam-trong-nen-kinh-te-so-hanh-trinh-mua-hang-da-thay-doi-ra");
  });

  it("never ends mid-word", () => {
    // The old hard `slice(0, 80)` produced "<76 a's>-bcd" here.
    expect(slugify(`${"a".repeat(76)} bcdefgh`)).toBe("a".repeat(76));
  });

  it("keeps a word that ends exactly on the limit", () => {
    const slug = slugify(`${"a".repeat(76)} bcd efgh`);
    expect(slug).toBe(`${"a".repeat(76)}-bcd`);
  });

  it("hard-cuts a single word longer than the limit", () => {
    expect(slugify("z".repeat(120))).toBe("z".repeat(80));
  });
});
