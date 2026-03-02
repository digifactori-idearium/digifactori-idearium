import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo } from 'react';
import { Audio, AudioListener, AudioLoader, Color, DoubleSide, ShaderMaterial } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

import { useRoomStore } from '@/stores';

export function GradientBackground({ color1 = '#1e3c72', color2 = '#2a5298' }) {
  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        color1: { value: new Color(color1) },
        color2: { value: new Color(color2) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;

        void main() {
          vec3 color = mix(color1, color2, vUv.y);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
      side: DoubleSide,
    });
  }, [color1, color2]);
  return (
    <mesh material={material} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

const UpdateSceneBackground: React.FC<{ color: string }> = ({ color }) => {
  const { scene } = useThree();

  // eslint-disable-next-line react-hooks/immutability
  scene.background = new Color(color);

  return null;
};

const AudioComponent: React.FC<{ soundTrack: string }> = ({ soundTrack }) => {
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

}

const Exporter: React.FC = () => {
  const {scene} = useThree();
      const saveChange = () => {
          const exporter = new GLTFExporter()
          
  
      exporter.parse(
        scene,
        (result:  ArrayBuffer | object) => {
          const output =
            result instanceof ArrayBuffer
              ? result
              : JSON.stringify(result, null, 2)
  
          const blob = new Blob([output], {
            type: "application/octet-stream",
          })
  
          const link = document.createElement("a")
          link.href = URL.createObjectURL(blob)
          link.download = "scene.gltf"
          link.click()
        },
        { binary: false } // true = .glb
      )
      }
  return <mesh onClick={() => {saveChange()}}>
            <boxGeometry args={[20, 20, 20]}/>

  </mesh>
}

export const EmptyRoom: React.FC = () => {
  const soundTrack = useRoomStore(state => state.global.music.currentTrack);

  const roomStore = useRoomStore(state => state);

  const intensities = {
    bright: 2,
    dim: 1,
    dark: 0.5,
  };

  return (
    <div id="canvas-container" className="w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{
          zoom: 3,
          position: [200, 200, 200],
          near: 0.1,
          far: 1000,
        }}
      >
        {/* <GradientBackground color1="#ef3b0e" color2="#4c0fda" /> */}
        {soundTrack && <AudioComponent soundTrack={soundTrack} />}
        <OrbitControls rotateSpeed={0.2} zoomSpeed={0.2} panSpeed={2} />
        <UpdateSceneBackground color={roomStore.background.color} />
        <ambientLight
          position={[50, 100, 100]}
          castShadow={false}
          intensity={1}
          color="white"
        />
        <directionalLight
          position={[50, 100, 100]}
          castShadow={true}
          intensity={intensities[roomStore.global.brightness]}
          color="white"
        />
        <pointLight
          position={[-10, -10, -10]}
          castShadow={false}
          intensity={20000}
          color="blue"
        />
        <mesh castShadow position={[50, 50, 50]} visible={true}>
          <boxGeometry args={[20, 20, 20]} />
          <meshPhongMaterial color={'#fc048c'} />
        </mesh>
        <mesh receiveShadow position={[0, 0, 0]} visible={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhongMaterial color={'#f60c0c'} />
        </mesh>
        <mesh
          receiveShadow={true}
          position={[45, -5, 45]}
          visible={!roomStore.floor.hidden}
        >
          <boxGeometry args={[110, 10, 110]} />
          <meshPhongMaterial color={roomStore.floor.color} />
        </mesh>
        <mesh
          position={[45, 50, -5]}
          rotation={[Math.PI / 2, 0, 0]}
          visible={!roomStore.rightWall.hidden}
        >
          <boxGeometry args={[110, 10, 100]} />
          <meshPhongMaterial color={roomStore.rightWall.color} />
        </mesh>
        <mesh
          position={[-5, 50, 50]}
          rotation={[0, 0, Math.PI / 2]}
          visible={!roomStore.leftWall.hidden}
        >
          <boxGeometry args={[100, 10, 100]} />
          <meshPhongMaterial color={roomStore.leftWall.color} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default EmptyRoom;
