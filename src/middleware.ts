import { NextResponse, type NextRequest } from "next/server";

const sessionCookieName = "poncho_session";
const publicPrefixes = ["/_next", "/favicon.ico", "/api/health", "/login", "/setup"];

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

function base64urlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToBase64url(bytes: ArrayBuffer) {
  const array = new Uint8Array(bytes);
  let binary = "";

  for (const byte of array) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));

  return bytesToBase64url(signature);
}

async function validAppSession(token: string | undefined, secret: string) {
  if (!token) {
    return false;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature || (await sign(body, secret)) !== signature) {
    return false;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(body))) as {
      exp?: number;
      userId?: string;
    };

    return Boolean(payload.userId && payload.exp && payload.exp >= Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const basicUser = process.env.BASIC_AUTH_USER;
  const basicPassword = process.env.BASIC_AUTH_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (basicUser && basicPassword) {
    const credentials = readBasicCredentials(request.headers.get("authorization"));

    if (credentials?.user !== basicUser || credentials.password !== basicPassword) {
      return unauthorized();
    }
  }

  if (!authSecret) {
    return NextResponse.next();
  }

  const hasValidSession = await validAppSession(
    request.cookies.get(sessionCookieName)?.value,
    authSecret,
  );

  if (hasValidSession) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*"],
};
