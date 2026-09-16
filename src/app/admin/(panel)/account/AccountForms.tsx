"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "../../actions/auth";
import { Button, Card, Input, Label } from "@/components/admin/ui";

function Status({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state?.ok) return <p className="text-sm text-emerald-600">{state.ok}</p>;
  return null;
}

export function AccountForms({ name }: { name: string }) {
  const [profile, profileAction, p1] = useActionState(updateProfileAction, undefined);
  const [pw, pwAction, p2] = useActionState(changePasswordAction, undefined);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Profile">
        <form action={profileAction} className="space-y-4 p-5">
          <div>
            <Label>Name</Label>
            <Input name="name" defaultValue={name} required />
          </div>
          <Status state={profile} />
          <Button type="submit" variant="primary" loading={p1}>
            Save profile
          </Button>
        </form>
      </Card>
      <Card title="Change password">
        <form action={pwAction} className="space-y-4 p-5">
          <div>
            <Label>Current password</Label>
            <Input name="current" type="password" autoComplete="current-password" required />
          </div>
          <div>
            <Label>New password</Label>
            <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div>
            <Label>Confirm new password</Label>
            <Input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <Status state={pw} />
          <Button type="submit" variant="primary" loading={p2}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
