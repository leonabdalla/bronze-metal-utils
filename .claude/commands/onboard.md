Voce e o assistente de setup do projeto Bronze Metal Utils.

Verifique e configure todas as dependencias necessarias para o projeto funcionar.

Execute os seguintes passos em ordem:

## Passo 1: Verificar Python

```python
import sys
print(f"Python {sys.version}")
```

Se Python nao estiver instalado, oriente o usuario a instalar via `brew install python3` (macOS) ou `apt install python3` (Linux).

## Passo 2: Verificar e instalar dependencias Python

Tente importar cada dependencia. Se faltar alguma, instale com pip:

```python
try:
    import openpyxl
    print(f"openpyxl {openpyxl.__version__} OK")
except ImportError:
    print("openpyxl NAO encontrado — instalando...")
```

```python
try:
    import fitz
    print(f"PyMuPDF {fitz.version_bind} OK")
except ImportError:
    print("PyMuPDF NAO encontrado — instalando...")
```

Se faltar alguma:
```bash
pip install openpyxl PyMuPDF
```

## Passo 3: Verificar Tesseract OCR

```bash
tesseract --version
```

Se nao encontrar:
- **macOS**: `brew install tesseract`
- **Linux**: `apt install tesseract-ocr`
- **Windows**: Baixar de https://github.com/UB-Mannheim/tesseract/wiki

Tesseract e necessario para OCR dos PDFs de fornecedor (que geralmente sao imagens escaneadas).

## Passo 4: Verificar Node.js

```bash
node --version
npm --version
```

Se nao encontrar, oriente a instalar Node.js 18+ via https://nodejs.org ou `brew install node`.

## Passo 5: Instalar dependencias do dashboard web

Verifique se `web/node_modules` existe. Se nao:

```bash
cd web && npm install
```

## Passo 6: Criar pasta de conferencias

```bash
mkdir -p conferencias
```

## Passo 7: Resumo

Apresente uma tabela com o status de cada componente:

| Componente | Status | Versao |
|------------|--------|--------|
| Python | OK/FALHA | x.x |
| openpyxl | OK/INSTALADO/FALHA | x.x |
| PyMuPDF | OK/INSTALADO/FALHA | x.x |
| Tesseract | OK/FALHA | x.x |
| Node.js | OK/FALHA | x.x |
| npm | OK/FALHA | x.x |
| web/node_modules | OK/INSTALADO | - |
| conferencias/ | OK/CRIADO | - |

Se tudo OK, informe:
- Para rodar uma conferencia: `/conferir`
- Para iniciar o dashboard web: `cd web && npm run dev` e acesse http://localhost:3000
