/**
 * Cloudflare Pages Function for /api/contact
 * Handles contact form submissions from index.html
 * Deploy this folder to Cloudflare Pages - it automatically becomes a serverless endpoint.
 *
 * Environment variables to set in Cloudflare dashboard (optional):
 * - CONTACT_EMAIL: where to forward (defaults to otim.no25@gmail.com)
 * - MAILCHANNELS_API_KEY or use Email Workers / Resend / SendGrid
 *
 * By default this logs and returns 200. Replace with your email provider.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    const { name, email, phone, message } = data || {};

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Basic validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: Integrate real email delivery
    // Example with MailChannels (free on Cloudflare), Resend, or SendGrid:
    //
    // Example - MailChannels:
    // await fetch("https://api.mailchannels.net/tx/v1/send", {
    //   method: "POST",
    //   headers: { "content-type": "application/json" },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: env.CONTACT_EMAIL || "otim.no25@gmail.com" }] }],
    //     from: { email: "noreply@otzu-tech-solutions.pages.dev", name: "OTZU Website" },
    //     subject: `New demo request from ${name}`,
    //     content: [{ type: "text/plain", value: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}` }]
    //   })
    // });
    //
    // Example - Resend:
    // await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     from: "onboarding@resend.dev",
    //     to: env.CONTACT_EMAIL || "otim.no25@gmail.com",
    //     subject: `OTZU Demo: ${name}`,
    //     html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>${message}</p>`
    //   })
    // });

    // Log to Cloudflare (visible in dashboard > Functions > Logs)
    console.log("OTZU contact submission:", { name, email, phone, message: message?.slice(0, 500) });

    // Optionally store in KV/D1 if you bind them via env.CONTACT_KV etc.

    return new Response(
      JSON.stringify({ ok: true, message: "Received. We'll reply shortly." }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON or server error", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}
