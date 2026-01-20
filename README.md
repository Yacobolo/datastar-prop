# @yacobolo/datastar-prop

[![npm version](https://img.shields.io/npm/v/@yacobolo/datastar-prop.svg)](https://www.npmjs.com/package/@yacobolo/datastar-prop)
[![Release](https://github.com/yacobolo/datastar-prop/actions/workflows/release.yml/badge.svg)](https://github.com/yacobolo/datastar-prop/actions/workflows/release.yml)
[![GitHub Pages](https://github.com/yacobolo/datastar-prop/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/yacobolo/datastar-prop/actions/workflows/gh-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Datastar](https://data-star.dev) plugin that provides property binding to sync element properties with reactive signals.

## Features

- **Property binding** - Bind signals directly to DOM element properties (not attributes)
- **Deep reactivity** - Automatically subscribes to nested signal changes
- **Lit component support** - Calls `requestUpdate()` for proper Lit lifecycle integration
- **Single & multi-property syntax** - Bind one property or multiple at once
- **Kebab-case conversion** - `data-prop:color-config` becomes `colorConfig`
- **Tiny bundle** - ~800 bytes minified

## Why This Plugin?

[Datastar](https://data-star.dev) includes a built-in [`data-attr`](https://data-star.dev/reference/attributes#data-attr) plugin for setting HTML attributes, but HTML attributes and DOM properties are not the same thing.

While `data-attr` works great for HTML attributes (like `class`, `id`, `href`), many DOM interactions require setting **properties** directly:

- Input `value` property (vs. the `value` attribute which only sets initial value)
- Checkbox `checked` property  
- Element `disabled` property for real-time form control
- **Complex objects/arrays to web components** (where JSON.stringify won't work)

This plugin fills that gap with added benefits:
- **Deep reactivity** ensures nested signal changes trigger updates
- **Lit support** handles Datastar's reactive proxies correctly

## Installation

```bash
npm install @yacobolo/datastar-prop
```

## Demo

**[View Interactive Demo →](https://yacobolo.github.io/datastar-prop/)**

## Usage

This plugin requires an import map to resolve the `datastar` module:

```html
<script type="importmap">
{
  "imports": {
    "datastar": "https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.6/bundles/datastar.js"
  }
}
</script>
<script type="module">
  // Import the plugin - it will auto-register with Datastar
  import 'https://cdn.jsdelivr.net/npm/@yacobolo/datastar-prop@1/dist/index.js';
</script>
```

Note: Using `@1` will automatically use the latest v1.x.x version.

## API

### Single Property Binding

Bind a single property using the `:property-name` suffix:

```html
<input data-prop:value="$mySignal" />
<input data-prop:checked="$isChecked" />
<button data-prop:disabled="$isDisabled">Submit</button>
```

Property names are converted from kebab-case to camelCase:
- `data-prop:color-config` → `colorConfig`
- `data-prop:my-property` → `myProperty`

### Multiple Property Binding

Bind multiple properties at once using an object:

```html
<input data-prop="{ value: $inputValue, disabled: $isDisabled }" />
```

### Complex Objects (Web Components)

Pass complex objects to web components - the main use case for this plugin:

```html
<div data-signals="{ 
  colorConfig: { r: 255, g: 100, b: 50, name: 'Orange' },
  items: ['Apple', 'Banana', 'Cherry']
}">
  
  <!-- Pass nested object to Lit component -->
  <color-picker data-prop:color-config="$colorConfig"></color-picker>
  
  <!-- Pass array to list component -->
  <item-list data-prop:items="$items"></item-list>
  
</div>
```

The plugin's **deep reactivity** ensures that changes to nested properties (like `$colorConfig.r = 128`) will trigger updates.

## Deep Reactivity

Unlike simple property binding, this plugin recursively reads all nested properties of your signals. This causes Datastar's effect system to subscribe to changes at any depth:

```html
<div data-signals="{ config: { nested: { deep: 'value' } } }">
  <!-- Changes to $config.nested.deep will trigger updates -->
  <my-component data-prop:config="$config"></my-component>
</div>
```

## Lit Component Support

When working with Lit components, Datastar's reactive proxies maintain the same object reference when internal values change. This would normally prevent Lit from detecting changes.

This plugin automatically calls `requestUpdate(propName)` on Lit elements, ensuring proper lifecycle updates:

```typescript
// Your Lit component
@customElement('my-component')
class MyComponent extends LitElement {
  @property({ type: Object })
  config = {};
  
  updated(changedProperties) {
    // This fires correctly when $config changes internally
    if (changedProperties.has('config')) {
      console.log('Config updated:', this.config);
    }
  }
}
```

## Manual Registration

If you need to register the plugin manually (e.g., for custom bundling):

```typescript
import propPlugin from '@yacobolo/datastar-prop';
import { attribute, effect } from 'datastar';

// Register manually
attribute(propPlugin(effect));
```

## Testing

```bash
pnpm test
```

## Development

```bash
# Install dependencies
pnpm install

# Build (production, minified)
pnpm build

# Build (development)
pnpm build:dev

# Run tests
pnpm test

# Serve demo locally
pnpm test:browser  # then open http://localhost:8080
```

## Development & Releases

This project uses automated releases via GitHub Actions. When you push to `main`:

1. **Tests run automatically** - Build and tests must pass
2. **Version bumping** - Add to your commit message:
   - `[major]` for breaking changes (1.0.0 → 2.0.0)
   - `[minor]` for new features (1.0.0 → 1.1.0)
   - Default: patch for bug fixes (1.0.0 → 1.0.1)
   - `[skip release]` to skip publishing
3. **Automatic publishing** - Package is published to npm
4. **GitHub Release created** - With auto-generated release notes

## License

MIT
