import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { HostRule } from '@advanced-rest-client/arc-types';

export const evaluate: unique symbol;
export const evaluateAgainst: unique symbol;
export const createRuleRe: unique symbol;
export const keyDownHandler: unique symbol;
export const inputHandler: unique symbol;
export const resultValue: unique symbol;
export const resultTemplate: unique symbol;

/**
 * An element that tests user input against provided host rules.
 *
 * The host rules is a model received from `host-rules-editor`. However,
 * it can be any object that contains `from` and `to` properties.
 *
 * It evaluates user entered URL against provided rules and displays the
 * result of the computation.
 * @deprecated Use `@advanced-rest-client/app` instead.
 */
export declare class HostRulesTesterElement extends LitElement {
  static get styles(): CSSResult;

  /**
   * Provided by the user URL
   * @attribute
   */
  url: string;

  /**
   * List of rules to use to evaluate the URL
   */
  rules?: HostRule.ARCHostRule[];

  /**
   * Enables compatibility with Anypoint platform
   * @attribute
   */
  compatibility: boolean;

  /**
   * Enables material design outlined theme
   * @attribute
   */
  outlined: boolean;
  constructor();

  testUrl(): void;
  
  [evaluate](): string;

  [evaluateAgainst](url: string, rule: HostRule.ARCHostRule): string|undefined;

  [createRuleRe](input: string): RegExp;

  [keyDownHandler](e: KeyboardEvent): void;

  [inputHandler](e: Event): void;

  /**
   * @return The template for the main UI
   */
  render(): TemplateResult;

  /**
   * @return The template for the test result, if any.
   */
  [resultTemplate](): TemplateResult|string;
}
