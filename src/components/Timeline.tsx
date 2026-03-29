'use client';

import type { CompositionState } from '@/remotion/types';

const COLORS: Record<string, string> = {
  text: '#6366f1',
  shape: '#10b981',
  image: '#f59e0b',
};

interface TimelineProps {
  composition: CompositionState;
  currentFrame: number;
}

export default function Timeline({ composition, currentFrame }: TimelineProps) {
  const { durationInFrames, layers } = composition;

  return (
    <div className="bg-editor-panel border border-editor-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-400">Timeline</h3>
        <span className="text-xs text-gray-600">
          {currentFrame}/{durationInFrames}f · {(durationInFrames / 30).toFixed(1)}s
        </span>
      </div>

      {/* Playhead */}
      <div className="relative mb-2">
        <div className="h-1 bg-editor-border rounded-full" />
        <div
          className="absolute top-0 h-1 bg-indigo-500 rounded-full transition-all"
          style={{ width: `${(currentFrame / durationInFrames) * 100}%` }}
        />
      </div>

      {/* Layers */}
      <div className="space-y-1">
        {layers.map((layer) => {
          const left = (layer.from / durationInFrames) * 100;
          const width = (layer.durationInFrames / durationInFrames) * 100;
          const color = COLORS[layer.type] ?? '#6b7280';
          const label = layer.type === 'text' ? (layer as { text?: string }).text ?? layer.id : layer.id;

          return (
            <div key={layer.id} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-16 truncate">{label}</span>
              <div className="flex-1 relative h-4 bg-editor-bg rounded">
                <div
                  className="absolute h-full rounded text-[9px] flex items-center px-1 overflow-hidden text-white"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 2)}%`,
                    backgroundColor: color,
                    opacity: 0.85,
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
