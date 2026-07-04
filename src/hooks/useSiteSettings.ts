'use client';

import { useState, useEffect } from 'react';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '@/services/firestore';
import type { SiteSettings } from '@/types';

// Module-level cache so every component shares a single fetch per page load.
let cachedSettings: SiteSettings | null = null;
let pendingFetch: Promise<SiteSettings> | null = null;

function fetchSettingsOnce(): Promise<SiteSettings> {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (!pendingFetch) {
    pendingFetch = getSiteSettings()
      .then((settings) => {
        cachedSettings = settings;
        return settings;
      })
      .catch(() => DEFAULT_SITE_SETTINGS);
  }
  return pendingFetch;
}

/** Clears the cache (used after admin saves settings). */
export function invalidateSiteSettingsCache() {
  cachedSettings = null;
  pendingFetch = null;
}

export function useSiteSettings(): { settings: SiteSettings; loaded: boolean } {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings ?? DEFAULT_SITE_SETTINGS);
  const [loaded, setLoaded] = useState(!!cachedSettings);

  useEffect(() => {
    let active = true;
    fetchSettingsOnce().then((s) => {
      if (active) {
        setSettings(s);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loaded };
}
