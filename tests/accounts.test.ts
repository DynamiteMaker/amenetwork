import { describe, it, expect } from "vitest";
import {
  isAccountDisabled,
  effectiveRole,
  checkAccountMutation,
} from "../lib/accounts";

describe("isAccountDisabled", () => {
  it("treats null (never banned) as active", () => {
    expect(isAccountDisabled(null)).toBe(false);
  });

  it("treats an expired ban as active again", () => {
    expect(isAccountDisabled("2000-01-01T00:00:00Z")).toBe(false);
  });

  it("treats a future ban date as disabled", () => {
    expect(isAccountDisabled("2999-01-01T00:00:00Z")).toBe(true);
  });

  it("ignores unparseable values", () => {
    expect(isAccountDisabled("not-a-date")).toBe(false);
  });
});

describe("effectiveRole", () => {
  it("folds multiple role rows to the strongest one", () => {
    expect(effectiveRole(["editor", "admin"])).toBe("admin");
    expect(effectiveRole(["editor"])).toBe("editor");
  });

  it("defaults to user when there is no role row", () => {
    expect(effectiveRole([])).toBe("user");
  });
});

describe("checkAccountMutation", () => {
  const admin = { id: "u-admin", role: "admin" as const };

  it("blocks the admin from mutating their own account", () => {
    expect(checkAccountMutation("u-admin", admin, 3)).toBe(
      "You cannot modify your own account here.",
    );
  });

  it("blocks demoting, disabling or removing the last active admin", () => {
    expect(checkAccountMutation("u-actor", admin, 0)).toBe(
      "Cannot change the last active admin. Promote another admin first.",
    );
  });

  it("allows mutating another admin while a second active admin exists", () => {
    expect(checkAccountMutation("u-actor", admin, 1)).toBeNull();
  });

  it("allows mutating non-admin accounts regardless of admin count", () => {
    expect(checkAccountMutation("u-actor", { id: "u-editor", role: "editor" }, 0)).toBeNull();
    expect(checkAccountMutation("u-actor", { id: "u-plain", role: "user" }, 0)).toBeNull();
  });
});
