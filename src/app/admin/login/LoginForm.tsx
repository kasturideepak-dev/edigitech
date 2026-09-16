"use client";

import { useActionState } from "react";
import { loginAction } from "../actions/auth";
import { Button, Input, Label } from "@/components/admin/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4 rounded-xl bg-white p-6 shadow-xl">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label>Email</Label>
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </div>
      <div>
        <Label>Password</Label>
        <Input name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <Button type="submit" variant="primary" className="w-full" loading={pending}>
        Sign in
      </Button>
    </form>
  );
}
