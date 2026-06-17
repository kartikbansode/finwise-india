import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const protectedRoutes = [
    "/dashboard",
    "/income",
    "/expenses",
    "/invoices",
    "/settings",
    "/tax",
    "/onboarding",
  ];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const hasSession =
    request.cookies.getAll().some((cookie) =>
      cookie.name.includes("sb-")
    );

  if (!hasSession && isProtected) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};