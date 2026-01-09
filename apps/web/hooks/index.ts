'use client';

import { useAuth, useLanguage } from './useStore';
import { getTranslation } from '@kibei/i18n';

export function useTranslation() {
  const { language } = useLanguage();

  return {
    t: (key: string) => getTranslation(language, key),
    language,
  };
}

export function useUser() {
  return useAuth();
}
