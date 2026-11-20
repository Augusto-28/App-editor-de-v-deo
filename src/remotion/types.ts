// Formato Reel do Instagram: vertical 9:16
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;

// Áreas seguras do Reel: o Instagram cobre o topo (nome/áudio) e o rodapé
// (legenda, botões). Conteúdo importante deve ficar entre SAFE_TOP e SAFE_BOTTOM.
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = VIDEO_HEIGHT - 420; // 1500
export const SAFE_SIDE = 60;

export type AnimationType =
  | 'none'
  | 'fadeIn'
  | 'fadeOut'
  | 'slideInLeft'
  | 'slideInRight'
  | 'typewriter';

export type LayerType = 'text' | 'shape' | 'image';

export interface BaseLayer {
  id: string;
  type: LayerType;
  from: number;
  durationInFrames: number;
  animation?: AnimationType;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize?: number;
  color?: string;
  /** Centro horizontal do texto, em pixels */
  x?: number;
  /** Topo do texto, em pixels */
  y?: number;
  fontWeight?: 'normal' | 'bold';
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rectangle' | 'circle';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type Layer = TextLayer | ShapeLayer | ImageLayer;

export interface CompositionState {
  durationInFrames: number;
  backgroundColor: string;
  layers: Layer[];
}

export const DEFAULT_COMPOSITION: CompositionState = {
  durationInFrames: 150,
  backgroundColor: '#0f0f23',
  layers: [
    {
      id: 'title',
      type: 'text',
      from: 0,
      durationInFrames: 150,
      text: 'Meu Reel',
      fontSize: 110,
      color: '#ffffff',
      x: VIDEO_WIDTH / 2,
      y: 820,
      fontWeight: 'bold',
      animation: 'fadeIn',
    },
    {
      id: 'subtitle',
      type: 'text',
      from: 15,
      durationInFrames: 135,
      text: 'Editado com IA',
      fontSize: 56,
      color: '#a5b4fc',
      x: VIDEO_WIDTH / 2,
      y: 980,
      fontWeight: 'normal',
      animation: 'slideInLeft',
    },
  ],
};
