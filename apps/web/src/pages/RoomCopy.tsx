import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, } from '@react-three/fiber';
import React from 'react';
import { Object3D, Object3DEventMap } from "three";

const animations = {
  "bob": [{
    interval: 10,
    anim: (child: Object3D<Object3DEventMap>) => {
      child.rotation.x += 0.01
  }}
]

  
}

function Model() {
  const { scene } = useGLTF("/models/scene.gltf")
 
  scene.children.forEach(child => {if(child.name == 'bob') {
    console.log(child);
    animations[child.name].forEach(animation => setInterval(() => animation.anim(child), animation.interval))
    // setInterval( () => child.rotation.x += 0.01, 10)
    // child.position.x = 60
  }

  })

  return <primitive object={scene} />
}

const RoomCopy: React.FC = () => {
    
    

    return <div id="canvas-container" style={{width: 500, height: 500}}>
        <Canvas shadows camera={{ position: [80, 100, 80] }}>
          <OrbitControls
                      rotateSpeed={0.2}
                      zoomSpeed={0.2}
                      panSpeed={2}/>
          <ambientLight position={[50, 100, 100]} castShadow={false} intensity={1} color="white"/>
          <directionalLight position={[50, 100, 100]} castShadow={true} intensity={2} color="white"/>
          
          <Model />
          
        </Canvas>
        
    </div>
}

export default RoomCopy