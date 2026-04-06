'use client'

import type { CampoConferencia } from '@/lib/types'
import { CampoStatusBadge } from './StatusBadge'
import { useState } from 'react'

function TruncatedCell({ value }: { value: string }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const display = value || '-'
  return (
    <td
      className="py-2 px-3 text-gray-600 max-w-40 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="block truncate">{display}</span>
      {showTooltip && value && value.length > 20 && (
        <div className="absolute z-50 bottom-full left-0 mb-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-pre-wrap break-words pointer-events-none">
          {value}
        </div>
      )}
    </td>
  )
}

interface ConferenciaTableProps {
  conferenciaId: string
  campos: CampoConferencia[]
  onEvidenciaClick?: (filename: string) => void
}

/** Extract base SO number: SO_0063000_remessa_1 → SO_0063000 */
function baseSO(so: string): string {
  return so.replace(/_remessa_\d+$/i, '')
}

/** Group campos by base SO, consolidating split orders */
function consolidateBySO(campos: CampoConferencia[]): Record<string, CampoConferencia[]> {
  const grouped: Record<string, CampoConferencia[]> = {}

  for (const c of campos) {
    const base = baseSO(c.salesOrder)
    if (!grouped[base]) grouped[base] = []

    const existing = grouped[base].find(e => e.campo === c.campo)
    if (existing) {
      if (c.valorInvoice && c.valorInvoice !== existing.valorInvoice) {
        existing.valorInvoice = existing.valorInvoice
          ? `${existing.valorInvoice} + ${c.valorInvoice}`
          : c.valorInvoice
      }
      if (c.valorPL && c.valorPL !== existing.valorPL) {
        existing.valorPL = existing.valorPL
          ? `${existing.valorPL} + ${c.valorPL}`
          : c.valorPL
      }
      if (c.valorCertificate && c.valorCertificate !== existing.valorCertificate) {
        existing.valorCertificate = existing.valorCertificate
          ? `${existing.valorCertificate} + ${c.valorCertificate}`
          : c.valorCertificate
      }
      if (c.evidenciaInvoice && !existing.evidenciaInvoice.includes(c.evidenciaInvoice)) {
        existing.evidenciaInvoice = existing.evidenciaInvoice
          ? `${existing.evidenciaInvoice}|${c.evidenciaInvoice}`
          : c.evidenciaInvoice
      }
      if (c.evidenciaPL && !existing.evidenciaPL.includes(c.evidenciaPL)) {
        existing.evidenciaPL = existing.evidenciaPL
          ? `${existing.evidenciaPL}|${c.evidenciaPL}`
          : c.evidenciaPL
      }
      if (c.evidenciaCertificate && !existing.evidenciaCertificate.includes(c.evidenciaCertificate)) {
        existing.evidenciaCertificate = existing.evidenciaCertificate
          ? `${existing.evidenciaCertificate}|${c.evidenciaCertificate}`
          : c.evidenciaCertificate
      }
      if (c.status === 'DIVERGENCIA') existing.status = 'DIVERGENCIA'
      else if (c.status === 'NAO_INFORMADO' && existing.status !== 'DIVERGENCIA') existing.status = 'NAO_INFORMADO'
      if (c.observacao && !existing.observacao.includes(c.observacao)) {
        existing.observacao = existing.observacao
          ? `${existing.observacao}; ${c.observacao}`
          : c.observacao
      }
    } else {
      grouped[base].push({ ...c, salesOrder: base })
    }
  }

  return grouped
}

/** Parse evidence field that may contain multiple files separated by | */
function parseEvidencias(campo: CampoConferencia): { label: string; file: string }[] {
  const result: { label: string; file: string }[] = []
  const add = (label: string, field: string) => {
    if (!field) return
    for (const f of field.split('|')) {
      if (f.trim()) result.push({ label, file: f.trim() })
    }
  }
  add('Inv', campo.evidenciaInvoice)
  add('PL', campo.evidenciaPL)
  add('Cert', campo.evidenciaCertificate)
  return result
}

export function ConferenciaTable({ conferenciaId, campos, onEvidenciaClick }: ConferenciaTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [collapsedOrders, setCollapsedOrders] = useState<Set<string>>(new Set())

  const grouped = consolidateBySO(campos)

  const toggleOrder = (so: string) => {
    setCollapsedOrders(prev => {
      const next = new Set(prev)
      if (next.has(so)) next.delete(so)
      else next.add(so)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([so, soCampos]) => {
        const isCollapsed = collapsedOrders.has(so)
        const okCount = soCampos.filter(c => c.status === 'OK').length
        const divCount = soCampos.filter(c => c.status === 'DIVERGENCIA').length

        return (
          <div key={so} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleOrder(so)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">{so}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-700">{okCount} OK</span>
                {divCount > 0 && <span className="text-red-700">{divCount} div.</span>}
                <span className="text-gray-400">{soCampos.length} campos</span>
              </div>
            </button>

            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500 bg-white">
                      <th className="py-2 px-3 font-medium w-36">Campo</th>
                      <th className="py-2 px-3 font-medium">PO</th>
                      <th className="py-2 px-3 font-medium">Invoice</th>
                      <th className="py-2 px-3 font-medium">Packing List</th>
                      <th className="py-2 px-3 font-medium">Certificate</th>
                      <th className="py-2 px-3 font-medium w-28">Status</th>
                      <th className="py-2 px-3 font-medium w-32">Evidencias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soCampos.map(campo => {
                      const key = `${so}|${campo.campo}`
                      const isExpanded = expandedRow === key
                      const rowBg = campo.status === 'DIVERGENCIA'
                        ? 'bg-red-50'
                        : campo.status === 'NAO_INFORMADO'
                        ? 'bg-yellow-50'
                        : ''
                      const evidencias = parseEvidencias(campo)

                      return (
                        <>
                          <tr
                            key={key}
                            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${rowBg}`}
                            onClick={() => setExpandedRow(isExpanded ? null : key)}
                          >
                            <td className="py-2 px-3 font-medium text-gray-800">{campo.campo}</td>
                            <TruncatedCell value={campo.valorPO} />
                            <TruncatedCell value={campo.valorInvoice} />
                            <TruncatedCell value={campo.valorPL} />
                            <TruncatedCell value={campo.valorCertificate} />
                            <td className="py-2 px-3"><CampoStatusBadge status={campo.status} /></td>
                            <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                              {evidencias.length > 0 ? (
                                <div className="flex gap-1 flex-wrap">
                                  {evidencias.map((e, i) => (
                                    <button
                                      key={`${e.file}-${i}`}
                                      onClick={() => onEvidenciaClick?.(e.file)}
                                      className="relative group"
                                      title={`${e.label}: ${e.file}`}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={`/api/evidencia/${conferenciaId}/${e.file}`}
                                        alt={e.label}
                                        className="w-10 h-10 object-cover object-top rounded border border-gray-200 hover:border-accent-400 hover:ring-2 hover:ring-accent-200 transition"
                                      />
                                      <span className="absolute -top-1 -right-1 bg-gray-700 text-white text-[8px] px-1 rounded">
                                        {e.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">-</span>
                              )}
                            </td>
                          </tr>
                          {isExpanded && campo.observacao && (
                            <tr key={`${key}-obs`} className="bg-gray-50">
                              <td colSpan={7} className="px-4 py-3">
                                <p className="text-xs text-gray-600">
                                  <strong>Obs:</strong> {campo.observacao}
                                </p>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
