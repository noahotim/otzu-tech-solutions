import { proxyToVercel } from "../_lib/proxy.js";
export async function onRequest(context) {
  // GET /api/catalog?resource=rooms|guests|inventory|staff|roles
  // POST/PUT/DELETE same
  return proxyToVercel(context.request, context.env);
}
