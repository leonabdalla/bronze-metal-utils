import { NextResponse } from 'next/server'
import { exportCSV } from '@/lib/conferencias'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csv = exportCSV(params.id)
  if (!csv) {
    return NextResponse.json({ error: 'Conferencia not found' }, { status: 404 })
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="conferencia_${params.id}.csv"`,
    },
  })
}
