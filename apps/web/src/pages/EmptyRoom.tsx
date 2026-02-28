import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useState } from 'react';
import { Audio, AudioListener, AudioLoader, Color } from "three";

import { useRoomStore } from "@/stores";




const UpdateSceneBackground: React.FC<{color: string}> = ({color}) => {

  const {scene} = useThree();

  // eslint-disable-next-line react-hooks/immutability
  scene.background = new Color(color);

  return null
}


const AudioComponent: React.FC<{soundTrack: string}> = ({soundTrack}) => {

  const {camera} = useThree()

  const listener = useMemo(() => new AudioListener(), [])
  const sound = useMemo(() => new Audio(listener), [listener])
  const audioLoader = useMemo(() => new AudioLoader(), []);

  useEffect(() => {
    camera.add(listener);

     return () => {
      camera.remove(listener);
      sound.stop();
    };
    
  }, [camera, listener, sound])
  

  useEffect(() => {
    sound.stop()
    audioLoader.load(soundTrack, (buffer => {
      console.log("new soundTrack: ", soundTrack)
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();
    }))

    return () => {audioLoader.abort()}
  }, [camera, soundTrack, audioLoader, sound])

  return null
}


export const EmptyRoom: React.FC = () => {

  const [soundTrack, setSoundTrack] = useState("")

  const roomStore = useRoomStore((state => state));

  const intensities = {
    "bright": 50,
    "dim": 30,
    "dark": 10
  }

    return <div id="canvas-container" style={{width: 500, height: 500}}>
        <Canvas shadows camera={{ position: [80, 100, 80] }}>
          <AudioComponent soundTrack={soundTrack}/>
          <OrbitControls
            rotateSpeed={2}
            zoomSpeed={2}
            panSpeed={2}/>
          <UpdateSceneBackground color={roomStore.background.color}/>
          <ambientLight intensity={intensities[roomStore.global.brightness]} color="white"/>
          <mesh receiveShadow position ={[0, -5, 0]} visible={!roomStore.floor.hidden} >
            <boxGeometry args={[80, 10, 80]}/>
            <meshPhongMaterial color={roomStore.floor.color}/>
          </mesh>
           <mesh position ={[0, 40, -35]} rotation={[Math.PI/2, 0, 0]} visible={!roomStore.rightWall.hidden}>
            <boxGeometry args={[80, 10, 80]}/>
            <meshPhongMaterial color={roomStore.rightWall.color}/>
          </mesh>
          <mesh position ={[-35, 40, 5]} rotation={[0, 0, Math.PI/2]} visible={!roomStore.leftWall.hidden}>
            <boxGeometry args={[80, 10, 70]}/>
            <meshPhongMaterial color={roomStore.leftWall.color}/>
          </mesh>

          
        </Canvas>
        <div>
          <p>
            Musique:<select 
              onChange={(e) => {
                const value = e.target.value;
                if (value == "sea") {
                  setSoundTrack("/sea.wav")
                } else if (value == "forest") {
                  console.log("forest")
                  setSoundTrack("/forest.wav")
                } else if (value == "gun") {
                  setSoundTrack("/son.mp3")
                } else {
                  setSoundTrack("")
                }
              }}>
              <option value="">Aucune</option>
              <option value="sea">Mer</option>
              <option value="forest">Foret</option>
              <option value="gun">Gun</option>
            </select>
          </p>
        </div>
    </div>
}

export default EmptyRoom