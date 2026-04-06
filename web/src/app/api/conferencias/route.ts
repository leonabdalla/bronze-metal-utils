import { NextResponse } from 'next/server'
import { listConferencias, getConferenciasByMonth } from '@/lib/conferencias'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view')

  if (view === 'month') {
    return NextResponse.json(getConferenciasByMonth())
  }

  return NextResponse.json(listConferencias())
}
