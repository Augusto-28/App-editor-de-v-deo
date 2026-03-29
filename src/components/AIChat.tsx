'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CompositionState } from '@/remotion/types';
import type Anthropic from '@anthropic-ai/sdk';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  currentState: CompositionState;
  onCompositionUpdate: (state: CompositionState) => void;
}

const EXAMPLES = [
  'Mude o título para "Bem-vindo ao Futuro"',
  'Adicione um círculo roxo no centro',
  'Aumente a duração para 10 segundos',
  'Mude o fundo para azul escuro',
  'Adicione um texto "Subscribe" com animação fadeIn',
];

export default function AIChat({ currentState, onCompositionUpdate }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/ai', { method: 'GET' })
      .then((r) => setHasApiKey(r.status !== 401))
      .catch(() => setHasApiKey(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: Message = { role: 'user', content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');
      setLoading(true);

      try {
        const apiMessages: Anthropic.MessageParam[] = newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, currentState }),
        });

        if (!response.body) throw new Error('Sem resposta do servidor');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let assistantText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const json = JSON.parse(line.slice(6));

            if (json.type === 'result') {
              assistantText = json.text || 'Composição atualizada!';
              if (json.updatedState) {
                onCompositionUpdate(json.updatedState);
              }
            } else if (json.type === 'error') {
              assistantText = `Erro: ${json.message}`;
            }
          }
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Erro ao processar: ${msg}` },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, currentState, onCompositionUpdate],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-editor-border">
        <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Claude AI Editor
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Descreva as edições em português</p>
      </div>

      {/* API Key Warning */}
      {hasApiKey === false && (
        <div className="mx-3 mt-3 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg text-xs text-amber-300">
          <p className="font-medium mb-1">⚠️ API Key não configurada</p>
          <p>Crie um arquivo <code className="bg-black/30 px-1 rounded">.env.local</code> com:</p>
          <code className="block mt-1 bg-black/30 p-1 rounded">
            ANTHROPIC_API_KEY=sk-ant-...
          </code>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center py-4">
              Diga o que quer editar no vídeo
            </p>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => sendMessage(ex)}
                className="w-full text-left text-xs p-2 rounded bg-editor-panel hover:bg-editor-border border border-editor-border text-gray-300 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-editor-panel text-gray-200 border border-editor-border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-editor-panel border border-editor-border rounded-lg px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              Analisando...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-editor-border">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva a edição..."
            rows={2}
            className="flex-1 bg-editor-panel border border-editor-border rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors"
          >
            ↑
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1">Enter para enviar · Shift+Enter nova linha</p>
      </div>
    </div>
  );
}
