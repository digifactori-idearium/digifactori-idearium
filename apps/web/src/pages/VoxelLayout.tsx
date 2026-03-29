import { useState } from "react"
import Voxel from "@/pages/Voxel"
import EditPanel from "@/components/voxel/panel"

export default function VoxelLayout() {

  const [mode, setMode] = useState<"add" | "remove" | "paint">("add")
  const [shape, setShape] = useState<"cube" | "mur" | "plateforme" | "escalier">("cube")
  const [rotation, setRotation] = useState(0)
  const [taille, setTaille] = useState(1)

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>

      <div style={{ width: 260, padding: 20 }}>
        <EditPanel
          mode={mode}
          setMode={setMode}
          shape={shape}
          setShape={setShape}
          rotation={rotation}
          setRotation={setRotation}
          taille={taille}
          setTaille={setTaille}
        />
      </div>

      <div style={{ flex: 1 }}>
        <Voxel
          mode={mode}
          shape={shape}
          rotation={rotation}
          taille={taille}
        />
      </div>

    </div>
  )
}