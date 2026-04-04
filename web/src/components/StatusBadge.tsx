'use client'

type CampoStatus = 'OK' | 'DIVERGENCIA' | 'N/A' | 'NAO_INFORMADO'
type AprovacaoStatus = 'aprovado' | 'pre-aprovado' | 'reprovado' | 'pendente'

const campoConfig: Record<CampoStatus, { style: string; icon: string }> = {
  OK: { style: 'bg-green-100 text-green-800', icon: 'M5 13l4 4L19 7' },
  DIVERGENCIA: { style: 'bg-red-100 text-red-800', icon: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  'N/A': { style: 'bg-gray-100 text-gray-600', icon: 'M20 12H4' },
  NAO_INFORMADO: { style: 'bg-yellow-100 text-yellow-800', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01' },
}

const aprovacaoConfig: Record<AprovacaoStatus, { style: string; label: string }> = {
  aprovado: { style: 'bg-green-100 text-green-800', label: 'Aprovado' },
  'pre-aprovado': { style: 'bg-blue-100 text-blue-800', label: 'Pre-aprovado' },
  reprovado: { style: 'bg-red-100 text-red-800', label: 'Reprovado' },
  pendente: { style: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
}

export function CampoStatusBadge({ status }: { status: CampoStatus }) {
  const config = campoConfig[status] || campoConfig['N/A']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.style}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
      </svg>
      {status.replace('_', ' ')}
    </span>
  )
}

export function AprovacaoStatusBadge({ status }: { status: AprovacaoStatus }) {
  const config = aprovacaoConfig[status] || aprovacaoConfig.pendente
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${config.style}`}>
      {config.label}
    </span>
  )
}
