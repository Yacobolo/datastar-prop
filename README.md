# Lit + Datastar Integration Examples

[![GitHub Pages](https://github.com/yacobolo/datastar-lit-examples/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/yacobolo/datastar-lit-examples/actions/workflows/gh-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Examples demonstrating how to integrate [Lit](https://lit.dev) web components with [Datastar](https://data-star.dev) using the built-in `data-attr` plugin.

**[View Live Demo](https://yacobolo.github.io/datastar-lit-examples/)**

## Key Discovery

**You don't need a custom plugin to pass complex objects to Lit components!**

Datastar's built-in `data-attr` works perfectly:

```html
<flow-diagram
    data-attr:nodes="$flow.nodes"
    data-attr:edges="$flow.edges"
    data-attr:config="$flow.config"
></flow-diagram>
```

## How It Works

### 1. Datastar's `data-attr` Auto-Stringifies

When you pass an object or array to `data-attr`, it internally calls `JSON.stringify()`:

```typescript
// From Datastar's attr.ts plugin
} else {
  el.setAttribute(key, JSON.stringify(val))
}
```

### 2. JSON.stringify Provides Deep Reactivity

Because `JSON.stringify()` runs **inside** Datastar's reactive effect, it reads all nested properties. This means Datastar tracks dependencies on every nested value:

```javascript
// When this runs inside the effect:
JSON.stringify($flow.nodes)

// It accesses: $flow.nodes[0].id, $flow.nodes[0].label, 
// $flow.nodes[0].x, $flow.nodes[0].y, $flow.nodes[0].color, etc.
// All become tracked dependencies!
```

### 3. Lit's Type Converters Parse JSON Back

Lit's `@property()` decorator with `type: Array` or `type: Object` automatically parses JSON strings from attributes:

```typescript
@property({ type: Array }) nodes: FlowNode[] = []
@property({ type: Object }) config: FlowConfig = { ... }
```

## Examples

This repo includes three working examples:

### Flow Diagram
- Demonstrates arrays of objects (`nodes`, `edges`)
- Nested object mutations (`$flow.nodes[0].color = 'red'`)
- Array mutations (`$flow.nodes.push(...)`)

### 3D Scene Viewer
- Three.js integration
- Config object with multiple properties
- Real-time property updates

### Data Chart
- ECharts integration
- Array data binding
- Config object binding

## Usage Pattern

### 1. Define Your Lit Component

```typescript
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

interface MyConfig {
  color: string
  size: number
}

@customElement('my-component')
export class MyComponent extends LitElement {
  // Use type: Object or type: Array for automatic JSON parsing
  @property({ type: Object }) config: MyConfig = { color: 'blue', size: 10 }
  @property({ type: Array }) items: string[] = []

  render() {
    return html`
      <div style="color: ${this.config.color}">
        ${this.items.map(item => html`<p>${item}</p>`)}
      </div>
    `
  }
}
```

### 2. Use with Datastar

```html
<div data-signals='{
  "config": { "color": "red", "size": 20 },
  "items": ["Apple", "Banana", "Cherry"]
}'>
  <my-component
    data-attr:config="$config"
    data-attr:items="$items"
  ></my-component>

  <!-- Nested changes work! -->
  <button data-on:click="$config.color = 'green'">Change Color</button>
  
  <!-- Array mutations work! -->
  <button data-on:click="$items.push('Date')">Add Item</button>
</div>
```

## Limitations

This approach works great for **JSON-serializable data**. If you need to pass:

- Functions
- Date objects
- Map/Set
- Circular references
- Class instances with methods

You'll need a different approach (custom plugin or direct property setting via `data-on`).

## Development

```bash
# Install dependencies
pnpm install

# Build and run dev server
pnpm dev

# Build only
pnpm build
```

## License

MIT
