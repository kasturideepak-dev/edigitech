import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getCurrentUser()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand text-xl font-bold text-white">e</div>
          <h1 className="text-xl font-semibold text-white">eDigiTech CMS</h1>
          <p className="mt-1 text-sm text-zinc-400">Sign in to manage your website</p>
        </div>
        <LoginForm next={typeof next === "string" ? next : ""} />
      </div>
    </div>
  );
}
