# App Editor de Vídeo com IA

Editor de vídeo inteligente usando **Next.js**, **Remotion** e **Claude AI**.

## Tecnologias

- **Next.js 14** — Framework React com App Router
- **Remotion** — Criação de vídeos programaticamente com React
- **Claude API (Opus 4.6)** — IA para interpretar e aplicar edições em linguagem natural
- **Tailwind CSS** — Estilização
- **Supabase** — Storage e banco de dados *(em breve)*

## Como funciona

1. A composição de vídeo é representada como um estado JSON (camadas, duração, fundo)
2. O usuário digita um comando em português no chat
3. Claude interpreta o comando e usa a ferramenta `update_composition` para retornar o estado atualizado
4. O Remotion Player renderiza o vídeo atualizado em tempo real

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o `.env.local` e adicione sua chave da API Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-...
```

> Obtenha sua chave em: https://console.anthropic.com

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

## Exemplos de comandos

- `"Mude o título para Bem-vindo"`
- `"Adicione um círculo roxo no centro com animação fadeIn"`
- `"Aumente a duração para 10 segundos"`
- `"Mude o fundo para gradiente azul escuro"`
- `"Adicione um texto 'Subscribe' na parte inferior com slideInLeft"`

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/ai/route.ts     # Endpoint da Claude API
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── VideoEditor.tsx    # Layout principal
│   ├── AIChat.tsx         # Chat com Claude
│   └── Timeline.tsx       # Timeline das camadas
└── remotion/
    ├── types.ts           # Tipos e estado padrão
    ├── VideoComposition.tsx  # Componente Remotion
    └── Root.tsx           # Raiz Remotion
```
