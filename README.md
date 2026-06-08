# Front-end com GitHub Copilot — Guia Prático para Estudantes

> Guia passo a passo para criar um front-end completo para uma API REST usando apenas **HTML + Tailwind CSS + JavaScript puro**, com o **GitHub Copilot** como motor de geração de código.
>
> O backend de exemplo é a **API Armazém do Seu João**, documentada em [`docs-backend/`](docs-backend/README.md). Cada etapa traz um **exemplo completo e funcional** usando essa API, seguido de um **template com `[PLACEHOLDERS]`** para você replicar o mesmo processo com a sua própria API.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Estratégia: como dar contexto ao Copilot](#3-estratégia-como-dar-contexto-ao-copilot)
4. [Estrutura do projeto](#4-estrutura-do-projeto)
5. [⚠️ Antes de começar: CORS](#5-️-antes-de-começar-cors)
6. [Etapa 01 — Arquivo de instruções do Copilot](#etapa-01--arquivo-de-instruções-do-copilot)
7. [Etapa 02 — Configuração base (`js/config.js`)](#etapa-02--configuração-base-jsconfigjs)
8. [Etapa 03 — Dashboard (`index.html`)](#etapa-03--dashboard-indexhtml)
9. [Etapa 04 — Produtos (`products.html`)](#etapa-04--produtos-productshtml)
10. [Etapa 05 — Clientes (`customers.html`)](#etapa-05--clientes-customershtml)
11. [Etapa 06 — Pedidos (`orders.html`)](#etapa-06--pedidos-ordershtml)
12. [Etapa 07 — Refinamentos visuais](#etapa-07--refinamentos-visuais)
13. [Verificação e Debug](#13-verificação-e-debug)
14. [Adaptando para sua própria API](#14-adaptando-para-sua-própria-api)

---

## 1. Visão Geral

### Stack utilizada

| Tecnologia                      | Papel                                  |
| ------------------------------- | -------------------------------------- |
| **HTML**                        | Estrutura das páginas                  |
| **Tailwind CSS** via CDN        | Estilo visual sem instalação nem build |
| **JavaScript puro** (Fetch API) | Comunicação com o backend              |
| **GitHub Copilot**              | Geração de código com IA               |

Nenhum framework (React, Vue, Angular), nenhum bundler, nenhum `npm install` no front-end. Tudo roda abrindo os arquivos `.html` em um servidor local.

### O que será construído

Quatro páginas HTML independentes:

| Página    | Arquivo          | Funcionalidade                                        |
| --------- | ---------------- | ----------------------------------------------------- |
| Dashboard | `index.html`     | Visão geral: contagem de produtos, clientes e pedidos |
| Produtos  | `products.html`  | Listar, criar, editar e remover produtos              |
| Clientes  | `customers.html` | Listar, criar, editar e remover clientes              |
| Pedidos   | `orders.html`    | Criar e listar pedidos, visualizar detalhes           |

```
┌──────────────────────────────────────────────────────┐
│  index.html — Dashboard                              │
│                                                      │
│  ┌────────────────┐ ┌───────────────┐ ┌──────────┐  │
│  │  12            │ │  8            │ │  24      │  │
│  │  Produtos      │ │  Clientes     │ │  Pedidos │  │
│  └────────────────┘ └───────────────┘ └──────────┘  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  products.html — Produtos         [+ Novo Produto]   │
│  ┌──────────────────────────────────────────────┐    │
│  │ Nome        │ Preço   │ Descrição  │  Ações  │    │
│  │ Arroz 5kg   │ R$28,90 │ Tipo 1     │  ✏️ 🗑️  │    │
│  │ Feijão 1kg  │ R$9,50  │ Carioca    │  ✏️ 🗑️  │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  orders.html — Pedidos            [+ Novo Pedido]    │
│  ┌──────────────────────────────────────────────┐    │
│  │ # │ Cliente      │ Total    │ Data  │ Detalhe │    │
│  │ 1 │ Maria Silva  │ R$86,70  │ 07/06 │   👁️    │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## 2. Pré-requisitos

- **VS Code** com a extensão [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) instalada e ativa
- **Backend rodando** em `http://localhost:3000` — siga [`docs-backend/README.md`](docs-backend/README.md)
- Extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code (para servir os arquivos HTML localmente)
- Conhecimento básico de HTML e JavaScript

**Verificar se o Copilot está ativo:** `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows) → "GitHub Copilot: Status".

---

## 3. Estratégia: como dar contexto ao Copilot

O Copilot gera código **muito mais preciso** quando conhece a estrutura da sua API. Há duas formas complementares de fornecer esse contexto:

### 3.1 Arquivo de instruções persistente

O Copilot lê automaticamente o arquivo `.github/copilot-instructions.md` em todas as interações dentro do workspace. É o lugar onde você descreve sua API **uma única vez** — e o Copilot passa a usar essa informação em todos os prompts seguintes sem você precisar repetir.

> Implementado na **Etapa 01**.

### 3.2 Referências com `#` no Copilot Chat

Além do arquivo de instruções, você pode anexar arquivos específicos diretamente no chat para um prompt pontual:

1. Abra o Copilot Chat (`Ctrl+Alt+I` ou clique no ícone de chat na barra lateral)
2. Digite `#` e comece a digitar o nome do arquivo — um seletor vai aparecer
3. Selecione o arquivo e envie junto com o prompt

```
Exemplo de uso no Copilot Chat:

  #docs-backend/requests.http  #docs-backend/Analise.md

  Com base nesses arquivos, gere o código JavaScript para listar
  todos os produtos e exibi-los em uma tabela HTML com Tailwind CSS.
```

> **Regra de ouro**: antes de pedir qualquer implementação, sempre anexe a documentação da sua API. Copilot sem contexto gera código genérico; Copilot com contexto gera código específico para o seu projeto.

---

## 4. Estrutura do projeto

```
ai-front/
├── index.html           ← Dashboard principal
├── products.html        ← CRUD de Produtos
├── customers.html       ← CRUD de Clientes
├── orders.html          ← Criar e listar Pedidos
├── js/
│   ├── config.js        ← BASE_URL e função fetchAPI()
│   ├── products.js      ← Lógica da tela de produtos
│   ├── customers.js     ← Lógica da tela de clientes
│   └── orders.js        ← Lógica da tela de pedidos
├── docs-backend/        ← Documentação do backend (já existe)
│   ├── README.md
│   ├── Analise.md
│   └── requests.http
└── README.md            ← Este arquivo
```

Crie as pastas e arquivos vazios pelo terminal:

```bash
mkdir js
touch index.html products.html customers.html orders.html
touch js/config.js js/products.js js/customers.js js/orders.js
```

---

## 5. ⚠️ Antes de começar: CORS

**O que é CORS?** É uma política de segurança do browser que **bloqueia por padrão** chamadas JavaScript feitas de uma origem para outra. Como o front-end roda em uma porta diferente da API (ex.: `localhost:5500` → `localhost:3000`), o browser rejeita todas as chamadas `fetch` sem uma permissão explícita do servidor.

**Sintoma no console do browser (F12):**

```
Access to fetch at 'http://localhost:3000/products' from origin
'http://127.0.0.1:5500' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present...
```

### Solução: habilitar CORS no backend Express

No terminal do projeto **backend**, instale o pacote:

```bash
npm install cors
npm install -D @types/cors
```

Abra `src/app.ts` e adicione o middleware **antes** das rotas:

```typescript
import express from 'express';
import cors from 'cors'; // ← 1. importar
import routes from './routes';
import { errorHandler } from './middlewares/error-handler';

export const app = express();

app.use(cors()); // ← 2. adicionar antes das rotas
app.use(express.json());
app.use(routes);
app.use(errorHandler);
```

Reinicie o servidor (`npm run dev`). O CORS estará habilitado para qualquer origem — adequado para desenvolvimento.

> **Não tenho acesso ao backend?** Se você está consumindo uma API de terceiros ou não pode alterar o servidor, instale a extensão [CORS Unblock](https://chromewebstore.google.com/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino) no Chrome para desativar a restrição **apenas no seu browser durante o desenvolvimento**. Nunca use isso em produção.

---

## Etapa 01 — Arquivo de instruções do Copilot

**Objetivo**: criar o arquivo `.github/copilot-instructions.md` que descreve a API para que o Copilot tenha contexto persistente em todos os prompts do workspace.

Crie a pasta e o arquivo:

```bash
mkdir -p .github
touch .github/copilot-instructions.md
```

Abra `.github/copilot-instructions.md` no VS Code, abra o Copilot Chat e use um dos prompts abaixo para preenchê-lo:

---

> ### 💬 Prompt — Exemplo completo (API Armazém do Seu João)
>
> ```
> #docs-backend/Analise.md  #docs-backend/requests.http
>
> Com base nesses arquivos, gere o conteúdo completo para o arquivo
> .github/copilot-instructions.md descrevendo a API para um agente de IA.
>
> O arquivo deve conter:
> - Nome e descrição resumida da API
> - URL base: http://localhost:3000
> - Lista de todas as entidades com seus campos e tipos TypeScript
> - Tabela de todos os endpoints: método HTTP, rota, corpo esperado e resposta
> - Todas as regras de negócio (e-mail único, preço > 0, restrições de exclusão etc.)
> - Stack do front-end: HTML puro, Tailwind CSS via CDN Play, JavaScript puro (Fetch API)
> - Instrução explícita para NUNCA usar React, Vue, Angular ou qualquer framework JS
> ```

---

> ### 💬 Prompt — Template para adaptar à sua API
>
> ```
> #[SEU-ARQUIVO-DE-DOCUMENTAÇÃO]  #[SEU-ARQUIVO-DE-ENDPOINTS-OU-REQUESTS]
>
> Com base nesses arquivos, gere o conteúdo completo para o arquivo
> .github/copilot-instructions.md descrevendo a API para um agente de IA.
>
> O arquivo deve conter:
> - Nome e descrição da API: [NOME DO SEU SISTEMA]
> - URL base: [URL BASE — ex: http://localhost:3000]
> - Lista de todas as entidades com seus campos e tipos
> - Tabela de todos os endpoints: método HTTP, rota, corpo e resposta
> - Regras de negócio relevantes
> - Stack do front-end: HTML puro, Tailwind CSS via CDN Play, JavaScript puro (Fetch API)
> - Instrução para NUNCA usar React, Vue, Angular ou qualquer framework JS
> ```

---

**Exemplo de resultado** que o Copilot deve gerar para a API do Armazém:

```markdown
# Armazém do Seu João — Contexto da API

## Configuração

- **URL Base**: `http://localhost:3000`
- **Stack do Front-end**: HTML puro, Tailwind CSS (CDN Play), JavaScript puro (Fetch API)
- **Restrição**: nunca usar React, Vue, Angular ou qualquer framework JS

## Entidades

- **Product**: `id` (number), `name` (string), `description` (string|null), `price` (number), `created_at` (string)
- **Customer**: `id` (number), `name` (string), `email` (string, único), `phone` (string|null), `created_at` (string)
- **Order**: `id` (number), `customer_id` (number), `total` (number), `created_at` (string)
- **OrderItem**: `id`, `order_id`, `product_id`, `quantity` (int > 0), `unit_price` (number)

## Endpoints

| Método | Rota                  | Corpo da Requisição                                  | Resposta      |
| ------ | --------------------- | ---------------------------------------------------- | ------------- |
| GET    | /products             | —                                                    | Product[]     |
| GET    | /products/:id         | —                                                    | Product       |
| POST   | /products             | `{ name, description?, price }`                      | Product 201   |
| PUT    | /products/:id         | `{ name?, description?, price? }`                    | Product       |
| DELETE | /products/:id         | —                                                    | 204           |
| GET    | /customers            | —                                                    | Customer[]    |
| GET    | /customers/:id        | —                                                    | Customer      |
| POST   | /customers            | `{ name, email, phone? }`                            | Customer 201  |
| PUT    | /customers/:id        | `{ name?, email?, phone? }`                          | Customer      |
| DELETE | /customers/:id        | —                                                    | 204           |
| GET    | /customers/:id/orders | —                                                    | Order[]       |
| GET    | /orders               | —                                                    | Order[]       |
| GET    | /orders/:id           | —                                                    | Order + itens |
| POST   | /orders               | `{ customer_id, items: [{ product_id, quantity }] }` | Order 201     |

## Regras de Negócio

- E-mail de cliente é único — duplicata retorna 409
- Preço de produto deve ser maior que zero
- Pedido deve ter pelo menos 1 item
- Não é possível remover produto que esteja em algum pedido (retorna 409)
- Não é possível remover cliente que tenha pedidos registrados (retorna 409)
- O preço registrado no item do pedido é o preço do produto no momento da venda
```

### ✅ Critérios de verificação — Etapa 01

- [ ] Arquivo `.github/copilot-instructions.md` criado e salvo
- [ ] Contém a URL base da API
- [ ] Lista todas as entidades com seus campos e tipos
- [ ] Lista todos os endpoints com método, rota e corpo
- [ ] Contém a restrição de não usar frameworks JS

---

## Etapa 02 — Configuração base (`js/config.js`)

**Objetivo**: criar um arquivo central com a URL base da API e uma função `fetchAPI()` reutilizável que padroniza todas as chamadas e centraliza o tratamento de erros.

> **Por que começar aqui?** Todos os outros arquivos JS vão usar `fetchAPI`. Se o Copilot souber que ela existe desde o início, ele a usará automaticamente nos prompts seguintes sem você precisar pedir.

Abra `js/config.js` e use o prompt:

---

> ### 💬 Prompt — Exemplo completo (API Armazém)
>
> ```
> Crie o arquivo js/config.js para o front-end da API Armazém do Seu João.
>
> O arquivo deve:
> - Declarar a constante BASE_URL = 'http://localhost:3000'
> - Declarar uma função assíncrona fetchAPI(path, options = {}) que:
>     • Faz fetch para BASE_URL + path
>     • Combina o cabeçalho 'Content-Type: application/json' com qualquer
>       header extra passado em options
>     • Se o status for 204, retorna null (sem body)
>     • Se a resposta não for ok (status >= 400), faz throw de um Error com
>       a mensagem do campo "error" do JSON retornado, ou o statusText
>     • Caso contrário, retorna o JSON da resposta
> - Usar JavaScript puro — sem import/export de módulos ES, pois os arquivos
>   serão carregados com <script> no HTML e precisam de variáveis globais
> ```

---

> ### 💬 Prompt — Template para adaptar
>
> ```
> Crie o arquivo js/config.js para o front-end da API [NOME DA SUA API].
>
> O arquivo deve:
> - Declarar a constante BASE_URL = '[URL BASE DA SUA API]'
> - Declarar uma função assíncrona fetchAPI(path, options = {}) que:
>     • Faz fetch para BASE_URL + path
>     • Combina Content-Type: application/json com headers extras de options
>     • Retorna null se status 204
>     • Lança um Error com a mensagem de erro da API se a resposta não for ok
>     • Retorna o JSON da resposta em caso de sucesso
> - JavaScript puro — sem módulos ES, variáveis globais via <script>
> ```

---

**Exemplo de resultado esperado:**

```javascript
const BASE_URL = 'http://localhost:3000';

async function fetchAPI(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || response.statusText);
  }

  return data;
}
```

### ✅ Critérios de verificação — Etapa 02

- [ ] `BASE_URL` declarada como variável global (sem `const` exportado)
- [ ] `fetchAPI` disponível globalmente (sem `export`)
- [ ] Trata status 204 (respostas de DELETE sem corpo)
- [ ] Lança `Error` com a mensagem do campo `"error"` da API

---

## Etapa 03 — Dashboard (`index.html`)

**Objetivo**: criar a página inicial com cards que exibem a contagem total de produtos, clientes e pedidos, e links de navegação para as demais páginas.

Abra `index.html` e use o prompt:

---

> ### 💬 Prompt — Exemplo completo (API Armazém)
>
> ```
> Crie o arquivo index.html para o dashboard do front-end da API Armazém do Seu João.
>
> Requisitos:
> - HTML5 completo com Tailwind CSS carregado via CDN:
>   <script src="https://cdn.tailwindcss.com"></script>
> - Carregar js/config.js com <script> antes de qualquer outro script
> - Barra de navegação no topo com o nome do sistema e links para:
>     Início (index.html), Produtos (products.html),
>     Clientes (customers.html), Pedidos (orders.html)
> - Título da página: "Armazém do Seu João"
> - Três cards lado a lado (grid responsivo, quebra para coluna no mobile) exibindo:
>     • Total de Produtos — busca GET /products e conta os itens do array
>     • Total de Clientes — busca GET /customers e conta os itens do array
>     • Total de Pedidos  — busca GET /orders e conta os itens do array
> - Cada card: ícone (pode ser emoji), número em destaque (texto grande), rótulo
> - Exibir "Carregando..." enquanto os dados chegam (antes do fetch resolver)
> - Em caso de erro, exibir mensagem vermelha no lugar do número
> - Design: fundo cinza claro (gray-100), cards brancos com sombra (shadow-md),
>   fonte limpa, espaçamento generoso
> - Usar a função fetchAPI() declarada em js/config.js
> ```

---

> ### 💬 Prompt — Template para adaptar
>
> ```
> Crie o arquivo index.html para o dashboard do front-end da API [NOME DA SUA API].
>
> Requisitos:
> - HTML5 com Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
> - Carregar js/config.js antes de qualquer outro script
> - Barra de navegação com links para: [LISTA DE PÁGINAS E ARQUIVOS .html]
> - Título: "[NOME DO SEU SISTEMA]"
> - [N] cards exibindo a contagem de:
>     [ENTIDADE 1] — GET /[rota1], contar itens do array
>     [ENTIDADE 2] — GET /[rota2], contar itens do array
>     ...
> - Estado de "Carregando..." durante o fetch
> - Mensagem de erro vermelha em caso de falha
> - Design: fundo cinza claro, cards brancos com sombra, responsivo
> - Usar fetchAPI() de js/config.js
> ```

---

> 💡 **Dica de refinamento**: Se o visual não ficou como esperado, peça ajustes específicos sem reescrever tudo:
>
> ```
> #index.html
>
> Ajuste o design: use azul (blue-600) como cor de destaque nos números dos cards,
> deixe o número em text-5xl e adicione um rodapé simples com o nome do sistema.
> ```

### ✅ Critérios de verificação — Etapa 03

- [ ] Tailwind CDN carregado
- [ ] `js/config.js` carregado antes dos scripts de lógica
- [ ] Os 3 cards buscam dados reais da API ao abrir a página
- [ ] Navegação funciona — links levam às outras páginas
- [ ] Estado de loading visível antes dos dados chegarem
- [ ] Erro exibido na tela (não no `console`)

---

## Etapa 04 — Produtos (`products.html`)

**Objetivo**: tela completa de CRUD de produtos — listagem em tabela, formulário de criação/edição e exclusão com confirmação.

Gere primeiro o arquivo de lógica (`js/products.js`), depois o HTML (`products.html`). Essa ordem garante que o Copilot saiba o que o JS faz ao gerar o HTML que o carrega.

### 4.1 Gerando `js/products.js`

---

> ### 💬 Prompt — Exemplo completo (API Armazém)
>
> ```
> Crie o arquivo js/products.js para a tela de produtos da API Armazém do Seu João.
>
> A lógica deve:
> - Ao carregar a página (DOMContentLoaded), buscar GET /products e renderizar
>   a lista em uma tabela HTML (id="products-table-body") com colunas:
>   Nome | Preço (formatado como R$ com 2 casas) | Descrição | Ações
> - Botão "Editar" em cada linha: preenche o formulário com os dados do produto
>   e guarda o id em um campo hidden (id="product-id") para o PUT
> - Botão "Excluir" em cada linha: pede window.confirm e faz DELETE /products/:id
> - Formulário (id="product-form") com campos:
>     name  (text, obrigatório)
>     description  (text, opcional)
>     price  (number, step="0.01", obrigatório)
> - Ao submeter o formulário:
>     • Se #product-id estiver vazio → POST /products com { name, description, price }
>     • Se #product-id tiver valor  → PUT  /products/:id com os campos preenchidos
> - Após qualquer operação bem-sucedida: recarregar a lista e limpar o formulário
> - Exibir mensagens de sucesso (verde) e erro (vermelho) em uma div (id="message")
>   que some após 4 segundos — nunca usar alert()
> - Usar a função fetchAPI() global de js/config.js
> - JavaScript puro, sem módulos ES
> ```

---

> ### 💬 Prompt — Template para adaptar
>
> ```
> Crie o arquivo js/[NOME-DA-ENTIDADE].js para a tela de [NOME AMIGÁVEL]
> da API [NOME DA SUA API].
>
> A lógica deve:
> - Ao carregar (DOMContentLoaded), buscar GET /[ROTA] e renderizar em tabela
>   (id="[entidade]-table-body") com colunas: [CAMPO1] | [CAMPO2] | ... | Ações
> - Botão "Editar": preenche formulário e guarda id em campo hidden
> - Botão "Excluir": window.confirm + DELETE /[ROTA]/:id
> - Formulário (id="[entidade]-form") com campos:
>     [CAMPO] ([tipo HTML], obrigatório/opcional)
> - Ao submeter: POST para criar / PUT para editar (baseado na presença de id)
> - Após operação: recarregar lista e limpar formulário
> - Mensagens de sucesso/erro em div (id="message") que some em 4s — sem alert()
> - Usar fetchAPI() global; JavaScript puro sem módulos ES
> ```

---

### 4.2 Gerando `products.html`

---

> ### 💬 Prompt — Exemplo completo (API Armazém)
>
> ```
> #js/products.js
>
> Crie o arquivo products.html para a tela de produtos.
>
> Requisitos:
> - HTML5 com Tailwind CDN e mesma barra de navegação do index.html
> - Carregar js/config.js e depois js/products.js antes do </body>
> - Título da seção: "Produtos"
> - Botão "Novo Produto" que alterna a visibilidade do formulário (toggle)
> - Formulário (id="product-form") com:
>     input name (text, obrigatório, placeholder "Nome do produto")
>     input description (text, placeholder "Descrição (opcional)")
>     input price (number, step="0.01", obrigatório, placeholder "0,00")
>     input hidden (id="product-id")
>     botões "Salvar" (submit) e "Cancelar" (limpa e esconde o form)
> - Div (id="message") para feedback de sucesso/erro
> - Tabela com thead: Nome | Preço | Descrição | Ações
>   e tbody (id="products-table-body") populado pelo JS
> - Design Tailwind consistente com index.html
> ```

---

> ### 💬 Prompt — Template para adaptar
>
> ```
> #js/[NOME-DA-ENTIDADE].js
>
> Crie o arquivo [NOME-DA-ENTIDADE].html para a tela de [NOME AMIGÁVEL].
>
> Requisitos:
> - HTML5 com Tailwind CDN, mesma barra de navegação do index.html
> - Carregar js/config.js e js/[NOME-DA-ENTIDADE].js antes do </body>
> - Título: "[NOME AMIGÁVEL]"
> - Botão "[+ NOVO ITEM]" que faz toggle do formulário
> - Formulário (id="[entidade]-form") com:
>     [input CAMPO (type, obrigatório/opcional, placeholder)]
>     input hidden (id="[entidade]-id")
>     botões "Salvar" e "Cancelar"
> - Div (id="message") para feedback
> - Tabela com thead: [COLUNAS] | Ações
>   e tbody (id="[entidade]-table-body")
> - Design Tailwind consistente com index.html
> ```

---

### ✅ Critérios de verificação — Etapa 04

- [ ] Tabela carrega ao abrir a página
- [ ] Criar produto funciona — `POST /products` com os dados corretos
- [ ] Editar funciona — formulário pré-preenchido e `PUT /products/:id` enviado
- [ ] Excluir funciona com confirmação — `DELETE /products/:id`
- [ ] Mensagem de sucesso/erro visível sem `alert()`
- [ ] Lista atualiza automaticamente após cada operação

---

## Etapa 05 — Clientes (`customers.html`)

**Objetivo**: replicar o padrão de Produtos para Clientes, com as diferenças: campo `email` (obrigatório, único), campo `phone` (opcional) e botão "Ver Pedidos" que liga à tela de pedidos.

---

> ### 💬 Prompt — Exemplo completo (API Armazém)
>
> ```
> #products.html  #js/products.js
>
> Usando os arquivos acima como referência de padrão visual e de código,
> crie js/customers.js e customers.html para a tela de clientes
> da API Armazém do Seu João.
>
> Diferenças em relação à tela de produtos:
> - Entidade Customer: id, name, email (obrigatório, único), phone (opcional)
> - Endpoints: GET/POST/PUT/DELETE /customers (mesmo padrão de /products)
> - Tabela com colunas: Nome | E-mail | Telefone | Ações
> - Formulário com campos:
>     name (text, obrigatório)
>     email (email, obrigatório)
>     phone (text, opcional)
> - Na coluna Ações, além de "Editar" e "Excluir", adicionar um botão
>   "Pedidos" que redireciona para orders.html?customer_id=ID_DO_CLIENTE
>   (esse parâmetro de URL será usado na Etapa 06)
> - Manter o mesmo design, comportamento de mensagens e de loading
> ```

---

> ### 💬 Prompt — Template para adaptar
>
> ```
> #[HTML-DA-ENTIDADE-JÁ-CRIADA]  #[JS-DA-ENTIDADE-JÁ-CRIADA]
>
> Usando esses arquivos como referência, crie js/[NOVA-ENTIDADE].js e
> [NOVA-ENTIDADE].html para a tela de [NOME AMIGÁVEL] da API [NOME DA API].
>
> Diferenças em relação à referência:
> - Entidade [NOME]: [CAMPO (tipo, restrição)]
> - Endpoints: GET/POST/PUT/DELETE /[ROTA]
> - Tabela com colunas: [COLUNAS]
> - Formulário com campos: [CAMPO (tipo, obrigatório/opcional)]
> - [FUNCIONALIDADE EXTRA — ex: botão de ação adicional, link para outra tela]
> - Manter mesmo design e comportamento da referência
> ```

---

> 💡 **Dica**: Usar `#products.html` como referência faz o Copilot manter consistência visual e de código entre as páginas. **Repita essa estratégia sempre que criar uma nova tela.**

### ✅ Critérios de verificação — Etapa 05

- [ ] Listagem, criação, edição e exclusão funcionam corretamente
- [ ] Input de e-mail usa `type="email"` no HTML
- [ ] Criar dois clientes com o mesmo e-mail exibe erro 409 na tela
- [ ] Botão "Pedidos" gera URL com `?customer_id=ID` correto
- [ ] Design consistente com `products.html`

---

## Etapa 06 — Pedidos (`orders.html`)

**Objetivo**: tela mais complexa — listagem de pedidos, formulário com seleção dinâmica de cliente e múltiplos itens (produto + quantidade), e visualização de detalhe de um pedido.

> **Por que é mais complexo?** A criação de um pedido exige chamadas à API antes mesmo de renderizar o formulário: buscar clientes para o `<select>` e buscar produtos para os selects de itens. Além disso, o número de itens é variável — o usuário pode adicionar e remover linhas dinamicamente.

---

> ### 💬 Prompt — Exemplo completo (API Armazém)
>
> ```
> #docs-backend/requests.http  #js/config.js  #js/customers.js
>
> Crie js/orders.js e orders.html para a tela de pedidos
> da API Armazém do Seu João.
>
> === FUNCIONALIDADE 1: LISTAGEM ===
> Ao carregar a página, buscar GET /orders e exibir tabela com colunas:
> # | Cliente (customer_id) | Total (R$) | Data (created_at formatada) | Ver Detalhe
>
> === FUNCIONALIDADE 2: CRIAR PEDIDO ===
> - Botão "Novo Pedido" mostra o formulário
> - Ao abrir o formulário, carregar GET /customers e preencher um <select>
>   com opções no formato "Nome — email"
> - Seção "Itens do Pedido" com:
>     • Botão "Adicionar Item" que insere uma nova linha de item
>     • Cada linha: <select> de produtos (GET /products, exibe "Nome — R$Preço")
>       + input de quantidade (number, min=1) + botão "Remover"
>     • Começa com 1 linha já adicionada
> - Botão "Criar Pedido" que valida (mínimo 1 item) e envia POST /orders com:
>   { customer_id: Number, items: [{ product_id: Number, quantity: Number }] }
>
> === FUNCIONALIDADE 3: VER DETALHE ===
> - Botão "Ver Detalhe" na tabela faz GET /orders/:id e exibe abaixo da tabela
>   uma seção com: ID do pedido, cliente, total (R$), data e uma sub-tabela
>   de itens com: Produto (product_id) | Qtd | Preço Unit. (R$) | Subtotal (R$)
>
> === FUNCIONALIDADE 4: FILTRO POR CLIENTE ===
> - Se a URL contiver ?customer_id=X, pré-selecionar esse cliente no <select>
>   do formulário assim que os clientes forem carregados
>
> Usar fetchAPI() global; JavaScript puro; Tailwind CSS; mesmo design das outras páginas.
> ```

---

> ### 💬 Prompt — Template para adaptar
>
> ```
> #[ARQUIVO-DE-REQUESTS]  #js/config.js
>
> Crie js/[ENTIDADE-COMPOSTA].js e [ENTIDADE-COMPOSTA].html para uma tela
> que envolve [DESCRIÇÃO DO RELACIONAMENTO].
>
> === FUNCIONALIDADE 1: LISTAGEM ===
> Buscar GET /[ROTA] e exibir tabela com: [COLUNAS]
>
> === FUNCIONALIDADE 2: CRIAR ===
> - Formulário com:
>     • <select> dinâmico carregado de GET /[ENTIDADE-RELACIONADA]
>     • Botão para adicionar linhas de itens dinamicamente
>     • Cada item: [SELECT/INPUT] + [CAMPO] + botão Remover
> - Enviar POST /[ROTA] com: { [ESTRUTURA DO BODY] }
> - Validação: [REGRA DE NEGÓCIO — ex: pelo menos 1 item]
>
> === FUNCIONALIDADE 3: VER DETALHE ===
> - Botão na tabela faz GET /[ROTA]/:id e exibe [DADOS DO DETALHE]
>
> Usar fetchAPI() global; JavaScript puro; Tailwind CSS.
> ```

---

### ✅ Critérios de verificação — Etapa 06

- [ ] Listagem de pedidos carrega ao abrir a página
- [ ] `<select>` de clientes é populado via `GET /customers`
- [ ] `<select>` de produtos é populado via `GET /products`
- [ ] Adicionar/remover linhas de itens funciona
- [ ] Validação impede enviar pedido com 0 itens
- [ ] `POST /orders` enviado com a estrutura `{ customer_id, items }` correta
- [ ] Detalhe do pedido exibe itens com preço unitário e subtotal
- [ ] URL com `?customer_id=X` pré-seleciona o cliente no `<select>`

---

## Etapa 07 — Refinamentos visuais

**Objetivo**: melhorar a experiência do usuário com feedback visual durante chamadas à API.

### 7.1 Spinner de loading

---

> ### 💬 Prompt
>
> ```
> #js/products.js
>
> Adicione feedback de loading à tela de produtos:
> - Criar uma função showLoading(show) que exibe/esconde um spinner
>   centralizado usando as classes Tailwind: animate-spin, rounded-full,
>   border-4, border-blue-500, border-t-transparent, h-8, w-8
> - Chamar showLoading(true) antes de cada fetchAPI() e showLoading(false)
>   no finally (tanto em sucesso quanto em erro)
> - O spinner deve aparecer na área da tabela, não na página inteira
> - Aplicar o mesmo padrão em js/customers.js e js/orders.js
> ```

---

### 7.2 Notificações toast

---

> ### 💬 Prompt
>
> ```
> #js/config.js
>
> Adicione ao final de js/config.js uma função showToast(message, type):
> - type: 'success' (fundo verde, ícone ✓) ou 'error' (fundo vermelho, ícone ✗)
> - O toast aparece no canto superior direito da tela com posição fixed
> - Entra com animação suave (transição de opacidade) e some após 3 segundos
> - Usa apenas Tailwind CSS para estilo
> - Substitua as divs de mensagem inline (id="message") de todas as telas
>   por chamadas a showToast()
> ```

---

### ✅ Critérios de verificação — Etapa 07

- [ ] Spinner aparece durante qualquer chamada à API e some ao terminar
- [ ] Toast verde aparece após criar, editar ou excluir com sucesso
- [ ] Toast vermelho aparece com a mensagem de erro retornada pela API
- [ ] Toasts somem automaticamente após 3 segundos

---

## 13. Verificação e Debug

### Checklist funcional completo

| Funcionalidade                   | Como testar                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Dashboard exibe contagens reais  | Abrir `index.html` pelo Live Server — números devem vir do banco                    |
| Criar produto                    | Preencher formulário em `products.html` e salvar                                    |
| Editar produto                   | Clicar em "Editar" — formulário preenche com dados atuais                           |
| Excluir produto                  | Clicar em "Excluir", confirmar — item deve sumir da lista                           |
| Validação de preço inválido      | Enviar produto com `price: -1` — deve exibir erro                                   |
| E-mail duplicado retorna 409     | Cadastrar dois clientes com o mesmo e-mail                                          |
| Criar pedido com múltiplos itens | Adicionar 2+ produtos com quantidades diferentes                                    |
| Ver detalhe do pedido            | Clicar em "Ver Detalhe" — itens com preços devem aparecer                           |
| Link "Pedidos" do cliente        | Deve redirecionar para `orders.html?customer_id=X` com o `<select>` pré-selecionado |

### Debug pelo DevTools (F12 → aba Network)

| Comportamento           | Provável causa                                    | Como resolver                                         |
| ----------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| Erro de CORS no console | Backend sem middleware `cors`                     | Volte para a [Seção 5](#5-️-antes-de-começar-cors)     |
| `Failed to fetch`       | Backend não está rodando                          | `npm run dev` no projeto backend                      |
| Status 400              | Dados inválidos no body                           | Inspecione aba "Payload" na requisição no DevTools    |
| Status 404              | ID inexistente                                    | Verifique se o seed foi executado (`npm run db:seed`) |
| Status 409              | Violação de regra de negócio                      | Leia a mensagem de erro retornada pela API            |
| Tabela vazia após criar | Função de recarregar lista não está sendo chamada | Revise o `then` / `await` após a operação             |

---

## 14. Adaptando para sua própria API

Siga este roteiro para replicar todo o processo com a sua API.

### Passo 1 — Mapeie sua API antes de abrir o Copilot

Responda às perguntas abaixo. Com isso em mãos, os prompts ficam muito mais diretos:

```
□ Qual é o nome do meu sistema?          _______________________________
□ Qual é a URL base?                     _______________________________
□ Quais são as entidades principais?     _______________________________
□ Para cada entidade:
    - Quais campos existem?              _______________________________
    - Quais são obrigatórios?            _______________________________
    - Quais são os tipos (text, number)?  _______________________________
□ Quais endpoints existem?
    (método + rota + body esperado)      _______________________________
□ Quais regras de negócio existem?
    (unicidade, restrições de exclusão)  _______________________________
□ Há entidades relacionadas entre si?    _______________________________
```

### Passo 2 — Crie o arquivo de instruções do Copilot

Use o template do [Etapa 01](#etapa-01--arquivo-de-instruções-do-copilot) substituindo os `[PLACEHOLDERS]` com as respostas do Passo 1. Isso é o que garante que o Copilot "conhece" sua API em todos os prompts seguintes.

### Passo 3 — Siga as etapas na mesma ordem

```
Etapa 01 → Etapa 02 → Etapa 03 → Etapa 04 → Etapa 05 → ... → Etapa 07
(instruções) (config.js) (dashboard) (entidade 1) (entidade 2)
```

**Regra**: gere as entidades mais simples primeiro (sem relacionamentos) e deixe as telas com relacionamentos (como "pedidos") para o final. Isso garante que os `<select>` dinâmicos já tenham os dados disponíveis quando você for criá-los.

### Passo 4 — Tabela de substituição de placeholders

Para adaptar qualquer prompt deste guia, faça estas substituições:

| Placeholder                              | Substituir por                                             |
| ---------------------------------------- | ---------------------------------------------------------- |
| `[NOME DA SUA API]`                      | Nome do seu sistema (ex: "Biblioteca Municipal")           |
| `[URL BASE DA SUA API]`                  | ex: `http://localhost:3000`                                |
| `[NOME-DA-ENTIDADE]`                     | Nome em minúsculo para arquivo (ex: `book`, `author`)      |
| `[NOME AMIGÁVEL]`                        | Nome para exibição (ex: "Livros", "Autores")               |
| `[ROTA]`                                 | Caminho da API (ex: `books`, `authors`)                    |
| `[CAMPO (tipo, restrição)]`              | ex: `title (text, obrigatório)`, `year (number, opcional)` |
| `[COLUNAS]`                              | ex: `Título \| Ano \| Autor \| Ações`                      |
| `[ESTRUTURA DO BODY]`                    | ex: `{ title, author_id, year }`                           |
| `[SEU-ARQUIVO-DE-DOCUMENTAÇÃO]`          | Caminho para o README ou análise da sua API                |
| `[SEU-ARQUIVO-DE-ENDPOINTS-OU-REQUESTS]` | Caminho para o `.http` ou swagger da sua API               |

### Template de `.github/copilot-instructions.md`

Copie, preencha e salve para a sua API:

```markdown
# [NOME DO SISTEMA] — Contexto da API

## Configuração

- **URL Base**: `[URL BASE]`
- **Stack do Front-end**: HTML puro, Tailwind CSS via CDN Play, JavaScript puro (Fetch API)
- **Restrição**: nunca usar React, Vue, Angular ou qualquer framework JS

## Entidades

- **[NomeEntidade1]**: `campo1` (tipo), `campo2` (tipo, restrição)
- **[NomeEntidade2]**: `campo1` (tipo), `campo2` (tipo, restrição)

## Endpoints

| Método | Rota            | Corpo                | Resposta     |
| ------ | --------------- | -------------------- | ------------ |
| GET    | /[entidade]     | —                    | Entidade[]   |
| GET    | /[entidade]/:id | —                    | Entidade     |
| POST   | /[entidade]     | { campo1, campo2 }   | Entidade 201 |
| PUT    | /[entidade]/:id | { campo1?, campo2? } | Entidade     |
| DELETE | /[entidade]/:id | —                    | 204          |

## Regras de Negócio

- [Regra 1 — ex: campo X é único, retorna 409 se duplicado]
- [Regra 2 — ex: campo Y deve ser maior que zero]
- [Regra 3 — ex: não remover entidade A que tenha entidade B associada]
```

---

> **Lembre-se**: o Copilot amplifica o que você sabe — não substitui o entendimento. Quando o código gerado tiver um problema, use o próprio Copilot para depurar: selecione o trecho com erro, abra o chat e descreva o que está acontecendo de errado. Iterar faz parte do processo.
