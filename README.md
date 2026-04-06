# Bronze Metal Utils

Ferramentas de conferencia de documentacao de importacao para a **Bronze Metal Ind. E Com Ltda**.

Cruzamento automatico de Purchase Order (PO), Invoice, Packing List e Certificate of Conformance com geracao de evidencias recortadas (crops PNG) e relatorio CSV.

## Pre-requisitos

| Ferramenta | Versao minima | Para que |
|------------|---------------|----------|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | - | CLI que executa as conferencias |
| Python | 3.10+ | Processamento de PDF e Excel |
| Node.js | 18+ | Dashboard web (Next.js) |

## Instalacao

### 1. Pre-requisito: Claude Code

Instale o Claude Code CLI: https://docs.anthropic.com/en/docs/claude-code

### 2. Setup completo com um prompt

Abra o Claude Code na pasta do usuario (`~/dev`), cole o prompt abaixo e **ative "ignorar permissoes"** (bypass permissions) para que o Claude execute todos os comandos sem pedir confirmacao a cada passo:

```
Clone o repositorio https://github.com/leonabdalla/bronze-metal-utils.git em ~/dev/bronze-metal-utils (crie a pasta ~/dev se nao existir). Depois, entre na pasta e execute o skill /onboard para instalar todas as dependencias automaticamente. Rode tudo sem pedir confirmacao entre os passos.
```

> **Como ativar "ignorar permissoes" no Claude Code**
> No canto inferior direito da janela do Claude Code, clique em **"Auto-approve"** ou use o atalho de permissoes para liberar execucao de comandos sem confirmacao manual. Isso e necessario para que a instalacao rode de ponta a ponta sem interrupcao.

O `/onboard` vai:
1. Verificar e instalar Python 3.12 (via `winget` no Windows)
2. Instalar `openpyxl` e `PyMuPDF` via pip
3. Verificar Node.js
4. Rodar `npm install` no dashboard web (corrigindo automaticamente problemas de registry privado)
5. Criar a pasta `conferencias/`
6. **Iniciar o dashboard web e abrir a aba de preview automaticamente**
7. Exibir uma tabela de status de todos os componentes

### 3. Setup manual

Se preferir instalar manualmente:

```bash
# Python (Windows)
winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements

# Dependencias Python (use o caminho completo se python nao estiver no PATH)
python -m pip install openpyxl PyMuPDF

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

No Claude Code, rode:

```
/onboard
```

O dashboard abre automaticamente na aba de preview. Alternativamente, via terminal:

```bash
cd web && npm run dev
```

## Estrutura do Projeto

```
bronze-metal-utils/
├── .claude/
│   ├── commands/
│   │   ├── conferir.md      # Skill de conferencia
│   │   ├── onboard.md       # Skill de setup inicial
│   │   └── relatorio-email.md
│   ├── launch.json          # Config dos servidores de dev (preview_start)
│   └── settings.json        # Permissoes pre-aprovadas
├── web/                     # Dashboard Next.js 14
│   ├── src/
│   │   ├── app/             # Rotas e paginas
│   │   ├── components/      # Componentes React
│   │   └── lib/             # Tipos e utilidades
│   └── package.json
├── conferencias/            # Output das conferencias (gitignored)
│   └── YYYY-MM-DD_fornecedor/
│       ├── conferencia.csv  # Relatorio de campos
│       └── evidencias/      # Crops PNG de cada campo
├── CLAUDE.md                # Instrucoes do projeto
├── README.md                # Este arquivo
└── .gitignore
```

## Stack

- **CLI**: Claude Code (Anthropic)
- **Backend/Processing**: Python 3 (PyMuPDF, openpyxl)
- **Frontend**: Next.js 14, React 18, Tailwind CSS 3, TypeScript
- **Storage**: Filesystem (CSVs + JSONs + PNGs)
