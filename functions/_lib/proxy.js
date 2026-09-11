const VERCEL_ORIGIN = "https://otzu-tech-solutions.vercel.app";

export async function proxyToVercel(request, env) {
  const url = new URL(request.url);
  const targetUrl = VERCEL_ORIGIN + url.pathname + url.search;

  // Clone headers, strip host-sensitive ones
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("x-forwarded-host");
  headers.set("x-forwarded-host", url.host);
  headers.set("x-real-ip", request.headers.get("cf-connecting-ip") || "");
  // Forward cookies automatically via headers clone

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  // Forward body for non-GET/HEAD
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.clone().arrayBuffer();
    // If body exists but content-type missing, preserve
  }

  const res = await fetch(targetUrl, init);

  // Clone response headers, strip encoding
  const outHeaders = new Headers(res.headers);
  outHeaders.delete("content-encoding");
  outHeaders.delete("content-length");
  // Ensure CORS for same-origin (Pages Functions already same-origin)
  // Preserve Set-Cookie (Cloudflare will forward multiple)
  outHeaders.set("x-proxy-by", "cloudflare-pages-fallback");
  outHeaders.set("x-proxy-origin", VERCEL_ORIGIN);

  // Stream body
  return new Response(res.body, {
    status: res.status,
    headers: outHeaders,
  });
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
