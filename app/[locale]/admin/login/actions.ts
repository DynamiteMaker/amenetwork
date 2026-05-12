"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function getLocaleFromReferer(referer: string | null): string {
  if (!referer) return "en";
  try {
    const url = new URL(referer);
    const match = url.pathname.match(/^\/(en|vi|zh|ja)\//);
    return match?.[1] ?? "en";
  } catch {
    return "en";
  }
}

export async function login(formData: FormData): Promise<void> {
  const headersList = await headers();
  const locale = getLocaleFromReferer(headersList.get("referer"));
  console.log("[LOGIN] URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("[LOGIN] email:", formData.get("email"));
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  console.log("[LOGIN] error:", error?.message);
  console.log("[LOGIN] user:", data.user?.id);
  if (error) throw new Error("Invalid email or password");
  redirect(`/${locale}/admin`);
}

export async function logout() {
  const headersList = await headers();
  const locale = getLocaleFromReferer(headersList.get("referer"));
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/admin/login`);
}
