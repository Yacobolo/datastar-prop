/**
 * Shared Styles for Lit Components
 * 
 * These styles can be imported into Lit components to share common
 * design tokens and patterns across Shadow DOM boundaries.
 * 
 * Usage in Lit component:
 * ```ts
 * import { sharedStyles, buttonStyles } from './shared-styles.ts'
 * 
 * @customElement('my-component')
 * class MyComponent extends LitElement {
 *   static styles = [sharedStyles, buttonStyles, css`...`]
 * }
 * ```
 */

import { css } from 'lit'

/**
 * Base shared styles - design tokens that mirror the global CSS
 * Use CSS custom properties so components can inherit from document
 */
export const sharedStyles = css`
  :host {
    /* Surface colors - inherit from document or use fallbacks */
    --_surface-bg: var(--surface-bg, oklch(12% 0.015 280));
    --_surface-1: var(--surface-1, oklch(18% 0.015 280));
    --_surface-2: var(--surface-2, oklch(25% 0.015 280));
    --_surface-3: var(--surface-3, oklch(32% 0.015 280));
    
    /* Text colors */
    --_text-1: var(--text-1, oklch(95% 0 0));
    --_text-2: var(--text-2, oklch(70% 0.01 280));
    --_text-3: var(--text-3, oklch(55% 0.01 280));
    
    /* Brand colors */
    --_brand: var(--brand, oklch(65% 0.2 265));
    --_brand-light: var(--brand-light, oklch(72% 0.18 265));
    --_brand-subtle: var(--brand-subtle, oklch(25% 0.08 265));
    
    /* Semantic colors */
    --_success: var(--success, oklch(65% 0.2 145));
    --_warning: var(--warning, oklch(75% 0.15 85));
    --_error: var(--error, oklch(60% 0.2 25));
    --_info: var(--info, oklch(65% 0.15 230));
    
    /* Spacing */
    --_space-xs: var(--space-xs, 12px);
    --_space-sm: var(--space-sm, 16px);
    --_space-md: var(--space-md, 20px);
    --_space-lg: var(--space-lg, 24px);
    
    /* Typography */
    --_font-body: var(--font-body, system-ui, sans-serif);
    --_font-code: var(--font-code, 'SF Mono', Monaco, Menlo, monospace);
    --_text-sm: var(--text-sm, 0.875rem);
    --_text-base: var(--text-base, 1rem);
    
    /* Borders & Radius */
    --_border-subtle: var(--border-subtle, 1px solid oklch(30% 0.02 280));
    --_radius-sm: var(--radius-sm, 4px);
    --_radius-md: var(--radius-md, 8px);
    
    /* Transitions */
    --_duration-fast: var(--duration-fast, 0.1s);
    --_duration-normal: var(--duration-normal, 0.2s);
    --_ease-out: var(--ease-out, cubic-bezier(0.25, 0.46, 0.45, 0.94));
    
    /* Apply base styles */
    font-family: var(--_font-body);
    color: var(--_text-1);
    box-sizing: border-box;
  }
  
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
`

/**
 * Button styles for use in Lit components
 */
export const buttonStyles = css`
  button,
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding-inline: var(--_space-xs);
    padding-block: 0.5rem;
    background: var(--_brand);
    color: white;
    border: none;
    border-radius: var(--_radius-md);
    font-size: var(--_text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: 
      background var(--_duration-fast) var(--_ease-out),
      transform var(--_duration-fast) var(--_ease-out);
  }
  
  button:hover,
  .btn:hover {
    background: var(--_brand-light);
    transform: translateY(-1px);
  }
  
  button:active,
  .btn:active {
    transform: translateY(0);
  }
  
  button:disabled,
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .btn-secondary {
    background: var(--_surface-2);
  }
  
  .btn-secondary:hover {
    background: var(--_surface-3);
  }
  
  .btn-ghost {
    background: transparent;
    border: var(--_border-subtle);
  }
  
  .btn-ghost:hover {
    background: var(--_surface-2);
    border-color: transparent;
  }
`

/**
 * Form input styles for use in Lit components
 */
export const inputStyles = css`
  input,
  select,
  textarea {
    background: var(--_surface-2);
    color: var(--_text-1);
    border: var(--_border-subtle);
    border-radius: var(--_radius-md);
    padding-inline: var(--_space-xs);
    padding-block: 0.5rem;
    font-size: var(--_text-sm);
    font-family: inherit;
    transition: 
      border-color var(--_duration-fast) var(--_ease-out),
      box-shadow var(--_duration-fast) var(--_ease-out);
  }
  
  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--_brand);
    box-shadow: 0 0 0 3px var(--_brand-subtle);
  }
  
  input::placeholder,
  textarea::placeholder {
    color: var(--_text-3);
  }
`

/**
 * Card/panel styles for use in Lit components
 */
export const cardStyles = css`
  .card {
    background: var(--_surface-1);
    border: var(--_border-subtle);
    border-radius: var(--_radius-md);
    overflow: hidden;
  }
  
  .card-header {
    padding: var(--_space-sm);
    border-block-end: var(--_border-subtle);
    background: linear-gradient(180deg, var(--_surface-2) 0%, var(--_surface-1) 100%);
  }
  
  .card-body {
    padding: var(--_space-sm);
  }
  
  .card-footer {
    padding: var(--_space-sm);
    border-block-start: var(--_border-subtle);
  }
`

/**
 * Scrollbar styles for dark theme
 */
export const scrollbarStyles = css`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--_surface-1);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--_surface-3);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: oklch(40% 0.02 280);
  }
`

/**
 * All styles combined for convenience
 */
export const allSharedStyles = [
  sharedStyles,
  buttonStyles,
  inputStyles,
  cardStyles,
  scrollbarStyles,
]
