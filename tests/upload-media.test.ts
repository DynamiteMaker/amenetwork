import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  altFromFileName,
  extensionForContentType,
  parseRemoteImageUrl,
  uploadMedia,
} from "../lib/upload-media";

function fakeSupabase(uploadError: { message: string } | null = null) {
  const calls: { path: string; file: File; options: { contentType: string } }[] = [];
  const upload = vi.fn(async (path: string, file: File, options: { contentType: string }) => {
    calls.push({ path, file, options });
    return { error: uploadError };
  });
  const client = {
    storage: {
      from: (bucket: string) => ({
        upload,
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/${bucket}/${path}` } }),
      }),
    },
  } as unknown as SupabaseClient;
  return { client, upload, calls };
}

const png = (name = "ha-noi-office.PNG", bytes = 8) =>
  new File([new Uint8Array(bytes)], name, { type: "image/png" });

describe("uploadMedia", () => {
  it("stores the file under the folder and returns its public URL", async () => {
    const { client, upload, calls } = fakeSupabase();
    const url = await uploadMedia(client, png());

    expect(url).toMatch(/^https:\/\/cdn\.test\/media\/posts\/\d+-[a-z0-9]{6}\.png$/);
    expect(upload).toHaveBeenCalledOnce();
    expect(calls[0].options).toEqual({ contentType: "image/png" });
    expect(calls[0].file.name).toBe("ha-noi-office.PNG");
  });

  it("honours a custom folder", async () => {
    const { client } = fakeSupabase();
    expect(await uploadMedia(client, png(), "cases")).toContain("/media/cases/");
  });

  it("rejects non-image files before touching storage", async () => {
    const { client, upload } = fakeSupabase();
    const pdf = new File([new Uint8Array(4)], "brief.pdf", { type: "application/pdf" });
    await expect(uploadMedia(client, pdf)).rejects.toThrow("Only image files are allowed");
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects files over 5MB before touching storage", async () => {
    const { client, upload } = fakeSupabase();
    const big = png("huge.png", 5 * 1024 * 1024 + 1);
    await expect(uploadMedia(client, big)).rejects.toThrow("File too large (max 5MB)");
    expect(upload).not.toHaveBeenCalled();
  });

  it("surfaces the storage error message", async () => {
    const { client } = fakeSupabase({ message: "new row violates row-level security policy" });
    await expect(uploadMedia(client, png())).rejects.toThrow(
      "new row violates row-level security policy",
    );
  });

  it("falls back to a jpg extension when the name has none", async () => {
    const { client } = fakeSupabase();
    const noExt = new File([new Uint8Array(2)], "photo", { type: "image/jpeg" });
    expect(await uploadMedia(client, noExt)).toMatch(/\.jpg$/);
  });
});

describe("altFromFileName", () => {
  it("turns a descriptive filename into readable alt text", () => {
    expect(altFromFileName("ame-office_ha-noi.webp")).toBe("ame office ha noi");
  });

  it("returns an empty alt for meaningless clipboard names", () => {
    expect(altFromFileName("image.png")).toBe("");
    expect(altFromFileName("Screenshot 2026-09-03 at 10.12.44.png")).toBe("");
    expect(altFromFileName("IMG_4821.jpeg")).toBe("");
  });
});

describe("parseRemoteImageUrl", () => {
  it("accepts a public http(s) image URL", () => {
    expect(parseRemoteImageUrl("https://images.example.com/a.jpg").hostname).toBe(
      "images.example.com",
    );
  });

  it("rejects non-http protocols", () => {
    expect(() => parseRemoteImageUrl("file:///etc/passwd")).toThrow("Only http(s)");
    expect(() => parseRemoteImageUrl("not a url")).toThrow("Invalid image URL");
  });

  it("rejects hosts that could reach internal infrastructure", () => {
    for (const url of [
      "http://localhost:3000/a.png",
      "http://127.0.0.1/a.png",
      "http://10.0.0.5/a.png",
      "http://192.168.1.4/a.png",
      "http://172.16.0.9/a.png",
      "http://169.254.169.254/latest/meta-data",
      "http://db.internal/a.png",
    ]) {
      expect(() => parseRemoteImageUrl(url)).toThrow("not allowed");
    }
  });
});

describe("extensionForContentType", () => {
  it("maps image mime types to storage extensions", () => {
    expect(extensionForContentType("image/jpeg")).toBe("jpg");
    expect(extensionForContentType("image/svg+xml")).toBe("svg");
    expect(extensionForContentType("image/webp")).toBe("webp");
    expect(extensionForContentType("")).toBe("jpg");
  });
});
