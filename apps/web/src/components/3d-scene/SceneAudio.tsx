import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { Audio, AudioListener, AudioLoader } from 'three';

export const SceneAudio: React.FC<{ soundTrack: string }> = ({
  soundTrack,
}) => {
  const { camera } = useThree();

  const listener = useMemo(() => new AudioListener(), []);
  const sound = useMemo(() => new Audio(listener), [listener]);
  const audioLoader = useMemo(() => new AudioLoader(), []);

  useEffect(() => {
    camera.add(listener);

    return () => {
      camera.remove(listener);
      sound.stop();
    };
  }, [camera, listener, sound]);

  useEffect(() => {
    sound.stop();
    audioLoader.load(soundTrack, buffer => {
      console.log('new soundTrack: ', soundTrack);
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    });

    return () => {
      audioLoader.abort();
    };
  }, [camera, soundTrack, audioLoader, sound]);
  return null;
};
