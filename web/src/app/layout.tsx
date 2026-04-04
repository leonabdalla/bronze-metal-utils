import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Bronze Metal Utils',
  description: 'Conferencia de documentacao de importacao',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container-page py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
