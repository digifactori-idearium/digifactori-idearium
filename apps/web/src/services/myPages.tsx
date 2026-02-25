import { Canvas } from '@react-three/fiber';
import React, { useState } from 'react';

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
        <Canvas camera={{ position: [100, 100, 100] }}>
          <ambientLight intensity={intensity} color="white"/>
          <directionalLight color="red" position={[0, 0, 5]} />
          <mesh position ={[-5, -5, -5]} visible={showFloor} >
            <boxGeometry args={[87, 10, 87]}/>
            <meshPhongMaterial color={themes.base.wallColors[0]}/>
          </mesh>
           <mesh position ={[0, 40, -40]} rotation={[Math.PI/2, 0, 0]} visible={showRightWall}>
            <boxGeometry args={[80, 10, 80]}/>
            <meshPhongMaterial color="green"/>
          </mesh>
          <mesh position ={[-40, 40, 0]} rotation={[0, 0, Math.PI/2]} visible={showLeftWall}>
            <boxGeometry args={[80, 10, 80]}/>
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
