'use client'

import { useState, useEffect } from 'react'
import type { MesSummary } from '@/lib/types'
import { AprovacaoStatusBadge } from './StatusBadge'
import { FilterBar } from './FilterBar'

export function Dashboard() {
  const [meses, setMeses] = useState<MesSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [expandedFornecedor, setExpandedFornecedor] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/conferencias?view=month')
      .then(r => r.json())
      .then(data => {
        setMeses(data)
        if (data.length > 0) setExpandedMonth(data[0].mes)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>
  }

  if (meses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">Nenhuma conferencia encontrada.</p>
        <p className="text-gray-400 text-sm mt-2">
          Use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/conferir</code> no Claude CLI para iniciar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Conferencias</h1>
        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="space-y-4">
        {meses.map(mes => {
          const isMonthOpen = expandedMonth === mes.mes

          return (
            <div key={mes.mes} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Month header */}
              <button
                onClick={() => setExpandedMonth(isMonthOpen ? null : mes.mes)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
              >
                <div className="flex items-center gap-4">
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isMonthOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-800">{mes.label}</h2>
                  <span className="text-xs text-gray-400">{mes.totalConferencias} conferencia(s)</span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-green-700">{mes.totalOK} OK</span>
                  <span className="text-red-700">{mes.totalDivergencia} div.</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-green-600">{mes.totalAprovado} aprov.</span>
                  <span className="text-yellow-600">{mes.totalPendente} pend.</span>
                </div>
              </button>

              {/* Fornecedores within month */}
              {isMonthOpen && (
                <div className="divide-y divide-gray-100">
                  {mes.fornecedores.map(forn => {
                    const fornKey = `${mes.mes}|${forn.fornecedor}`
                    const isFornOpen = expandedFornecedor === fornKey

                    let confs = forn.conferencias
                    if (statusFilter !== 'todos') {
                      confs = confs.filter(c => c.statusAprovacao === statusFilter)
                    }
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase()
                      confs = confs.filter(c =>
                        c.salesOrders.some(so => so.toLowerCase().includes(q)) ||
                        c.id.toLowerCase().includes(q) ||
                        c.fornecedor.toLowerCase().includes(q)
                      )
                    }
                    if (confs.length === 0) return null

                    return (
                      <div key={fornKey}>
                        {/* Fornecedor header */}
                        <button
                          onClick={() => setExpandedFornecedor(isFornOpen ? null : fornKey)}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition text-left pl-10"
                        >
                          <div className="flex items-center gap-3">
                            <svg className={`w-3 h-3 text-gray-400 transition-transform ${isFornOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium text-gray-700">{forn.fornecedor}</span>
                            <span className="text-xs text-gray-400">{confs.length} conferencia(s)</span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="text-green-600">{forn.totalAprovado} aprov.</span>
                            <span className="text-yellow-600">{forn.totalPendente} pend.</span>
                          </div>
                        </button>

                        {/* Conferencias list */}
                        {isFornOpen && (
                          <div className="pl-16 pr-5 pb-3 space-y-2">
                            {confs.map(conf => (
                              <a
                                key={conf.id}
                                href={`/conferencia/${conf.id}`}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-accent-400 hover:shadow-sm transition"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {conf.salesOrders.join(', ')}
                                    </span>
                                    <AprovacaoStatusBadge status={conf.statusAprovacao} />
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">{conf.data}</p>
                                </div>
                                <div className="text-right text-sm">
                                  <span className="text-green-700 font-medium">{conf.totalOK}</span>
                                  <span className="text-gray-300 mx-1">/</span>
                                  <span className="text-red-700 font-medium">{conf.totalDivergencia}</span>
                                  <span className="text-gray-300 mx-1">/</span>
                                  <span className="text-gray-400">{conf.totalCampos}</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
