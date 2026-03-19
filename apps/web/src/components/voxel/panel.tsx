import { useState } from "react"

interface EditPanelProps {
  mode: "add" | "remove" | "paint"
  setMode: (m: "add" | "remove" | "paint") => void
  shape: "cube" | "mur" | "plateforme" | "escalier"
  setShape: (s: "cube" | "mur" | "plateforme" | "escalier") => void
  rotation: number
  setRotation: React.Dispatch<React.SetStateAction<number>>
}

export default function EditPanel({mode, setMode, shape, setShape, rotation, setRotation}: EditPanelProps) {

  const [open, setOpen] = useState(false)

  interface ButtonProps {
    value: "add" | "remove" | "paint"
    label: string
    color: string
  }

  const Button = ({ value, label, color }: ButtonProps) => (
    <button
      onClick={() => setMode(value)}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        background: mode === value ? color : "#444",
        color: "white",
        boxShadow: mode === value ? `0 0 12px ${color}` : "none"
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      width: "100%",
      background: "rgba(30,30,30,0.9)",
      padding: 20,
      borderRadius: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      color: "white"
    }}>

      <b>🧱 Edition</b>

      {/* DROPDOWN */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: "none",
            background: "#333",
            color: "white",
            cursor: "pointer"
          }}
        >
          📦 Forme : {shape}
        </button>

        {open && (
          <div style={{
            position: "absolute",
            top: 45,
            left: 0,
            right: 0,
            background: "#222",
            borderRadius: 12,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}>
            {["cube","mur","plateforme","escalier"].map(s => (
              <div
                key={s}
                onClick={() => { setShape(s as any); setOpen(false) }}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  cursor: "pointer",
                  background: shape === s ? "#555" : "transparent"
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>
          🔄 Rotation : {(rotation % 4 + 4) % 4 * 90}°
        </div>
      
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setRotation(r => r - 1)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "none",
              background: "#555",
              color: "white",
              cursor: "pointer",
              fontSize: 18
            }}
          >
            ↺
          </button>
      
          <button
            onClick={() => setRotation(r => r + 1)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "none",
              background: "#555",
              color: "white",
              cursor: "pointer",
              fontSize: 18
            }}
          >
            ↻
          </button>
        </div>
      </div>

      <Button value="add" label="Ajouter bloc" color="#4ade80" />
      <Button value="remove" label="Supprimer bloc" color="#f87171" />
      <Button value="paint" label="Peindre" color="#60a5fa" />

    </div>
  )
}