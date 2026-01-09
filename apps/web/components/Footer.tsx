'use client';

import { useTranslation } from '@/hooks';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#070A12]/40 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="mb-3">
              <Logo size="md" showText={true} />
            </div>
            <p className="text-slate-300/80 text-sm">
              Suivi national des prix et des taux de change en RDC
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.about')}</h4>
            <ul className="text-slate-300/80 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.privacy')}</h4>
            <ul className="text-slate-300/80 text-sm space-y-2">
              <li>
                <a href="/privacy" className="hover:text-white">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white">
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-slate-300/70 text-sm">
          <p>&copy; 2024 KiBei. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
