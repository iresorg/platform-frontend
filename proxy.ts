import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleHome, STAFF_ROUTE_PREFIXES } from "@/lib/auth/roles";
import { isUserRole } from "@/lib/auth/types";

const SESSION_COOKIE = "ires_session";
const STAFF_ROLES = new Set(["tier1", "tier2", "admin"]);
const CUSTOMER_ROUTE_PREFIXES = ["/portal"];
// Any signed-in role may use these (role checks stay on the client).
const SHARED_ROUTE_PREFIXES = ["/settings", "/no-organization"];

// Optimistic checks only — this reads a non-sensitive role cookie to
// pre-filter obviously unauthorized navigations. The bearer token that
// actually authorizes Case API requests lives in localStorage and is
// verified server-side on every request; see lib/http.ts.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // An unrecognised value counts as signed out: acting on it would bounce
  // between roleHome() and the route guards forever.
  const cookieRole = request.cookies.get(SESSION_COOKIE)?.value;
  const role = isUserRole(cookieRole) ? cookieRole : undefined;

  const isAnalystRoute = STAFF_ROUTE_PREFIXES.some((p) =>
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
  const isStaff = STAFF_ROLES.has(role);
  if (!isStaff && isAnalystRoute) {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }
  if (isStaff && isCustomerRoute) {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
