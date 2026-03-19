import { Canvas, ThreeEvent } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useRef, useState, useMemo } from "react"
import * as THREE from "three"

interface VoxelProps {
  mode: "add" | "remove" | "paint"
  shape: "cube" | "mur" | "plateforme" | "escalier"
  rotation: number
}

interface VoxelPainterProps {
  mode: "add" | "remove" | "paint"
  shape: "cube" | "mur" | "plateforme" | "escalier"
  rotation: number
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
}

function VoxelPainter({ mode, shape, rotation, setIsDragging }: VoxelPainterProps) {

  const planeRef = useRef<THREE.Mesh>(null!)
  const rollOverRef = useRef<THREE.Group>(null!)

  const clickStartTime = useRef(0)
  const [voxels, setVoxels] = useState<THREE.Vector3[]>([])

  const cubeGeo = useMemo(() => new THREE.BoxGeometry(50, 50, 50), [])
  const cubeMaterial = useMemo(() => new THREE.MeshLambertMaterial({ color: 0xfeb74c }), [])

  const snapPosition = (pos: THREE.Vector3) => {
    pos.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
    if (pos.y < 25) pos.y = 25
    return pos
  }

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (!event.face) return

    const clickDuration = performance.now() - clickStartTime.current
    if (clickDuration > 400) setIsDragging(true)

    const pos = rollOverRef.current.position
    pos.copy(event.point).add(event.face.normal)

    if ((mode === "remove" || mode === "paint") && event.object !== planeRef.current) {
      pos.copy(event.object.position)
      return
    }

    snapPosition(pos)
  }

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    clickStartTime.current = performance.now()
  }

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {

    event.stopPropagation()
    setIsDragging(false)

    const clickDuration = performance.now() - clickStartTime.current
    if (clickDuration > 150) return

    const position = new THREE.Vector3()

    if (event.face) {
      if (mode === "add")
        position.copy(event.point).add(event.face.normal)
      else  
        position.copy(event.object.position)
    }
    else position.copy(rollOverRef.current.position)

    snapPosition(position)

    if (mode === "remove") {
      const positionsToDelete: THREE.Vector3[] = []
    
      getShapeOffsets().forEach(o => {
        const p = position.clone().add(new THREE.Vector3(o[0], o[1], o[2]))
        snapPosition(p)
        positionsToDelete.push(p)
      })
    
      // filtrer les voxels existants
      setVoxels(prev =>
        prev.filter(v =>
          !positionsToDelete.some(p => p.equals(v))
        )
      )
    }

    else if (mode === "add") {

      const newVoxels: THREE.Vector3[] = []
    
      getShapeOffsets().forEach(o=>{
        newVoxels.push(
          position.clone().add(new THREE.Vector3(o[0],o[1],o[2]))
        )
      })
    
      setVoxels(prev => [...prev, ...newVoxels])
    }
  }

  const rotateOffset = (x:number, y:number, z:number) => {

    const r = ((rotation % 4) + 4) % 4
  
    if (r === 0) return [x,y,z]
    if (r === 1) return [z,y,-x]
    if (r === 2) return [-x,y,-z]
    if (r === 3) return [-z,y,x]
  
    return [x,y,z]
  }

  const getShapeOffsets = () => {

    const offsets:number[][] = []
  
    if (shape === "cube")
      offsets.push([0,0,0])
  
    if (shape === "mur")
      for (let i=0;i<5;i++)
        offsets.push([i*50,0,0])
  
    if (shape === "plateforme")
      for (let x=0;x<3;x++)
        for (let z=0;z<3;z++)
          offsets.push([x*50,0,z*50])
  
    if (shape === "escalier")
      for (let i=0;i<5;i++)
        offsets.push([i*50,i*50,0])
  
    return offsets.map(o => rotateOffset(o[0],o[1],o[2]))
  }

  return (
    <>
      <color attach="background" args={[0xf0f0f0]} />
      <ambientLight intensity={3} color={0x606060} />
      <directionalLight position={[1, 0.75, 0.5]} intensity={3} />

      <group ref={rollOverRef}>
        {getShapeOffsets().map((o,i)=>(
          <mesh key={i} position={o as any}>
            <boxGeometry args={[50,50,50]} />
            <meshBasicMaterial
              color={0xff0000}
              transparent
              opacity={0.35}
            />
          </mesh>
        ))}
      </group>

      <gridHelper args={[1000, 20]} />

      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {voxels.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          geometry={cubeGeo}
          material={cubeMaterial}
        />
      ))}
    </>
  )
}

export default function Voxel({ mode, shape, rotation }: VoxelProps) {

  const [isDragging, setIsDragging] = useState(false)

  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [500, 800, 1300], fov: 45, near: 1, far: 10000 }}
    >
      <VoxelPainter
        mode={mode}
        shape={shape}
        rotation={rotation}
        setIsDragging={setIsDragging}
      />
      <OrbitControls enabled={isDragging} target={[0, 25, 0]} />
    </Canvas>
  )
}