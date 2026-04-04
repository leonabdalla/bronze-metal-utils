import { NextResponse } from 'next/server'
import { getConferencia, deleteConferencia } from '@/lib/conferencias'

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
