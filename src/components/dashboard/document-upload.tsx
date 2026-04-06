'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Company {
  id: string
  name: string
}

export function DocumentUpload({ companies }: { companies: Company[] }) {
  const router = useRouter()
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')

  const onDrop = useCallback(async (files: File[]) => {
    if (!selectedCompany || files.length === 0) return
    setUploading(true)

    for (const file of files) {
      setProgress(`Envoi de ${file.name}...`)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Upload dans Supabase Storage
      const path = `${user!.id}/${selectedCompany}/${Date.now()}_${file.name}`
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(path, file)

      if (storageError) {
        setProgress(`Erreur pour ${file.name}`)
        continue
      }

      // Enregistrer en DB
      setProgress(`Analyse de ${file.name} par l'IA...`)
      await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          storagePath: path,
          companyId: selectedCompany,
          fileType: file.type,
        }),
      })
    }

    setProgress('Import terminé !')
    setUploading(false)
    setTimeout(() => setProgress(''), 3000)
    router.refresh()
  }, [selectedCompany, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/csv': ['.csv'],
    },
    disabled: uploading || !selectedCompany,
  })

  return (
    <div className="space-y-4">
      {/* Sélection société */}
      {companies.length > 1 && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Société concernée
          </label>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {companies.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-gray-600 font-medium">Créez d&apos;abord une société</p>
          <p className="text-sm text-gray-400 mt-1">Les documents sont liés à une société</p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <>
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent mb-4" />
              <p className="text-gray-600 font-medium">{progress}</p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-3">📤</p>
              <p className="text-gray-700 font-medium">
                {isDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez vos documents'}
              </p>
              <p className="text-sm text-gray-400 mt-1">ou cliquez pour sélectionner</p>
              <p className="text-xs text-gray-400 mt-3">PDF, Images (PNG, JPG) · L&apos;IA analyse automatiquement</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
