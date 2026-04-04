import { listConferencias } from '@/lib/conferencias'

export default function Home() {
  const conferencias = listConferencias()
  const totalConf = conferencias.length
  const totalOK = conferencias.reduce((s, c) => s + c.totalOK, 0)
  const totalDiv = conferencias.reduce((s, c) => s + c.totalDivergencia, 0)

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="bg-gray-900 text-white -mx-6 -mt-10 px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Conferencia de Documentacao de Importacao
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Cruzamento automatico de Purchase Order, Invoice, Packing List e Certificate of Conformance
            para verificacao de importacoes da Bronze Metal.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="/conferencias"
              className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
            >
              Ver Conferencias
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Como Funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            step="1"
            title="Prepare os arquivos"
            description="Tenha o PDF do fornecedor (Invoice + Packing List + Certificate) e o Excel da PO (Purchase Order) da Bronze Metal."
          />
          <StepCard
            step="2"
            title="Execute o Claude"
            description="Rode o comando /conferir no terminal com o Claude CLI para processamento automatico."
          />
          <StepCard
            step="3"
            title="Revise e aprove"
            description="Visualize o cruzamento campo a campo com evidencias, revise divergencias e aprove com seu email."
          />
        </div>
      </section>

      {/* First time setup */}
      {totalConf === 0 && (
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Primeira vez? Configure o projeto</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-blue-800 mb-3">
              Este projeto usa o <strong>Claude Code</strong> (CLI da Anthropic) para executar as conferencias.
              A interface web serve apenas para visualizar e aprovar os resultados.
            </p>
            <p className="text-sm text-blue-700">
              Se ainda nao tem o Claude Code instalado, siga as instrucoes em{' '}
              <a href="https://docs.anthropic.com/en/docs/claude-code" className="underline font-medium" target="_blank" rel="noopener noreferrer">
                docs.anthropic.com/en/docs/claude-code
              </a>
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 text-sm font-mono">
            <p className="text-gray-500 mb-2"># 1. Abra o terminal na raiz do projeto:</p>
            <p className="text-green-400">$ claude</p>
            <p className="text-gray-500 mt-4 mb-2"># 2. Execute o setup automatico:</p>
            <p className="text-gray-300">
              <span className="text-gray-500">&gt;</span> /onboard
            </p>
            <p className="text-gray-500 mt-4 mb-2"># 3. Depois, para rodar uma conferencia:</p>
            <p className="text-gray-300">
              <span className="text-gray-500">&gt;</span> /conferir
            </p>
          </div>
        </section>
      )}

      {/* Terminal command */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Comando no Terminal</h2>
        <div className="bg-gray-900 rounded-xl p-6 text-sm font-mono">
          <p className="text-gray-500 mb-2"># Na raiz do projeto, com os arquivos PDF e Excel disponiveis:</p>
          <p className="text-green-400">$ claude</p>
          <p className="text-gray-300 mt-2">
            <span className="text-gray-500">&gt;</span> /conferir
          </p>
          <p className="text-gray-500 mt-4"># O Claude vai pedir o PDF e o Excel, extrair evidencias,</p>
          <p className="text-gray-500"># cruzar todos os campos e gerar o relatorio automaticamente.</p>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Requisitos: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">claude</code> CLI,
          Python com <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">PyMuPDF</code>,
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">openpyxl</code> e
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">tesseract</code> OCR
        </p>
      </section>

      {/* Quick stats */}
      {totalConf > 0 && (
        <section className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-gray-900">{totalConf}</p>
              <p className="text-sm text-gray-500 mt-1">Conferencias</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-green-700">{totalOK}</p>
              <p className="text-sm text-gray-500 mt-1">Campos OK</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-3xl font-bold text-red-700">{totalDiv}</p>
              <p className="text-sm text-gray-500 mt-1">Divergencias</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-accent-500 text-white font-bold flex items-center justify-center mx-auto mb-4">
        {step}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
