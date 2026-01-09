'use client';

import { useTranslation } from '@/hooks';
import Link from 'next/link';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-4">Conditions d'Utilisation</h1>
          <p className="text-slate-300/80">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 md:p-10 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptation des Conditions</h2>
            <p className="text-slate-300/90 leading-relaxed">
              En accédant et en utilisant KiBei RDC (« la plateforme »), vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme. Ces conditions s'appliquent à tous les 
              utilisateurs de la plateforme, y compris les visiteurs, les utilisateurs enregistrés, les collecteurs, les modérateurs et les administrateurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description du Service</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              KiBei RDC est une plateforme de suivi national des prix et des taux de change en République Démocratique du Congo. 
              La plateforme permet :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>La consultation publique des prix des produits de base par marché, ville et province</li>
              <li>Le suivi des taux de change avec historique et sources</li>
              <li>La soumission de données par les collecteurs autorisés</li>
              <li>La validation et modération des données par les modérateurs</li>
              <li>La gestion administrative de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Compte Utilisateur</h2>
            <h3 className="text-xl font-medium mb-3 mt-6">3.1. Création de compte</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous vous engagez à :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la sécurité de votre compte et mot de passe</li>
              <li>Notifier immédiatement toute utilisation non autorisée de votre compte</li>
              <li>Être responsable de toutes les activités sous votre compte</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">3.2. Rôles et permissions</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              La plateforme attribue différents rôles avec des permissions spécifiques :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li><strong>Utilisateur public :</strong> Consultation des données, création de rapports</li>
              <li><strong>Collecteur :</strong> Soumission de prix et taux de change</li>
              <li><strong>Modérateur :</strong> Validation et modération des soumissions</li>
              <li><strong>Administrateur :</strong> Gestion complète de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Utilisation Acceptable</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Vous vous engagez à utiliser la plateforme de manière légale et conforme à ces conditions. Il est strictement interdit de :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Utiliser la plateforme à des fins illégales ou frauduleuses</li>
              <li>Transmettre des données fausses, trompeuses ou inexactes</li>
              <li>Tenter d'accéder à des zones restreintes ou à des comptes d'autres utilisateurs</li>
              <li>Utiliser des robots, scripts automatisés ou autres moyens pour accéder à la plateforme</li>
              <li>Perturber, désactiver ou endommager la plateforme ou ses serveurs</li>
              <li>Reproduire, dupliquer ou copier le contenu sans autorisation</li>
              <li>Utiliser la plateforme pour harceler, menacer ou nuire à autrui</li>
              <li>Violer les droits de propriété intellectuelle</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Soumission de Données</h2>
            <h3 className="text-xl font-medium mb-3 mt-6">5.1. Exactitude des données</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              En soumettant des données (prix, taux de change, rapports), vous garantissez que :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Les informations sont exactes et vérifiables</li>
              <li>Vous avez le droit de soumettre ces données</li>
              <li>Les données ne violent aucune loi ou réglementation</li>
              <li>Les données ne contiennent pas d'informations personnelles identifiables sans consentement</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">5.2. Modération</h3>
            <p className="text-slate-300/90 leading-relaxed">
              Toutes les soumissions sont soumises à modération. Les modérateurs peuvent rejeter, modifier ou supprimer 
              toute soumission qui ne respecte pas les standards de qualité ou les règles de la plateforme. 
              Les décisions de modération sont définitives.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Propriété Intellectuelle</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              La plateforme KiBei RDC, y compris son design, logo, code source et contenu, est protégée par les lois sur la propriété 
              intellectuelle de la République Démocratique du Congo et les conventions internationales.
            </p>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Les données publiques (prix et taux de change validés) sont mises à disposition sous licence ouverte pour usage public, 
              mais la plateforme elle-même reste propriété de KiBei RDC.
            </p>
            <p className="text-slate-300/90 leading-relaxed">
              Vous conservez les droits sur le contenu que vous soumettez, mais vous accordez à KiBei RDC une licence non exclusive 
              pour utiliser, afficher et distribuer ce contenu sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Disponibilité du Service</h2>
            <p className="text-slate-300/90 leading-relaxed">
              Nous nous efforçons de maintenir la plateforme accessible 24h/24 et 7j/7, mais nous ne garantissons pas une disponibilité 
              ininterrompue. La plateforme peut être temporairement indisponible pour maintenance, mises à jour ou pour des raisons 
              techniques. Nous ne serons pas responsables des dommages résultant de l'indisponibilité de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation de Responsabilité</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Dans les limites permises par la loi congolaise :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>KiBei RDC est fourni « tel quel » sans garantie d'aucune sorte</li>
              <li>Nous ne garantissons pas l'exactitude, la complétude ou l'actualité des données affichées</li>
              <li>Nous ne serons pas responsables des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation de la plateforme</li>
              <li>Les utilisateurs sont responsables de leurs propres décisions basées sur les données de la plateforme</li>
              <li>Nous ne garantissons pas que la plateforme sera exempte d'erreurs, de virus ou d'autres composants nuisibles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Indemnisation</h2>
            <p className="text-slate-300/90 leading-relaxed">
              Vous acceptez d'indemniser et de dégager KiBei RDC, ses dirigeants, employés et partenaires de toute réclamation, 
              perte, responsabilité et dépense (y compris les frais d'avocat) résultant de votre utilisation de la plateforme, 
              de votre violation de ces conditions ou de votre violation des droits d'autrui.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Suspension et Résiliation</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Nous nous réservons le droit de suspendre ou résilier votre accès à la plateforme à tout moment, sans préavis, 
              pour violation de ces conditions ou pour toute autre raison que nous jugeons appropriée, notamment :
            </p>
            <ul className="list-disc list-inside text-slate-300/90 space-y-2 ml-4">
              <li>Violation des conditions d'utilisation</li>
              <li>Activité frauduleuse ou suspecte</li>
              <li>Comportement nuisible à la communauté</li>
              <li>Demande des autorités compétentes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Modifications des Conditions</h2>
            <p className="text-slate-300/90 leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications importantes seront 
              communiquées par e-mail ou via une notification sur la plateforme. Votre utilisation continue de la plateforme après 
              ces modifications constitue votre acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Loi Applicable et Juridiction</h2>
            <p className="text-slate-300/90 leading-relaxed">
              Ces conditions d'utilisation sont régies par les lois de la République Démocratique du Congo. 
              Tout litige relatif à ces conditions sera soumis à la juridiction exclusive des tribunaux compétents de la RDC, 
              en particulier ceux de la Province du Lualaba.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Dispositions Générales</h2>
            <h3 className="text-xl font-medium mb-3 mt-6">13.1. Intégralité de l'accord</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Ces conditions, ainsi que la politique de confidentialité, constituent l'intégralité de l'accord entre vous et KiBei RDC 
              concernant l'utilisation de la plateforme.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">13.2. Divisibilité</h3>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Si une disposition de ces conditions est jugée invalide ou inapplicable, les autres dispositions restent en vigueur.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">13.3. Renonciation</h3>
            <p className="text-slate-300/90 leading-relaxed">
              Le fait de ne pas exercer un droit ou une disposition de ces conditions ne constitue pas une renonciation à ce droit ou cette disposition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact</h2>
            <p className="text-slate-300/90 leading-relaxed mb-4">
              Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter :
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
              En utilisant KiBei RDC, vous reconnaissez avoir lu, compris et accepté ces conditions d'utilisation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

