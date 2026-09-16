"use server";

import { revalidatePath, updateTag } from "next/cache";
import { assertUser } from "@/lib/auth";
import { SETTINGS_TAG, saveSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS, type SettingsKey, type SiteSettings } from "@/lib/settings-schema";

export async function saveSettingsAction<K extends SettingsKey>(key: K, value: SiteSettings[K]) {
  try {
    await assertUser(key === "seo" ? "seo.manage" : "settings.manage");
    if (!(key in DEFAULT_SETTINGS)) throw new Error("Unknown settings group");
    await saveSettings(key, value);
    updateTag(SETTINGS_TAG);
    // Header/footer appear on every page.
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Could not save settings" };
  }
}
