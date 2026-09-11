import { proxyToVercel } from "../_lib/proxy.js";
export async function onRequest(context) {
  return proxyToVercel(context.request, context.env);
}
