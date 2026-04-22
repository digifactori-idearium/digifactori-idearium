import { useState } from "react"

interface EditPanelProps {
  mode: "add" | "remove" | "paint"
  setMode: (m: "add" | "remove" | "paint") => void
  shape: "cube" | "mur" | "plateforme" | "escalier" | "cadre" | "anneau" | "cercle" | "sphere"
  setShape: (s: "cube" | "mur" | "plateforme" | "escalier" | "cadre" | "anneau" | "cercle" | "sphere") => void
  rotationH: number
  setRotationH: React.Dispatch<React.SetStateAction<number>>
  rotationV: number
  setRotationV: React.Dispatch<React.SetStateAction<number>>
  longueur: number
  setLongueur: (n: number) => void
  largeur: number
  setLargeur: (n: number) => void
  hauteur: number
  setHauteur: (n: number) => void
}

interface ButtonProps {
  value: "add" | "remove" | "paint"
  label: string
  color: string
  mode: "add" | "remove" | "paint"
  setMode: (m: "add" | "remove" | "paint") => void
}

const Button = ({ value, label, color, mode, setMode }: ButtonProps) => (
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
      boxShadow: mode === value ? `0 0 12px ${color}` : "none",
    }}
  >
    {label}
  </button>
)

export default function EditPanel({ mode, setMode, shape, setShape, rotationH, setRotationH, rotationV, setRotationV, longueur, setLongueur, largeur, setLargeur, hauteur, setHauteur }: EditPanelProps) {
  const [open, setOpen] = useState(false)
  const forme = {
    cube: {longueur : false, largeur : false, hauteur : false},
    mur: {longueur : true, largeur : false, hauteur : true},
    plateforme: {longueur : true, largeur : true, hauteur : false},
    escalier: {longueur : false, largeur : true, hauteur : true},
    cadre: {longueur : true, largeur : true, hauteur : false},
    anneau: {longueur : false, largeur : true, hauteur : false},
    cercle: {longueur : false, largeur : true, hauteur : false},
    sphere: {longueur : false, largeur : true, hauteur : false}
  }

  const formeSelect = forme[shape]

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

      {formeSelect.longueur && (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 14 }}>
          🔢 Longueur des formes :
        </label>
      
        <input
          type="number"
          value={longueur}
          onChange={(e) => setLongueur(Number(e.target.value))}
          min={1}
          style={{
            padding: 8,
            borderRadius: 10,
            border: "none",
            background: "#333",
            color: "white"
          }}
        />
      </div>
      )}

      {formeSelect.largeur && (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 14 }}>
          🔢 Largueur des formes :
        </label>
      
        <input
          type="number"
          value={largeur}
          onChange={(e) => setLargeur(Number(e.target.value))}
          min={1}
          style={{
            padding: 8,
            borderRadius: 10,
            border: "none",
            background: "#333",
            color: "white"
          }}
        />
      </div>
      )}

      {formeSelect.hauteur && (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 14 }}>
          🔢 Hauteur des formes :
        </label>
      
        <input
          type="number"
          value={hauteur}
          onChange={(e) => setHauteur(Number(e.target.value))}
          min={1}
          style={{
            padding: 8,
            borderRadius: 10,
            border: "none",
            background: "#333",
            color: "white"
          }}
        />
      </div>
      )}

      {/* DROPDOWN */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: "none",
            background: "#555",
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
            background: "#555",
            borderRadius: 12,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}>
            {["cube","mur","plateforme","escalier","cadre", "anneau", "cercle", "sphere"].map(s => (
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

      {/* RotationH */}
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>
          🔄 rotation Horizontale : {(rotationH % 4 + 4) % 4 * 90}°
        </div>
      
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setRotationH(r => r - 1)}
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
      
          <button
            onClick={() => setRotationH(r => r + 1)}
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
        </div>
      </div>

      {/* RotationV */}
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>
          🔄 rotation Verticale : {(rotationV % 4 + 4) % 4 * 90}°
        </div>
      
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setRotationV(r => r - 1)}
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
            onClick={() => setRotationV(r => r + 1)}
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

      {/* Boutons Mode */}
      <Button value="add" label="Ajouter bloc" color="#4ade80" mode={mode} setMode={setMode} />
      <Button value="remove" label="Supprimer bloc" color="#f87171" mode={mode} setMode={setMode} />
      <Button value="paint" label="Peindre" color="#60a5fa" mode={mode} setMode={setMode} />
    </div>
  )
}