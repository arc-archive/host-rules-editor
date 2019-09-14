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
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import styles from './TesterStyles.js';
/**
 * An element that tests user input agains provided host rules.
 *
 * The host rules is a model received from `host-rules-editor`. However,
 * it can be any object that contains `from` and `to` properties.
 *
 * It evaluates user entered URL against provided rules and displays the
 * result of the computation.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class HostRulesTester extends LitElement {
  static get styles() {
    return styles;
  }

  render() {
    const {
      url,
      compatibility,
      outlined
    } = this;
    return html`
    <div class="inputs">
      <anypoint-input
        type="url"
        class="url-input"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        .value="${url}"
        @value-changed="${this._inputHandler}"
        @keydown="${this._keyDown}"
      >
        <label slot="label">Enter URL to test</label>
      </anypoint-input>
      <anypoint-button
        @click="${this.testUrl}"
        title="Evaluate the URL"
        ?compatibility="${compatibility}"
        @aria-label="Activate to evaluate the URL"
      >Test</anypoint-button>
    </div>
    ${this._resultTemplate()}`;
  }

  _resultTemplate() {
    const { _result } = this;
    return _result ? html`<output>${_result}</output>` : '';
  }

  static get properties() {
    return {
      /**
       * Provided by the user URL
       */
      url: { type: String },
      /**
       * Evaludated result of parsing the URL against rules
       */
      _result: { type: String },
      /**
       * List of rules to use to evaluate the URL
       */
      rules: { type: Array },
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

  testUrl() {
    if (!this.rules || !this.rules.length) {
      this._result = 'Define rules first.';
      return;
    }
    if (!this.url) {
      this._result = 'Define the URL first.';
      return;
    }
    const result = this._evaluate();
    this._result = result;
  }

  _evaluate() {
    let url = this.url;
    const rules = this.rules;
    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i];
      const result = this._evaluateAgainst(url, rule);
      if (result) {
        url = result;
      }
    }
    return url;
  }

  _evaluateAgainst(url, rule) {
    if (!rule.from || rule.enabled === false) {
      return;
    }
    const re = this._createRuleRe(rule.from);
    if (!re.test(url)) {
      return;
    }
    return url.replace(re, rule.to);
  }

  _createRuleRe(input) {
    input = input.replace(/\*/g, '(.*)');
    return new RegExp(input, 'gi');
  }

  _keyDown(e) {
    if (e.key === 'Enter') {
      this.testUrl();
    }
  }

  _inputHandler(e) {
    this.url = e.detail.value;
  }
}
