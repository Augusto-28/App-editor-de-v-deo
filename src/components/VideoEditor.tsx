'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import {
  DEFAULT_COMPOSITION,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  type CompositionState,
} from '@/remotion/types';
import AIChat from './AIChat';
import Timeline from './Timeline';

export default function VideoEditor() {
  const [composition, setComposition] = useState<CompositionState>(DEFAULT_COMPOSITION);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef>(null);

  // A timeline acompanha o frame atual do Player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = (e: { detail: { frame: number } }) => setCurrentFrame(e.detail.frame);
    player.addEventListener('frameupdate', onFrame);
    return () => player.removeEventListener('frameupdate', onFrame);
  }, []);

  const handleExport = useCallback(async () => {
    const title = composition.layers.find((l) => l.type === 'text');
    const name = title && 'text' in title ? title.text : 'reel';
    setExporting(true);
    setExportMessage('Renderizando o MP4 na sua máquina...');
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: composition, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Falha ao renderizar');
      setExportMessage(`Vídeo salvo em ${data.video}`);
    } catch (err) {
      setExportMessage(`Erro: ${err instanceof Error ? err.message : 'desconhecido'}`);
    } finally {
      setExporting(false);
    }
  }, [composition]);

  const handleCompositionUpdate = useCallback((newState: CompositionState) => {
    setComposition(newState);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-editor-bg text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-editor-panel border-b border-editor-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
            <span className="text-xs font-bold">V</span>
          </div>
          <h1 className="text-sm font-semibold text-gray-200">Editor de Vídeo com IA</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            {VIDEO_WIDTH}x{VIDEO_HEIGHT} · {(composition.durationInFrames / VIDEO_FPS).toFixed(1)}s ·{' '}
            {composition.layers.length} camadas
          </span>
          {exportMessage && (
            <span className="max-w-md truncate text-gray-400" title={exportMessage}>
              {exportMessage}
            </span>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-white font-medium"
          >
            {exporting ? 'Exportando...' : 'Exportar MP4'}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video Preview */}
        <div className="flex-1 flex flex-col p-4 gap-3">
          <div className="flex-1 min-h-0 flex items-center justify-center bg-black rounded-lg overflow-hidden relative">
            <Player
              ref={playerRef}
              component={VideoComposition}
              inputProps={{ state: composition }}
              durationInFrames={composition.durationInFrames}
              fps={VIDEO_FPS}
              compositionWidth={VIDEO_WIDTH}
              compositionHeight={VIDEO_HEIGHT}
              style={{ height: '100%', aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}`, maxWidth: '100%' }}
              controls
            />
          </div>
          <Timeline composition={composition} currentFrame={currentFrame} />
        </div>

        {/* Right: AI Chat */}
        <div className="w-80 border-l border-editor-border flex flex-col">
          <AIChat
            currentState={composition}
            onCompositionUpdate={handleCompositionUpdate}
          />
        </div>
      </div>
    </div>
  );
}
