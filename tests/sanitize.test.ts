import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../lib/sanitize";

describe("sanitizeHtml", () => {
  it("keeps rich-text markup authored in the admin editor", () => {
    const html =
      '<h2 id="intro" class="lead">Title</h2><p>Body <strong>bold</strong></p><ul><li>one</li></ul>' +
      '<a href="https://amenetwork.vn" target="_blank" rel="noopener">link</a>' +
      '<img src="https://cdn.example.com/a.webp" alt="a" width="800" />';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("removes script tags and their body", () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe("<p>ok</p>");
  });

  it("removes inline event handlers", () => {
    expect(sanitizeHtml('<p onclick="steal()">ok</p>')).toBe("<p>ok</p>");
  });

  it("removes javascript: urls", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe("<a href>x</a>");
  });

  it("returns an empty string for missing content", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });
});
