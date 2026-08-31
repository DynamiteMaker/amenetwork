"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ALLOWED_TYPES = ["post", "news"] as const;
const ALLOWED_STATUSES = ["draft", "published"] as const;
const POST_LOCALES = ["en", "vi", "ja", "zh"] as const;

async function requireAdminRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const role = await getUserRole(user.id);
  if (role !== "admin" && role !== "editor") throw new Error("Forbidden");
  return { user, role };
}

async function requireAdminOnly() {
  const { user, role } = await requireAdminRole();
  if (role !== "admin") throw new Error("Admin only");
  return { user, role };
}

export async function savePost(formData: FormData) {
  const { user } = await requireAdminRole();

  const id = formData.get("id") as string | null;
  const type = ALLOWED_TYPES.find((t) => t === formData.get("type")) ?? "post";
  const status = ALLOWED_STATUSES.find((s) => s === formData.get("status")) ?? "draft";
  const slug = (formData.get("slug") as string)?.trim();

  if (!slug) throw new Error("Slug is required");

  let tags: string[] = [];
  try {
    const parsed = JSON.parse((formData.get("tags") as string) || "[]");
    if (Array.isArray(parsed)) tags = parsed.filter((t: unknown) => typeof t === "string");
  } catch {
    /* keep empty array */
  }

  // A post is only published in a locale that has a translation, so a locale
  // without a title is skipped entirely.
  const translations: {
    locale: string;
    title: string;
    excerpt: string;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
  }[] = [];
  for (const loc of POST_LOCALES) {
    const prefix = `tr_${loc}_`;
    const title = (formData.get(`${prefix}title`) as string)?.trim();
    if (!title) continue;
    translations.push({
      locale: loc,
      title,
      excerpt: (formData.get(`${prefix}excerpt`) as string)?.trim() || "",
      content: (formData.get(`${prefix}content`) as string) || "",
      meta_title: (formData.get(`${prefix}meta_title`) as string)?.trim() || null,
      meta_description: (formData.get(`${prefix}meta_description`) as string)?.trim() || null,
    });
  }

  if (translations.length === 0) throw new Error("At least one translation is required");

  const payload: Record<string, unknown> = {
    slug,
    featured_image: (formData.get("featured_image") as string) || null,
    status,
    type,
    is_featured: formData.get("is_featured") === "on",
    category: (formData.get("category") as string)?.trim() || null,
    tags,
    author_id: user.id,
  };

  const admin = createAdminClient();
  let result;
  if (id) {
    result = await admin.from("posts").update(payload).eq("id", id).select("id, slug").single();
  } else {
    payload.published_at = status === "published" ? new Date().toISOString() : null;
    result = await admin.from("posts").insert(payload).select("id, slug").single();
  }

  if (result.error) throw new Error(result.error.message);
  const postId = result.data.id;

  if (id) await admin.from("post_translations").delete().eq("post_id", postId);

  const { error: trErr } = await admin
    .from("post_translations")
    .insert(translations.map((t) => ({ ...t, post_id: postId })));
  if (trErr) throw new Error(trErr.message);

  revalidatePath("/blog");
  if (result.data?.slug) revalidatePath(`/blog/${result.data.slug}`);

  const basePath = type === "news" ? "/admin/news" : "/admin/posts";
  redirect(`${basePath}/${postId}/edit`);
}

export async function deletePost(id: string, type: "post" | "news") {
  await requireAdminRole();

  const admin = createAdminClient();
  const { error } = await admin.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/blog");
  return { success: true };
}

export async function deleteSubmission(id: string) {
  await requireAdminRole();

  const admin = createAdminClient();
  const { error } = await admin.from("contact_submissions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function grantRole(userId: string, role: "admin" | "editor") {
  await requireAdminOnly();

  const admin = createAdminClient();
  const { error } = await admin.from("user_roles").insert({ user_id: userId, role });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function revokeRole(id: string) {
  await requireAdminOnly();

  const admin = createAdminClient();
  const { error } = await admin.from("user_roles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// --- Cases CRUD ---

const CASE_TAGS = ["branding", "digital", "growth", "healthcare", "apac"] as const;
const CASE_STATUSES = ["draft", "published"] as const;
const CASE_LOCALES = ["en", "vi", "ja", "zh"] as const;

export async function saveCase(formData: FormData) {
  await requireAdminRole();

  const id = formData.get("id") as string | null;
  const status = CASE_STATUSES.find((s) => s === formData.get("status")) ?? "draft";
  const tag = CASE_TAGS.find((t) => t === formData.get("tag")) ?? "branding";
  const slug = (formData.get("slug") as string)?.trim();
  if (!slug) throw new Error("Slug is required");

  let results: { value: string; label: string }[] = [];
  try {
    const parsed = JSON.parse((formData.get("results") as string) || "[]");
    if (Array.isArray(parsed)) results = parsed;
  } catch { /* keep empty */ }

  let testimonial: { quote: string; author: string; role: string } | null = null;
  try {
    const raw = formData.get("testimonial") as string;
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj.quote) testimonial = obj;
    }
  } catch { /* keep null */ }

  let solution: string[] = [];
  try {
    const parsed = JSON.parse((formData.get("solution") as string) || "[]");
    if (Array.isArray(parsed)) solution = parsed.filter((s: unknown) => typeof s === "string");
  } catch { /* keep empty */ }

  const translations: { locale: string; client: string; title: string; context: string; challenge: string }[] = [];
  for (const loc of CASE_LOCALES) {
    const prefix = `tr_${loc}_`;
    const client = (formData.get(`${prefix}client`) as string)?.trim();
    const title = (formData.get(`${prefix}title`) as string)?.trim();
    if (!client || !title) continue;
    translations.push({
      locale: loc,
      client,
      title,
      context: (formData.get(`${prefix}context`) as string)?.trim() || "",
      challenge: (formData.get(`${prefix}challenge`) as string)?.trim() || "",
    });
  }

  if (translations.length === 0) throw new Error("At least one translation is required");

  const admin = createAdminClient();

  const casePayload: Record<string, unknown> = {
    slug,
    tag,
    status,
    thumbnail: (formData.get("thumbnail") as string) || null,
    hero_image: (formData.get("hero_image") as string) || null,
    metric_value: (formData.get("metric_value") as string)?.trim() || null,
    metric_label: (formData.get("metric_label") as string)?.trim() || null,
    results,
    solution,
    testimonial,
    is_featured: formData.get("is_featured") === "on",
    sort_order: parseInt((formData.get("sort_order") as string) || "0", 10),
  };

  if (!id && status === "published") {
    casePayload.published_at = new Date().toISOString();
  }

  let caseId: string;
  if (id) {
    const { data, error } = await admin.from("cases").update(casePayload).eq("id", id).select("id, slug").single();
    if (error) throw new Error(error.message);
    caseId = data.id;
    // Delete existing translations and re-insert
    await admin.from("case_translations").delete().eq("case_id", caseId);
  } else {
    if (status === "published") casePayload.published_at = new Date().toISOString();
    const { data, error } = await admin.from("cases").insert(casePayload).select("id, slug").single();
    if (error) throw new Error(error.message);
    caseId = data.id;
  }

  // Insert translations
  const { error: trErr } = await admin
    .from("case_translations")
    .insert(translations.map((t) => ({ ...t, case_id: caseId })));
  if (trErr) throw new Error(trErr.message);

  revalidatePath("/cases");
  revalidatePath(`/cases/${slug}`);
  redirect(`/admin/cases/${caseId}/edit`);
}

export async function deleteCase(id: string) {
  await requireAdminRole();

  const admin = createAdminClient();
  const { error } = await admin.from("cases").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/cases");
  return { success: true };
}
