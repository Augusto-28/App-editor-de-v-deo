# App Editor de Vídeo com IA

Editor de vídeo inteligente usando **Next.js**, **Remotion** e **Claude AI**.

## Tecnologias

- **Next.js 14** — Framework React com App Router
- **Remotion** — Criação de vídeos programaticamente com React
- **Claude API (Opus 5.5)** — IA para interpretar e aplicar edições em linguagem natural
- **Tailwind CSS** — Estilização

## Como funciona

1. A composição de vídeo é representada como um estado JSON (camadas, duração, fundo)
2. O usuário digita um comando em português no chat
3. Claude interpreta o comando e usa a ferramenta `update_composition` para retornar o estado atualizado
4. O Remotion Player renderiza o vídeo atualizado em tempo real
5. O botão **Exportar MP4** gera o Reel vertical (1080x1920, 30fps, H.264) na sua máquina

Tudo fica local: os vídeos vão para `videos/`, os projetos (JSON) para `projetos/`
e as imagens que você usar em `public/media/`. As três pastas estão no `.gitignore`.

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

### 4. Exportar o Reel

Clique em **Exportar MP4** no editor. Na primeira vez o Remotion baixa um Chrome
headless (uns 100 MB), depois cada Reel curto leva poucos segundos.

Também dá para renderizar um projeto salvo pela linha de comando:

```bash
npm run render -- videos/meu-reel.mp4 --props=projetos/meu-reel.json
```

E `npm run studio` abre o Remotion Studio para ajustar a composição.

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
│   ├── api/render/route.ts # Exporta o MP4 localmente
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── VideoEditor.tsx    # Layout principal
│   ├── AIChat.tsx         # Chat com Claude
│   └── Timeline.tsx       # Timeline das camadas
└── remotion/
    ├── types.ts           # Tipos e estado padrão
    ├── VideoComposition.tsx  # Componente Remotion
    ├── Root.tsx           # Raiz Remotion
    └── index.ts           # Entrada do `remotion render`
```
