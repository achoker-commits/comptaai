import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDocument } from '@/lib/ai/agent'
import { checkPlanLimit } from '@/lib/subscription'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const limit = await checkPlanLimit('docs_per_month')
  if (!limit.allowed) return Response.json({ error: limit.reason }, { status: 403 })

  const { fileName, storagePath, companyId, fileType } = await request.json()

  // Détecter le type de document à partir du nom
  const lowerName = fileName.toLowerCase()
  let docType: 'invoice' | 'receipt' | 'bank_statement' | 'other' = 'other'
  if (lowerName.includes('facture') || lowerName.includes('invoice')) docType = 'invoice'
  else if (lowerName.includes('reçu') || lowerName.includes('receipt') || lowerName.includes('ticket')) docType = 'receipt'
  else if (lowerName.includes('relevé') || lowerName.includes('bank') || lowerName.includes('extrait')) docType = 'bank_statement'

  // Télécharger le fichier depuis Supabase Storage et envoyer le contenu réel à l'IA
  let documentContent = `Nom du fichier : ${fileName}\nType MIME : ${fileType}\nType détecté : ${docType}`
  let fileBase64: string | undefined
  let fileMime: string | undefined

  try {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: fileData } = await adminSupabase.storage
      .from('documents')
      .download(storagePath)

    if (fileData) {
      const buffer = await fileData.arrayBuffer()
      fileBase64 = Buffer.from(buffer).toString('base64')
      fileMime = fileType || 'application/pdf'
    }
  } catch {
    // Fallback : analyse par nom de fichier si le téléchargement échoue
  }

  const analysis = await analyzeDocument(documentContent, docType, fileBase64, fileMime)

  // Sauvegarder en DB
  const { data: doc } = await supabase.from('documents').insert({
    user_id: user.id,
    company_id: companyId,
    name: fileName,
    type: docType,
    storage_path: storagePath,
    amount: analysis.amount_ttc || analysis.amount_ht || null,
    category: analysis.category || null,
    date: analysis.date || null,
    vendor: analysis.vendor || null,
    processed: true,
  }).select().single()

  // Si montant extrait, créer une transaction
  if (doc && analysis.amount_ht) {
    await supabase.from('transactions').insert({
      company_id: companyId,
      document_id: doc.id,
      label: analysis.vendor ? `${analysis.vendor} — ${analysis.category || fileName}` : fileName,
      amount: Math.abs(analysis.amount_ht),
      type: docType === 'invoice' && analysis.amount_ht > 0 ? 'credit' : 'debit',
      category: analysis.category || 'Non catégorisé',
      date: analysis.date || new Date().toISOString().split('T')[0],
    })
  }

  return Response.json({ success: true, analysis })
}
