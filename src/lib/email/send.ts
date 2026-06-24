import { createAdminClient } from "@/lib/supabase/admin";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "PatentIQ <onboarding@resend.dev>"
  );
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[email] skipped (RESEND_API_KEY absent):", input.subject, "→", input.to);
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend error:", res.status, err);
    return false;
  }

  return true;
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();
  return data?.email ?? null;
}

export function buildEmailHtml(params: {
  title: string;
  body: string;
  actionUrl?: string | null;
  actionLabel?: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const href = params.actionUrl
    ? params.actionUrl.startsWith("http")
      ? params.actionUrl
      : `${appUrl}${params.actionUrl}`
    : null;

  const button = href
    ? `<p style="margin:24px 0"><a href="${href}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${params.actionLabel ?? "Ouvrir dans PatentIQ"}</a></p>`
    : "";

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#1e293b;line-height:1.5;max-width:560px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">${params.title}</h2>
<p style="margin:0 0 16px;color:#475569">${params.body}</p>
${button}
<p style="margin-top:32px;font-size:12px;color:#94a3b8">PatentIQ — plateforme propriété intellectuelle</p>
</body></html>`;
}
