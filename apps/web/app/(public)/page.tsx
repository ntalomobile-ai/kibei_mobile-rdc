'use client';

import { useTranslation } from '@/hooks';
import { Button } from '@kibei/ui';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Logo } from '@/components/Logo';

// Images du patronage - S.E. Madame Fifi MASUKA SAINI
const patronageImages = [
  {
    src: '/images/patronage/FIFI_MASUKA_GOUVERNEURE.jpg',
    alt: 'S.E. Madame Fifi MASUKA SAINI - Portrait officiel en tant que Gouverneure',
    caption: 'S.E. Madame Fifi MASUKA SAINI — Gouverneure de la Province du Lualaba, symbole de leadership et d\'engagement pour le développement provincial.'
  },
  {
    src: '/images/patronage/fifi-masuka-saini-aux-cotes-de-felix-tshisekedi.webp',
    alt: 'S.E. Madame Fifi MASUKA SAINI aux côtés du Président Félix TSHISEKEDI',
    caption: 'Aux côtés de S.E. le Président Félix TSHISEKEDI — Engagement fort pour la mise en œuvre des politiques publiques de stabilisation économique.'
  },
  {
    src: '/images/patronage/reçue par le président.jpg',
    alt: 'S.E. Madame Fifi MASUKA SAINI reçue par le Président de la République',
    caption: 'Reçue par le Chef de l\'État — Moment privilégié d\'échange sur les enjeux du développement du Lualaba et de la RDC.'
  },
  {
    src: '/images/patronage/patronage-1.jpg.jpeg',
    alt: 'S.E. Madame Fifi MASUKA SAINI avec le Président de la République',
    caption: 'Rencontre officielle avec S.E. le Président Félix TSHISEKEDI — Alignement avec la vision présidentielle pour la protection du pouvoir d\'achat.'
  },
  {
    src: '/images/patronage/patronage-3.jpg.jpg',
    alt: 'S.E. Madame Fifi MASUKA SAINI - Cérémonie d\'installation',
    caption: 'Cérémonie d\'installation comme Gouverneure — Engagement solennel pour servir la population du Lualaba avec dévouement et transparence.'
  },
  {
    src: '/images/patronage/patronage-4.jpg.jpg',
    alt: 'S.E. Madame Fifi MASUKA SAINI - Discours officiel',
    caption: 'Discours officiel — Présentation de la vision et des priorités pour le développement économique et social de la province.'
  },
  {
    src: '/images/patronage/la gouv avec le président de l\'assemblée provinciale du Lualaba.jpeg',
    alt: 'S.E. Madame Fifi MASUKA SAINI avec le Président de l\'Assemblée Provinciale du Lualaba',
    caption: 'Avec le Président de l\'Assemblée Provinciale — Collaboration institutionnelle pour la mise en œuvre des politiques provinciales.'
  },
  {
    src: '/images/patronage/la gouv avec le secretaire du partie UDPS.jpeg',
    alt: 'S.E. Madame Fifi MASUKA SAINI avec le Secrétaire du Parti UDPS',
    caption: 'Avec le Secrétaire du Parti UDPS — Échange sur les orientations politiques et le renforcement de la démocratie participative.'
  },
  {
    src: '/images/patronage/Masuka.jpg',
    alt: 'S.E. Madame Fifi MASUKA SAINI - Portrait',
    caption: 'Portrait officiel — Représentation de l\'autorité et de la détermination dans le service public.'
  },
  {
    src: '/images/patronage/bras soulevé.jfif',
    alt: 'S.E. Madame Fifi MASUKA SAINI - Moment de célébration',
    caption: 'Moment de célébration — Symbole d\'espoir et d\'engagement pour un avenir meilleur pour tous les Congolais.'
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % patronageImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + patronageImages.length) % patronageImages.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                <span className="h-2 w-2 rounded-full bg-[#FCD116] shadow-[0_0_14px_rgba(252,209,22,0.35)]" />
                Plateforme RDC — données publiques & vérifiées
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                KiBei RDC
              </h1>
              <p className="mt-4 text-lg text-slate-300/80">
                Suivi national des <span className="text-white">prix</span> et des <span className="text-white">taux de change</span>,
                présenté de manière claire, rapide et professionnelle.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/prices">
                  <Button size="lg">{t('nav.prices')}</Button>
                </Link>
                <Link href="/exchange-rates">
                  <Button variant="outline" size="lg">
                    {t('nav.exchangeRates')}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="lg">
                    {t('nav.login')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300/70">Raccourcis</p>
                  <p className="text-xl font-semibold text-white mt-1">Accès rapide</p>
                </div>
                <Logo size="sm" />
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-[#070A12]/40 p-4">
                  <p className="text-xs text-slate-300/70">Prix</p>
                  <p className="text-lg font-semibold text-white mt-1">Produits de base</p>
                  <p className="text-sm text-slate-300/80 mt-2">
                    Comparer par marché, ville et province.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#070A12]/40 p-4">
                  <p className="text-xs text-slate-300/70">Taux</p>
                  <p className="text-lg font-semibold text-white mt-1">FX</p>
                  <p className="text-sm text-slate-300/80 mt-2">
                    Lecture simple, historique et source.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-[#070A12]/40 p-4">
                <p className="text-xs text-slate-300/70">Identité RDC</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00A3E0]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#CE1126]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FCD116]" />
                  <span className="ml-2 text-sm text-slate-300/80">Bleu / Rouge / Jaune + Blanc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center mb-4">
                <span className="h-2 w-2 rounded-full bg-[#00A3E0]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Suivi des Prix</h3>
              <p className="text-slate-300/80 mt-2 text-sm">
                Consultez les prix des produits de base par marché, ville et province.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center mb-4">
                <span className="h-2 w-2 rounded-full bg-[#CE1126]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Taux de Change</h3>
              <p className="text-slate-300/80 mt-2 text-sm">
                Accédez aux taux validés, avec source et date de publication.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center mb-4">
                <span className="h-2 w-2 rounded-full bg-[#FCD116]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Multilangue</h3>
              <p className="text-slate-300/80 mt-2 text-sm">
                Disponible en français, swahili et lingala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patronage Section */}
      <section className="py-16 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00A3E0]/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FCD116]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FCD116]/30 bg-[#FCD116]/10 px-4 py-1.5 text-xs text-[#FCD116] uppercase tracking-widest font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Initiative Officielle
            </div>
          </div>
          
          <div className="rounded-3xl border border-[#FCD116]/20 bg-gradient-to-br from-[#070A12] via-[#0A1628] to-[#070A12] shadow-[0_0_60px_rgba(252,209,22,0.08)] p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Official Emblem/Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#00A3E0] via-[#0066B3] to-[#00A3E0] p-1 shadow-[0_0_40px_rgba(0,163,224,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#070A12] flex items-center justify-center">
                      <div className="text-center">
                        <div className="flex justify-center gap-1 mb-1">
                          <span className="h-2 w-2 rounded-full bg-[#00A3E0]" />
                          <span className="h-2 w-2 rounded-full bg-[#CE1126]" />
                          <span className="h-2 w-2 rounded-full bg-[#FCD116]" />
                        </div>
                        <span className="text-xs font-bold text-white/80 tracking-wider">RDC</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">LUALABA</div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FCD116]/20 animate-[spin_20s_linear_infinite]" style={{ margin: '-8px', width: 'calc(100% + 16px)', height: 'calc(100% + 16px)' }} />
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-[#FCD116]/80 font-medium mb-2">
                  Sous le Haut Patronage de
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  S.E. Madame Fifi MASUKA SAINI
                </h3>
                <p className="text-lg text-slate-300 font-medium mb-4">
                  Gouverneur de la Province du Lualaba
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-400">
                  <svg className="w-4 h-4 text-[#00A3E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>République Démocratique du Congo</span>
                </div>
              </div>
            </div>
            
            {/* Bottom decorative line with colors of DRC */}
            <div className="mt-8 flex items-center gap-0 rounded-full overflow-hidden h-1">
              <div className="flex-1 bg-[#00A3E0]" />
              <div className="w-8 bg-[#CE1126]" />
              <div className="flex-1 bg-[#FCD116]" />
            </div>
          </div>
          
          <p className="text-center text-sm text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Ce projet s'inscrit pleinement dans la vision de <span className="text-white font-medium">Son Excellence Monsieur le Président de la République Félix Antoine TSHISEKEDI TSHILOMBO</span>, Chef de l'État, qui a fait de la protection du pouvoir d'achat des ménages congolais et de la stabilisation du taux de change des axes majeurs de son action publique.
          </p>

          {/* Carousel d'images */}
          <div className="mt-10 relative">
            <div className="rounded-2xl border border-white/10 bg-[#070A12]/60 backdrop-blur overflow-hidden shadow-[0_0_40px_rgba(0,163,224,0.1)]">
              {/* Main image container */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                {patronageImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentSlide
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-transparent to-transparent" />
                  </div>
                ))}

                {/* Navigation arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  aria-label="Image précédente"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  aria-label="Image suivante"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <p className="text-white font-medium text-sm md:text-base">
                    {patronageImages[currentSlide]?.caption}
                  </p>
                </div>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 py-4 bg-[#070A12]/80">
                {patronageImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-8 h-2 bg-[#FCD116]'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Aller à l'image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#00A3E0]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#FCD116]/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Pilot Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Province Pilote</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
            <h3 className="text-2xl font-bold mb-4 text-white">Lualaba — Kolwezi</h3>
            <p className="text-slate-300/80 mb-4">
              Notre plateforme démarre avec la province de Lualaba, en particulier la ville de Kolwezi,
              pour un suivi optimal des prix et des taux de change.
            </p>
            <p className="text-slate-300/70">
              Cette phase pilote nous permettra de valider notre approche avant une expansion nationale.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10">
            <h2 className="text-3xl font-bold mb-4 text-white">Contribuer aux Données</h2>
            <p className="text-lg text-slate-300/80 mb-8">
            Êtes-vous collecteur ou modérateur? Connectez-vous pour soumettre et valider les données.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-[#070A12] hover:bg-white/90 shadow-[0_10px_30px_rgba(252,209,22,0.12)]">
                Se Connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
