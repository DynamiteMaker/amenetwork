import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Project scaffold", () => {
  it("has message files for all locales", () => {
    const messagesDir = path.resolve(__dirname, "../messages");
    const locales = ["en", "vi", "ja", "zh"];

    for (const locale of locales) {
      const filePath = path.join(messagesDir, `${locale}.json`);
      expect(fs.existsSync(filePath), `Missing ${locale}.json`).toBe(true);
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content.seo?.siteName).toBe("AME Marketing");
      expect(content.home?.h1a).toBeDefined();
    }
  });

  it("has next-intl routing config", () => {
    const routingPath = path.resolve(__dirname, "../i18n/routing.ts");
    expect(fs.existsSync(routingPath)).toBe(true);
    const content = fs.readFileSync(routingPath, "utf-8");
    expect(content).toContain("locales");
    expect(content).toContain('"en"');
    expect(content).toContain('"vi"');
    expect(content).toContain('"ja"');
    expect(content).toContain('"zh"');
  });

  it("has design system CSS tokens", () => {
    const cssPath = path.resolve(__dirname, "../app/globals.css");
    const content = fs.readFileSync(cssPath, "utf-8");
    expect(content).toContain("--brand:");
    expect(content).toContain("--peach:");
    expect(content).toContain("--champagne:");
    expect(content).toContain("--lilac:");
    expect(content).toContain("--ink:");
  });
});
