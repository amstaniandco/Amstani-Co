import { Resend } from "resend";

// Lazily instantiated so a missing key degrades gracefully instead of crashing imports.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * The "from" address. Resend can only deliver mail from a domain you've verified in the
 * Resend dashboard — a raw gmail.com address will be rejected until that domain is verified.
 * Override with EMAIL_FROM in your env once a domain is set up (e.g. "Amstani & Co <hello@yourdomain.com>").
 */
export const EMAIL_FROM = process.env.EMAIL_FROM || "Amstani & Co <amstaniandco@gmail.com>";

/** Address customer replies are routed to. */
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || "amstaniandco@gmail.com";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type SendArgs = { to: string; subject: string; html: string; replyTo?: string };

/**
 * Send an email via Resend. Never throws — email is a side-effect that must not break
 * the primary request. Returns true on success, false if skipped or failed.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return false;
  }
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.warn("[email] invalid recipient — skipping:", to);
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      replyTo: replyTo || EMAIL_REPLY_TO,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

// ─── Shared layout ─────────────────────────────────────────────────────────────

function layout(opts: { heading: string; bodyHtml: string; preheader?: string }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    ${opts.preheader ? `<span style="display:none;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${opts.preheader}</span>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f6;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.06);">
          <tr><td style="background:linear-gradient(135deg,#65bbc5,#0f766e);padding:22px 28px;">
            <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;">AMSTANI &amp; CO.</span>
          </td></tr>
          <tr><td style="padding:28px 28px 8px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">${opts.heading}</h1>
            ${opts.bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 28px 28px;">
            <hr style="border:none;border-top:1px solid #e9eef1;margin:0 0 16px;" />
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              You're receiving this email from Amstani &amp; Co.<br/>
              Need help? Just reply to this message.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#334155;">${text}</p>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:10px;margin:6px 0 14px;">${label}</a>`;
}

// ─── Order helpers ─────────────────────────────────────────────────────────────

type OrderItem = { name?: string; quantity?: number; price?: number };
type OrderEmailData = {
  customerName?: string;
  orderNumber?: string;
  storeName?: string;
  items?: OrderItem[];
  total?: number;
};

function money(n: number | undefined): string {
  return `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function itemsTable(items: OrderItem[] = [], total?: number): string {
  if (!items.length) return "";
  const rows = items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0;font-size:13px;color:#334155;">${it.name ?? "Item"} <span style="color:#94a3b8;">× ${it.quantity ?? 1}</span></td>
        <td style="padding:8px 0;font-size:13px;color:#334155;text-align:right;">${money((it.price ?? 0) * (it.quantity ?? 1))}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;border-top:1px solid #e9eef1;border-bottom:1px solid #e9eef1;">
    ${rows}
    ${
      total !== undefined
        ? `<tr><td style="padding:10px 0 0;font-size:14px;font-weight:700;color:#0f172a;">Total</td>
           <td style="padding:10px 0 0;font-size:14px;font-weight:700;color:#0f172a;text-align:right;">${money(total)}</td></tr>`
        : ""
    }
  </table>`;
}

// ─── Email builders ────────────────────────────────────────────────────────────

export function welcomeEmail(name: string) {
  return {
    subject: "Welcome to Amstani & Co — thanks for registering! 🎉",
    html: layout({
      heading: `Welcome aboard, ${name || "there"}!`,
      preheader: "Thanks for registering with Amstani & Co.",
      bodyHtml:
        para("Thank you for registering with <strong>Amstani &amp; Co.</strong> Your account is ready to go.") +
        para("Discover unique stores, follow your favourites, and shop a curated catalog of products from sellers across the country.") +
        button("Start exploring", `${APP_URL}/home`) +
        para("We're glad to have you with us. If you have any questions, just reply to this email."),
    }),
  };
}

export function orderAcceptedEmail(d: OrderEmailData) {
  return {
    subject: `Your order ${d.orderNumber ?? ""} has been accepted ✅`,
    html: layout({
      heading: "Your order is confirmed!",
      preheader: `Order ${d.orderNumber ?? ""} accepted by ${d.storeName ?? "the store"}.`,
      bodyHtml:
        para(`Hi ${d.customerName || "there"}, good news — <strong>${d.storeName || "the store"}</strong> has accepted your order <strong>${d.orderNumber ?? ""}</strong> and is preparing it now.`) +
        itemsTable(d.items, d.total) +
        button("View your order", `${APP_URL}/orders`) +
        para("We'll email you again as your order progresses."),
    }),
  };
}

export function orderOnHoldEmail(d: OrderEmailData) {
  return {
    subject: `Update on your order ${d.orderNumber ?? ""} — on hold`,
    html: layout({
      heading: "Your order is temporarily on hold",
      preheader: `Order ${d.orderNumber ?? ""} is on hold.`,
      bodyHtml:
        para(`Hi ${d.customerName || "there"}, your order <strong>${d.orderNumber ?? ""}</strong> from <strong>${d.storeName || "the store"}</strong> has been placed on hold. This is usually due to a stock check or a quick verification.`) +
        itemsTable(d.items, d.total) +
        para("No action is needed from you right now — the store will resolve this shortly and we'll keep you posted.") +
        button("View your order", `${APP_URL}/orders`),
    }),
  };
}

export function orderStatusUpdateEmail(d: OrderEmailData & { status: string }) {
  const friendly: Record<string, string> = {
    Rejected: "could not be accepted",
    Dispatched: "has been dispatched",
    Shipped: "has shipped",
    Delivered: "has been delivered",
  };
  const phrase = friendly[d.status] || `is now: ${d.status}`;
  return {
    subject: `Order ${d.orderNumber ?? ""} update — ${d.status}`,
    html: layout({
      heading: `Your order ${phrase}`,
      preheader: `Order ${d.orderNumber ?? ""}: ${d.status}.`,
      bodyHtml:
        para(`Hi ${d.customerName || "there"}, an update on your order <strong>${d.orderNumber ?? ""}</strong> from <strong>${d.storeName || "the store"}</strong>: it ${phrase}.`) +
        itemsTable(d.items, d.total) +
        button("View your order", `${APP_URL}/orders`),
    }),
  };
}
