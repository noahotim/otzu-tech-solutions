import { proxyToVercel } from "../_lib/proxy.js";
// Fallback for any /api/* not explicitly handled (e.g. /api/invoices, /api/receipts, etc.)
export async function onRequest(context) {
  return proxyToVercel(context.request, context.env);
}
