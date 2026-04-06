'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/conferencias', label: 'Conferencias' },
]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900 text-white">
      <div className="container-page flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2">
          <span className="text-bronze-400 font-bold text-xl tracking-tight">Bronze Metal</span>
          <span className="text-gray-400 text-sm hidden sm:inline">Utils</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(link => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-800 px-4 pb-4 space-y-1">
          {links.map(link => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>
      )}
    </header>
  )
}
