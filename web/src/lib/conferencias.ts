import fs from 'fs'
import path from 'path'
import type { CampoConferencia, Conferencia, ConferenciaSummary, MesSummary, FornecedorGroup } from './types'

const CONFERENCIAS_DIR = path.resolve(process.cwd(), '..', 'conferencias')

function detectFornecedor(dirName: string): string {
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
    campos,
    evidencias,
  }
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
      }))

    return {
      mes,
      label: `${monthNames[mm] || mm} ${mes.slice(0, 4)}`,
      totalConferencias: confs.length,
      totalOK: confs.reduce((s, c) => s + c.totalOK, 0),
      totalDivergencia: confs.reduce((s, c) => s + c.totalDivergencia, 0),
      fornecedores,
      conferencias: confs,
    }
  })
}

export function exportCSV(id: string): string | null {
  const conf = getConferencia(id)
  if (!conf) return null

  const BOM = '\uFEFF'
  const header = 'Fornecedor;Sales_Order;Campo;Valor_PO;Valor_Invoice;Valor_PL;Valor_Certificate;Status;Observacao;Evidencia_Invoice;Evidencia_PL;Evidencia_Certificate'

  const lines = [header]
  for (const c of conf.campos) {
    const line = [
      conf.fornecedor, c.salesOrder, c.campo, c.valorPO, c.valorInvoice, c.valorPL,
      c.valorCertificate, c.status, c.observacao,
      c.evidenciaInvoice, c.evidenciaPL, c.evidenciaCertificate
    ].join(';')
    lines.push(line)
  }

  return BOM + lines.join('\n')
}

export function deleteConferencia(id: string): boolean {
  if (!/^[\w-]+$/.test(id)) return false
  const dirPath = path.join(CONFERENCIAS_DIR, id)
  if (!fs.existsSync(dirPath)) return false
  fs.rmSync(dirPath, { recursive: true, force: true })
  return true
}
