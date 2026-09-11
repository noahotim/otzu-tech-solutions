import { proxyToVercel } from "../_lib/proxy.js";

export async function onRequest(context) {
  const { request, env } = context;
  // Handles:
  // GET /api/booking?checkIn=&nights=&guests=
  // POST /api/booking  (create reservation)
  // GET /api/booking?action=access-status|mtn-status|mtn-check|receipt-pdf|request-demo etc
  // POST /api/booking?action=mtn-pay|request-demo
  // Proxy keeps Vercel DB as source of truth until D1 migration.
  return proxyToVercel(request, env);
}
