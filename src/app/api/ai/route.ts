import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import type { CompositionState } from '@/remotion/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Você é um assistente especialista em edição de vídeo com Remotion.
Quando o usuário pede uma edição, você analisa o estado atual da composição e usa a ferramenta
"update_composition" para aplicar as mudanças desejadas.

Regras:
- Sempre use a ferramenta update_composition para retornar as alterações
- Mantenha as propriedades que não precisam ser alteradas
- Seja criativo e preciso nas edições
- duração é em frames (30fps = 30 frames por segundo)
- posições x/y são em pixels (largura padrão: 1280, altura: 720)
- Explique brevemente o que foi alterado após chamar a ferramenta`;

const tools: Anthropic.Tool[] = [
  {
    name: 'update_composition',
    description: 'Atualiza o estado da composição de vídeo com as edições solicitadas',
    input_schema: {
      type: 'object' as const,
      properties: {
        durationInFrames: {
          type: 'number',
          description: 'Duração total do vídeo em frames (fps=30)',
        },
        backgroundColor: {
          type: 'string',
          description: 'Cor de fundo em formato hex ou CSS (ex: #1a1a2e)',
        },
        layers: {
          type: 'array',
          description: 'Lista de camadas do vídeo',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['text', 'shape', 'image'] },
              from: { type: 'number', description: 'Frame de início' },
              durationInFrames: { type: 'number', description: 'Duração em frames' },
              text: { type: 'string', description: 'Texto (apenas para type=text)' },
              fontSize: { type: 'number' },
              color: { type: 'string' },
              x: { type: 'number', description: 'Posição X em pixels' },
              y: { type: 'number', description: 'Posição Y em pixels' },
              fontWeight: { type: 'string', enum: ['normal', 'bold'] },
              animation: {
                type: 'string',
                enum: ['none', 'fadeIn', 'fadeOut', 'slideInLeft', 'slideInRight', 'typewriter'],
              },
              shapeType: { type: 'string', enum: ['rectangle', 'circle'] },
              width: { type: 'number' },
              height: { type: 'number' },
              fill: { type: 'string' },
            },
            required: ['id', 'type', 'from', 'durationInFrames'],
          },
        },
      },
      required: ['durationInFrames', 'backgroundColor', 'layers'],
    },
  },
];

export async function POST(req: NextRequest) {
  const { messages, currentState } = (await req.json()) as {
    messages: Anthropic.MessageParam[];
    currentState: CompositionState;
  };

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = (data: object) =>
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

  (async () => {
    try {
      const systemWithState = `${SYSTEM_PROMPT}\n\nEstado atual da composição:\n${JSON.stringify(currentState, null, 2)}`;

      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        thinking: { type: 'adaptive' },
        system: systemWithState,
        tools,
        messages,
      });

      let updatedState: CompositionState | null = null;
      let assistantText = '';

      for (const block of response.content) {
        if (block.type === 'text') {
          assistantText = block.text;
        } else if (block.type === 'tool_use' && block.name === 'update_composition') {
          updatedState = block.input as CompositionState;
        }
      }

      await send({ type: 'result', text: assistantText, updatedState });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      await send({ type: 'error', message });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
