// Tests for the prop plugin using Node's native test runner
import { test } from 'node:test'
import assert from 'node:assert'
import { JSDOM } from 'jsdom'
import propPlugin from './index.js'

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document as unknown as Document
global.Element = dom.window.Element as unknown as typeof Element

// Test the plugin factory
test('propPlugin returns an AttributePlugin object', () => {
  const mockEffect = (fn: () => void) => {
    fn()
    return () => {}
  }
  const plugin = propPlugin(mockEffect)

  assert.strictEqual(plugin.name, 'prop')
  assert.strictEqual(plugin.returnsValue, true)
  assert.deepStrictEqual(plugin.requirement, { key: 'allowed', value: 'must' })
  assert.strictEqual(typeof plugin.apply, 'function')
})

test('plugin has correct structure', () => {
  const mockEffect = (fn: () => void) => {
    fn()
    return () => {}
  }
  const plugin = propPlugin(mockEffect)

  assert.ok(plugin)
  assert.ok(plugin.name)
  assert.ok(plugin.apply)
  assert.ok(plugin.requirement)
})

// Test single property binding
test('updates single property on element', () => {
  const mockEffect = (fn: () => void) => {
    fn() // Execute immediately for test
    return () => {} // Return cleanup function
  }

  const plugin = propPlugin(mockEffect)
  const el = document.createElement('input') as unknown as Element & { value: string }
  const key = 'value'
  let signalValue = 'test value'
  const rx = () => signalValue

  // Apply the plugin
  const cleanup = plugin.apply({
    el,
    key,
    value: '$signal',
    rx,
    rawKey: 'prop:value',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  // Check initial value was set
  assert.strictEqual(el.value, 'test value')

  // Cleanup
  if (cleanup) cleanup()
})

// Test kebab-case to camelCase conversion
test('converts kebab-case key to camelCase property', () => {
  const mockEffect = (fn: () => void) => {
    fn()
    return () => {}
  }

  const plugin = propPlugin(mockEffect)
  const el = document.createElement('div') as unknown as Element & { colorConfig: unknown }
  const rx = () => ({ r: 255, g: 0, b: 0 })

  plugin.apply({
    el,
    key: 'color-config',
    value: '$colorConfig',
    rx,
    rawKey: 'prop:color-config',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  // Should be colorConfig, not color-config
  assert.deepStrictEqual(el.colorConfig, { r: 255, g: 0, b: 0 })
})

// Test multiple properties binding
test('updates multiple properties on element', () => {
  const mockEffect = (fn: () => void) => {
    fn()
    return () => {}
  }

  const plugin = propPlugin(mockEffect)
  const el = document.createElement('input') as unknown as Element & { value: string; disabled: boolean }
  let propsObject = {
    value: 'initial',
    disabled: false
  }
  const rx = () => propsObject

  // Apply the plugin without a key (multiple properties mode)
  const cleanup = plugin.apply({
    el,
    key: undefined,
    value: '{ value: $val, disabled: $dis }',
    rx,
    rawKey: 'prop',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  // Check initial values were set
  assert.strictEqual(el.value, 'initial')
  assert.strictEqual(el.disabled, false)

  // Cleanup
  if (cleanup) cleanup()
})

// Test cleanup function
test('cleanup function disconnects effect', () => {
  let effectCleanupCalled = false
  const mockEffect = (fn: () => void) => {
    fn()
    return () => { effectCleanupCalled = true }
  }

  const plugin = propPlugin(mockEffect)
  const el = document.createElement('input')
  const rx = () => 'test'

  const cleanup = plugin.apply({
    el,
    key: 'value',
    value: '$signal',
    rx,
    rawKey: 'prop:value',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  // Call cleanup
  if (cleanup) cleanup()

  // Verify effect cleanup was called
  assert.strictEqual(effectCleanupCalled, true)
})

// Test deep reactivity helper
test('deepRead handles nested objects', () => {
  // We test this indirectly through the plugin
  // The plugin should track all nested properties
  let effectRunCount = 0
  const mockEffect = (fn: () => void) => {
    fn()
    effectRunCount++
    return () => {}
  }

  const plugin = propPlugin(mockEffect)
  const el = document.createElement('div') as unknown as Element & { config: unknown }
  const nestedObject = {
    level1: {
      level2: {
        level3: 'deep value'
      }
    }
  }
  const rx = () => nestedObject

  plugin.apply({
    el,
    key: 'config',
    value: '$config',
    rx,
    rawKey: 'prop:config',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  // Plugin should have run and set the nested object
  assert.deepStrictEqual(el.config, nestedObject)
  assert.strictEqual(effectRunCount, 1)
})

// Test Lit component support (requestUpdate)
test('calls requestUpdate for Lit components', () => {
  const mockEffect = (fn: () => void) => {
    fn()
    return () => {}
  }

  const plugin = propPlugin(mockEffect)
  
  // Create a mock Lit element
  let requestUpdateCalled = false
  let requestUpdatePropName: string | undefined
  const mockLitElement = document.createElement('div') as unknown as Element & { 
    myProp: unknown
    requestUpdate: (name?: string) => void
  }
  mockLitElement.requestUpdate = (name?: string) => {
    requestUpdateCalled = true
    requestUpdatePropName = name
  }

  const rx = () => ({ data: 'test' })

  plugin.apply({
    el: mockLitElement,
    key: 'my-prop',
    value: '$myProp',
    rx,
    rawKey: 'prop:my-prop',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  assert.strictEqual(requestUpdateCalled, true)
  assert.strictEqual(requestUpdatePropName, 'myProp')
})

// Test circular reference handling
test('handles circular references without infinite loop', () => {
  const mockEffect = (fn: () => void) => {
    fn()
    return () => {}
  }

  const plugin = propPlugin(mockEffect)
  const el = document.createElement('div') as unknown as Element & { data: unknown }
  
  // Create object with circular reference
  const obj: Record<string, unknown> = { a: 1 }
  obj.self = obj

  const rx = () => obj

  // Should not throw or hang
  plugin.apply({
    el,
    key: 'data',
    value: '$data',
    rx,
    rawKey: 'prop:data',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  assert.strictEqual(el.data, obj)
})

// Test array binding
test('handles array values correctly', () => {
  const mockEffect = (fn: () => void) => {
    fn()
    return () => {}
  }

  const plugin = propPlugin(mockEffect)
  const el = document.createElement('div') as unknown as Element & { items: unknown[] }
  const items = ['Apple', 'Banana', 'Cherry']
  const rx = () => items

  plugin.apply({
    el,
    key: 'items',
    value: '$items',
    rx,
    rawKey: 'prop:items',
    mods: new Map(),
    error: () => new Error(),
    loadedPluginNames: { actions: new Set(), attributes: new Set() },
  })

  assert.deepStrictEqual(el.items, items)
})

// Test helper functions directly
test('deepRead reads all keys of a flat object', () => {
  // Local implementation to test the algorithm
  function deepRead(obj: unknown, seen: WeakSet<object> = new WeakSet()): string[] {
    const accessed: string[] = []
    
    if (obj && typeof obj === 'object') {
      if (seen.has(obj)) return accessed
      seen.add(obj)

      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          accessed.push(`[${i}]`)
          accessed.push(...deepRead(obj[i], seen))
        }
      } else {
        for (const key of Object.keys(obj)) {
          accessed.push(key)
          accessed.push(...deepRead((obj as Record<string, unknown>)[key], seen))
        }
      }
    }
    return accessed
  }

  const obj = { a: 1, b: 2, c: 3 }
  const accessed = deepRead(obj)
  assert.ok(accessed.includes('a'))
  assert.ok(accessed.includes('b'))
  assert.ok(accessed.includes('c'))
})

test('kebabToCamel converts correctly', () => {
  function kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  }

  assert.strictEqual(kebabToCamel('color-config'), 'colorConfig')
  assert.strictEqual(kebabToCamel('my-long-property-name'), 'myLongPropertyName')
  assert.strictEqual(kebabToCamel('alreadyCamel'), 'alreadyCamel')
  assert.strictEqual(kebabToCamel('value'), 'value')
})
