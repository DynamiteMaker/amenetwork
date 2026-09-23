import { describe, it, expect } from "vitest";
import { formatVnDateTime, isoToVnInput, vnLocalToIso } from "@/lib/vn-time";

// The schedule input must mean Vietnam time (GMT+7) on every device, so all
// expectations below are fixed UTC instants and valid in any test timezone.

describe("vnLocalToIso", () => {
  it("converts a Vietnam wall time to UTC (09:30 VN == 02:30 UTC)", () => {
    expect(vnLocalToIso("2030-06-01T09:30")).toBe("2030-06-01T02:30:00.000Z");
  });

  it("keeps seconds", () => {
    expect(vnLocalToIso("2030-01-01T00:00:30")).toBe("2029-12-31T17:00:30.000Z");
  });

  it("returns null for empty or unparseable values", () => {
    expect(vnLocalToIso("")).toBeNull();
    expect(vnLocalToIso("not-a-date")).toBeNull();
  });
});

describe("isoToVnInput", () => {
  it("renders a UTC instant as Vietnam wall time", () => {
    expect(isoToVnInput("2030-01-01T02:00:00Z")).toBe("2030-01-01T09:00");
  });

  it("rolls the date across midnight", () => {
    expect(isoToVnInput("2030-06-01T17:30:00Z")).toBe("2030-06-02T00:30");
  });

  it("round-trips with vnLocalToIso", () => {
    expect(isoToVnInput(vnLocalToIso("2030-06-01T09:30")!)).toBe("2030-06-01T09:30");
  });

  it("returns empty for null", () => {
    expect(isoToVnInput(null)).toBe("");
  });
});

describe("formatVnDateTime", () => {
  it("formats dd/MM/yyyy HH:mm in Vietnam time", () => {
    expect(formatVnDateTime("2030-01-01T02:00:00Z")).toBe("01/01/2030 09:00");
  });

  it("returns empty for null", () => {
    expect(formatVnDateTime(null)).toBe("");
  });
});
