import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Supabase clients", () => {
  it("server client exports createClient", async () => {
    const mod = await import("../lib/supabase/server");
    expect(mod.createClient).toBeDefined();
    expect(typeof mod.createClient).toBe("function");
  });

  it("browser client exports createClient", async () => {
    const mod = await import("../lib/supabase/client");
    expect(mod.createClient).toBeDefined();
    expect(typeof mod.createClient).toBe("function");
  });

  it("admin client exports createAdminClient", async () => {
    const mod = await import("../lib/supabase/admin");
    expect(mod.createAdminClient).toBeDefined();
    expect(typeof mod.createAdminClient).toBe("function");
  });
});

describe("Auth helpers", () => {
  it("exports getCurrentUser, getUserRole, requireAdmin", async () => {
    const mod = await import("../lib/auth");
    expect(mod.getCurrentUser).toBeDefined();
    expect(mod.getUserRole).toBeDefined();
    expect(mod.requireAdmin).toBeDefined();
  });
});

describe("Database types", () => {
  it("exports Database type with expected tables", async () => {
    const typesPath = path.resolve(__dirname, "../lib/supabase/types.ts");
    const content = fs.readFileSync(typesPath, "utf-8");
    expect(content).toContain("contact_submissions");
    expect(content).toContain("posts");
    expect(content).toContain("user_roles");
    expect(content).toContain("app_role");
  });
});

describe("Proxy", () => {
  // This Next version renamed middleware.ts to proxy.ts.
  it("combines i18n + auth in proxy.ts", async () => {
    const proxyPath = path.resolve(__dirname, "../proxy.ts");
    const content = fs.readFileSync(proxyPath, "utf-8");
    expect(content).toContain("next-intl/middleware");
    expect(content).toContain("@supabase/ssr");
    expect(content).toContain("/admin");
    expect(content).toContain("getUser");
  });
});
