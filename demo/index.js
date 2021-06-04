import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/arc-models/arc-data-export.js';
import '@advanced-rest-client/arc-models/host-rules-model.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/arc-events';
import '../host-rules-editor.js';

class ComponentDemoPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
    ]);
    this.componentName = 'host-rules-editor';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.generator = new DataGenerator();
    this.renderViewControls = true;

    this.generateData = this.generateData.bind(this);

    listenEncoding();
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  async generateData() {
    await this.generator.insertHostRulesData({
      size: 25
    });
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    await ArcModelEvents.destroy(document.body, ['host-rules']);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
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
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <host-rules-editor
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            slot="content"></host-rules-editor>
        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button @click="${this.generateData}">Generate 25 rules</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear list</anypoint-button>
        </div>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <arc-data-export appVersion="demo-page"></arc-data-export>
      <host-rules-model></host-rules-model>

      <h2>ARC host rules editor screen</h2>
      ${this._demoTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
