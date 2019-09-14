import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/arc-data-export/arc-data-export.js';
import '@advanced-rest-client/arc-models/host-rules-model.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../host-rules-editor.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'listType',
      'exportSheetOpened',
      'exportFile',
      'exportData'
    ]);
    this._componentName = 'host-rules-editor';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._exportOpenedChanged = this._exportOpenedChanged.bind(this);

    window.addEventListener('file-data-save', this._fileExportHandler.bind(this));
    window.addEventListener('google-drive-data-save', this._fileExportHandler.bind(this));
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _fileExportHandler(e) {
    const { content, file } = e.detail;
    setTimeout(() => {
      this.exportData = JSON.stringify(JSON.parse(content), null, 2);
      this.exportFile = file;
      this.exportSheetOpened = true;
    });
    e.preventDefault();
  }

  _exportOpenedChanged(e) {
    this.exportSheetOpened = e.detail.value;
  }

  async generateData() {
    await DataGenerator.insertHostRulesData({
      size: 25
    });
    const e = new CustomEvent('data-imported', {
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async deleteData() {
    const e = new CustomEvent('destroy-model', {
      detail: {
        models: ['host-rules']
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      listType,
      exportSheetOpened,
      exportData,
      exportFile
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the cookies manager element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <host-rules-editor
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            .listType="${listType}"
            slot="content"></host-rules-editor>
        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button @click="${this.generateData}">Generate 25 rules</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
        </div>

        <bottom-sheet
          .opened="${exportSheetOpened}"
          @opened-changed="${this._exportOpenedChanged}">
          <h3>Export demo</h3>
          <p>This is a preview of the file. Normally export module would save this data to file / Drive.</p>
          <p>File: ${exportFile}</p>
          <pre>${exportData}</pre>
        </bottom-sheet>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <arc-data-export appversion="demo-page"></arc-data-export>
      <host-rules-model></host-rules-model>

      <h2>ARC host rules editor screen</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
