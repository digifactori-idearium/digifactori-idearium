import { OrbitControls, useHelper } from "@react-three/drei";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useControls } from "leva";
import React, { useEffect, useRef, useState } from 'react';
import { Audio, AudioListener, AudioLoader, Color, Mesh, PositionalAudio, SpotLightHelper } from "three";

const LightWithHelper:React.FC = () => {

  const light = useRef<any>(null);

  const {angle, penumbra} = useControls({
    angle: Math.PI/8,
    penumbra: {
      value:0,
      min: 0,
      max: 1,
      step: 0.1
    }
  })

  useHelper(light, SpotLightHelper, 'orange')

  return(
    <spotLight 
      ref={light}
      angle={angle}
      penumbra={penumbra}
      distance={82}
      intensity={80000000}
      color={0xffea00}
      position={[0, 80, 0]}
      castShadow />
  )
}

const AnimatedBox:React.FC  = () =>{

  const boxRef = useRef<Mesh>(null);

  const {color, speed} = useControls({
    color: "#ffff00",
    speed: {
      value: 0.005,
      min: 0,
      max: 0.03,
      step: 0.001
    }
  })

  const [wireframe, setWireframe] = useState(false)

  const handleClick = () => {
    setWireframe(!wireframe)
  }

  useFrame(() => {
    if(boxRef.current) {
      boxRef.current.rotation.x += speed;
      boxRef.current.rotation.x += speed;
      boxRef.current.rotation.x += speed;
    }
    
  })
  
  return (
  <mesh castShadow position={[0, 40, 0]}ref={boxRef} onClick={handleClick}>
    <boxGeometry args={[10, 10, 10]}/>
    <meshStandardMaterial color={color} wireframe={wireframe}/>
  </mesh>
)
}

const UpdateSceneBackground: React.FC = () => {
  const [color, setColor] = useState('deepskyblue');

  const {scene} = useThree();

  // eslint-disable-next-line react-hooks/immutability
  scene.background = new Color(color);

  return null
}

const AudioComponent: React.FC = () => {

  const {camera} = useThree()

  useEffect(() => {
    const listener = new AudioListener();
    camera.add(listener);

    const sound = new Audio(listener)

    const audioLoader = new AudioLoader();
    audioLoader.load("/sound.mp3", (buffer => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);

      const handleClick = () => {
        sound.play();
      }
      window.addEventListener('click', handleClick);
    }))
  })

  return null
}

const AudioComponent2: React.FC = () => {

  const {camera} = useThree()

  const audioRef = useRef<any>(null)

  useEffect(() => {
    const listener = new AudioListener();
    camera.add(listener);

    const sound = new PositionalAudio(listener)

    const audioLoader = new AudioLoader();
    audioLoader.load("/son.mp3", (buffer => {
      sound.setBuffer(buffer);
      // sound.setLoop(true);
      sound.setVolume(1);
      sound.setRefDistance(5);
      if(audioRef.current) {
        audioRef.current.add(sound)
      }

      const handleClick = () => {
        sound.play();
      }
      globalThis.addEventListener('click', handleClick);
    }))
  }, [camera])

  return <mesh ref={audioRef} position={[0, 0, 2]}>
    <boxGeometry/>
    <meshNormalMaterial />

  </mesh>
}

export const Room: React.FC = () => {

  const [intensity, setIntensity] = useState(5);
  const [showLeftWall, setShowLeftWall] = useState(true)
  const [showRightWall, setShowRightWall] = useState(true)
  const [showFloor, setShowFloor] = useState(true)
  

  const themes = {
      base:{
        wallColors: [0x111111, 0x222222, 0x333333],
        bgColor: "black"
      },
      fluo:{
        wallColors: ["red", "green", "blue"],
        bgColor: "black"
      }
    }

    return <div id="canvas-container" style={{width: 500, height: 500}}>
        <Canvas shadows camera={{ position: [80, 100, 80] }}>
          <OrbitControls movementSpeed={10}/>
          <UpdateSceneBackground />
          <AudioComponent2 />
          <ambientLight intensity={intensity} color="white"/>
          {/* <directionalLight color="red" position={[0, 0, 5]} /> */}
          <LightWithHelper />
          <AnimatedBox/>
          <mesh receiveShadow position ={[0, -5, 0]} visible={showFloor} >
            <boxGeometry args={[80, 10, 80]}/>
            <meshPhongMaterial color="red"/>
          </mesh>
           <mesh position ={[0, 40, -35]} rotation={[Math.PI/2, 0, 0]} visible={showRightWall}>
            <boxGeometry args={[80, 10, 80]}/>
            <meshPhongMaterial color="green"/>
          </mesh>
          <mesh position ={[-35, 40, 5]} rotation={[0, 0, Math.PI/2]} visible={showLeftWall}>
            <boxGeometry args={[80, 10, 70]}/>
            <meshPhongMaterial color="blue"/>
          </mesh>

          
        </Canvas>
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
}
