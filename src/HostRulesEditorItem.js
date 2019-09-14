/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-textarea.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@polymer/iron-collapse/iron-collapse.js';
import { close, insertComment } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import styles from './ItemStyles.js';
/**
 * Editor rule item editor.
 *
 * Renders inputs to control host rules.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class HostRulesEditorItem extends LitElement {
  static get styles() {
    return styles;
  }

  render() {
    return html`
    <div class="editor">
      <div class="input-fields">
        ${this._inputsTemplate()}
      </div>
      ${this._actionsTemplate()}
    </div>
    ${this._commentTemplate()}`;
  }

  _inputsTemplate() {
    const {
      enabled,
      to,
      from,
      compatibility,
      outlined
    } = this;
    return html`<div class="from-field">
      <anypoint-checkbox
        data-action="enable"
        .checked="${enabled}"
        @checked-changed="${this._enabledHandler}"
        aria-label="Press to enable or disable this rule"></anypoint-checkbox>
      <anypoint-input
        class="host-from"
        required
        autovalidate
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        name="from"
        .value="${from}"
        @value-changed="${this._inputHandler}"
      >
        <label slot="label">From (required)</label>
      </anypoint-input>
    </div>
    <anypoint-input
      class="to-field"
      required
      autovalidate
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      name="to"
      .value="${to}"
      @value-changed="${this._inputHandler}"
    >
      <label slot="label">To (required)</label>
    </anypoint-input>`;
  }

  _actionsTemplate() {
    const {
      compatibility
    } = this;
    return html`
    <anypoint-icon-button
      class="action-icon"
      data-action="delete"
      title="Remove rule"
      aria-label="Activate to remove the rule"
      ?compatibility="${compatibility}"
      @click="${this._requestRemove}"
    >
      <span class="icon">${close}</span>
    </anypoint-icon-button>
    <anypoint-icon-button
      class="action-icon"
      data-action="comment"
      title="Add comment to the rule"
      aria-label="Activate to add comment to the rule"
      ?compatibility="${compatibility}"
      @click="${this.toggleComment}"
    >
      <span class="icon">${insertComment}</span>
    </anypoint-icon-button>
    `;
  }

  _commentTemplate() {
    const {
      commentOpened,
      compatibility,
      outlined,
      comment
    } = this;
    return html`<iron-collapse
      .opened="${commentOpened}">
      <anypoint-textarea
        name="comment"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        .value="${comment}"
        @value-changed="${this._inputHandler}">
        <label slot="label">Rule comment (optional)</label>
      </anypoint-textarea>
    </iron-collapse>`;
  }

  static get properties() {
    return {
      /**
       * From host declaration. It can contain a `*` wildchar.
       *
       * Example:
       * ```
       * http://api.domain.com/*\/endpoint/
       * ```
       */
      from: { type: String },
      /**
       * To host declaration. It must be valid URI to where the request will be
       * redirected.
       */
      to: { type: String },
      /**
       * Determines if the option is enabled.
       *
       * Note, this property will inherit boolean `false` value from `paper-checkbox`
       * if not set.
       */
      enabled: { type: Boolean },
      /**
       * Comment for the entry
       */
      comment: { type: String },
      /**
       * If set comment section is opened and textarea visible.
       */
      commentOpened: { type: Boolean },
      /**
       * If set it renders "narrow" view fow small screens
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material desing outlined theme
       */
      outlined: { type: Boolean }
    };
  }

  /**
   * Toggles the comment section.
   */
  toggleComment() {
    this.commentOpened = !this.commentOpened;
  }

  _requestRemove() {
    this.dispatchEvent(new CustomEvent('remove-rule', {
      composed: true
    }));
  }

  _inputHandler(e) {
    const { name, value } = e.target;
    this[name] = value;
    this._notify(name, value);
  }

  _enabledHandler(e) {
    const { value } = e.detail;
    this.enabled = value;
    this._notify('enabled', value);
  }

  _notify(name, value) {
    this.dispatchEvent(new CustomEvent('property-changed', {
      detail: {
        name,
        value
      }
    }));
  }

  /**
   * Dispatched when the user request to remove the rule.
   * Note that this event does not bubbles.
   *
   * @event remove-rule
   */
}
