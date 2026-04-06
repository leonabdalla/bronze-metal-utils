'use client'

import { useState, useEffect, useCallback } from 'react'

interface EvidenciaViewerProps {
  conferenciaId: string
  filename: string
  onClose: () => void
}

export function EvidenciaViewer({ conferenciaId, filename, onClose }: EvidenciaViewerProps) {
  const [zoom, setZoom] = useState(1)
  const src = `/api/evidencia/${conferenciaId}/${filename}`

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === '+' || e.key === '=') setZoom(z => Math.min(3, z + 0.25))
    if (e.key === '-') setZoom(z => Math.max(0.25, z - 0.25))
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-5xl max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white z-10">
          <span className="text-sm font-medium text-gray-700">{filename}</span>
          <div className="flex gap-2 items-center">
            <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="text-xs px-2 py-1 border rounded hover:bg-gray-50 transition">-</button>
            <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="text-xs px-2 py-1 border rounded hover:bg-gray-50 transition">+</button>
            <button onClick={onClose} className="text-xs px-2 py-1 border rounded hover:bg-gray-50 ml-2 transition">
              Fechar <span className="text-gray-400">(Esc)</span>
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={filename}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            className="max-w-none"
          />
        </div>
      </div>
    </div>
  )
}

interface EvidenciaGalleryProps {
  conferenciaId: string
  evidencias: string[]
  onSelect: (filename: string) => void
}

export function EvidenciaGallery({ conferenciaId, evidencias, onSelect }: EvidenciaGalleryProps) {
  if (evidencias.length === 0) return null

  const grouped: Record<string, string[]> = {}
  for (const e of evidencias) {
    const group = e.startsWith('packing_list') ? 'packing_list'
      : e.startsWith('invoice') ? 'invoice'
      : e.startsWith('certificate') ? 'certificate'
      : e.startsWith('ultrasonic') ? 'ultrasonic'
      : 'other'
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(e)
  }

  const groupLabels: Record<string, string> = {
    invoice: 'Invoice',
    packing_list: 'Packing List',
    certificate: 'Certificate',
    ultrasonic: 'Ultrasonic',
    other: 'Outros',
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([group, files]) => (
        <div key={group}>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {groupLabels[group] || group} ({files.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {files.map(file => (
              <button
                key={file}
                onClick={() => onSelect(file)}
                className="border rounded-lg overflow-hidden hover:ring-2 hover:ring-accent-400 transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/evidencia/${conferenciaId}/${file}`}
                  alt={file}
                  className="w-full h-24 object-cover object-top"
                />
                <p className="text-[10px] text-gray-500 p-1 truncate" title={file}>{file}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
