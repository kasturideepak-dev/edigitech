import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/ui";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · eDigiTech CMS" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
