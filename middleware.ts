import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_PATTERN = /\/(en|vi|ja|zh)?\/?admin(\/|$)/;
const ADMIN_LOGIN_PATTERN = /\/admin\/login(\/|$|\?)/;

export async function middleware(request: NextRequest) {
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

  // 3. Protect admin routes (any authenticated user blocked without admin/editor role)
  const pathname = request.nextUrl.pathname;
  if (ADMIN_PATTERN.test(pathname) && !ADMIN_LOGIN_PATTERN.test(pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/(vi|en|ja|zh)/:path*"],
};
