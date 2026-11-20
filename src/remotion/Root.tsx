import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { DEFAULT_COMPOSITION, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH, type CompositionState } from './types';

export function RemotionRoot() {
  return (
    <Composition
      id="VideoEditor"
      component={VideoComposition}
      durationInFrames={DEFAULT_COMPOSITION.durationInFrames}
      fps={VIDEO_FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
      defaultProps={{ state: DEFAULT_COMPOSITION }}
      // A duração vem do projeto passado em --props
      calculateMetadata={({ props }: { props: { state: CompositionState } }) => ({
        durationInFrames: props.state.durationInFrames,
      })}
    />
  );
}
