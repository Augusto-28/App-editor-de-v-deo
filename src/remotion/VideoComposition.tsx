import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { VIDEO_WIDTH, VIDEO_HEIGHT, SAFE_SIDE } from './types';
import type { CompositionState, TextLayer, ShapeLayer, ImageLayer, AnimationType } from './types';

function getAnimationStyle(
  frame: number,
  fps: number,
  animation: AnimationType = 'none',
  durationInFrames: number,
): React.CSSProperties {
  switch (animation) {
    case 'fadeIn': {
      const opacity = interpolate(frame, [0, Math.min(20, durationInFrames)], [0, 1], {
        extrapolateRight: 'clamp',
      });
      return { opacity };
    }
    case 'fadeOut': {
      const opacity = interpolate(
        frame,
        [Math.max(0, durationInFrames - 20), durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp' },
      );
      return { opacity };
    }
    case 'slideInLeft': {
      const x = interpolate(frame, [0, Math.min(20, durationInFrames)], [-200, 0], {
        extrapolateRight: 'clamp',
      });
      const opacity = interpolate(frame, [0, Math.min(10, durationInFrames)], [0, 1], {
        extrapolateRight: 'clamp',
      });
      return { transform: `translateX(${x}px)`, opacity };
    }
    case 'slideInRight': {
      const x = interpolate(frame, [0, Math.min(20, durationInFrames)], [200, 0], {
        extrapolateRight: 'clamp',
      });
      const opacity = interpolate(frame, [0, Math.min(10, durationInFrames)], [0, 1], {
        extrapolateRight: 'clamp',
      });
      return { transform: `translateX(${x}px)`, opacity };
    }
    case 'typewriter': {
      return {};
    }
    default:
      return {};
  }
}

function TextLayerComponent({ layer }: { layer: TextLayer }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animStyle = getAnimationStyle(frame, fps, layer.animation, layer.durationInFrames);

  const displayText =
    layer.animation === 'typewriter'
      ? layer.text.slice(0, Math.floor(interpolate(frame, [0, layer.durationInFrames], [0, layer.text.length], { extrapolateRight: 'clamp' })))
      : layer.text;

  return (
    <div
      style={{
        position: 'absolute',
        left: layer.x ?? VIDEO_WIDTH / 2,
        top: layer.y ?? VIDEO_HEIGHT / 2,
        transform: `translateX(-50%) ${animStyle.transform ?? ''}`,
        // Quebra linha em vez de vazar para fora do vídeo vertical
        maxWidth: VIDEO_WIDTH - SAFE_SIDE * 2,
        width: 'max-content',
        fontSize: layer.fontSize ?? 64,
        lineHeight: 1.15,
        color: layer.color ?? '#ffffff',
        fontWeight: layer.fontWeight ?? 'normal',
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'pre-wrap',
        opacity: animStyle.opacity ?? 1,
        textAlign: 'center',
      }}
    >
      {displayText}
    </div>
  );
}

function ShapeLayerComponent({ layer }: { layer: ShapeLayer }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animStyle = getAnimationStyle(frame, fps, layer.animation, layer.durationInFrames);

  const w = layer.width ?? 200;
  const h = layer.height ?? 200;

  return (
    <div
      style={{
        position: 'absolute',
        left: (layer.x ?? VIDEO_WIDTH / 2) - w / 2,
        top: (layer.y ?? VIDEO_HEIGHT / 2) - h / 2,
        width: w,
        height: h,
        backgroundColor: layer.fill ?? '#6366f1',
        borderRadius: layer.shapeType === 'circle' ? '50%' : '0',
        ...animStyle,
      }}
    />
  );
}

function ImageLayerComponent({ layer }: { layer: ImageLayer }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animStyle = getAnimationStyle(frame, fps, layer.animation, layer.durationInFrames);

  const w = layer.width ?? VIDEO_WIDTH;
  const h = layer.height ?? VIDEO_WIDTH;
  // Arquivos locais ficam em public/ (ex.: "media/foto.png"); URLs externas passam direto
  const src = /^(https?:|data:|blob:)/.test(layer.src) ? layer.src : staticFile(layer.src.replace(/^\/+/, ''));

  return (
    <Img
      src={src}
      style={{
        position: 'absolute',
        left: (layer.x ?? VIDEO_WIDTH / 2) - w / 2,
        top: (layer.y ?? VIDEO_HEIGHT / 2) - h / 2,
        width: w,
        height: h,
        objectFit: 'cover',
        ...animStyle,
      }}
    />
  );
}

export function VideoComposition({ state }: { state: CompositionState }) {
  return (
    <AbsoluteFill style={{ backgroundColor: state.backgroundColor }}>
      {state.layers.map((layer) => (
        <Sequence key={layer.id} from={layer.from} durationInFrames={layer.durationInFrames}>
          {layer.type === 'text' && <TextLayerComponent layer={layer} />}
          {layer.type === 'shape' && <ShapeLayerComponent layer={layer} />}
          {layer.type === 'image' && layer.src && <ImageLayerComponent layer={layer} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
