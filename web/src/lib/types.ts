export interface CampoConferencia {
  salesOrder: string
  campo: string
  valorPO: string
  valorInvoice: string
  valorPL: string
  valorCertificate: string
  status: 'OK' | 'DIVERGENCIA' | 'N/A' | 'NAO_INFORMADO'
  observacao: string
  evidenciaInvoice: string
  evidenciaPL: string
  evidenciaCertificate: string
}

export interface AprovacaoCampo {
  status: 'aprovado' | 'reprovado' | 'pendente'
  obs: string
}

export interface Aprovacao {
  status: 'aprovado' | 'pre-aprovado' | 'reprovado' | 'pendente'
  aprovadoPor: string
  emailAprovador: string
  dataAprovacao: string
  campos: Record<string, AprovacaoCampo>
  observacaoGeral?: string
}

export interface Conferencia {
  id: string
  data: string
  fornecedor: string
  salesOrders: string[]
  totalCampos: number
  totalOK: number
  totalDivergencia: number
  statusAprovacao: 'aprovado' | 'pre-aprovado' | 'reprovado' | 'pendente'
  campos: CampoConferencia[]
  evidencias: string[]
  aprovacao?: Aprovacao
}

export interface ConferenciaSummary {
  id: string
  data: string
  fornecedor: string
  salesOrders: string[]
  totalCampos: number
  totalOK: number
  totalDivergencia: number
  statusAprovacao: 'aprovado' | 'pre-aprovado' | 'reprovado' | 'pendente'
}

export interface FornecedorGroup {
  fornecedor: string
  conferencias: ConferenciaSummary[]
  totalOK: number
  totalDivergencia: number
  totalPendente: number
  totalAprovado: number
  totalReprovado: number
}

export interface MesSummary {
  mes: string
  label: string
  totalConferencias: number
  totalOK: number
  totalDivergencia: number
  totalPendente: number
  totalAprovado: number
  totalReprovado: number
  fornecedores: FornecedorGroup[]
  conferencias: ConferenciaSummary[]
}
