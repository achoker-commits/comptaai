'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Company { id: string; name: string }
interface Message { role: 'user' | 'assistant'; content: string }

const suggestions = [
  'Quelle est ma TVA à déclarer ce trimestre ?',
  'Explique-moi la différence entre TVA collectée et déductible',
  'Comment catégoriser un repas d\'affaires ?',
  'Quand dois-je déclarer ma TVA ?',
  'Qu\'est-ce que le compte 626 en PCG ?',
]

export function ChatInterface({ companies }: { companies: Company[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis votre agent comptable IA. Je suis là pour répondre à toutes vos questions comptables et fiscales françaises.\n\nJe connais le Plan Comptable Général (PCG), les règles de TVA, et je peux analyser vos données financières. Comment puis-je vous aider aujourd'hui ?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newMessages.slice(-20), // garde les 20 derniers messages
        companyId: selectedCompany || null,
      }),
    })

    const data = await response.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
      {/* Sélecteur de société */}
      {companies.length > 0 && (
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
          <span className="text-sm text-gray-500">Contexte :</span>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
          >
            <option value="">Général (sans société)</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedCompany && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              ✓ L&apos;agent connaît vos données financières
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                <span className="text-white text-xs font-bold">IA</span>
              </div>
            )}
            <div
              className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mr-3">
              <span className="text-white text-xs font-bold">IA</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Posez votre question comptable..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={loading}
          />
          <Button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} size="lg">
            Envoyer
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Les réponses sont indicatives. Consultez un expert-comptable pour les actes officiels.
        </p>
      </div>
    </div>
  )
}
