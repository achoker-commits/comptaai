export const dynamic = 'force-static';

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — ComptaAI",
  description: "Conditions générales d'utilisation du service ComptaAI.",
};

const LAST_UPDATED = '6 avril 2026';
const CONTACT_EMAIL = 'contact@comptaai.fr';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <Link href="/" className="text-indigo-400 text-sm hover:underline mb-6 block">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl font-bold text-white mb-3">Conditions générales d&apos;utilisation</h1>
          <p className="text-gray-400 text-sm">Dernière mise à jour : {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Objet</h2>
            <p>
              Les présentes conditions régissent l&apos;utilisation de ComptaAI, service de comptabilité
              assistée par intelligence artificielle accessible via abonnement. En créant un compte,
              vous acceptez ces conditions sans réserve.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description du service</h2>
            <p>
              ComptaAI est un outil d&apos;aide à la comptabilité. Il permet d&apos;analyser des documents,
              de catégoriser des transactions et de répondre à des questions comptables.
            </p>
            <div className="mt-4 bg-yellow-950 border border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-300 text-sm font-medium mb-1">⚠️ Avertissement important</p>
              <p className="text-yellow-200 text-sm">
                ComptaAI est un outil d&apos;assistance, non un expert-comptable agréé. Les informations
                fournies ne constituent pas un conseil comptable ou fiscal officiel. Pour les décisions
                importantes, consultez un expert-comptable certifié.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Abonnements et paiements</h2>
            <ul className="space-y-2 list-none">
              {[
                'Les abonnements sont facturés mensuellement ou annuellement selon le plan choisi.',
                'Les paiements sont traités par Stripe. ComptaAI ne stocke aucune donnée de carte bancaire.',
                "L'abonnement se renouvelle automatiquement sauf résiliation avant la date d'échéance.",
                'Aucun remboursement partiel pour les périodes non utilisées.',
                "En cas d'échec de paiement, l'accès est suspendu après un délai de grâce de 7 jours.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Limites d&apos;utilisation</h2>
            <p>Chaque plan inclut des limites définies lors de la souscription (nombre de sociétés,
            documents par mois, accès à l&apos;agent IA). Ces limites sont vérifiées automatiquement.
            En cas de dépassement, une mise à niveau de plan est proposée.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Obligations de l&apos;utilisateur</h2>
            <ul className="space-y-2 list-none">
              {[
                "N'uploader que des documents vous appartenant ou pour lesquels vous avez autorisation.",
                'Ne pas tenter de contourner les limites techniques ou les contrôles d\'accès.',
                'Maintenir la confidentialité de vos identifiants de connexion.',
                'Utiliser le service conformément à la législation applicable.',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Disponibilité</h2>
            <p>
              Nous visons une disponibilité de 99,5% mais ne garantissons pas une disponibilité
              ininterrompue. Des maintenances planifiées peuvent entraîner des interruptions temporaires,
              communiquées à l&apos;avance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Résiliation</h2>
            <p>
              Vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord.
              Votre accès reste actif jusqu&apos;à la fin de la période payée. Vos données sont
              conservées 30 jours après résiliation puis définitivement supprimées, sauf obligation légale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Limitation de responsabilité</h2>
            <p>
              ComptaAI ne saurait être tenu responsable des erreurs dans les analyses IA, des décisions
              prises sur base des informations fournies, ou des pertes indirectes résultant de l&apos;utilisation
              du service. Notre responsabilité est limitée au montant de l&apos;abonnement mensuel payé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Droit applicable</h2>
            <p>
              Ces conditions sont régies par le droit français. Tout litige sera soumis aux
              tribunaux compétents de Paris, sauf disposition légale contraire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Contact</h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <Link href="/" className="text-indigo-400 hover:underline">Retour à l&apos;accueil</Link>
          {' · '}
          <Link href="/privacy" className="text-indigo-400 hover:underline">Politique de confidentialité</Link>
        </div>
      </div>
    </main>
  );
}
