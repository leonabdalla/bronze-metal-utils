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

export interface Conferencia {
  id: string
  data: string
  fornecedor: string
  salesOrders: string[]
  totalCampos: number
  totalOK: number
  totalDivergencia: number
  campos: CampoConferencia[]
  evidencias: string[]
}

export interface ConferenciaSummary {
  id: string
  data: string
  fornecedor: string
  salesOrders: string[]
  totalCampos: number
  totalOK: number
  totalDivergencia: number
}

export interface FornecedorGroup {
  fornecedor: string
  conferencias: ConferenciaSummary[]
  totalOK: number
  totalDivergencia: number
}

export interface MesSummary {
  mes: string
  label: string
  totalConferencias: number
  totalOK: number
  totalDivergencia: number
  fornecedores: FornecedorGroup[]
  conferencias: ConferenciaSummary[]
}
