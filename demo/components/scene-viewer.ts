import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface SceneConfig {
  rotationSpeed: number
  color: string
  wireframe: boolean
  shape: 'cube' | 'sphere' | 'torus' | 'octahedron'
  cameraZ: number
}

/**
 * A Three.js scene viewer component
 * Demonstrates Datastar data-attr integration with config objects
 */
@customElement('scene-viewer')
export class SceneViewer extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 300px;
    }
    .container {
      width: 100%;
      height: 100%;
    }
    canvas {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-2, 8px);
    }
  `

  @property({ type: Object }) config: SceneConfig = {
    rotationSpeed: 0.01,
    color: '#6366f1',
    wireframe: false,
    shape: 'cube',
    cameraZ: 5
  }

  private THREE: any = null
  private scene: any = null
  private camera: any = null
  private renderer: any = null
  private mesh: any = null
  private animationFrame?: number
  private currentShape?: string

  protected async firstUpdated() {
    // Dynamic import of Three.js from the importmap
    this.THREE = await import('three')
    this.initThree()
    this.runAnimation()
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('config') && this.THREE) {
      this.updateScene()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    this.renderer?.dispose()
  }

  private initThree() {
    const THREE = this.THREE
    if (!THREE) return
    
    const container = this.shadowRoot?.querySelector('.container') as HTMLElement
    if (!container) return

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a2e)

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.camera.position.z = this.config.cameraZ

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(this.renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2)
    this.scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 100)
    pointLight.position.set(5, 5, 5)
    this.scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0x6366f1, 50)
    pointLight2.position.set(-5, -5, 5)
    this.scene.add(pointLight2)

    // Create initial mesh
    this.createMesh()

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (!this.camera || !this.renderer) return
      const width = container.clientWidth
      const height = container.clientHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    })
    resizeObserver.observe(container)
  }

  private createMesh() {
    const THREE = this.THREE
    if (!this.scene || !THREE) return

    // Remove old mesh
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach((m: any) => m.dispose())
      } else {
        this.mesh.material.dispose()
      }
    }

    // Create geometry based on shape
    let geometry: any
    switch (this.config.shape) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1.5, 32, 32)
        break
      case 'torus':
        geometry = new THREE.TorusGeometry(1, 0.4, 16, 100)
        break
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(1.5)
        break
      case 'cube':
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2)
    }

    const material = new THREE.MeshStandardMaterial({
      color: this.config.color,
      wireframe: this.config.wireframe,
      metalness: 0.3,
      roughness: 0.4
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)
    this.currentShape = this.config.shape
  }

  private updateScene() {
    if (!this.mesh || !this.camera) return

    // Update material
    const material = this.mesh.material
    material.color.set(this.config.color)
    material.wireframe = this.config.wireframe

    // Update camera
    this.camera.position.z = this.config.cameraZ

    // Recreate mesh if shape changed
    if (this.currentShape !== this.config.shape) {
      this.createMesh()
    }
  }

  private runAnimation() {
    this.animationFrame = requestAnimationFrame(() => this.runAnimation())

    if (this.mesh) {
      this.mesh.rotation.x += this.config.rotationSpeed
      this.mesh.rotation.y += this.config.rotationSpeed * 0.7
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  render() {
    return html`<div class="container"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'scene-viewer': SceneViewer
  }
}
