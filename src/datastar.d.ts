/**
 * Type declarations for Datastar
 * Datastar doesn't ship with TypeScript types, so we declare the minimum
 * needed for this plugin.
 */

declare module "datastar" {
  export interface Modifiers extends Map<string, Set<string>> {}

  export interface AttributeContext {
    el: Element;
    rawKey: string;
    mods: Modifiers;
    error: (reason: string, metadata?: Record<string, unknown>) => Error;
    key: string | undefined;
    value: string;
    loadedPluginNames: {
      actions: Set<string>;
      attributes: Set<string>;
    };
    rx: (() => unknown) | undefined;
  }

  export type Requirement = "allowed" | "must" | "denied" | "exclusive";

  export interface RequirementConfig {
    key?: Requirement;
    value?: Requirement;
  }

  export interface AttributePlugin<R = RequirementConfig, B = boolean> {
    name: string;
    requirement?: R | Requirement;
    returnsValue?: B;
    argNames?: string[];
    apply: (ctx: AttributeContext) => (() => void) | void;
  }

  export type Effect = () => void;

  /**
   * Register an attribute plugin with Datastar
   */
  export function attribute<R extends Requirement | RequirementConfig, B extends boolean>(
    plugin: AttributePlugin<R, B>
  ): void;

  /**
   * Create a reactive effect that re-runs when dependencies change
   */
  export function effect(fn: () => void | (() => void)): () => void;
}

declare module "datastar/library/src/engine/types" {
  export interface Modifiers extends Map<string, Set<string>> {}

  export interface AttributeContext {
    el: Element;
    rawKey: string;
    mods: Modifiers;
    error: (reason: string, metadata?: Record<string, unknown>) => Error;
    key: string | undefined;
    value: string;
    loadedPluginNames: {
      actions: Set<string>;
      attributes: Set<string>;
    };
    rx: (() => unknown) | undefined;
  }

  export type Requirement = "allowed" | "must" | "denied" | "exclusive";

  export interface RequirementConfig {
    key?: Requirement;
    value?: Requirement;
  }

  export interface AttributePlugin<R = RequirementConfig, B = boolean> {
    name: string;
    requirement?: R | Requirement;
    returnsValue?: B;
    argNames?: string[];
    apply: (ctx: AttributeContext) => (() => void) | void;
  }

  export type Effect = () => void;
}
