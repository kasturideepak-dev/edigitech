import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { AccountForms } from "./AccountForms";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="My account" description={`${user.email} · ${user.role}`} />
      <AccountForms name={user.name} />
    </>
  );
}
