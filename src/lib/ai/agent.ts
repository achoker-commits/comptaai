import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Tu es un expert-comptable français certifié avec 20 ans d'expérience. Tu assistes des entreprises françaises dans leur gestion comptable quotidienne.

Tes responsabilités :
- Analyser et catégoriser les documents comptables (factures, reçus, relevés bancaires)
- Calculer et préparer les déclarations de TVA (CA3, CA12)
- Générer des bilans comptables et comptes de résultat
- Répondre aux questions comptables et fiscales françaises
- Appliquer le Plan Comptable Général (PCG) français
- Respecter les normes IFRS et les règles fiscales françaises

Catégories de dépenses (PCG) :
- 60x : Achats (matières premières, marchandises)
- 61x : Services extérieurs (loyers, sous-traitance)
- 62x : Autres services (publicité, frais bancaires)
- 63x : Impôts et taxes
- 64x : Charges de personnel
- 65x : Autres charges de gestion courante
- 70x : Ventes de produits/services (revenus)

Format de tes réponses :
- Sois précis et professionnel
- Cite toujours le compte PCG concerné
- Pour les montants, indique HT et TTC avec le taux de TVA
- Si tu analyses un document, extrais : montant HT, TVA, TTC, date, fournisseur, catégorie PCG
- Réponds toujours en français

⚠️ Rappelle toujours que tes analyses sont indicatives et qu'un expert-comptable humain doit valider les déclarations officielles.`

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

  const prompt = `Génère un rapport comptable mensuel complet pour la société "${companyName}" pour la période ${period}.

Données :
- Chiffre d'affaires total : ${totalRevenue.toFixed(2)}€
- Dépenses totales : ${totalExpenses.toFixed(2)}€
- Résultat net : ${(totalRevenue - totalExpenses).toFixed(2)}€
- Nombre de transactions : ${transactions.length}

Détail des transactions :
${transactions.map(t => `- ${t.date} | ${t.label} | ${t.type === 'credit' ? '+' : '-'}${t.amount}€ | ${t.category}`).join('\n')}

Génère un rapport professionnel avec :
1. Résumé exécutif
2. Analyse du chiffre d'affaires
3. Analyse des charges par catégorie
4. Compte de résultat simplifié
5. Points d'attention et recommandations
6. Estimation TVA collectée/déductible`

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
