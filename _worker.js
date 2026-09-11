const VERCEL_ORIGIN = "https://otzu-tech-solutions.vercel.app";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API proxy -> Vercel (keep DB there until D1 migration)
    if (url.pathname.startsWith("/api/")) {
      // Special: native contact on Worker too (optional)
      if (url.pathname === "/api/contact" && request.method === "POST") {
        try {
          const data = await request.json();
          console.log("OTZU contact (Worker):", data);
          return new Response(JSON.stringify({ ok: true, message: "Received" }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
      }
      const target = VERCEL_ORIGIN + url.pathname + url.search;
      const headers = new Headers(request.headers);
      headers.delete("host");
      const init = { method: request.method, headers, redirect: "manual" };
      if (request.method !== "GET" && request.method !== "HEAD") init.body = await request.clone().arrayBuffer();
      const res = await fetch(target, init);
      const out = new Headers(res.headers);
      out.delete("content-encoding");
      out.delete("content-length");
      out.set("x-proxy-by", "worker");
      return new Response(res.body, { status: res.status, headers: out });
    }

    // Static assets (Cloudflare will serve via env.ASSETS)
    // Fallback SPA: serve index.html for extensionless routes? assets not_found_handling=single-page-application handles it.
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Not found", { status: 404 });
    }
  },
};
