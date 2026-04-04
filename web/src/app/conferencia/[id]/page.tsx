'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Conferencia, AprovacaoCampo } from '@/lib/types'
import { ConferenciaTable } from '@/components/ConferenciaTable'
import { EvidenciaViewer, EvidenciaGallery } from '@/components/EvidenciaViewer'

function baseSO(so: string): string {
  return so.replace(/_remessa_\d+$/i, '')
}

function getBaseSOs(campos: { salesOrder: string }[]): string[] {
  return [...new Set(campos.map(c => baseSO(c.salesOrder)))]
}

const CACHE_PREFIX = 'bm_conf_'

interface CacheData {
  campos: Record<string, AprovacaoCampo>
  savedAt: string
}

function loadCache(id: string): CacheData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${id}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveCache(id: string, data: CacheData) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${CACHE_PREFIX}${id}`, JSON.stringify(data))
  } catch {}
}

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {message}
    </div>
  )
}

export default function ConferenciaDetailPage({ params }: { params: { id: string } }) {
  const [conf, setConf] = useState<Conferencia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvidencia, setSelectedEvidencia] = useState<string | null>(null)
  const [aprovacaoCampos, setAprovacaoCampos] = useState<Record<string, AprovacaoCampo>>({})
  const [showGallery, setShowGallery] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [cacheTime, setCacheTime] = useState<string | null>(null)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    fetch(`/api/conferencia/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Nao encontrada')
        return r.json()
      })
      .then((data: Conferencia) => {
        setConf(data)
        const cached = loadCache(params.id)
        if (cached && cached.campos && Object.keys(cached.campos).length > 0) {
          setAprovacaoCampos(cached.campos)
          setCacheTime(cached.savedAt || null)
        }
        setLoading(false)
        setTimeout(() => { initialLoadDone.current = true }, 100)
      })
      .catch(() => { setError('Conferencia nao encontrada'); setLoading(false) })
  }, [params.id])

  // Auto-save to localStorage
  useEffect(() => {
    if (!conf || !initialLoadDone.current) return
    const now = new Date().toLocaleTimeString()
    saveCache(params.id, { campos: aprovacaoCampos, savedAt: now })
    setCacheTime(now)
  }, [aprovacaoCampos, params.id, conf])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  const handleCampoAprovacao = useCallback((key: string, status: AprovacaoCampo['status'], obs: string) => {
    setAprovacaoCampos(prev => ({ ...prev, [key]: { status, obs } }))
  }, [])

  const handleApproveOrder = useCallback((so: string) => {
    if (!conf) return
    setAprovacaoCampos(prev => {
      const next = { ...prev }
      for (const c of conf.campos) {
        if (baseSO(c.salesOrder) === so) {
          const key = `${so}|${c.campo}`
          next[key] = { status: 'aprovado', obs: prev[key]?.obs || '' }
        }
      }
      return next
    })
  }, [conf])

  const handleRejectOrder = useCallback((so: string) => {
    if (!conf) return
    setAprovacaoCampos(prev => {
      const next = { ...prev }
      for (const c of conf.campos) {
        if (baseSO(c.salesOrder) === so) {
          const key = `${so}|${c.campo}`
          next[key] = { status: 'reprovado', obs: prev[key]?.obs || '' }
        }
      }
      return next
    })
  }, [conf])

  const handleBulkApproveAll = useCallback(() => {
    if (!conf) return
    setAprovacaoCampos(prev => {
      const next = { ...prev }
      for (const c of conf.campos) {
        const so = baseSO(c.salesOrder)
        const key = `${so}|${c.campo}`
        next[key] = { status: 'aprovado', obs: prev[key]?.obs || '' }
      }
      return next
    })
    showToast('Todos os campos marcados como aprovados')
  }, [conf])

  const handleExport = () => {
    window.open(`/api/export/${params.id}`, '_blank')
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar esta conferencia? Esta acao nao pode ser desfeita.')) return
    try {
      const res = await fetch(`/api/conferencia/${params.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem(`${CACHE_PREFIX}${params.id}`) } catch {}
      }
      window.location.href = '/conferencias'
    } catch {
      showToast('Erro ao deletar conferencia', 'error')
    }
  }

  const baseSOs = conf ? getBaseSOs(conf.campos) : []

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>
  if (error || !conf) return <div className="text-center py-12 text-red-500">{error}</div>

  const hasDivergencias = conf.totalDivergencia > 0

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {selectedEvidencia && (
        <EvidenciaViewer
          conferenciaId={conf.id}
          filename={selectedEvidencia}
          onClose={() => setSelectedEvidencia(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <a href="/conferencias" className="text-sm text-accent-500 hover:underline">&larr; Voltar</a>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{conf.fornecedor}</h1>
          <p className="text-gray-500">{baseSOs.join(', ')} — {conf.data}</p>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition p-1"
          title="Deletar conferencia"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Ordens" value={baseSOs.length} />
        <SummaryCard label="OK" value={conf.totalOK} color="text-green-700" />
        <SummaryCard label="Divergencias" value={conf.totalDivergencia} color="text-red-700" />
        <SummaryCard label="Evidencias" value={conf.evidencias.length} color="text-accent-700" />
      </div>

      {hasDivergencias && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          Atencao: {conf.totalDivergencia} divergencia(s) encontrada(s). Revise os campos marcados em vermelho.
        </div>
      )}

      {/* Comparison Table */}
      <ConferenciaTable
        conferenciaId={conf.id}
        campos={conf.campos}
        aprovacaoCampos={aprovacaoCampos}
        onCampoAprovacao={handleCampoAprovacao}
        onEvidenciaClick={setSelectedEvidencia}
        onApproveOrder={handleApproveOrder}
        onRejectOrder={handleRejectOrder}
      />

      {/* Evidence gallery */}
      {conf.evidencias.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
          >
            <span className="text-sm font-medium text-gray-700">
              Todas as Evidencias ({conf.evidencias.length})
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showGallery ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showGallery && (
            <div className="p-4">
              <EvidenciaGallery
                conferenciaId={conf.id}
                evidencias={conf.evidencias}
                onSelect={setSelectedEvidencia}
              />
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-4 sticky bottom-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBulkApproveAll}
            className="bg-accent-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent-600 transition"
          >
            Aprovar Tudo
          </button>
          <button
            onClick={handleExport}
            className="border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition"
          >
            Exportar CSV
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            {cacheTime && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Salvo localmente: {cacheTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color = 'text-gray-900' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
