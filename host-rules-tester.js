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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@polymer/paper-button/paper-button.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * An element that tests user input agains provided host rules.
 *
 * The host rules is a model received from `host-rules-editor`. However,
 * it can be any object that contains `from` and `to` properties.
 *
 * It evaluates user entered URL against provided rules and displays the
 * result of the computation.
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
class HostRulesTester extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --host-rules-tester;
    }

    .inputs {
      @apply --layout-horizontal;
    }

    .url-input {
      @apply --layout-flex;
    }

    output {
      display: block;
      padding: 8px 4px;
      font-weight: 500;
      @apply --arc-font-code1;
    }
    </style>
    <div class="inputs">
      <paper-input class="url-input" label="Enter URL to test" value="{{url}}" on-keydown="_keyDown"></paper-input>
      <paper-button on-click="testUrl" title="Tap to evaluate">Test</paper-button>
    </div>
    <output>[[result]]</output>
`;
  }

  static get is() {return 'host-rules-tester';}
  static get properties() {
    return {
      /**
       * Provided by the user URL
       */
      url: String,
      /**
       * Evaludated result of parsing the URL against rules
       */
      result: {
        type: String,
        readOnly: true
      },
      /**
       * List of rules to use to evaluate the URL
       */
      rules: Array
    };
  }

  testUrl() {
    if (!this.rules || !this.rules.length) {
      this._setResult('Define rules first.');
      return;
    }
    if (!this.url) {
      this._setResult('Define the URL first.');
      return;
    }
    const result = this._evaluate();
    this._setResult(result);
  }

  _evaluate() {
    let url = this.url;
    const rules = this.rules;
    for (let i = 0, len = rules.length; i < len; i++) {
      let rule = rules[i];
      let result = this._evaluateAgainst(url, rule);
      if (result) {
        url = result;
      }
    }
    return url;
  }

  _evaluateAgainst(url, rule) {
    if (!rule.from) {
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
}
window.customElements.define(HostRulesTester.is, HostRulesTester);
