Voce e o assistente de setup do projeto Bronze Metal Utils.

Verifique e configure todas as dependencias necessarias para o projeto funcionar.

**IMPORTANTE**: Execute todos os passos automaticamente com o Bash tool, sem pedir confirmacao ao usuario entre os passos. Nao pare em erros recuperaveis — tente corrigir antes de desistir.

---

## Passo 1: Verificar Python

```bash
python --version 2>&1 || python3 --version 2>&1
```

Se Python nao estiver no PATH, procure em locais comuns do Windows:

```bash
ls "/c/Users/$USERNAME/AppData/Local/Programs/Python/" 2>/dev/null
```

Se Python nao estiver instalado, instale via winget (Windows):

```bash
winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements
```

Apos instalar, o executavel fica em:
`C:\Users\<usuario>\AppData\Local\Programs\Python\Python312\python.exe`

Use o caminho completo para os proximos passos se `python` nao estiver no PATH.

---

## Passo 2: Verificar e instalar dependencias Python

Tente importar cada dependencia usando o executavel encontrado/instalado:

```bash
"$PYTHON_EXE" -c "import openpyxl; print(openpyxl.__version__)" 2>&1
"$PYTHON_EXE" -c "import fitz; print(fitz.__version__)" 2>&1
```

Se faltar alguma, instale com:

```bash
"$PYTHON_EXE" -m pip install openpyxl PyMuPDF
```

Onde `$PYTHON_EXE` e o caminho completo do Python encontrado, ex:
`/c/Users/<usuario>/AppData/Local/Programs/Python/Python312/python.exe`

---

## Passo 3: Verificar Node.js e npm

```bash
node --version
npm --version
```

Node.js 18+ e necessario. Se nao encontrar, instale via https://nodejs.org.

---

## Passo 5: Instalar dependencias do dashboard web

Verifique se `web/node_modules` existe. Se nao:

```bash
cd web && npm install
```

**ATENCAO**: Se `npm install` falhar com erro 401, o `package-lock.json` pode ter URLs de um registry privado (ex: AWS CodeArtifact). Corrija assim:

```bash
rm web/package-lock.json
cd web && npm install
```

---

## Passo 6: Criar pasta de conferencias

```bash
mkdir -p conferencias
```

---

## Passo 7: Iniciar o dashboard web

Use a ferramenta `mcp__Claude_Preview__preview_start` com `name: "Next.js (web)"` para iniciar o dashboard e abrir a aba de preview automaticamente.

A configuracao ja esta em `.claude/launch.json`. Se a porta 3000 estiver ocupada, o servidor sobe em outra porta automaticamente (autoPort esta habilitado).

---

## Passo 8: Resumo

Apresente uma tabela com o status de cada componente:

| Componente | Status | Versao |
|------------|--------|--------|
| Python | OK/INSTALADO/FALHA | x.x |
| openpyxl | OK/INSTALADO/FALHA | x.x |
| PyMuPDF | OK/INSTALADO/FALHA | x.x |
| Node.js | OK/FALHA | x.x |
| npm | OK/FALHA | x.x |
| web/node_modules | OK/INSTALADO | - |
| conferencias/ | OK/CRIADO | - |
| Dashboard web | OK/FALHA | - |

Se tudo OK, informe:
- Para rodar uma conferencia: `/conferir`
- Dashboard ja aberto na aba de preview
