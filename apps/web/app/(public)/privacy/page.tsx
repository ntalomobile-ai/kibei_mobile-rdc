'use client';

import { useTranslation } from '@/hooks';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-300/80 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
          <p className="text-slate-300/80">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 md:p-10 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              KiBei RDC (« nous », « notre » ou « la plateforme ») s'engage à protéger la confidentialité et la sécurité 
              des données personnelles de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, 
              utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme de suivi 
              des prix et des taux de change en République Démocratique du Congo.
            </p>
            <p className="text-slate-300/90 leading-relaxed">
              En utilisant KiBei RDC, vous acceptez les pratiques décrites dans cette politique de confidentialité. 
              Si vous n'acceptez pas cette politique, veuillez ne pas utiliser notre plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Données Collectées</h2>
            <h3 className="text-xl font-medium mb-3 mt-6">2.1. Données personnelles</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous collectons les informations suivantes lorsque vous créez un compte ou utilisez nos services :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Nom et prénom</li>
              <li>Adresse e-mail</li>
              <li>Mot de passe (stocké de manière sécurisée et cryptée)</li>
              <li>Rôle utilisateur (collecteur, modérateur, administrateur, utilisateur public)</li>
              <li>Photo de profil (optionnelle)</li>
              <li>Informations de localisation (province, ville, marché) si vous soumettez des données</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2. Données techniques</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous collectons automatiquement certaines informations techniques :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Adresse IP</li>
              <li>Type de navigateur et version</li>
              <li>Système d'exploitation</li>
              <li>Pages visitées et durée de visite</li>
              <li>Date et heure d'accès</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.3. Données de contenu</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Si vous êtes collecteur ou modérateur, nous stockons les données que vous soumettez :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Prix des produits</li>
              <li>Taux de change</li>
              <li>Rapports et signalements</li>
              <li>Historique des soumissions et validations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Utilisation des Données</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous utilisons vos données personnelles pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li><strong>Fourniture des services :</strong> Permettre l'accès à la plateforme et aux fonctionnalités selon votre rôle</li>
              <li><strong>Authentification :</strong> Vérifier votre identité et gérer votre compte</li>
              <li><strong>Amélioration de la plateforme :</strong> Analyser l'utilisation pour améliorer nos services</li>
              <li><strong>Communication :</strong> Vous envoyer des notifications importantes concernant votre compte ou la plateforme</li>
              <li><strong>Modération :</strong> Assurer la qualité et la fiabilité des données publiées</li>
              <li><strong>Conformité légale :</strong> Respecter les obligations légales et réglementaires en RDC</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Partage des Données</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li><strong>Données publiques :</strong> Les prix et taux de change validés sont accessibles publiquement sans informations personnelles identifiables</li>
              <li><strong>Prestataires de services :</strong> Nous pouvons partager des données avec des prestataires techniques de confiance (hébergement, sécurité) sous contrat de confidentialité</li>
              <li><strong>Obligations légales :</strong> Si requis par la loi congolaise ou une autorité judiciaire compétente</li>
              <li><strong>Protection des droits :</strong> Pour protéger nos droits, votre sécurité ou celle d'autrui</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Sécurité des Données</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Chiffrement des mots de passe avec des algorithmes sécurisés</li>
              <li>Protection contre les accès non autorisés</li>
              <li>Sauvegardes régulières des données</li>
              <li>Surveillance continue de la sécurité</li>
              <li>Authentification sécurisée (tokens JWT)</li>
              <li>Protection contre les attaques courantes (CSRF, XSS, injection SQL)</li>
            </ul>
            <p className="text-slate-300/90 leading-relaxed mt-4">
              Malgré ces mesures, aucune méthode de transmission sur Internet n'est totalement sécurisée. 
              Nous ne pouvons garantir une sécurité absolue.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Conservation des Données</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Fournir les services demandés</li>
              <li>Respecter nos obligations légales</li>
              <li>Résoudre les litiges et faire respecter nos accords</li>
            </ul>
            <p className="text-slate-300/90 leading-relaxed mt-4">
              Les données de prix et de taux de change sont conservées indéfiniment pour maintenir l'historique public, 
              mais sans informations personnelles identifiables après validation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Vos Droits</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Conformément à la législation congolaise sur la protection des données, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données (sous réserve des obligations légales)</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données dans certains cas</li>
              <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
            </ul>
            <p className="text-slate-300/90 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à l'adresse indiquée dans la section « Contact » ci-dessous.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies et Technologies Similaires</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous utilisons des cookies et technologies similaires pour :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Maintenir votre session de connexion</li>
              <li>Mémoriser vos préférences</li>
              <li>Améliorer l'expérience utilisateur</li>
              <li>Analyser l'utilisation de la plateforme</li>
            </ul>
            <p className="text-slate-300/90 leading-relaxed mt-4">
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Données des Mineurs</h2>
            <p className="text-slate-300/90 leading-relaxed">
              KiBei RDC n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données 
              personnelles de mineurs. Si nous apprenons qu'un mineur nous a fourni des données personnelles, 
              nous prendrons des mesures pour supprimer ces informations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modifications de cette Politique</h2>
            <p className="text-slate-300/90 leading-relaxed">
              Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications importantes seront 
              communiquées par e-mail ou via une notification sur la plateforme. La date de « Dernière mise à jour » 
              en haut de cette page indique quand la politique a été révisée pour la dernière fois. 
              Votre utilisation continue de la plateforme après ces modifications constitue votre acceptation de la nouvelle politique.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Loi Applicable</h2>
            <p className="text-slate-300/90 leading-relaxed">
              Cette politique de confidentialité est régie par les lois de la République Démocratique du Congo. 
              Tout litige relatif à cette politique sera soumis à la juridiction exclusive des tribunaux compétents de la RDC.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Pour toute question, préoccupation ou demande concernant cette politique de confidentialité ou vos données personnelles, 
              vous pouvez nous contacter :
            </p>
            <div className="rounded-xl border border-white/10 bg-[#070A12]/40 p-6">
              <p className="text-slate-300/90 mb-2">
                <strong className="text-white">KiBei RDC</strong>
              </p>
              <p className="text-slate-300/90 mb-2">
                Plateforme de suivi des prix et taux de change
              </p>
              <p className="text-slate-300/90 mb-2">
                Province du Lualaba, République Démocratique du Congo
              </p>
              <p className="text-slate-300/90">
                <strong className="text-white">E-mail :</strong> contact@kibei.cd
              </p>
            </div>
          </section>

          <div className="pt-8 border-t border-white/10">
            <p className="text-center text-slate-300/70 text-sm">
              En utilisant KiBei RDC, vous reconnaissez avoir lu, compris et accepté cette politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

