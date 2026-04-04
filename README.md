# Bronze Metal Utils

Ferramentas de conferencia de documentacao de importacao para a **Bronze Metal Ind. E Com Ltda**.

Cruzamento automatico de Purchase Order (PO), Invoice, Packing List e Certificate of Conformance com geracao de evidencias recortadas (crops PNG) e relatorio CSV.

## Pre-requisitos

| Ferramenta | Versao minima | Para que |
|------------|---------------|----------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | - | CLI que executa as conferencias |
| Python | 3.10+ | Processamento de PDF e Excel |
| Node.js | 18+ | Dashboard web (Next.js) |
| Tesseract OCR | 5.x | Reconhecimento de texto em PDFs escaneados |

## Instalacao

### 1. Clonar o repositorio

```bash
git clone https://github.com/seu-usuario/bronze-metal-utils.git
cd bronze-metal-utils
```

### 2. Setup automatico (recomendado)

Com o Claude Code instalado, basta rodar:

```bash
claude
```

E no prompt do Claude:

```
/onboard
```

O skill `/onboard` verifica e instala todas as dependencias automaticamente.

### 3. Setup manual

Se preferir instalar manualmente:

```bash
# Dependencias Python
pip install openpyxl PyMuPDF

# Tesseract OCR (macOS)
brew install tesseract

# Dashboard web
cd web && npm install
```

## Como Usar

### Rodar uma conferencia

1. Abra o terminal na raiz do projeto
2. Inicie o Claude Code:
   ```bash
   claude
   ```
3. Execute o skill de conferencia:
   ```
   /conferir
   ```
4. O Claude vai pedir:
   - Caminho do **Excel (PO)** — Purchase Order da Bronze Metal
   - Caminho do **PDF** do fornecedor (Invoice + Packing List + Certificate)
5. O processo automatico faz:
   - Leitura do PO (fonte de verdade)
   - Conversao do PDF em imagens + OCR
   - Classificacao de cada pagina
   - Extracao dos dados via visao
   - Cruzamento campo a campo
   - Geracao de crops de evidencia (recortes PNG)
   - Geracao do CSV de conferencia
6. Resultado aparece em `conferencias/<data>_<fornecedor>/`

### Dashboard web

```bash
cd web && npm run dev
```

Acesse `http://localhost:3000` para visualizar conferencias, revisar campos e aprovar/reprovar.

## Estrutura do Projeto

```
bronze-metal-utils/
├── .claude/
│   └── commands/
│       ├── conferir.md      # Skill de conferencia
│       └── onboard.md       # Skill de setup inicial
├── web/                     # Dashboard Next.js 14
│   ├── src/
│   │   ├── app/             # Rotas e paginas
│   │   ├── components/      # Componentes React
│   │   └── lib/             # Tipos e utilidades
│   └── package.json
├── conferencias/            # Output das conferencias (gitignored)
│   └── YYYY-MM-DD_fornecedor/
│       ├── conferencia.csv  # Relatorio de campos
│       ├── aprovacao.json   # Status de aprovacao
│       └── evidencias/      # Crops PNG de cada campo
├── CLAUDE.md                # Instrucoes do projeto
├── README.md                # Este arquivo
└── .gitignore
```

## Stack

- **CLI**: Claude Code (Anthropic)
- **Backend/Processing**: Python 3 (PyMuPDF, openpyxl, Tesseract OCR)
- **Frontend**: Next.js 14, React 18, Tailwind CSS 3, TypeScript
- **Storage**: Filesystem (CSVs + JSONs + PNGs)
