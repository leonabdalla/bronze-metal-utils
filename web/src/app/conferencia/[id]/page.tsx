'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Conferencia, Aprovacao, AprovacaoCampo } from '@/lib/types'
import { ConferenciaTable } from '@/components/ConferenciaTable'
import { EvidenciaViewer, EvidenciaGallery } from '@/components/EvidenciaViewer'
import { AprovacaoStatusBadge } from '@/components/StatusBadge'

/** Extract base SO: SO_0063000_remessa_1 → SO_0063000 */
function baseSO(so: string): string {
  return so.replace(/_remessa_\d+$/i, '')
}

/** Get unique base SOs from campos */
function getBaseSOs(campos: { salesOrder: string }[]): string[] {
  return [...new Set(campos.map(c => baseSO(c.salesOrder)))]
}

// --- localStorage helpers ---
const CACHE_PREFIX = 'bm_conf_'

interface CacheData {
  campos: Record<string, AprovacaoCampo>
  email: string
  obs: string
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
  } catch { /* quota */ }
}

function clearCache(id: string) {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(`${CACHE_PREFIX}${id}`) } catch {}
}

// --- Toast notification ---
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${
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
  const [emailAprovador, setEmailAprovador] = useState('')
  const [observacaoGeral, setObservacaoGeral] = useState('')
  const [saving, setSaving] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [cacheTime, setCacheTime] = useState<string | null>(null)

  // Guard: skip auto-save until initial load is done
  const initialLoadDone = useRef(false)

  // Load data: cache > server
  useEffect(() => {
    fetch(`/api/conferencia/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Nao encontrada')
        return r.json()
      })
      .then((data: Conferencia) => {
        setConf(data)

        const cached = loadCache(params.id)

        // CACHE wins over server — it has the user's latest in-progress work
        if (cached && cached.campos && Object.keys(cached.campos).length > 0) {
          setAprovacaoCampos(cached.campos)
          setEmailAprovador(cached.email || '')
          setObservacaoGeral(cached.obs || '')
          setCacheTime(cached.savedAt || null)
        } else if (data.aprovacao?.campos) {
          // Fallback to server data
          setAprovacaoCampos(data.aprovacao.campos)
          setEmailAprovador(data.aprovacao.emailAprovador || '')
          setObservacaoGeral(data.aprovacao.observacaoGeral || '')
        }

        setLoading(false)
        // Allow auto-save after a tick so initial state is settled
        setTimeout(() => { initialLoadDone.current = true }, 100)
      })
      .catch(() => { setError('Conferencia nao encontrada'); setLoading(false) })
  }, [params.id])

  // Auto-save to localStorage on every change (after initial load)
  useEffect(() => {
    if (!conf || !initialLoadDone.current) return
    const now = new Date().toLocaleTimeString()
    saveCache(params.id, {
      campos: aprovacaoCampos,
      email: emailAprovador,
      obs: observacaoGeral,
      savedAt: now,
    })
    setCacheTime(now)
  }, [aprovacaoCampos, emailAprovador, observacaoGeral, params.id, conf])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  // Reload from server (discard local cache)
  const handleReloadFromServer = useCallback(async () => {
    if (!confirm('Isso vai descartar suas edicoes locais e carregar os dados salvos no servidor. Continuar?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/conferencia/${params.id}`)
      if (!res.ok) throw new Error()
      const data: Conferencia = await res.json()
      setConf(data)
      if (data.aprovacao?.campos) {
        setAprovacaoCampos(data.aprovacao.campos)
        setEmailAprovador(data.aprovacao.emailAprovador || '')
        setObservacaoGeral(data.aprovacao.observacaoGeral || '')
      } else {
        setAprovacaoCampos({})
        setEmailAprovador('')
        setObservacaoGeral('')
      }
      clearCache(params.id)
      setCacheTime(null)
      showToast('Dados carregados do servidor')
    } catch {
      showToast('Erro ao carregar do servidor', 'error')
    }
    setLoading(false)
  }, [params.id])

  // Save draft to server (persist aprovacao.json) without final approval
  const handleSaveDraft = async () => {
    if (!conf) return
    setSaving(true)
    const aprovacao: Aprovacao = {
      status: 'pendente',
      aprovadoPor: emailAprovador.trim() ? emailAprovador.trim().split('@')[0] : '',
      emailAprovador: emailAprovador.trim(),
      dataAprovacao: new Date().toISOString(),
      campos: aprovacaoCampos,
      observacaoGeral: observacaoGeral.trim(),
    }
    try {
      const res = await fetch(`/api/conferencia/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aprovacao),
      })
      if (!res.ok) throw new Error()
      setConf(prev => prev ? { ...prev, aprovacao } : null)
      showToast('Rascunho salvo no servidor (aprovacao.json)')
    } catch {
      showToast('Erro ao salvar rascunho', 'error')
    }
    setSaving(false)
  }

  const handleCampoAprovacao = useCallback((key: string, status: AprovacaoCampo['status'], obs: string) => {
    setAprovacaoCampos(prev => ({ ...prev, [key]: { status, obs } }))
  }, [])

  // Per-order: approve all campos in a SO
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

  // Bulk: approve ALL campos
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

  // Get unique base SOs
  const baseSOs = conf ? getBaseSOs(conf.campos) : []

  // Count completed per SO
  const soStats = conf ? baseSOs.map(so => {
    const soCampos = conf.campos.filter(c => baseSO(c.salesOrder) === so)
    const completed = soCampos.filter(c => {
      const key = `${so}|${c.campo}`
      return aprovacaoCampos[key]?.status && aprovacaoCampos[key]?.status !== 'pendente'
    }).length
    return { so, total: soCampos.length, completed, allDone: completed === soCampos.length }
  }) : []

  const totalCamposConsolidated = soStats.reduce((s, x) => s + x.total, 0)
  const totalCompleted = soStats.reduce((s, x) => s + x.completed, 0)
  const allFieldsCompleted = totalCompleted === totalCamposConsolidated && totalCamposConsolidated > 0

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSave = async (globalStatus: Aprovacao['status']) => {
    if (!conf) return
    if (!emailAprovador.trim() || !isValidEmail(emailAprovador.trim())) {
      showToast('Informe um email valido para aprovar.', 'error')
      return
    }
    if (globalStatus === 'aprovado' && !allFieldsCompleted) {
      showToast('Revise todos os campos antes de aprovar.', 'error')
      return
    }
    setSaving(true)
    const aprovacao: Aprovacao = {
      status: globalStatus,
      aprovadoPor: emailAprovador.trim().split('@')[0],
      emailAprovador: emailAprovador.trim(),
      dataAprovacao: new Date().toISOString(),
      campos: aprovacaoCampos,
      observacaoGeral: observacaoGeral.trim(),
    }
    try {
      const res = await fetch(`/api/conferencia/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aprovacao),
      })
      if (!res.ok) throw new Error()
      setConf(prev => prev ? { ...prev, statusAprovacao: globalStatus, aprovacao } : null)
      clearCache(params.id)
      setCacheTime(null)
      showToast(
        globalStatus === 'aprovado'
          ? 'Conferencia aprovada e salva!'
          : 'Conferencia reprovada e salva.'
      )
    } catch {
      showToast('Erro ao salvar aprovacao', 'error')
    }
    setSaving(false)
  }

  const handleExport = () => {
    window.open(`/api/export/${params.id}?aprovacao=true`, '_blank')
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar esta conferencia? Esta acao nao pode ser desfeita.')) return
    try {
      const res = await fetch(`/api/conferencia/${params.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      clearCache(params.id)
      window.location.href = '/conferencias'
    } catch {
      showToast('Erro ao deletar conferencia', 'error')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>
  if (error || !conf) return <div className="text-center py-12 text-red-500">{error}</div>

  const hasDivergencias = conf.totalDivergencia > 0

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
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
        <div className="flex items-center gap-3">
          <AprovacaoStatusBadge status={conf.statusAprovacao} />
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
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <SummaryCard label="Ordens" value={baseSOs.length} />
        <SummaryCard label="OK" value={conf.totalOK} color="text-green-700" />
        <SummaryCard label="Divergencias" value={conf.totalDivergencia} color="text-red-700" />
        <SummaryCard label="Evidencias" value={conf.evidencias.length} color="text-accent-700" />
        <SummaryCard label="Revisados" value={`${totalCompleted}/${totalCamposConsolidated}`} color={allFieldsCompleted ? 'text-green-700' : 'text-yellow-700'} />
      </div>

      {hasDivergencias && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          Atencao: {conf.totalDivergencia} divergencia(s) encontrada(s). Revise os campos marcados em vermelho.
        </div>
      )}

      {conf.statusAprovacao === 'pre-aprovado' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
          Pre-aprovado automaticamente pelo Claude. Revise e confirme a aprovacao com seu email.
        </div>
      )}

      {/* Comparison Table with inline evidence + per-order approval */}
      <ConferenciaTable
        conferenciaId={conf.id}
        campos={conf.campos}
        aprovacaoCampos={aprovacaoCampos}
        onCampoAprovacao={handleCampoAprovacao}
        onEvidenciaClick={setSelectedEvidencia}
        onApproveOrder={handleApproveOrder}
        onRejectOrder={handleRejectOrder}
      />

      {/* All evidence - collapsible */}
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

      {/* Approval bar */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-4 sticky bottom-4 shadow-lg">
        <div className="flex flex-col gap-3">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all"
                style={{ width: `${totalCamposConsolidated > 0 ? (totalCompleted / totalCamposConsolidated) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{totalCompleted}/{totalCamposConsolidated} revisados</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="email"
              placeholder="Seu email para aprovacao..."
              value={emailAprovador}
              onChange={e => setEmailAprovador(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm flex-1 min-w-48 focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
            />
            <input
              type="text"
              placeholder="Observacao geral (opcional)..."
              value={observacaoGeral}
              onChange={e => setObservacaoGeral(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm flex-1 min-w-48 focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkApproveAll}
              className="bg-accent-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent-600 transition"
            >
              Aprovar Tudo
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="border border-accent-400 text-accent-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent-50 disabled:opacity-50 transition"
            >
              {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
            <button
              onClick={() => handleSave('aprovado')}
              disabled={saving || !allFieldsCompleted || !isValidEmail(emailAprovador)}
              className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title={!allFieldsCompleted ? 'Revise todos os campos antes de aprovar' : ''}
            >
              Aprovar Final
            </button>
            <button
              onClick={() => handleSave('reprovado')}
              disabled={saving || !isValidEmail(emailAprovador)}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Reprovar
            </button>
            <button
              onClick={handleExport}
              className="border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition"
            >
              Exportar CSV
            </button>
            <button
              onClick={handleReloadFromServer}
              className="border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition text-gray-500"
              title="Carregar dados salvos no servidor (descarta cache local)"
            >
              Carregar Servidor
            </button>
          </div>

          {/* Cache status */}
          <div className="flex items-center gap-3 text-xs">
            {cacheTime && (
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Cache local: {cacheTime}
              </span>
            )}
            {!allFieldsCompleted && (
              <span className="text-yellow-600">
                Revise todos os campos para aprovacao final.
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
