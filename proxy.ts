import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_PATTERN = /\/(en|vi|ja|zh)?\/?admin(\/|$)/;
const ADMIN_LOGIN_PATTERN = /\/admin\/login(\/|$|\?)/;

export default async function proxy(request: NextRequest) {
  // 1. Handle i18n
  const response = intlMiddleware(request);

  // 2. Refresh Supabase session and check auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Protect admin routes (redirect unauthenticated users)
  const pathname = request.nextUrl.pathname;
  if (ADMIN_PATTERN.test(pathname) && !ADMIN_LOGIN_PATTERN.test(pathname)) {
    if (!user) {
      const locale = pathname.split("/")[1]?.match(/^(vi|en|ja|zh)$/) ? pathname.split("/")[1] : "en";
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
