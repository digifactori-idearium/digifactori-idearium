import { useMemo } from 'react';
import { ShaderMaterial, Color } from 'three';

interface Props {
  baseColor: string;
  accentColor: string;
}

export function SceneGradient({ baseColor, accentColor }: Props) {
  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uBaseColor: { value: new Color(baseColor) },
        uAccentColor: { value: new Color(accentColor) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 1.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uAccentColor;
        varying vec2 vUv;

        void main() {

          // Radial center glow
          float dist = distance(vUv, vec2(0.5));
          float radial = 1.0 - smoothstep(0.2, 0.8, dist);

          // Vertical lift (subtle sky feel)
          float vertical = smoothstep(0.0, 1.0, vUv.y);

          // Blend base → accent in center
          vec3 radialBlend = mix(uBaseColor, uAccentColor, radial * 0.6);

          // Slight vertical brightness
          vec3 finalColor = mix(radialBlend, uAccentColor, vertical * 0.15);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });
  }, [baseColor, accentColor]);

  return (
    <mesh renderOrder={-10000} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
