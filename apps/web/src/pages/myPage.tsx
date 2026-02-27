import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useState } from 'react';
import { Audio, AudioListener, AudioLoader, Color } from "three";




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

  const [intensity, setIntensity] = useState(5);
  const [showLeftWall, setShowLeftWall] = useState(true)
  const [showRightWall, setShowRightWall] = useState(true)
  const [showFloor, setShowFloor] = useState(true)
  const [soundTrack, setSoundTrack] = useState("")
  
  const themes = {
    base:{
      wallColors: ["red", "orange", "yellow"],
      bgColor: "blue"
    },
    fluo:{
      wallColors: ["red", "green", "blue"],
      bgColor: "lightyellow"
    }
  }
  
  const [theme, setTheme] = useState<{wallColors: number[] | string[] | string, bgColor: string}>(themes.fluo)

    return <div id="canvas-container" style={{width: 500, height: 500}}>
        <Canvas shadows camera={{ position: [80, 100, 80] }}>
          <AudioComponent soundTrack={soundTrack}/>
          <OrbitControls
            rotateSpeed={2}
            zoomSpeed={2}
            panSpeed={2}/>
          <UpdateSceneBackground color={theme.bgColor}/>
          <ambientLight intensity={intensity} color="white"/>
          <mesh receiveShadow position ={[0, -5, 0]} visible={showFloor} >
            <boxGeometry args={[80, 10, 80]}/>
            <meshPhongMaterial color={theme.wallColors[0]}/>
          </mesh>
           <mesh position ={[0, 40, -35]} rotation={[Math.PI/2, 0, 0]} visible={showRightWall}>
            <boxGeometry args={[80, 10, 80]}/>
            <meshPhongMaterial color={theme.wallColors[1]}/>
          </mesh>
          <mesh position ={[-35, 40, 5]} rotation={[0, 0, Math.PI/2]} visible={showLeftWall}>
            <boxGeometry args={[80, 10, 70]}/>
            <meshPhongMaterial color={theme.wallColors[2]}/>
          </mesh>

          
        </Canvas>
        <div>
          <p>
            Thème:<select 
              onChange={(e) => {
                const value = e.target.value;
                if (value == "base") {
                  setTheme(themes.base)
                } else if (value == "fluo") {
                  setTheme(themes.fluo)
                }
              }}>
              <option value="base">Choix 1</option>
              <option value="fluo">Choix 2</option>
            </select>
          </p>
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
          <p>
            Intensité de la lumière<input type="range" min={0} max={10} value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))}/>
          </p>
          <p>
            Montrer le sol<input type="checkbox" checked={showFloor} onChange={()=>setShowFloor(!showFloor)}/> 
          </p>
          <p>
            Montrer le mur de droite<input type="checkbox" checked={showRightWall} onChange={()=>setShowRightWall(!showRightWall)}/>
          </p>
          <p>
            Montrer le mur de gauche<input type="checkbox" checked={showLeftWall} onChange={()=>setShowLeftWall(!showLeftWall)}/>
          </p>
        </div>
    </div>
}

export default EmptyRoom