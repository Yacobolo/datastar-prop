/**
 * @yacobolo/datastar-prop - Property binding plugin for Datastar
 *
 * Binds Datastar signal values to element properties (not attributes).
 * This is useful for:
 * - Passing complex objects/arrays to web components
 * - Setting input values programmatically
 * - Managing checkbox/radio checked states
 * - Any scenario where attributes don't work (JSON.stringify limitations)
 *
 * Usage:
 *   Single property:
 *     data-prop:color-config="$colorConfig"
 *     data-prop:items="$items"
 *
 *   Multiple properties:
 *     data-prop="{ value: $inputValue, disabled: $isDisabled }"
 *
 * The key is converted from kebab-case to camelCase:
 *   color-config -> colorConfig
 *
 * Features:
 * - Deep reactivity: Uses deepRead() to subscribe to nested signal changes
 * - Lit component support: Calls requestUpdate() for reactive proxy compatibility
 */

import type { AttributePlugin } from 'datastar/library/src/engine/types'

// Type for effect function
type EffectFn = (fn: () => void) => () => void

/**
 * Recursively reads all nested properties of an object.
 * This causes Datastar's effect system to subscribe to all nested signals,
 * ensuring the effect re-runs when any nested value changes.
 *
 * Uses a WeakSet to track visited objects and prevent infinite loops
 * from circular references.
 */
function deepRead(obj: unknown, seen: WeakSet<object> = new WeakSet()): void {
  if (obj && typeof obj === "object") {
    if (seen.has(obj)) return;
    seen.add(obj);

    if (Array.isArray(obj)) {
      for (const item of obj) {
        deepRead(item, seen);
      }
    } else {
      for (const key of Object.keys(obj)) {
        deepRead((obj as Record<string, unknown>)[key], seen);
      }
    }
  }
}

/**
 * Converts kebab-case to camelCase
 * Examples: color-config -> colorConfig, my-prop -> myProp
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Sets a property on an element and triggers Lit update if applicable
 */
function setProperty(
  el: Element,
  propName: string,
  value: unknown
): void {
  const element = el as unknown as Record<string, unknown>;
  element[propName] = value;

  // Force Lit update since Datastar proxies maintain same reference
  // This ensures Lit's updated() lifecycle fires even when the proxy
  // reference hasn't changed but internal values have
  if (typeof (element as { requestUpdate?: (name?: string) => void }).requestUpdate === "function") {
    (element as { requestUpdate: (name?: string) => void }).requestUpdate(propName);
  }
}

/**
 * Creates the prop plugin with the given effect function.
 * This allows for manual registration with Datastar if needed.
 *
 * @param effect - The effect function from Datastar
 * @returns The AttributePlugin configuration
 */
export default function propPlugin(effect: EffectFn): AttributePlugin<{ key: 'allowed'; value: 'must' }, true> {
  return {
    name: "prop",
    requirement: {
      key: "allowed",
      value: "must",
    },
    returnsValue: true,
    apply({ el, key, rx }) {
      const update = () => {
        const value = rx!();

        // Subscribe to ALL nested signals by reading them
        // This is what makes this plugin unique - deep reactivity
        deepRead(value);

        if (key) {
          // Single property mode: data-prop:property-name="$signal"
          const propName = kebabToCamel(key);
          setProperty(el, propName, value);
        } else {
          // Multi-property mode: data-prop="{ prop1: $signal1, prop2: $signal2 }"
          if (value && typeof value === "object" && !Array.isArray(value)) {
            for (const [propName, propValue] of Object.entries(value)) {
              setProperty(el, propName, propValue);
            }
          }
        }
      };

      return effect(update);
    },
  };
}

// Auto-register with datastar if available from importmap
if (typeof window !== 'undefined') {
  (async () => {
    try {
      // @ts-ignore - datastar may be available via importmap at runtime
      const datastar = await import('datastar')
      if (datastar?.attribute && datastar?.effect) {
        datastar.attribute(propPlugin(datastar.effect))
      }
    } catch (e) {
      // Datastar not available via importmap, plugin needs manual registration
    }
  })()
}
