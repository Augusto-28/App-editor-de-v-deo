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
  x?: number;
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
      text: 'Meu Vídeo',
      fontSize: 72,
      color: '#ffffff',
      x: 640,
      y: 320,
      fontWeight: 'bold',
      animation: 'fadeIn',
    },
    {
      id: 'subtitle',
      type: 'text',
      from: 15,
      durationInFrames: 135,
      text: 'Editado com IA',
      fontSize: 32,
      color: '#a5b4fc',
      x: 640,
      y: 400,
      fontWeight: 'normal',
      animation: 'slideInLeft',
    },
  ],
};
