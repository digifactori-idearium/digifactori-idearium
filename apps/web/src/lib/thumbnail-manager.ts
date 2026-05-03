import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

class ThumbnailManager {
  private static instance: ThumbnailManager;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private loader: GLTFLoader;
  private queue: Array<{
    file: string;
    resolve: (url: string) => void;
  }> = [];
  private processing = false;

  private constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(128, 128);
    this.renderer.setPixelRatio(1);

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();

    this.scene.background = null;

    this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 5);
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this.scene.add(hemisphereLight);

    this.loader = new GLTFLoader();
  }

  static getInstance(): ThumbnailManager {
    if (!ThumbnailManager.instance) {
      ThumbnailManager.instance = new ThumbnailManager();
    }
    return ThumbnailManager.instance;
  }

  async generateThumbnail(file: string): Promise<string> {
    return new Promise(resolve => {
      this.queue.push({ file, resolve });
      this.processQueue();
    });
  }

  private setupMaterials(object: THREE.Object3D) {
    object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          materials.forEach(material => {
            material.needsUpdate = true;

            if (material instanceof THREE.MeshStandardMaterial) {
              material.envMapIntensity = 0.5;
              material.roughness = Math.min(material.roughness, 0.8);
              material.metalness = Math.max(material.metalness, 0.1);
            }

            if (material instanceof THREE.MeshBasicMaterial) {
              if (material.color.getHex() === 0x000000) {
                material.color.set(0x808080);
              }
            }

            if (material instanceof THREE.MeshPhongMaterial) {
              material.shininess = 30;
              material.specular = new THREE.Color(0x111111);
            }

            if (material.map) {
              material.map.colorSpace = THREE.SRGBColorSpace;
            }
            if (material.emissiveMap) {
              material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            }
          });
        }
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    try {
      const { file, resolve } = this.queue.shift()!;

      const gltf = await this.loader.loadAsync(file);
      const model = gltf.scene;

      this.setupMaterials(model);

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;

      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      model.position.y += 0.5;

      this.scene.add(model);

      await new Promise(resolve => requestAnimationFrame(resolve));

      this.renderer.render(this.scene, this.camera);
      await new Promise(resolve => requestAnimationFrame(resolve));
      this.renderer.render(this.scene, this.camera);

      // Generate blob
      const canvas = this.renderer.domElement;
      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, 'image/webp', 0.9);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }

      // Cleanup
      this.scene.remove(model);
      model.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      const { resolve } = this.queue.shift() || {};
      resolve?.('');
    } finally {
      this.processing = false;
      this.processQueue();
    }
  }

  dispose() {
    this.renderer.dispose();
    this.scene.clear();
    // Clear queue
    this.queue = [];
  }
}

export const thumbnailManager = ThumbnailManager.getInstance();
