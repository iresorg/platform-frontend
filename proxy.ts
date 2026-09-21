import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "analyst" | "lead" | "customer";

const SESSION_COOKIE = "ires_session";
const ANALYST_ROUTE_PREFIXES = ["/cases"];
const CUSTOMER_ROUTE_PREFIXES = ["/portal"];
// Any signed-in role may use these (role checks stay on the client).
const SHARED_ROUTE_PREFIXES = ["/settings"];

function roleHome(role: Role): string {
  return role === "customer" ? "/portal" : "/cases";
}

// Optimistic checks only — this reads a non-sensitive role cookie to
// pre-filter obviously unauthorized navigations. The bearer token that
// actually authorizes Case API requests lives in localStorage and is
// verified server-side on every request; see lib/cases/api.ts.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(SESSION_COOKIE)?.value as
    | Role
    | undefined;

  const isAnalystRoute = ANALYST_ROUTE_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );
  const isCustomerRoute = CUSTOMER_ROUTE_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  const isSharedRoute = SHARED_ROUTE_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  if (!role) {
    if (isAnalystRoute || isCustomerRoute || isSharedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }
  if (role === "customer" && isAnalystRoute) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }
  if (role !== "customer" && isCustomerRoute) {
    return NextResponse.redirect(new URL("/cases", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
