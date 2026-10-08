"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { assertUser } from "@/lib/auth";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export type EnquiryInput = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  /** Hidden field; real people leave it empty. */
  website?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Public: stores a contact form submission.
 * Saved to the database rather than emailed, so an SMTP problem can never lose
 * an enquiry. The dashboard shows them under Enquiries.
 */
export async function submitEnquiryAction(input: EnquiryInput): Promise<Result> {
  try {
    // Honeypot: bots fill every field they find.
    if (input.website?.trim()) return { ok: true };

    const name = (input.name ?? "").trim();
    const email = (input.email ?? "").trim().toLowerCase();
    const message = (input.message ?? "").trim();

    if (name.length < 2) return { ok: false, error: "Please enter your name." };
    if (!EMAIL.test(email)) return { ok: false, error: "Please enter a valid email address." };
    if (message.length < 10) return { ok: false, error: "Please tell us a little more about what you need." };
    if (name.length > 160 || email.length > 190 || message.length > 5000)
      return { ok: false, error: "That message is too long. Please shorten it." };

    await db.insert(enquiries).values({
      name: name.slice(0, 160),
      email: email.slice(0, 190),
      phone: (input.phone ?? "").trim().slice(0, 40),
      subject: (input.subject ?? "").trim().slice(0, 200),
      message: message.slice(0, 5000),
      source: (input.source ?? "").trim().slice(0, 250),
    });

    revalidatePath("/admin/enquiries");
    return { ok: true };
  } catch {
    return { ok: false, error: "Sorry, something went wrong. Please try again or message us on WhatsApp." };
  }
}

// ------------------------------------------------------------------ admin

export async function setEnquiryStatusAction(id: number, status: "new" | "read" | "archived") {
  try {
    await assertUser("pages.edit");
    await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
    revalidatePath("/admin/enquiries");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteEnquiryAction(id: number) {
  try {
    await assertUser("pages.delete");
    await db.delete(enquiries).where(eq(enquiries.id, id));
    revalidatePath("/admin/enquiries");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function listEnquiries() {
  await assertUser("pages.edit");
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(500);
}
