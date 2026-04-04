import fs from 'fs'
import path from 'path'
import type { CampoConferencia, Conferencia, ConferenciaSummary, Aprovacao, MesSummary, FornecedorGroup } from './types'

const CONFERENCIAS_DIR = path.resolve(process.cwd(), '..', 'conferencias')

function detectFornecedor(dirName: string): string {
  // Extract fornecedor from folder name: YYYY-MM-DD_fornecedor_name
  const match = dirName.match(/^\d{4}-\d{2}-\d{2}_(.+)$/)
  if (match) {
    return match[1]
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }
  return 'Desconhecido'
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { current += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ';') { result.push(current); current = '' }
      else { current += ch }
    }
  }
  result.push(current)
  return result
}

function parseCSV(content: string): CampoConferencia[] {
  const lines = content.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const campos: CampoConferencia[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i])
    if (parts.length < 8) continue
    campos.push({
      salesOrder: parts[0] || '',
      campo: parts[1] || '',
      valorPO: parts[2] || '',
      valorInvoice: parts[3] || '',
      valorPL: parts[4] || '',
      valorCertificate: parts[5] || '',
      status: (parts[6] as CampoConferencia['status']) || 'N/A',
      observacao: parts[7] || '',
      evidenciaInvoice: parts[8] || '',
      evidenciaPL: parts[9] || '',
      evidenciaCertificate: parts[10] || '',
    })
  }
  return campos
}

function readAprovacao(conferenciaDir: string): Aprovacao | undefined {
  const aprovacaoPath = path.join(conferenciaDir, 'aprovacao.json')
  if (!fs.existsSync(aprovacaoPath)) return undefined
  try {
    const data = JSON.parse(fs.readFileSync(aprovacaoPath, 'utf-8'))
    return {
      ...data,
      emailAprovador: data.emailAprovador || '',
      observacaoGeral: data.observacaoGeral || '',
    }
  } catch {
    return undefined
  }
}

export function listConferencias(): ConferenciaSummary[] {
  if (!fs.existsSync(CONFERENCIAS_DIR)) return []

  const dirs = fs.readdirSync(CONFERENCIAS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'uploads')
    .map(d => d.name)
    .sort()
    .reverse()

  return dirs.map(dirName => {
    const dirPath = path.join(CONFERENCIAS_DIR, dirName)
    const csvPath = path.join(dirPath, 'conferencia.csv')

    let campos: CampoConferencia[] = []
    if (fs.existsSync(csvPath)) {
      campos = parseCSV(fs.readFileSync(csvPath, 'utf-8'))
    }

    const aprovacao = readAprovacao(dirPath)
    const salesOrders = [...new Set(campos.map(c => c.salesOrder))]
    const datePart = dirName.match(/^(\d{4}-\d{2}-\d{2})/)

    return {
      id: dirName,
      data: datePart ? datePart[1] : dirName,
      fornecedor: detectFornecedor(dirName),
      salesOrders,
      totalCampos: campos.length,
      totalOK: campos.filter(c => c.status === 'OK').length,
      totalDivergencia: campos.filter(c => c.status === 'DIVERGENCIA').length,
      statusAprovacao: aprovacao?.status || 'pendente',
    }
  })
}

export function getConferencia(id: string): Conferencia | null {
  const dirPath = path.join(CONFERENCIAS_DIR, id)
  if (!fs.existsSync(dirPath)) return null

  const csvPath = path.join(dirPath, 'conferencia.csv')
  let campos: CampoConferencia[] = []
  if (fs.existsSync(csvPath)) {
    campos = parseCSV(fs.readFileSync(csvPath, 'utf-8'))
  }

  const evidenciasDir = path.join(dirPath, 'evidencias')
  let evidencias: string[] = []
  if (fs.existsSync(evidenciasDir)) {
    evidencias = fs.readdirSync(evidenciasDir)
      .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
      .sort()
  }

  const aprovacao = readAprovacao(dirPath)
  const salesOrders = [...new Set(campos.map(c => c.salesOrder))]
  const datePart = id.match(/^(\d{4}-\d{2}-\d{2})/)

  return {
    id,
    data: datePart ? datePart[1] : id,
    fornecedor: detectFornecedor(id),
    salesOrders,
    totalCampos: campos.length,
    totalOK: campos.filter(c => c.status === 'OK').length,
    totalDivergencia: campos.filter(c => c.status === 'DIVERGENCIA').length,
    statusAprovacao: aprovacao?.status || 'pendente',
    campos,
    evidencias,
    aprovacao,
  }
}

export function saveAprovacao(id: string, aprovacao: Aprovacao): boolean {
  const dirPath = path.join(CONFERENCIAS_DIR, id)
  if (!fs.existsSync(dirPath)) return false
  fs.writeFileSync(
    path.join(dirPath, 'aprovacao.json'),
    JSON.stringify(aprovacao, null, 2),
    'utf-8'
  )
  return true
}

export function getEvidenciaPath(conferenciaId: string, filename: string): string | null {
  const safe = path.basename(filename)
  const filePath = path.join(CONFERENCIAS_DIR, conferenciaId, 'evidencias', safe)
  if (!fs.existsSync(filePath)) return null
  return filePath
}

export function getConferenciasByMonth(): MesSummary[] {
  const conferencias = listConferencias()
  const byMonth: Record<string, ConferenciaSummary[]> = {}

  for (const c of conferencias) {
    const mes = c.data.slice(0, 7)
    if (!byMonth[mes]) byMonth[mes] = []
    byMonth[mes].push(c)
  }

  const meses = Object.keys(byMonth).sort().reverse()
  const monthNames: Record<string, string> = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Marco', '04': 'Abril',
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
  }

  return meses.map(mes => {
    const confs = byMonth[mes]
    const mm = mes.slice(5, 7)

    // Group by fornecedor
    const byFornecedor: Record<string, ConferenciaSummary[]> = {}
    for (const c of confs) {
      if (!byFornecedor[c.fornecedor]) byFornecedor[c.fornecedor] = []
      byFornecedor[c.fornecedor].push(c)
    }

    const fornecedores: FornecedorGroup[] = Object.entries(byFornecedor)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fornecedor, fConfs]) => ({
        fornecedor,
        conferencias: fConfs,
        totalOK: fConfs.reduce((s, c) => s + c.totalOK, 0),
        totalDivergencia: fConfs.reduce((s, c) => s + c.totalDivergencia, 0),
        totalPendente: fConfs.filter(c => c.statusAprovacao === 'pendente').length,
        totalAprovado: fConfs.filter(c => c.statusAprovacao === 'aprovado' || c.statusAprovacao === 'pre-aprovado').length,
        totalReprovado: fConfs.filter(c => c.statusAprovacao === 'reprovado').length,
      }))

    return {
      mes,
      label: `${monthNames[mm] || mm} ${mes.slice(0, 4)}`,
      totalConferencias: confs.length,
      totalOK: confs.reduce((s, c) => s + c.totalOK, 0),
      totalDivergencia: confs.reduce((s, c) => s + c.totalDivergencia, 0),
      totalPendente: confs.filter(c => c.statusAprovacao === 'pendente').length,
      totalAprovado: confs.filter(c => c.statusAprovacao === 'aprovado' || c.statusAprovacao === 'pre-aprovado').length,
      totalReprovado: confs.filter(c => c.statusAprovacao === 'reprovado').length,
      fornecedores,
      conferencias: confs,
    }
  })
}

export function exportCSV(id: string, includeAprovacao: boolean): string | null {
  const conf = getConferencia(id)
  if (!conf) return null

  const BOM = '\uFEFF'
  let header = 'Fornecedor;Sales_Order;Campo;Valor_PO;Valor_Invoice;Valor_PL;Valor_Certificate;Status;Observacao;Evidencia_Invoice;Evidencia_PL;Evidencia_Certificate'
  if (includeAprovacao) {
    header += ';Status_Aprovacao;Obs_Aprovacao;Email_Aprovador'
  }

  const lines = [header]
  for (const c of conf.campos) {
    const key = `${c.salesOrder}|${c.campo}`
    let line = [
      conf.fornecedor, c.salesOrder, c.campo, c.valorPO, c.valorInvoice, c.valorPL,
      c.valorCertificate, c.status, c.observacao,
      c.evidenciaInvoice, c.evidenciaPL, c.evidenciaCertificate
    ].join(';')

    if (includeAprovacao && conf.aprovacao) {
      const campo = conf.aprovacao.campos[key]
      line += `;${campo?.status || 'pendente'};${campo?.obs || ''};${conf.aprovacao.emailAprovador || ''}`
    } else if (includeAprovacao) {
      line += ';pendente;;'
    }

    lines.push(line)
  }

  return BOM + lines.join('\n')
}

export function deleteConferencia(id: string): boolean {
  // Sanitize: only allow folder names that look like conferencia dirs
  if (!/^[\w-]+$/.test(id)) return false
  const dirPath = path.join(CONFERENCIAS_DIR, id)
  if (!fs.existsSync(dirPath)) return false
  fs.rmSync(dirPath, { recursive: true, force: true })
  return true
}

export function getUploadDir(): string {
  const uploadDir = path.join(CONFERENCIAS_DIR, 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  return uploadDir
}
