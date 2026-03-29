'use client';

import { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import { VideoComposition } from '@/remotion/VideoComposition';
import { DEFAULT_COMPOSITION, type CompositionState } from '@/remotion/types';
import AIChat from './AIChat';
import Timeline from './Timeline';

export default function VideoEditor() {
  const [composition, setComposition] = useState<CompositionState>(DEFAULT_COMPOSITION);
  const [currentFrame, setCurrentFrame] = useState(0);

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
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{composition.durationInFrames} frames</span>
          <span>·</span>
          <span>{composition.layers.length} camadas</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video Preview */}
        <div className="flex-1 flex flex-col p-4 gap-3">
          <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden relative">
            <Player
              component={VideoComposition}
              inputProps={{ state: composition }}
              durationInFrames={composition.durationInFrames}
              fps={30}
              compositionWidth={1280}
              compositionHeight={720}
              style={{ width: '100%', maxWidth: '100%' }}
              controls
              onFrameUpdate={setCurrentFrame}
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
