import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { can, requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { EnquiriesList } from "./EnquiriesList";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const user = await requireUser("pages.edit");
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(500);

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages sent through the contact form. They are stored here, so nothing is lost if email delivery fails."
      />
      <EnquiriesList
        rows={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        canDelete={can(user.role, "pages.delete")}
      />
    </>
  );
}
