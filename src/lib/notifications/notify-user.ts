import { revalidatePath } from "next/cache";
import {
  createNotification,
  createNotifications,
  type CreateNotificationInput,
} from "@/lib/notifications/create";
import {
  buildEmailHtml,
  getUserEmail,
  sendEmail,
} from "@/lib/email/send";
import { getNotificationPrefs } from "@/lib/notifications/prefs";
import { siteConfig } from "@/config/site";
async function sendNotificationEmail(input: CreateNotificationInput): Promise<void> {
  const prefs = await getNotificationPrefs(input.userId);
  if (!prefs.emailEnabled) return;

  const email = await getUserEmail(input.userId);
  if (!email) return;

  await sendEmail({
    to: email,
    subject: `[${siteConfig.name}] ${input.title}`,
    html: buildEmailHtml({
      title: input.title,
      body: input.body ?? "",
      actionUrl: input.actionUrl,
    }),
    text: `${input.title}\n\n${input.body ?? ""}`,
  });
}

function revalidateNotificationSurfaces() {
  revalidatePath("/dashboard/notifications");
}

/** Notification in-app + email transactionnel (si RESEND_API_KEY configurée). */
export async function notifyUser(input: CreateNotificationInput) {
  await createNotification(input);
  revalidateNotificationSurfaces();
  await sendNotificationEmail(input).catch((e) =>
    console.error("[notifyUser] email:", e)
  );
}

export async function notifyUsers(inputs: CreateNotificationInput[]) {
  if (!inputs.length) return;
  await createNotifications(inputs);
  revalidateNotificationSurfaces();
  await Promise.all(
    inputs.map((input) =>
      sendNotificationEmail(input).catch((e) =>
        console.error("[notifyUsers] email:", e)
      )
    )
  );
}
