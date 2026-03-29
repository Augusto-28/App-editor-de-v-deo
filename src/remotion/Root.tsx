import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { DEFAULT_COMPOSITION } from './types';

export function RemotionRoot() {
  return (
    <Composition
      id="VideoEditor"
      component={VideoComposition}
      durationInFrames={DEFAULT_COMPOSITION.durationInFrames}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ state: DEFAULT_COMPOSITION }}
    />
  );
}
