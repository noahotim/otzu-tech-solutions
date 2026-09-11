import { proxyToVercel } from "../_lib/proxy.js";

export async function onRequest(context) {
  const { request, env } = context;
  // If D1 is bound and you want native auth, implement here.
  // For now, proxy to Vercel so existing users/sessions keep working.
  // This keeps cookies (session) intact.
  return proxyToVercel(request, env);
}
