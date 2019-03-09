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
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-button/paper-button.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@advanced-rest-client/tutorial-toast/tutorial-toast.js';
import '@polymer/paper-fab/paper-fab.js';
import '@advanced-rest-client/uuid-generator/uuid-generator.js';
import '@polymer/iron-collapse/iron-collapse.js';
import './host-rules-editor-item.js';
import './host-rules-tester.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
/**
 * An element to render host rules mapping editor.
 *
 * Host rules mapping allow ARC to redirect connection from one URI to another
 * without changinh the `host` header value. This element allows to enter mapping
 * rules and to test them agains arbitrary URL.
 *
 * NOTE: This element does not provide data storing interface. Instead of operating
 * on a data store it sends custom events that should be handled by the hosting
 * application. Example inferface is included in `arc-models/host-rules-model` element.
 *
 * NOTE: This element works with `arc-data-export` element to export data to a file.
 * You can use other way to handle `export-user-data` custom event to export host
 * rules data.
 *
 * ### Example
 *
 * ```
 * <arc-data-export></arc-data-export>
 * <host-rules-model></host-rules-model>
 * <host-rules-editor></host-rules-editor>
 * ```
 *
 * ### Data model
 *
 * The `items` property accepts an array of the following objects:
 *
 * ```javascript
 * {
 *    from: String, // The from rule (may contain asterisks)
 *    to: String, // replacement value
 *    enabled: Boolean, // if false the rule is ignored
 *    comment: String // optional rule description
 * }
 * ```
 *
 * ### Narrow view
 *
 * The element does not recognizes screen size to render mobile like view. To render
 * narrow view (that fit mobile screen or narrow drawer etc) set `narrow` attribute
 * on the element
 *
 * ```html
 * <host-rules-editor narrow></host-rules-editor>
 * ```
 *
 * ### Styling
 *
 * `<host-rules-editor>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--host-rules-editor` | Mixin applied to the element | `{}`
 * `--inline-fom-action-icon-color` | Color of the icons in the form editor | `rgba(0, 0, 0, 0.74)`
 * `--inline-fom-action-icon-color-hover` | Color of the icons in the form editor when hovering | * `--accent-color` or `rgba(0, 0, 0, 0.74)`
 * `--host-rules-editor-loader` | Mixin applied to the paper-progress element when loading rules | `{}`
 * `--host-rules-editor-empty-screen` | Mixin applied to the empty screen message | `{}`
 * `--host-rules-editor-item-input` | Mixin applied to the rules inputs | `{}`
 * `--host-rules-editor-item-comment-input` | Mixin applied to the comment textarea input | `{}`
 * `--host-rules-editor-item-comment-input-narrow` | Mixin applied to the comment textarea input in narrow view | `{}`
 * `--host-rules-editor-tutorial-toast` | Mixin applied to the tutorial toast element | `{}`
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
class HostRulesEditor extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --host-rules-editor;
    }

    .header {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    h2 {
      margin-left: 16px;
      @apply --arc-font-headline;
      @apply --layout-flex;
    }

    h3 {
      margin-left: 16px;
      @apply --arc-font-subhead;
    }

    [hidden] {
      display: none !important;
    }

    paper-progress {
      width: 100%;
      @apply --host-rules-editor-loader;
    }

    #dataClearDialog {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
    }

    #dataClearDialog paper-button {
      color: #fff;
      background-color: transparent;
    }

    .error-toast {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
      @apply --error-toast;
    }

    tutorial-toast {
      position: absolute;
    }

    .add-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
    }

    .empty-screen {
      @apply --layout-vertical;
      @apply --layout-center;
      @apply --host-rules-editor-empty-screen;
    }

    host-rules-editor-item {
      padding: 0 16px;
    }

    host-rules-tester {
      margin: 8px 16px;
      padding: 8px;
      background-color: var(--host-rules-editor-tester-background-color, #E8F5E9);
      @apply --host-rules-editor-tester-background;
    }

    tutorial-toast {
      position: absolute;
      @apply --host-rules-editor-tutorial-toast;
    }

    .menu-item {
      @apply --paper-item;
      color: var(--context-menu-item-color);
      background-color: var(--context-menu-item-background-color);
    }

    .menu-item:hover {
      @apply --paper-item-hover;
      color: var(--context-menu-item-color-hover);
      background-color: var(--context-menu-item-background-color-hover);
    }
    </style>
    <div class="header">
      <h2>Hosts rules mapping</h2>
      <div class="header-actions">
        <paper-button hidden\$="[[dataUnavailable]]" raised="" on-click="toggleRulesTester">Test rules</paper-button>
        <paper-menu-button dynamic-align="" id="mainMenu">
          <paper-icon-button icon="arc:more-vert" slot="dropdown-trigger"></paper-icon-button>
          <paper-listbox slot="dropdown-content" id="mainMenuOptions">
            <paper-icon-item on-click="_onExportAll" data-action="export-all" class="menu-item"><iron-icon icon="arc:archive" slot="item-icon"></iron-icon>Export all to file</paper-icon-item>
            <paper-icon-item on-click="_onExportAllDrive" data-action="export-drive" class="menu-item"><iron-icon icon="arc:drive-color" slot="item-icon"></iron-icon>Export all to Google Drive</paper-icon-item>
            <paper-icon-item on-click="_deleteAll" data-action="export-drive" class="menu-item"><iron-icon icon="arc:clear" slot="item-icon"></iron-icon>Delete all</paper-icon-item>
            <paper-icon-item on-click="_onLearnMore" data-action="learn-more" class="menu-item"><iron-icon icon="arc:info-outline" slot="item-icon"></iron-icon>Learn more about host rules</paper-icon-item>
          </paper-listbox>
        </paper-menu-button>
      </div>
    </div>
    <template is="dom-if" if="[[loading]]">
      <paper-progress indeterminate=""></paper-progress>
    </template>
    <iron-collapse opened="[[rulesTesterOpened]]">
      <host-rules-tester rules="[[items]]"></host-rules-tester>
    </iron-collapse>
    <template is="dom-if" if="[[dataUnavailable]]">
      <div class="empty-screen">
        <h3 class="empty-title">No mappings available</h3>
        <paper-button raised="" on-click="_onLearnMore">Learn more</paper-button>
      </div>
    </template>
    <template is="dom-if" if="[[!dataUnavailable]]">
      <template is="dom-repeat" items="{{items}}">
        <host-rules-editor-item narrow="[[narrow]]" host-from="{{item.from}}" host-to="{{item.to}}" enabled="{{item.enabled}}" comment="{{item.comment}}" on-remove-rule="_deleteRule"></host-rules-editor-item>
      </template>
    </template>

    <template is="dom-if" if="[[_tutorialAllowed]]">
      <tutorial-toast opened="[[dataUnavailable]]">
        Add host rules to redirect traffic without editing your hosts file.
      </tutorial-toast>
    </template>

    <paper-toast id="noModel" class="error-toast" text="Model not found. Please, report an issue."></paper-toast>
    <paper-toast id="noExport" class="error-toast" text="Export module not found. Please, report an issue."></paper-toast>
    <paper-toast id="deleteError" class="error-toast" text="Unable to delete rule. Please, report an issue."></paper-toast>
    <paper-toast id="updateError" class="error-toast" text="Unable to update rule. Please, report an issue."></paper-toast>

    <paper-dialog id="dataClearDialog" on-iron-overlay-closed="_onClearDialogResult">
      <h2>Danger zone</h2>
      <p>This will remove all stored rules. Without option to restore it.</p>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <paper-button on-click="_onExportAll">Create file backup</paper-button>
        <paper-button dialog-dismiss="" autofocus="">Cancel</paper-button>
        <paper-button dialog-confirm="" class="action-button">Destroy</paper-button>
      </div>
    </paper-dialog>

    <paper-fab icon="arc:add" class="add-fab" on-click="appendRule"></paper-fab>
    <uuid-generator id="uuid"></uuid-generator>
`;
  }

  static get is() {return 'host-rules-editor';}
  static get properties() {
    return {
      // List of saved items restored from the datastore.
      items: {
        type: Array,
        observer: '_itemsChanged'
      },
      // Computed value, true if `items` is set.
      hasItems: {
        type: Boolean,
        readOnly: true,
        value: false
      },
      // True when loading data from the datastore.
      loading: {
        type: Boolean,
        readOnly: true,
        notify: true
      },
      /**
       * A computed flag that determines that the query to the databastore
       * has been performed and empty result was returned.
       * This can be true only if not in search.
       */
      dataUnavailable: {
        type: Boolean,
        computed: '_computeDataUnavailable(hasItems, loading)'
      },
      /**
       * If set it renders "narrow" view fow small screens
       */
      narrow: Boolean,
      /**
       * If true the rules tester is visible.
       */
      rulesTesterOpened: Boolean,
      _tutorialAllowed: Boolean,
      /**
       * When set it won't ask the model for data when connected to the DOM.
       */
      noAuto: Boolean
    };
  }

  static get observers() {
    return [
      '_modelChanged(items.*)'
    ];
  }

  constructor() {
    super();
    this._ruleUpdated = this._ruleUpdated.bind(this);
    this._ruleDeleted = this._ruleDeleted.bind(this);
    this._rulesCleared = this._rulesCleared.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('host-rules-changed', this._ruleUpdated);
    window.addEventListener('host-rules-deleted', this._ruleDeleted);
    window.addEventListener('host-rules-clear', this._rulesCleared);
    if (this.noAuto) {
      this._tutorialAllowed = true;
      return;
    }
    afterNextRender(this, () => {
      if (!this.items && !this.noAuto) {
        this.refresh()
        .catch((cause) => {
          console.warn(cause);
        });
      }
      this._tutorialAllowed = true;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('host-rules-changed', this._ruleUpdated);
    window.removeEventListener('host-rules-deleted', this._ruleDeleted);
    window.removeEventListener('host-rules-clear', this._rulesCleared);
  }
  /**
   * Refreshes the list of rules from the model.
   * This element is designed to work with `arc-models/host-rules-model`
   * element but can work with any model that handles `host-rules-list`
   * custom event.
   *
   * Calling this function will replace current `items` value with the one
   * received from the model.
   *
   * @return {Promise}
   */
  refresh() {
    if (this.loading) {
      return;
    }
    this._setLoading(true);
    const e = new CustomEvent('host-rules-list', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {}
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this._setLoading(false);
      this.$.noModel.opened = true;
      return Promise.reject(new Error('Model not found'));
    }

    return e.detail.result
    .then((rules) => {
      this._setLoading(false);
      this.items = rules;
    });
  }

  // Computes value for the `dataUnavailable` proeprty
  _computeDataUnavailable(hasItems, loading) {
    return !loading && !hasItems;
  }

  // Computes and sets value for `hasItems` property
  _itemsChanged(value) {
    if (value && value.length) {
      if (!this.hasItems) {
        this._setHasItems(true);
      }
    } else {
      if (this.hasItems) {
        this._setHasItems(false);
      }
    }
  }

  _closeMainMenu() {
    this.$.mainMenu.opened = false;
    this.$.mainMenuOptions.selected = -1;
  }
  /**
   * Handler for export all to file menu click
   */
  _onExportAll() {
    this._sendExport('file');
  }
  /**
   * Handler for export all to Google Drive menu click
   */
  _onExportAllDrive() {
    this._sendExport('drive');
  }
  /**
   * Dispatches `arc-data-export` custom event.
   * @param {String} destination File storage destination.
   */
  _sendExport(destination) {
    this._closeMainMenu();
    const e = this._dispatchExport(destination);
    if (!e.defaultPrevented) {
      this.$.noExport.opened = true;
    }
  }

  _dispatchExport(destination) {
    // data, options, providerOptions
    const options = {
      provider: destination,
      file: 'arc-host-rules.json'
    };
    const e = new CustomEvent('arc-data-export', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {
        options,
        data: {
          'host-rules': true
        }
      }
    });
    this.dispatchEvent(e);
    return e;
  }

  /**
   * Appends empty rule to the rules list.
   */
  appendRule() {
    const rule = {
      from: '',
      to: '',
      enabled: true,
      comment: ''
    };
    if (!this.items || !this.items.length) {
      this.set('items', [rule]);
    } else {
      this.push('items', rule);
    }
  }
  /**
   * Handler for delete rule event from an item.
   * @param {CustomEvent} e
   * @return {Promise}
   */
  _deleteRule(e) {
    const item = e.model.get('item');
    if (!item._id) {
      this.splice('items', e.model.get('index'), 1);
      return Promise.resolve();
    }

    const e2 = new CustomEvent('host-rules-deleted', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {
        id: item._id,
        rev: item._rev
      }
    });
    this.dispatchEvent(e2);
    if (!e2.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error('Model not found'));
    }
    return e2.detail.result
    .catch(() => {
      this.$.deleteError.opened = true;
    });
  }

  _modelChanged(record) {
    this._itemsChanged(record.base);
    if (this.__ignoreChangeNotifier) {
      return;
    }
    if (record.path === 'items' || record.path === 'items.length' ||
      record.path === 'items.splices') {
      return;
    }
    if (record.path.indexOf('._rev') !== -1) {
      return;
    }
    let changePathItem = record.path.substr(0, record.path.lastIndexOf('.'));
    if (changePathItem === 'items') {
      changePathItem = record.path;
    }
    if (this._hostRulesChangedNotifier) {
      clearTimeout(this._hostRulesChangedNotifier);
    }
    this._hostRulesChangedNotifier = setTimeout(() => {
      this._hostRulesChangedNotifier = false;
      const item = this.get(changePathItem);
      if (!item || !item.from || !item.to) {
        return;
      }
      if (!item._id) {
        item._id = this.$.uuid.generate();
      }
      const e = new CustomEvent('host-rules-changed', {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: {
          rule: item
        }
      });
      this.dispatchEvent(e);
      e.detail.result.then((item) => {
        this.set(changePathItem + '._rev', item._rev);
      })
      .catch((cause) => {
        console.eror(cause);
        this.$.updateError.opened = true;
      });
    }, 250);
  }
  /**
   * Updates a rule from the `host-rules-changed` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   *
   * @param {CustomEvent} e
   */
  _ruleUpdated(e) {
    if (e.cancelable || e.composedPath()[0] === this) {
      return;
    }
    this.__ignoreChangeNotifier = true;
    const updatedValue = e.detail.rule;
    if (!this.items) {
      this.set('items', [updatedValue]);
      this.__ignoreChangeNotifier = false;
      return;
    }
    const index = this.items.findIndex((item) => item._id === updatedValue._id);
    if (index === -1) {
      this.push('items', updatedValue);
    } else {
      this.set(['items', index], updatedValue);
    }
    this.__ignoreChangeNotifier = false;
  }
  /**
   * Deletes the rule from the `host-rules-deleted` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   *
   * @param {CustomEvent} e
   */
  _ruleDeleted(e) {
    if (e.cancelable || e.composedPath()[0] === this) {
      return;
    }
    if (!this.items || !this.items.length) {
      return;
    }
    const id = e.detail.id;
    const index = this.items.findIndex((item) => item._id === id);
    if (index === -1) {
      return;
    }
    this.splice('items', index, 1);
  }
  /**
   * Toggles the rule tester view.
   * Use `rulesTesterOpened` property to control the view instead of calling
   * this function.
   */
  toggleRulesTester() {
    this.rulesTesterOpened = !this.rulesTesterOpened;
  }

  _onLearnMore() {
    this._closeMainMenu();
    const url = 'https://github.com/advanced-rest-client/arc-electron/wiki/Host-rules';
    const e = new CustomEvent('open-external-url', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {
        url
      }
    });
    this.dispatchEvent(e);
    if (e.defaultPrevented) {
      return;
    }
    return window.open(url);
  }

  _deleteAll() {
    this._closeMainMenu();
    this.$.dataClearDialog.opened = true;
  }
  /**
   * Called when the delete warning dialog closes.
   *
   * The function dispatches custom event handled by the model to remove all
   * data.
   *
   * @param {CustomEvent} e
   * @return {Promise}
   */
  _onClearDialogResult(e) {
    if (e.detail.canceled || !e.detail.confirmed) {
      return Promise.resolve();
    }
    const e2 = new CustomEvent('host-rules-clear', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {}
    });
    this.dispatchEvent(e2);
    if (!e2.defaultPrevented) {
      this.$.noModel.opened = true;
      return Promise.reject(new Error('No model found.'));
    }
    return e2.detail.result
    .catch(() => {
      this.$.deleteError.opened = true;
    });
  }
  /**
   * Handler for non cancelable `host-rules-clear` to remove all rules.
   * @param {CustomEvent} e
   */
  _rulesCleared(e) {
    if (e.cancelable) {
      return;
    }
    this.items = [];
  }
  /**
   * Dispatched when value of a rule chnages.
   *
   * Note that the rule maight not be yet saved when this event is fired.
   *
   * The rule object contains all data received when dispatched `host-rules-list`
   * event with altered data. If the model added other properties that can identify
   * specific rule then it will be also included in `rule` object.
   *
   * @event host-rules-changed
   * @param {Object} rule Rule definition
   */

  /**
   * Dispatched when the user requested to delete rule entry.
   *
   * Note that the rule maight not be yet saved when this event is fired.
   * The model should check if the rule can be identified as a datastore
   * object.
   *
   * The rule object contains all data received when dispatched `host-rules-list`
   * event with altered data. If the model added other properties that can identify
   * specific rule then it will be also included in `rule` object.
   *
   * This event is cancelable
   *
   * @event host-rules-deleted
   * @param {Object} rule Rule definition
   */

  /**
   * Fired when the element request the list of available rules.
   *
   * It expect the event to be canceled by event handler and `result`
   * property to be set on the detail object which is a `Promise` resolved
   * to list of results.
   *
   * @event host-rules-list
   */

  /**
   * Dispatched to request the model to clear the data store
   *
   * @event host-rules-clear
   */
}
window.customElements.define(HostRulesEditor.is, HostRulesEditor);
