import type { SupabaseClient } from "@supabase/supabase-js";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const MEDIA_BUCKET = "media";

/**
 * Uploads one image to the public `media` bucket and returns its public URL.
 * Shared by the featured-image picker and the in-article image insert so both
 * paths validate, name, and store files identically.
 */
export async function uploadMedia(
  supabase: SupabaseClient,
  file: File,
  folder = "posts",
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File too large (max 5MB)");

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file)}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Storage serves files by extension, so it must come from the MIME type
 * whenever the name has none — clipboard pastes arrive as bare `image`, and a
 * name like `photo` would otherwise become a `.photo` object nothing renders.
 */
export function extensionForContentType(contentType: string): string {
  const subtype = contentType.split("/")[1]?.split("+")[0]?.replace(/[^a-z0-9]/g, "") ?? "";
  if (!subtype) return "jpg";
  return subtype === "jpeg" ? "jpg" : subtype;
}

function extensionFor(file: File): string {
  const named = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";
  if (named.length >= 2 && named.length <= 5) return named === "jpeg" ? "jpg" : named;
  return extensionForContentType(file.type);
}

// Copying a pasted image means fetching a URL an editor supplied, so anything
// that could reach infrastructure behind the deployment is rejected outright.
const PRIVATE_HOST =
  /^(localhost$|127\.|0\.0\.0\.0$|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|.*\.internal$|.*\.local$)/i;

/** Validates a remote image URL before the server is asked to fetch it. */
export function parseRemoteImageUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid image URL");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http(s) image URLs can be copied");
  }
  if (PRIVATE_HOST.test(parsed.hostname)) throw new Error("That host is not allowed");
  return parsed;
}

// Clipboard, camera, and screenshot names carry no meaning, so they must not
// end up as `alt="Screenshot 2026-09-03"` on a published article.
const GENERIC_NAME_WORDS: Record<string, true> = {
  image: true, images: true, img: true, imgp: true, dsc: true, dscn: true,
  picture: true, pic: true, photo: true, photos: true, screenshot: true,
  screen: true, shot: true, capture: true, untitled: true, pasted: true,
  paste: true, clipboard: true, download: true, downloaded: true, file: true,
  copy: true, final: true, new: true, at: true, on: true, am: true, pm: true, v: true,
};

/** Filename -> readable alt text, so inserted images are not published alt-less. */
export function altFromFileName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) return "";

  const words = base
    .toLowerCase()
    .replace(/[\d.:,()[\]]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0 || words.every((w) => GENERIC_NAME_WORDS[w])) return "";

  return base.slice(0, 120);
}
