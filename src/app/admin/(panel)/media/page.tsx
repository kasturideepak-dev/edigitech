import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { MediaBrowser } from "@/components/admin/MediaBrowser";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaPage() {
  await requireUser("media.manage");
  return (
    <>
      <PageHeader title="Media Library" description="Upload and organize images. Always add alt text — it helps SEO and accessibility." />
      <MediaBrowser />
    </>
  );
}
