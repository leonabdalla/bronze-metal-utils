import { NextResponse } from 'next/server'
import { getConferencia, saveAprovacao, deleteConferencia } from '@/lib/conferencias'
import type { Aprovacao } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const conf = getConferencia(params.id)
  if (!conf) {
    return NextResponse.json({ error: 'Conferencia not found' }, { status: 404 })
  }
  return NextResponse.json(conf)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json() as Aprovacao
  const ok = saveAprovacao(params.id, body)
  if (!ok) {
    return NextResponse.json({ error: 'Conferencia not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ok = deleteConferencia(params.id)
  if (!ok) {
    return NextResponse.json({ error: 'Conferencia not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
