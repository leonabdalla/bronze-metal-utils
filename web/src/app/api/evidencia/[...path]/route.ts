import { NextResponse } from 'next/server'
import { getEvidenciaPath } from '@/lib/conferencias'
import fs from 'fs'

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const [conferenciaId, ...rest] = params.path
  const filename = rest.join('/')

  const filePath = getEvidenciaPath(conferenciaId, filename)
  if (!filePath) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
