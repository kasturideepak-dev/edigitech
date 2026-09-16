"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsAction } from "../../actions/settings";
import { SETTINGS_TABS, type SettingsKey, type SiteSettings } from "@/lib/settings-schema";
import { FieldGroup, LinkOptionsContext } from "@/components/admin/fields";
import { Button, cx, useToast } from "@/components/admin/ui";

export function SettingsEditor({
  initial,
  initialTab,
  allowedTabs,
  linkOptions,
}: {
  initial: SiteSettings;
  initialTab?: string;
  allowedTabs: string[] | null;
  linkOptions: { label: string; url: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const tabs = SETTINGS_TABS.filter((t) => !allowedTabs || allowedTabs.includes(t.key));
  const [tab, setTab] = useState<SettingsKey>((tabs.find((t) => t.key === initialTab) ?? tabs[0]).key);
  const [values, setValues] = useState(initial);
  const [dirty, setDirty] = useState<Partial<Record<SettingsKey, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const current = tabs.find((t) => t.key === tab)!;

  async function save() {
    setSaving(true);
    const res = await saveSettingsAction(tab, values[tab]);
    setSaving(false);
    if (!res.ok) return toast("error", res.error);
    setDirty((d) => ({ ...d, [tab]: false }));
    toast("success", `${current.label} saved — the live site is updated.`);
    router.refresh();
  }

  return (
    <LinkOptionsContext.Provider value={linkOptions}>
      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-52 lg:flex-col">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => {
                setTab(t.key);
                window.history.replaceState(null, "", `?tab=${t.key}`);
              }}
              className={cx(
                "whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium",
                tab === t.key ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-white",
              )}
            >
              {t.label}
              {dirty[t.key] && <span className="ml-1 text-amber-500">●</span>}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
              <div>
                <h2 className="font-semibold">{current.label}</h2>
                <p className="text-sm text-zinc-500">{current.description}</p>
              </div>
              <Button variant="primary" onClick={save} loading={saving} disabled={!dirty[tab]}>
                Save changes
              </Button>
            </div>
            <div className="p-5">
              <FieldGroup
                key={tab}
                fields={current.fields}
                value={values[tab] as unknown as Record<string, unknown>}
                onChange={(v) => {
                  setValues((s) => ({ ...s, [tab]: v }));
                  setDirty((d) => ({ ...d, [tab]: true }));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </LinkOptionsContext.Provider>
  );
}
