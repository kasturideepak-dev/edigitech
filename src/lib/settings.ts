import "server-only";
import { unstable_cache } from "next/cache";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { settings as settingsTable } from "@/db/schema";
import { DEFAULT_SETTINGS, type SettingsKey, type SiteSettings } from "./settings-schema";

export const SETTINGS_TAG = "settings";

const KEYS = Object.keys(DEFAULT_SETTINGS) as SettingsKey[];

/** Reads all settings from the DB and merges them over the defaults. */
export async function loadSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(settingsTable).where(inArray(settingsTable.key, KEYS));
  const merged = structuredClone(DEFAULT_SETTINGS) as Record<string, Record<string, unknown>>;
  for (const row of rows) {
    if (row.key in merged && row.value && typeof row.value === "object") {
      merged[row.key] = { ...merged[row.key], ...(row.value as Record<string, unknown>) };
    }
  }
  return merged as unknown as SiteSettings;
}

/** Cached for public pages; invalidated whenever settings are saved. */
export const getSettings = unstable_cache(loadSettings, ["site-settings"], { tags: [SETTINGS_TAG] });

export async function saveSettings<K extends SettingsKey>(key: K, value: SiteSettings[K]) {
  await db
    .insert(settingsTable)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}
