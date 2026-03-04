import { useMemo } from 'react';
import { ShaderMaterial, Color } from 'three';

export function SceneGradient({ color = '#6c63ff' }) {
  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(color) },
        uIntensity: { value: 0.15 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 1.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          float dist = distance(vUv, vec2(0.5));
          
          float mask = pow(1.0 - dist * 1.5, 3.0);
          mask = clamp(mask, 0.0, 1.0);

          vec3 backgroundColor = vec3(0.02); 
          vec3 finalColor = mix(backgroundColor, uColor, mask * uIntensity);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });
  }, [color]);

  return (
    <mesh
      renderOrder={-10000} // Ensures it stays behind everything else
      frustumCulled={false}
    >
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
