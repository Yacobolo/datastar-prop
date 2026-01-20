import { LitElement, html, css, nothing } from 'lit'
import { customElement, state, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'

interface TreeNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  children?: TreeNode[]
  count?: number
  path: string
}

/**
 * A live signals viewer component with tree view
 * Shows the current Datastar signals state in real-time
 */
@customElement('live-signals')
export class LiveSignals extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      background: var(--gray-9, #0f0f17);
      border-left: 1px solid var(--gray-7, #2a2a3c);
      z-index: 1000;
      font-family: var(--font-mono, 'SF Mono', 'Monaco', 'Menlo', monospace);
      font-size: 12px;
      transition: transform 0.2s ease;
    }

    :host([collapsed]) {
      transform: translateX(100%);
    }

    .toggle {
      position: absolute;
      top: 50%;
      left: -32px;
      transform: translateY(-50%);
      width: 32px;
      height: 64px;
      background: var(--gray-8, #1a1a2e);
      border: 1px solid var(--gray-7, #2a2a3c);
      border-right: none;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-4, #9ca3af);
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .toggle:hover {
      background: var(--gray-7, #2a2a3c);
      color: var(--gray-1, #f3f4f6);
    }

    .toggle svg {
      width: 16px;
      height: 16px;
      transition: transform 0.2s ease;
    }

    :host([collapsed]) .toggle svg {
      transform: rotate(180deg);
    }

    .header {
      padding: 16px;
      border-bottom: 1px solid var(--gray-7, #2a2a3c);
      background: linear-gradient(180deg, var(--gray-8, #1a1a2e) 0%, var(--gray-9, #0f0f17) 100%);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-icon {
      width: 20px;
      height: 20px;
      color: var(--indigo-4, #818cf8);
    }

    .header h3 {
      margin: 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--gray-3, #d1d5db);
      font-weight: 600;
    }

    .content {
      height: calc(100vh - 57px);
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* Scrollbar */
    .content::-webkit-scrollbar {
      width: 8px;
    }

    .content::-webkit-scrollbar-track {
      background: transparent;
    }

    .content::-webkit-scrollbar-thumb {
      background: var(--gray-7, #2a2a3c);
      border-radius: 4px;
    }

    .content::-webkit-scrollbar-thumb:hover {
      background: var(--gray-6, #374151);
    }

    /* Tree styles */
    .tree-root {
      padding: 8px 0;
    }

    .tree-node {
      position: relative;
    }

    .tree-row {
      display: flex;
      align-items: center;
      padding: 4px 12px 4px 0;
      cursor: default;
      transition: background 0.1s ease;
      min-height: 26px;
    }

    .tree-row:hover {
      background: var(--gray-8, #1a1a2e);
    }

    .tree-row.root-level {
      background: var(--gray-8, #1a1a2e);
      border-bottom: 1px solid var(--gray-7, #2a2a3c);
      margin-bottom: 2px;
    }

    .tree-row.root-level:hover {
      background: var(--gray-7, #2a2a3c);
    }

    .indent {
      display: flex;
      align-items: stretch;
      align-self: stretch;
    }

    .indent-guide {
      width: 16px;
      display: flex;
      justify-content: center;
      position: relative;
    }

    .indent-guide::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--gray-7, #2a2a3c);
    }

    .expand-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--gray-5, #6b7280);
      cursor: pointer;
      border-radius: 4px;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.1s ease;
    }

    .expand-btn:hover {
      background: var(--gray-7, #2a2a3c);
      color: var(--gray-3, #d1d5db);
    }

    .expand-btn svg {
      width: 12px;
      height: 12px;
      transition: transform 0.15s ease;
    }

    .expand-btn.expanded svg {
      transform: rotate(90deg);
    }

    .expand-placeholder {
      width: 20px;
      flex-shrink: 0;
    }

    .key {
      color: var(--violet-4, #a78bfa);
      margin-right: 4px;
      font-weight: 500;
    }

    .colon {
      color: var(--gray-5, #6b7280);
      margin-right: 6px;
    }

    .value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value.string {
      color: var(--lime-4, #a3e635);
    }

    .value.number {
      color: var(--cyan-4, #22d3ee);
    }

    .value.boolean {
      color: var(--orange-4, #fb923c);
    }

    .value.null {
      color: var(--gray-5, #6b7280);
      font-style: italic;
    }

    .badge {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 10px;
      background: var(--gray-7, #2a2a3c);
      color: var(--gray-4, #9ca3af);
      margin-left: 6px;
      font-weight: 500;
    }

    .type-icon {
      width: 14px;
      height: 14px;
      margin-right: 6px;
      flex-shrink: 0;
      opacity: 0.7;
    }

    .type-icon.object {
      color: var(--violet-4, #a78bfa);
    }

    .type-icon.array {
      color: var(--cyan-4, #22d3ee);
    }

    .preview {
      color: var(--gray-5, #6b7280);
      font-size: 11px;
      margin-left: 4px;
    }

    /* Change highlight animation */
    @keyframes flash-bg {
      0% { 
        background: var(--yellow-8, #854d0e);
        box-shadow: inset 0 0 0 1px var(--yellow-6, #ca8a04);
      }
      100% { 
        background: transparent;
        box-shadow: none;
      }
    }

    @keyframes flash-text {
      0%, 50% { 
        color: var(--yellow-3, #fef08a);
        text-shadow: 0 0 8px var(--yellow-5, #eab308);
      }
      100% { 
        color: inherit;
        text-shadow: none;
      }
    }

    .tree-row.changed {
      animation: flash-bg 1s ease-out forwards;
    }

    .value.changed {
      animation: flash-text 1s ease-out forwards;
    }

    /* Children container */
    .children {
      overflow: hidden;
    }

    .children.collapsed {
      display: none;
    }

    /* Empty state */
    .empty {
      padding: 24px 16px;
      text-align: center;
      color: var(--gray-5, #6b7280);
    }

    .empty-icon {
      width: 32px;
      height: 32px;
      margin: 0 auto 8px;
      opacity: 0.5;
    }
  `

  @state() private signals: Record<string, any> = {}
  @state() private previousSignals: string = '{}'
  @state() private expandedPaths: Set<string> = new Set()
  @state() private changedPaths: Map<string, number> = new Map() // path -> timestamp for animation key
  @state() private collapsed = false
  @state() private isFirstLoad = true

  connectedCallback() {
    super.connectedCallback()
    this.startObserving()
  }

  private startObserving() {
    this.updateSignals()
    setInterval(() => this.updateSignals(), 100)
  }

  private updateSignals() {
    const jsonSignalsEl = document.querySelector('[data-json-signals]')
    if (jsonSignalsEl && jsonSignalsEl.textContent) {
      try {
        const newSignals = JSON.parse(jsonSignalsEl.textContent)
        const newJson = JSON.stringify(newSignals)
        
        // On first load, expand all root-level signals
        if (this.isFirstLoad && Object.keys(newSignals).length > 0) {
          this.isFirstLoad = false
          this.expandedPaths = new Set(Object.keys(newSignals))
          this.previousSignals = newJson
          this.signals = newSignals
          return
        }
        
        // Detect changes
        if (newJson !== this.previousSignals) {
          const changedRoots = this.detectChanges(this.signals, newSignals, '')
          this.previousSignals = newJson
          this.signals = newSignals
          
          // Auto-expand changed branches, collapse others
          if (changedRoots.size > 0) {
            this.autoExpandChanged(changedRoots)
          }
          
          // Clear changed paths after animation
          setTimeout(() => {
            this.changedPaths = new Map()
          }, 1000)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  private detectChanges(oldObj: any, newObj: any, path: string): Set<string> {
    const timestamp = Date.now()
    const newChanges = new Map<string, number>()
    const changedRoots = new Set<string>()
    
    const check = (oldVal: any, newVal: any, currentPath: string) => {
      if (typeof newVal !== 'object' || newVal === null) {
        if (oldVal !== newVal) {
          newChanges.set(currentPath, timestamp)
          // Track root-level signal that changed
          const root = currentPath.split('.')[0].split('[')[0]
          changedRoots.add(root)
        }
        return
      }
      
      if (Array.isArray(newVal)) {
        if (!Array.isArray(oldVal) || oldVal.length !== newVal.length) {
          newChanges.set(currentPath, timestamp)
          const root = currentPath.split('.')[0].split('[')[0]
          changedRoots.add(root)
        }
        newVal.forEach((item, i) => {
          check(oldVal?.[i], item, `${currentPath}[${i}]`)
        })
      } else {
        const allKeys = new Set([...Object.keys(oldVal || {}), ...Object.keys(newVal)])
        allKeys.forEach(key => {
          check(oldVal?.[key], newVal[key], currentPath ? `${currentPath}.${key}` : key)
        })
      }
    }
    
    check(oldObj, newObj, path)
    this.changedPaths = newChanges
    return changedRoots
  }

  private getParentPaths(path: string): string[] {
    const parents: string[] = []
    let current = ''
    let i = 0
    
    while (i < path.length) {
      if (path[i] === '.') {
        if (current) parents.push(current)
        current += '.'
      } else if (path[i] === '[') {
        if (current) parents.push(current)
        const end = path.indexOf(']', i)
        current += path.slice(i, end + 1)
        i = end
      } else {
        current += path[i]
      }
      i++
    }
    
    return parents
  }

  private autoExpandChanged(changedRoots: Set<string>) {
    const newExpanded = new Set<string>()
    
    // Expand changed roots and all parent paths leading to changed values
    for (const root of Object.keys(this.signals)) {
      if (changedRoots.has(root)) {
        newExpanded.add(root)
        
        // Expand all parent paths for each changed path
        for (const changedPath of this.changedPaths.keys()) {
          if (changedPath.startsWith(root)) {
            for (const parentPath of this.getParentPaths(changedPath)) {
              newExpanded.add(parentPath)
            }
          }
        }
      }
      // Don't add unchanged roots - they stay collapsed
    }
    
    this.expandedPaths = newExpanded
  }

  private toggleExpand(path: string) {
    const newExpanded = new Set(this.expandedPaths)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    this.expandedPaths = newExpanded
  }

  private toggleCollapsed() {
    this.collapsed = !this.collapsed
    if (this.collapsed) {
      this.setAttribute('collapsed', '')
    } else {
      this.removeAttribute('collapsed')
    }
  }

  private buildTree(obj: any, parentPath: string = ''): TreeNode[] {
    if (typeof obj !== 'object' || obj === null) return []
    
    return Object.entries(obj)
      .filter(([key]) => !key.startsWith('$'))  // Filter out $ prefixed signal accessors
      .map(([key, value]) => {
      const path = parentPath ? `${parentPath}.${key}` : key
      const type = this.getType(value)
      const node: TreeNode = { key, value, type, path }
      
      if (type === 'object') {
        node.children = this.buildTree(value as Record<string, any>, path)
        node.count = Object.keys(value as object).length
      } else if (type === 'array') {
        node.children = (value as any[]).map((item, i) => {
          const itemPath = `${path}[${i}]`
          const itemType = this.getType(item)
          const child: TreeNode = { key: String(i), value: item, type: itemType, path: itemPath }
          if (itemType === 'object') {
            child.children = this.buildTree(item as Record<string, any>, itemPath)
            child.count = Object.keys(item as object).length
          } else if (itemType === 'array') {
            child.count = (item as any[]).length
          }
          return child
        })
        node.count = (value as any[]).length
      }
      
      return node
    })
  }

  private getType(value: any): TreeNode['type'] {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value as TreeNode['type']
  }

  private renderTree(nodes: TreeNode[], depth: number = 0): any {
    // Use repeat with keys that include change timestamp to force re-render
    return repeat(
      nodes,
      (node) => {
        const changeTimestamp = this.changedPaths.get(node.path)
        return changeTimestamp ? `${node.path}-${changeTimestamp}` : node.path
      },
      (node) => this.renderNode(node, depth)
    )
  }

  private renderNode(node: TreeNode, depth: number): any {
    const isExpandable = node.type === 'object' || node.type === 'array'
    const isExpanded = this.expandedPaths.has(node.path)
    const changeTimestamp = this.changedPaths.get(node.path)
    const isChanged = changeTimestamp !== undefined
    const isRootLevel = depth === 0

    return html`
      <div class="tree-node">
        <div class="tree-row ${isRootLevel ? 'root-level' : ''} ${isChanged ? 'changed' : ''}">
          ${this.renderIndent(depth)}
          ${isExpandable ? html`
            <button 
              class="expand-btn ${isExpanded ? 'expanded' : ''}"
              @click=${() => this.toggleExpand(node.path)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ` : html`<span class="expand-placeholder"></span>`}
          
          ${this.renderTypeIcon(node.type)}
          
          <span class="key">${node.key}</span>
          <span class="colon">:</span>
          
          ${isExpandable ? html`
            <span class="badge">${node.count} ${node.type === 'array' ? 'items' : 'keys'}</span>
            ${!isExpanded && node.children?.length ? html`
              <span class="preview">${this.getPreview(node)}</span>
            ` : nothing}
          ` : html`
            <span class="value ${node.type} ${isChanged ? 'changed' : ''}">${this.formatValue(node.value, node.type)}</span>
          `}
        </div>
        
        ${isExpandable && node.children ? html`
          <div class="children ${isExpanded ? '' : 'collapsed'}">
            ${this.renderTree(node.children, depth + 1)}
          </div>
        ` : nothing}
      </div>
    `
  }

  private renderIndent(depth: number): any {
    if (depth === 0) return html`<span style="width: 8px"></span>`
    
    return html`
      <span class="indent">
        ${Array(depth).fill(0).map(() => html`
          <span class="indent-guide"></span>
        `)}
      </span>
    `
  }

  private renderTypeIcon(type: TreeNode['type']): any {
    if (type === 'object') {
      return html`
        <svg class="type-icon object" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      `
    }
    if (type === 'array') {
      return html`
        <svg class="type-icon array" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      `
    }
    return nothing
  }

  private formatValue(value: any, type: TreeNode['type']): string {
    if (type === 'string') return `"${value}"`
    if (type === 'null') return 'null'
    if (type === 'boolean') return value ? 'true' : 'false'
    return String(value)
  }

  private getPreview(node: TreeNode): string {
    if (node.type === 'array' && node.children) {
      const items = node.children.slice(0, 3).map(c => {
        if (c.type === 'object') return '{...}'
        if (c.type === 'array') return '[...]'
        return this.formatValue(c.value, c.type)
      })
      return `[${items.join(', ')}${node.children.length > 3 ? ', ...' : ''}]`
    }
    if (node.type === 'object' && node.children) {
      const keys = node.children.slice(0, 3).map(c => c.key)
      return `{ ${keys.join(', ')}${node.children.length > 3 ? ', ...' : ''} }`
    }
    return ''
  }

  render() {
    const tree = this.buildTree(this.signals)
    const isEmpty = tree.length === 0

    return html`
      <button class="toggle" @click=${() => this.toggleCollapsed()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div class="header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        <h3>Live Signals</h3>
      </div>
      
      <div class="content">
        ${isEmpty ? html`
          <div class="empty">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>No signals detected</div>
          </div>
        ` : html`
          <div class="tree-root">
            ${this.renderTree(tree)}
          </div>
        `}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'live-signals': LiveSignals
  }
}
