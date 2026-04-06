export const dynamic = 'force-static';

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — ComptaAI',
  description: 'Politique de confidentialité et traitement des données personnelles de ComptaAI.',
};

const LAST_UPDATED = '6 avril 2026';
const CONTACT_EMAIL = 'privacy@comptaai.fr';
const COMPANY_NAME = 'ComptaAI';
const DATA_HOST = 'Supabase (serveurs UE)';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-indigo-400 text-sm hover:underline mb-6 block">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="text-3xl font-bold text-white mb-3">Politique de confidentialité</h1>
          <p className="text-gray-400 text-sm">Dernière mise à jour : {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Responsable du traitement</h2>
            <p>
              {COMPANY_NAME} est responsable du traitement de vos données personnelles dans le cadre de
              l&apos;utilisation de notre service de comptabilité assistée par intelligence artificielle.
            </p>
            <p className="mt-3">
              Contact : <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Données collectées</h2>
            <ul className="space-y-3 list-none">
              {[
                { label: 'Données de compte', detail: 'Adresse email, nom, mot de passe hashé.' },
                { label: 'Données de sociétés', detail: 'Nom, SIREN, adresse, régime TVA des sociétés que vous gérez.' },
                { label: 'Documents comptables', detail: 'Factures, reçus et relevés que vous uploadez pour analyse.' },
                { label: 'Conversations IA', detail: 'Historique de vos échanges avec l\'agent comptable.' },
                { label: 'Données de facturation', detail: 'Informations de paiement gérées par Stripe (jamais stockées directement).' },
                { label: 'Données d\'usage', detail: 'Pages visitées, fonctionnalités utilisées, pour améliorer le service.' },
              ].map(({ label, detail }) => (
                <li key={label} className="flex gap-3">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                  <span><strong className="text-white">{label}</strong> : {detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Finalités du traitement</h2>
            <ul className="space-y-2 list-none">
              {[
                'Fourniture du service de comptabilité assistée par IA',
                'Authentification et gestion de votre compte',
                'Facturation et gestion des abonnements',
                'Amélioration des fonctionnalités et de la qualité du service',
                'Support client et assistance technique',
                'Respect de nos obligations légales et fiscales',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Base légale</h2>
            <p>
              Le traitement de vos données repose sur : l&apos;exécution du contrat (fourniture du service),
              votre consentement (communications marketing), et nos obligations légales (conservation des
              documents comptables).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Hébergement et sécurité</h2>
            <p>
              Vos données sont hébergées sur <strong className="text-white">{DATA_HOST}</strong>,
              conformément au RGPD. Les données sont chiffrées en transit (TLS) et au repos.
              Chaque société est isolée par des règles de sécurité au niveau des lignes (Row Level Security).
            </p>
            <p className="mt-3">
              Les documents que vous uploadez sont analysés par l&apos;API Claude d&apos;Anthropic. Anthropic
              n&apos;utilise pas vos données pour entraîner ses modèles dans le cadre des API professionnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Durée de conservation</h2>
            <ul className="space-y-2 list-none">
              {[
                { item: 'Documents comptables', duration: '10 ans (obligation légale française)' },
                { item: 'Données de compte', duration: "Durée de l'abonnement + 3 ans" },
                { item: 'Conversations IA', duration: '1 an glissant (supprimées automatiquement)' },
                { item: 'Logs de facturation', duration: '5 ans (obligation fiscale)' },
              ].map(({ item, duration }) => (
                <li key={item} className="flex gap-3">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                  <span><strong className="text-white">{item}</strong> : {duration}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Partage avec des tiers</h2>
            <p>
              Nous ne vendons jamais vos données. Vos données peuvent être partagées uniquement avec :
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                { name: 'Stripe', role: 'Paiements — conformité PCI DSS' },
                { name: 'Supabase', role: 'Hébergement base de données — serveurs UE' },
                { name: 'Anthropic', role: 'Traitement IA des documents — sans réentraînement' },
              ].map(({ name, role }) => (
                <li key={name} className="flex gap-3">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                  <span><strong className="text-white">{name}</strong> : {role}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Vos droits (RGPD)</h2>
            <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { right: 'Accès', desc: 'Obtenir une copie de vos données' },
                { right: 'Rectification', desc: 'Corriger des données inexactes' },
                { right: 'Effacement', desc: 'Supprimer votre compte et données' },
                { right: 'Portabilité', desc: 'Exporter vos données (JSON/CSV)' },
                { right: 'Opposition', desc: 'Refuser certains traitements' },
                { right: 'Limitation', desc: 'Restreindre le traitement' },
              ].map(({ right, desc }) => (
                <div key={right} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                  <div className="font-semibold text-white text-sm">{right}</div>
                  <div className="text-gray-400 text-sm mt-1">{desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Pour exercer ces droits : <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>
              {' '}— Réponse sous 30 jours. Vous pouvez également saisir la{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">CNIL</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Cookies</h2>
            <p>
              Nous utilisons uniquement les cookies strictement nécessaires au fonctionnement du service
              (session d&apos;authentification). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou à vos données personnelles :
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block mt-3 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Contacter la DPO
            </a>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <Link href="/" className="text-indigo-400 hover:underline">Retour à l&apos;accueil</Link>
          {' · '}
          <Link href="/terms" className="text-indigo-400 hover:underline">Conditions générales</Link>
        </div>
      </div>
    </main>
  );
}
