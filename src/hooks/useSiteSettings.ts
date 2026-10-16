'use client';

import { useState, useEffect } from 'react';
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from '@/services/firestore';
import { invalidateCache } from '@/utils/cacheStore';
import type { SiteSettings } from '@/types';

/** Clears the cache (used after admin saves settings). */
export function invalidateSiteSettingsCache() {
  invalidateCache('settings_general');
}

export function useSiteSettings(): { settings: SiteSettings; loaded: boolean } {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSettings = () => {
      getSiteSettings().then((s) => {
        if (active) {
          setSettings(s);
          setLoaded(true);
        }
      });
    };

    loadSettings();

    const handleInvalidation = (e: Event) => {
      const customEvent = e as CustomEvent<{ prefixOrKey?: string }>;
      if (!customEvent.detail?.prefixOrKey || customEvent.detail.prefixOrKey.includes('settings')) {
        loadSettings();
      }
    };

    window.addEventListener('divya_cache_invalidated', handleInvalidation);
    return () => {
      active = false;
      window.removeEventListener('divya_cache_invalidated', handleInvalidation);
    };
  }, []);

  return { settings, loaded };
}
