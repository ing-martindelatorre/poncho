import { NextResponse, type NextRequest } from "next/server";

const publicPrefixes = ["/_next", "/favicon.ico", "/api/health"];

function isPublicPath(pathname: string) {
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    headers: {
      "WWW-Authenticate": 'Basic realm="Poncho"',
    },
    status: 401,
  });
}

function readBasicCredentials(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");

    if (separator === -1) {
      return null;
    }

    return {
      password: decoded.slice(separator + 1),
      user: decoded.slice(0, separator),
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password || isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const credentials = readBasicCredentials(request.headers.get("authorization"));

  if (credentials?.user === user && credentials.password === password) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*"],
};
