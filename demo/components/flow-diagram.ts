import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface FlowNode {
  id: string
  label: string
  x: number
  y: number
  color?: string
}

export interface FlowEdge {
  id: string
  source: string
  target: string
}

export interface FlowConfig {
  nodeRadius: number
  lineWidth: number
  animate: boolean
}

/**
 * A simple flow diagram component using Canvas
 * Now using HTML attributes with JSON parsing (testing data-attr compatibility)
 */
@customElement('flow-diagram')
export class FlowDiagram extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 300px;
    }
    canvas {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-2, 8px);
      background: var(--surface-2, #1a1a2e);
    }
  `

  // Using Lit's built-in type converters - they handle JSON parsing from attributes
  @property({ type: Array, reflect: true }) nodes: FlowNode[] = []
  @property({ type: Array, reflect: true }) edges: FlowEdge[] = []
  @property({ type: Object, reflect: true }) config: FlowConfig = {
    nodeRadius: 30,
    lineWidth: 2,
    animate: true
  }

  private canvas?: HTMLCanvasElement
  private ctx?: CanvasRenderingContext2D
  private animationFrame?: number
  private time = 0

  protected firstUpdated() {
    this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement
    this.ctx = this.canvas?.getContext('2d') ?? undefined
    this.resizeCanvas()
    window.addEventListener('resize', () => this.resizeCanvas())
    this.draw()
  }

  protected updated(_changedProperties: PropertyValues) {
    this.draw()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  }

  private resizeCanvas() {
    if (!this.canvas) return
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * window.devicePixelRatio
    this.canvas.height = rect.height * window.devicePixelRatio
    this.ctx?.scale(window.devicePixelRatio, window.devicePixelRatio)
    this.draw()
  }

  private draw() {
    // Cancel any existing animation frame to prevent stacking
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = undefined
    }
    
    if (!this.ctx || !this.canvas) return

    const ctx = this.ctx
    const rect = this.canvas.getBoundingClientRect()
    
    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw edges
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)'
    ctx.lineWidth = this.config.lineWidth
    
    for (const edge of this.edges) {
      const source = this.nodes.find(n => n.id === edge.source)
      const target = this.nodes.find(n => n.id === edge.target)
      if (!source || !target) continue

      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      
      // Curved line
      const midX = (source.x + target.x) / 2
      const midY = (source.y + target.y) / 2 - 30
      ctx.quadraticCurveTo(midX, midY, target.x, target.y)
      ctx.stroke()

      // Animated dot on edge
      if (this.config.animate) {
        const t = (Math.sin(this.time * 0.02 + parseInt(edge.id) * 0.5) + 1) / 2
        const dotX = Math.pow(1-t, 2) * source.x + 2 * (1-t) * t * midX + Math.pow(t, 2) * target.x
        const dotY = Math.pow(1-t, 2) * source.y + 2 * (1-t) * t * midY + Math.pow(t, 2) * target.y
        
        ctx.beginPath()
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#a5b4fc'
        ctx.fill()
      }
    }

    // Draw nodes
    for (const node of this.nodes) {
      const radius = this.config.nodeRadius
      const color = node.color || '#6366f1'
      
      // Glow effect
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, radius * 1.5
      )
      gradient.addColorStop(0, color)
      gradient.addColorStop(0.6, color + '40')
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.fillStyle = '#fff'
      ctx.font = '12px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x, node.y)
    }

    // Animation loop
    if (this.config.animate) {
      this.time++
      this.animationFrame = requestAnimationFrame(() => this.draw())
    }
  }

  render() {
    return html`<canvas></canvas>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'flow-diagram': FlowDiagram
  }
}
