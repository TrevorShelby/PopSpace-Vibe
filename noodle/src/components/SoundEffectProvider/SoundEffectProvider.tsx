import * as React from 'react';
import { Howl, Howler } from 'howler';
import soundsMp3 from '../../sounds/sounds.mp3';
import soundsWebm from '../../sounds/sounds.webm';
import { useMediaReadiness } from '@src/media/useMediaReadiness';

export type SoundEffectName = 'join';

export const SoundEffectContext = React.createContext<{ playSound: (name: SoundEffectName) => void } | null>(null);

const howl = new Howl({
  src: [soundsMp3, soundsWebm],
  sprite: {
    join: [0, 5000],
  },
});

export const SoundEffectProvider: React.FC = ({ children }) => {
  const isReady = useMediaReadiness((s) => s.isReady);
  const isReadyRef = React.useRef(isReady);
  React.useLayoutEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  // Add a click event listener to resume the audio context
  React.useEffect(() => {
    const handleUserGesture = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
    };

    document.addEventListener('click', handleUserGesture);
    return () => document.removeEventListener('click', handleUserGesture);
  }, []);

  const play = React.useCallback((name: SoundEffectName) => {
    if (!isReadyRef.current) return;
    howl.play(name);
  }, []);

  return <SoundEffectContext.Provider value={{ playSound: play }}>{children}</SoundEffectContext.Provider>;
};

