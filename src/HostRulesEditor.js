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
import { moreVert, exportVariant, deleteIcon, info } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-fab/paper-fab.js';
import '@advanced-rest-client/uuid-generator/uuid-generator.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import '@advanced-rest-client/export-options/export-options.js';
import '../host-rules-editor-item.js';
import '../host-rules-tester.js';
import styles from './EditorStyles.js';

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
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class HostRulesEditor extends LitElement {
  static get styles() {
    return styles;
  }

  _headerTemplate() {
    const { compatibility, dataUnavailable } = this;
    return html`<div class="header">
      <h2>Hosts rules mapping</h2>

      ${dataUnavailable ? '' : html`<anypoint-button
        emphasis="medium"
        toggles
        @click="${this.toggleRulesTester}"
        aria-label="Activate to open rules test editor"
      >Test rules</anypoint-button>`}

      <anypoint-menu-button
        dynamicalign
        closeOnActivate
        id="mainMenu"
        ?compatibility="${compatibility}">
        <anypoint-icon-button
          aria-label="Activate to open context menu"
          slot="dropdown-trigger"
          ?compatibility="${compatibility}">
          <span class="icon">${moreVert}</span>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          id="mainMenuOptions"
          ?compatibility="${compatibility}">
          <anypoint-icon-item
            class="menu-item"
            data-action="export-all"
            @click="${this.openExportAll}">
            <span class="icon" slot="item-icon">${exportVariant}</span>Export all
          </anypoint-icon-item>
          <anypoint-icon-item
            class="menu-item"
            data-action="delete-all"
            @click="${this._deleteAllClick}">
            <span class="icon" slot="item-icon">${deleteIcon}</span>Delete all
          </anypoint-icon-item>
          <anypoint-icon-item
            class="menu-item"
            data-action="learn-more"
            @click="${this._onLearnMore}">
            <span class="icon" slot="item-icon">${info}</span>Learn more about host rules
          </anypoint-icon-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </div>`;
  }

  _busyTemplate() {
    if (!this._loading) {
      return '';
    }
    return html`<paper-progress indeterminate></paper-progress>`;
  }

  _testerTemplate() {
    const {
      compatibility,
      outlined,
      rulesTesterOpened,
      items
    } = this;
    return html`<iron-collapse .opened="${rulesTesterOpened}">
      <host-rules-tester
        .rules="${items}"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"></host-rules-tester>
    </iron-collapse>`;
  }

  _unavailableTemplate() {
    return html`<div class="empty-screen">
      <h3 class="empty-title">No mappings available</h3>
      <paper-button raised="" on-click="_onLearnMore">Learn more</paper-button>
    </div>`;
  }

  _listTemplate() {
    const items = this.items || [];
    const {
      narrow,
      compatibility,
      outlined
    } = this;
    return items.map((item, index) => html`
      <host-rules-editor-item
        data-index="${index}"
        ?narrow="${narrow}"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        .from="${item.from}"
        .to="${item.to}"
        ?enabled="${item.enabled}"
        .comment="${item.comment}"
        @remove-rule="${this._deleteRule}"
        @property-changed="${this._itemChanged}"
      ></host-rules-editor-item>
    `);
  }

  _exportOptionsTemplate() {
    const {
      _exportOptionsOpened,
      _exportOptions,
      compatibility,
      outlined
    } = this;
    return html`<bottom-sheet
      id="exportOptionsContainer"
      .opened="${_exportOptionsOpened}"
      @overlay-opened="${this._resizeExportContent}"
      @overlay-closed="${this._sheetClosedHandler}">
      <export-options
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        .file="${_exportOptions.file}"
        .provider="${_exportOptions.provider}"
        .providerOptions="${_exportOptions.providerOptions}"
        @accept="${this._acceptExportOptions}"
        @cancel="${this._cancelExportOptions}"></export-options>
    </bottom-sheet>`;
  }

  _toastsTemplate() {
    return html`
    <paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>
    <paper-toast id="driveSaved" text="Cookies saved on Google Drive."></paper-toast>`;
  }

  _clearDialogTemplate() {
    const {
      compatibility
    } = this;
    return html`<anypoint-dialog
      id="dataClearDialog"
      ?compatibility="${compatibility}"
      @overlay-closed="${this._onClearDialogResult}">
      <h2>Remove all rules?</h2>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?compatibility="${compatibility}"
          data-action="delete-export-all"
          @click="${this._exportAllFile}">Create backup file</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-dismiss>Cancel</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-confirm
          class="action-button" autofocus>Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }

  render() {
    const { dataUnavailable } = this;
    return html`
    ${this._headerTemplate()}
    ${this._busyTemplate()}
    ${this._testerTemplate()}
    ${dataUnavailable ? this._unavailableTemplate() : this._listTemplate()}
    ${this._exportOptionsTemplate()}
    ${this._toastsTemplate()}
    ${this._clearDialogTemplate()}
    <paper-fab icon="arc:add" class="add-fab" @click="${this.appendRule}"></paper-fab>
    <uuid-generator id="uuid"></uuid-generator>`;
  }

  static get properties() {
    return {
      // List of saved items restored from the datastore.
      items: { type: Array },
      // True when loading data from the datastore.
      _loading: { type: Boolean },
      /**
       * If set it renders "narrow" view fow small screens
       */
      narrow: { type: Boolean },
      /**
       * If true the rules tester is visible.
       */
      rulesTesterOpened: { type: Boolean },
      /**
       * When set it won't ask the model for data when connected to the DOM.
       */
      noAuto: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material desing outlined theme
       */
      outlined: { type: Boolean },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: { type: Boolean },
      _exportOptions: { type: Object }
    };
  }
  /**
   * @return {Boolean} `true` if `items` is set.
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }
  /**
   * Computed flag that determines that the query to the databastore
   * has been performed and empty result was returned.
   *
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { hasItems, _loading } = this;
    return !_loading && !hasItems;
  }

  get _exportOptionsContainer() {
    return this.shadowRoot.querySelector('#exportOptionsContainer');
  }

  constructor() {
    super();
    this._ruleUpdated = this._ruleUpdated.bind(this);
    this._ruleDeleted = this._ruleDeleted.bind(this);
    this._dataImportHandler = this._dataImportHandler.bind(this);
    this._dataDestroyHandler = this._dataDestroyHandler.bind(this);
    this._storeDelay = 250;
    this._exportOptions = {
      file: this._generateFileName(),
      provider: 'file',
      providerOptions: {
        parents: ['My Drive']
      }
    }
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('host-rules-changed', this._ruleUpdated);
    window.addEventListener('host-rules-deleted', this._ruleDeleted);
    window.addEventListener('data-imported', this._dataImportHandler);
    window.addEventListener('datastore-destroyed', this._dataDestroyHandler);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('host-rules-changed', this._ruleUpdated);
    window.removeEventListener('host-rules-deleted', this._ruleDeleted);
    window.removeEventListener('data-imported', this._dataImportHandler);
    window.removeEventListener('datastore-destroyed', this._dataDestroyHandler);
  }

  firstUpdated() {
    if (!this.items && !this.noAuto) {
      this.refresh();
    }
  }
  /**
   * Handles an exception by sending exception details to GA.
   * @param {String} message A message to send.
   */
  _handleException(message) {
    const e = new CustomEvent('send-analytics', {
     bubbles: true,
     composed: true,
     detail: {
       type: 'exception',
       description: message
     }
    });
    this.dispatchEvent(e);
    const toast = this.shadowRoot.querySelector('#errorToast');
    toast.text = message;
    toast.opened = true;
  }

  _dataImportHandler() {
    this.refresh();
  }

  _dataDestroyHandler(e) {
    let { datastore } = e.detail;
    if (!Array.isArray(datastore)) {
      datastore = [datastore];
    }
    if (datastore.indexOf('host-rules') !== -1 || datastore[0] === 'all') {
      this.items = [];
    }
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
  async refresh() {
    if (this._loading) {
      return;
    }
    this._loading = true;
    const e = new CustomEvent('host-rules-list', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {}
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this._loading = false;
      this._handleException('Hosts rules model not found');
      return;
    }
    try {
      this.items = await e.detail.result;
    } catch (e) {
      this.items = undefined;
      this._handleException(e.message);
    }
    this._loading = false;
  }

  _deselectMainMenu() {
    setTimeout(() => {
      const menuOptions = this.shadowRoot.querySelector('#mainMenuOptions');
      menuOptions.selected = null;
    });
  }
  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `_doExportItems()`
   */
  async _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const { detail } = e;
    return await this._doExportItems(this._exportItems, detail);
  }

  _cancelExportOptions() {
    this._exportOptionsOpened = false;
    this._exportItems = undefined;
  }

  _resizeExportContent(e) {
    this._exportOptionsContainer.notifyResize();
    this._exportOptionsOpened = true;
  }

  _sheetClosedHandler(e) {
    this._exportOptionsOpened = false;
  }
  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {Array<Object>} cookies List of cookies to export.
   * @param {String} detail Export configuration
   * @return {Promise}
   */
  async _doExportItems(cookies, detail) {
    detail.options.kind = 'ARC#HostRules';
    const request = this._dispatchExportData(cookies, detail);
    if (!request.detail.result) {
      this._handleException('Host rules: Export module not found');
      return;
    }
    try {
      await request.detail.result;
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.shadowRoot.querySelector('#driveSaved').opened = true;
      }
    } catch (e) {
      this._handleException(e.message);
    }
    this._exportItems = undefined;
  }
  /**
   * Dispatches `arc-data-export` event and returns it.
   * @param {Array<Object>} cookies List of cookies to export.
   * @param {Object} opts
   * @return {CustomEvent}
   */
  _dispatchExportData(cookies, opts) {
    const e = new CustomEvent('arc-data-export', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        options: opts.options,
        providerOptions: opts.providerOptions,
        data: {
          cookies
        }
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Menu item handler to export all data to file
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _exportAllFile() {
    const detail = {
      options: {
        file: this._generateFileName(),
        provider: 'file'
      }
    };
    return this._doExportItems(this.items, detail);
  }

  /**
   * Menu item handler to export all data to file
   */
  openExportAll() {
    this._deselectMainMenu();
    this._exportOptionsOpened = true;
    this._exportItems = this.items;
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
    const items = this.items || [];
    items.push(rule);
    this.items = [...items];
  }
  /**
   * Handler for delete rule event from an item.
   * @param {CustomEvent} e
   * @return {Promise}
   */
  async _deleteRule(e) {
    const index = Number(e.target.dataset.index);
    const item = this.items[index];
    if (!item._id) {
      const items = this.items;
      items.splice(index, 1);
      this.items = [...items];
      return;
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
      this._handleException('Hosts rules model not found');
      return;
    }
    try {
      return await e2.detail.result;
    } catch (e) {
      this._handleException(e.message);
    }
  }

  _itemChanged(e) {
    const index = Number(e.target.dataset.index);
    const item = this.items[index];
    const { name, value } = e.detail;
    item[name] = value; // no need to reassign items here.
    // Next sections creates a debouncer for a rule and updates the rule after
    // a timeout. If in a meantime the rule get's updated again the timer is cancelled
    // and re-created. This should prevent storing data on each keystroke.
    // Also this prohibits a race condition when a rule change some time after
    // user made a change since the update event. Event dispatched by the model
    // would override user input.
    const timers = this.__updateImeouts || {};
    const timerKey = `u${index}`;
    const timeout = timers[timerKey];
    if (timeout) {
      clearTimeout(timeout);
    }
    timers[timerKey] = setTimeout(() => {
      delete this.__updateImeouts[timerKey];
      this._storeRule(index);
    }, this._storeDelay);
    this.__updateImeouts = timers;
  }

  async _storeRule(index) {
    const rule = this.items[index];
    if (!rule || !rule.from || !rule.to) {
      return;
    }
    if (!rule._id) {
      rule._id = this.shadowRoot.querySelector('#uuid').generate();
    }
    const e = new CustomEvent('host-rules-changed', {
      composed: true,
      cancelable: true,
      bubbles: true,
      detail: {
        rule
      }
    });
    this.dispatchEvent(e);
    try {
      return await e.detail.result;
    } catch (e) {
      this._handleException(e.message);
    }
  }

  _shouldIgnoreEvent(e) {
    if (e.cancelable) {
      return true;
    }
    const path = e.path || e.composedPath;
    if (path[0] === this) {
      return true;
    }
    return false;
  }
  /**
   * Updates a rule from the `host-rules-changed` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   *
   * @param {CustomEvent} e
   */
  _ruleUpdated(e) {
    if (this._shouldIgnoreEvent(e)) {
      return;
    }
    const { rule } = e.detail;
    const items = this.items || [];
    const index = items.findIndex((item) => item._id === rule._id);
    if (index === -1) {
      items.push(rule);
    } else {
      items[index] = rule;
    }
    this.items = [...items];
  }
  /**
   * Deletes the rule from the `host-rules-deleted` custom event.
   * The event should contain `rule` property on the event's detail object
   * containing the rule object.
   *
   * @param {CustomEvent} e
   */
  _ruleDeleted(e) {
    if (this._shouldIgnoreEvent(e)) {
      return;
    }
    const items = this.items || [];
    const { id } = e.detail;
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) {
      return;
    }
    items.splice(index, 1);
    this.items = [...items];
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
    this._deselectMainMenu();
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

  _deleteAllClick() {
    this._deselectMainMenu();
    const dialog = this.shadowRoot.querySelector('#dataClearDialog');
    dialog.opened = true;
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
  async _onClearDialogResult(e) {
    if (!e.detail.confirmed) {
      return;
    }
    const e2 = new CustomEvent('destroy-model', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        models: ['host-rules'],
        result: []
      }
    });
    this.dispatchEvent(e2);
    try {
      for (const p of e2.detail.result) {
        await p;
      }
    } catch (e) {
      this._handleException(e.message);
    }
  }
  /**
   * Generates file name for the export options panel.
   * @return {String}
   */
  _generateFileName() {
    return 'arc-host-rules.json';
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
   * @event destroy-model
   */
}
