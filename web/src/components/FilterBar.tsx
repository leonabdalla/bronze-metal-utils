'use client'

interface FilterBarProps {
  statusFilter: string
  onStatusChange: (v: string) => void
  searchQuery: string
  onSearchChange: (v: string) => void
}

export function FilterBar({ statusFilter, onStatusChange, searchQuery, onSearchChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="border border-gray-200 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
        />
      </div>
      <select
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        className="border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
      >
        <option value="todos">Todos</option>
        <option value="pendente">Pendente</option>
        <option value="pre-aprovado">Pre-aprovado</option>
        <option value="aprovado">Aprovado</option>
        <option value="reprovado">Reprovado</option>
      </select>
    </div>
  )
}
