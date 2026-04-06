# Bronze Metal Utils

Ferramentas de conferencia de documentacao de importacao para Bronze Metal Ind. E Com Ltda.

## Fornecedores
- **NGK Metals (NGK Berylco)** — Ligas de cobre-berilio (C17200, C17510) em placas e barras
- Outros fornecedores: skill generico, funciona para qualquer empresa

## Estrutura

- `/conferir` — Skill generico de conferencia. Recebe PDF + Excel(PO), cruza todos os campos e gera CSV + evidencias PNG. PO e fonte de verdade. Suporta split orders.
- `conferencias/` — Output das conferencias, organizado por data e fornecedor.
- `web/` — Frontend Next.js 14 (App Router + Tailwind). Dashboard com hierarquia Mes > Fornecedor > Ordens.

## Frontend (web/)
- **Stack**: Next.js 14, React 18, Tailwind CSS 3, TypeScript
- **Rodar**: `cd web && npm install && npm run dev` (porta 3000)
- **Storage**: Filesystem — le CSVs de `conferencias/`. Revisao salva em localStorage do navegador.
- **CSV**: separador `;`, encoding UTF-8 BOM
- **Rotas API**: `/api/conferencias`, `/api/conferencia/[id]` (GET/PATCH), `/api/evidencia/[...path]`, `/api/export/[id]`
- **Paginas**: `/` (landing), `/conferencias` (dashboard), `/conferencia/[id]` (detalhe)

## Como Rodar uma Nova Conferencia

A conferencia e feita exclusivamente via terminal com o Claude CLI. Nao ha interface web para isso.

### Passo a passo
1. Tenha os arquivos prontos: PDF do fornecedor (Invoice/Packing List/Certificate) e Excel da PO (Purchase Order)
2. Na raiz do projeto, abra o Claude CLI:
   ```
   claude
   ```
3. Execute o skill de conferencia:
   ```
   /conferir
   ```
4. O Claude vai pedir os caminhos do PDF e do Excel
5. O processo automatico faz:
   - Conversao do PDF em paginas PNG (evidencias)
   - Classificacao de cada pagina (Invoice, Packing List, Certificate, etc.)
   - Leitura e extracao dos dados do Excel (PO)
   - Extracao dos dados do PDF via visao
   - Cruzamento campo a campo (PO e fonte de verdade)
   - Geracao do CSV de conferencia + evidencias em `conferencias/<data>-<fornecedor>/`
6. Resultado aparece automaticamente no dashboard web (`/conferencias`)

### Requisitos
- `claude` CLI instalado e no PATH
- Python com `PyMuPDF` (fitz) e `openpyxl`

## Dependencias Python
- `openpyxl` — leitura de arquivos Excel (.xlsx)
- `PyMuPDF` (fitz) — conversao de PDF para PNG

## Nota sobre PDFs Escaneados
Os PDFs usados atualmente nao contem texto embutido (sao imagens escaneadas). O workflow usa leitura visual das paginas PNG + crops por coordenadas de regiao — sem necessidade de Tesseract OCR.

Se no futuro algum fornecedor enviar PDFs com texto embutido (digitais), o `page.get_text()` do PyMuPDF extrai o texto diretamente, tambem sem Tesseract.

Tesseract so seria necessario se precisar extrair texto de PDFs escaneados de forma programatica (ex: busca por palavra para crops precisos). Nesse caso, instalar via `winget install UB-Mannheim.TesseractOCR` e usar `page.get_textpage_ocr()`.

## Dados da Bronze Metal (referencia para validacao)
- **Razao Social**: Bronze Metal Ind. E Com Ltda
- **CNPJ**: 51.961.365/0001-13 (SP) / 51.961.365/0002-02 (Itajai)
- **Endereco SP**: Rua Dr. Pedro Ferreira 333, Sl 1206, Box 179, Centro, Sao Paulo SP, 04756-100
- **Endereco Miami (ECU)**: 2401 NW 69th St, Miami 1 - Ocean, Miami FL 33147, USA
- **Incoterms padrao**: FOB MIAMI
- **Payment Terms padrao**: Net 120 Days
