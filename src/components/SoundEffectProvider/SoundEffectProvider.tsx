import * as React from 'react';
import { useMediaReady } from '../MediaReadinessProvider/useMediaReady';
import { Howl } from 'howler';
import soundsMp3 from '../../sounds/sounds.mp3';
import soundsWebm from '../../sounds/sounds.webm';

export type SoundEffectName = 'join';

export const SoundEffectContext = React.createContext<{ playSound: (name: SoundEffectName) => void } | null>(null);

// global Howl object to play sounds with
const howl = new Howl({
  src: [soundsMp3, soundsWebm],
  // sounds are arranged into a single file, and we use timeslices to name specific sounds within the file
  sprite: {
    join: [0, 5000],
  },
});

export const SoundEffectProvider: React.FC = ({ children }) => {
  // we'll track the media readiness state and only begin playing sounds when it's ready.
  const isReady = useMediaReady();
  // to keep the `play` callback reference stable we copy it to a ref
  const isReadyRef = React.useRef(isReady);
  React.useLayoutEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  const play = React.useCallback((name: SoundEffectName) => {
    if (!isReadyRef.current) return;
    howl.play(name);
  }, []);

  return <SoundEffectContext.Provider value={{ playSound: play }}>{children}</SoundEffectContext.Provider>;
};
