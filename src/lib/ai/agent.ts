import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Tu es un expert-comptable belge certifié (IEC/IPCF) avec 20 ans d'expérience. Tu assistes des entreprises belges dans leur gestion comptable quotidienne.

Tes responsabilités :
- Analyser et catégoriser les documents comptables (factures, reçus, relevés bancaires)
- Calculer et préparer les déclarations de TVA belge (formulaire 625)
- Générer des bilans comptables et comptes de résultat selon les normes belges
- Répondre aux questions comptables et fiscales belges
- Appliquer le Plan Comptable Minimum Normalisé (PCMN) belge
- Respecter le Code des Sociétés et des Associations (CSA) belge

Taux TVA belges :
- 21% : taux normal (plupart des biens et services)
- 12% : taux réduit (produits alimentaires transformés, restaurants)
- 6% : taux réduit (alimentation de base, médicaments, livres, logements sociaux)
- 0% : exportations, opérations intracommunautaires

Catégories de charges (PCMN) :
- 60x : Achats de marchandises, matières premières
- 61x : Services et biens divers (loyers, honoraires, publicité)
- 62x : Rémunérations, charges sociales, pensions
- 63x : Amortissements et réductions de valeur
- 64x : Autres charges d'exploitation (taxes diverses)
- 65x : Charges financières
- 74x : Autres produits d'exploitation
- 70x : Chiffre d'affaires (ventes)

Numéros de TVA belges : format BE 0xxx.xxx.xxx
Formulaires clés : TVA 625 (mensuel/trimestriel), IPM (personnes morales), ICC (impôt communal des sociétés)

Format de tes réponses :
- Sois précis et professionnel
- Cite toujours le compte PCMN concerné
- Pour les montants, indique HTVA et TVAC avec le taux de TVA
- Si tu analyses un document, extrais : montant HTVA, TVA, TVAC, date, fournisseur, compte PCMN
- Mentionne le numéro de TVA intracommunautaire si présent (BE + numéro)
- Réponds toujours en français

⚠️ Rappelle toujours que tes analyses sont indicatives et qu'un expert-comptable ou réviseur d'entreprises agréé doit valider les déclarations officielles.`

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function chatWithAgent(
  messages: ChatMessage[],
  companyContext: string
): Promise<string> {
  const systemWithContext = `${SYSTEM_PROMPT}

Contexte de la société cliente :
${companyContext}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemWithContext,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  })

  const content = response.content[0]
  if (content.type !== 'text') return ''
  return content.text
}

export async function analyzeDocument(
  documentContent: string,
  documentType: string,
  fileBase64?: string,
  fileMime?: string
): Promise<{
  amount_ht?: number
  amount_tva?: number
  amount_ttc?: number
  date?: string
  vendor?: string
  category?: string
  pcg_account?: string
  description: string
}> {
  const prompt = `Analyse ce document comptable de type "${documentType}" et extrais les informations suivantes en JSON.
${!fileBase64 ? `\nContexte fichier :\n${documentContent}\n` : ''}
Réponds UNIQUEMENT avec un JSON valide contenant ces champs :
{
  "amount_ht": nombre ou null,
  "amount_tva": nombre ou null,
  "amount_ttc": nombre ou null,
  "tva_rate": nombre (ex: 20, 10, 5.5) ou null,
  "date": "YYYY-MM-DD" ou null,
  "vendor": "nom du fournisseur" ou null,
  "category": "description courte de la catégorie",
  "pcg_account": "numéro compte PCG (ex: 626000)" ou null,
  "description": "résumé en 1 phrase"
}`

  // Si le fichier réel est disponible (PDF ou image), on l'envoie à Claude pour analyse visuelle
  const userContent = fileBase64 && fileMime
    ? (fileMime === 'application/pdf'
      ? [
          { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: fileBase64 } },
          { type: 'text' as const, text: prompt },
        ]
      : fileMime.startsWith('image/')
      ? [
          { type: 'image' as const, source: { type: 'base64' as const, media_type: fileMime as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: fileBase64 } },
          { type: 'text' as const, text: prompt },
        ]
      : prompt)
    : prompt

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })

  const content = response.content[0]
  if (content.type !== 'text') return { description: 'Analyse impossible' }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { description: content.text }
    return JSON.parse(jsonMatch[0])
  } catch {
    return { description: content.text }
  }
}

export async function generateReport(
  transactions: Array<{
    label: string
    amount: number
    type: 'debit' | 'credit'
    category: string
    date: string
    tva_rate?: number
    tva_amount?: number
  }>,
  period: string,
  companyName: string
): Promise<string> {
  const totalRevenue = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  const tvaCollectee = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.tva_amount ?? t.amount * (t.tva_rate ?? 21) / 100), 0)

  const tvaDed = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (t.tva_amount ?? t.amount * (t.tva_rate ?? 21) / 100), 0)

  const tvaSolde = tvaCollectee - tvaDed

  const prompt = `Génère un rapport comptable mensuel complet pour la société belge "${companyName}" pour la période ${period}.

Données financières :
- Chiffre d'affaires (HTVA) : ${totalRevenue.toFixed(2)} €
- Charges totales (HTVA) : ${totalExpenses.toFixed(2)} €
- Résultat d'exploitation : ${(totalRevenue - totalExpenses).toFixed(2)} €
- Nombre de transactions : ${transactions.length}
- TVA collectée estimée (21%) : ${tvaCollectee.toFixed(2)} €
- TVA déductible estimée (21%) : ${tvaDed.toFixed(2)} €
- Solde TVA à payer/récupérer : ${tvaSolde.toFixed(2)} €

Détail des transactions :
${transactions.map(t => `- ${t.date} | ${t.label} | ${t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}€ | ${t.category}`).join('\n')}

Génère un rapport professionnel belge avec :
1. Résumé exécutif
2. Analyse du chiffre d'affaires (HTVA)
3. Analyse des charges par catégorie PCMN
4. Compte de résultat simplifié (normes belges)
5. Situation TVA (formulaire 625 — cases 00, 01, 54, 59)
6. Points d'attention et recommandations fiscales belges
7. Rappel des échéances (déclaration TVA, ISOC si applicable)`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') return 'Rapport non disponible'
  return content.text
}
