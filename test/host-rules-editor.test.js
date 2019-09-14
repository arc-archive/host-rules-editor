import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import '@advanced-rest-client/arc-models/host-rules-model.js';
import '../host-rules-editor.js';
import { HostModel } from './model.js';

describe('<host-rules-editor>', function() {
  async function basicFixture() {
    return await fixture(html`<host-rules-editor></host-rules-editor>`);
  }

  async function noAutoFixture() {
    return await fixture(html`<host-rules-editor noauto></host-rules-editor>`);
  }

  async function dataFixture(items) {
    return await fixture(html`<host-rules-editor
      noauto
      .items="${items}"></host-rules-editor>`);
  }

  async function modelFixture() {
    const region = await fixture(html`
      <div>
        <host-rules-model></host-rules-model>
        <host-rules-editor noauto></host-rules-editor>
      </div>
    `);
    const element = region.querySelector('host-rules-editor');
    await element.refresh();
    return element;
  }

  const TEST_RULES = [{
    from: 'host-from',
    to: 'host-to',
    enabled: true,
    comment: 'test-comment',
    _id: 'test-id'
  }];

  before(() => {
    HostModel.register();
  });

  describe('Initialization', function() {
    it('hasItems is false by default', async function() {
      const element = await noAutoFixture();
      assert.isFalse(element.hasItems);
    });

    it('Is not loading right after initialization', async function() {
      const element = await noAutoFixture();
      assert.isUndefined(element.loading);
    });

    it('dataUnavailable is computed', async function() {
      const element = await noAutoFixture();
      assert.isTrue(element.dataUnavailable);
    });

    it('rulesTesterOpened is undefined', async function() {
      const element = await noAutoFixture();
      assert.isUndefined(element.rulesTesterOpened);
    });

    it('Eventually calls for model data', (done) => {
      window.addEventListener('host-rules-list', function f(e) {
        window.removeEventListener('host-rules-list', f);
        e.preventDefault();
        e.detail.result = Promise.resolve();
        done();
      });
      basicFixture();
    });

    it('does not call for model data when no-auto', async () => {
      const element = await noAutoFixture();
      const spy = sinon.spy();
      element.addEventListener('host-rules-list', spy);
      await aTimeout();
      assert.isFalse(spy.called);
    });

    it('sets default _storeDelay', async () => {
      const element = await noAutoFixture();
      assert.equal(element._storeDelay, 250);
    });
  });

  describe('refresh()', function() {
    let element;
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('Sets the loading property', function() {
      element.refresh();
      assert.isTrue(element._loading);
    });

    it('Sends host-rules-list custom event', function() {
      const spy = sinon.spy();
      element.addEventListener('host-rules-list', spy);
      element.refresh();
      assert.isTrue(spy.calledOnce);
    });

    it('host-rules-list event is cancelable', function(done) {
      element.addEventListener('host-rules-list', function clb(e) {
        element.removeEventListener('host-rules-list', clb);
        assert.isTrue(e.cancelable);
        done();
      });
      element.refresh();
    });

    it('Sets hasItems property (empty data)', function() {
      return element.refresh()
      .then(() => {
        assert.isFalse(element.hasItems);
      });
    });

    it('Sets dataUnavailable property (empty data)', function() {
      return element.refresh()
      .then(() => {
        assert.isTrue(element.dataUnavailable);
      });
    });

    it('Renders empty info screen', async () => {
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.ok(node);
    });

    it('Sets hasItems property (with data)', async () => {
      window.HOST_RULES = TEST_RULES;
      await element.refresh();
      assert.isTrue(element.hasItems);
    });

    it('Sets dataUnavailable property (with data)', async () => {
      window.HOST_RULES = TEST_RULES;
      await element.refresh();
      assert.isFalse(element.dataUnavailable);
    });

    it('empty info screen is not rendered', async () => {
      window.HOST_RULES = TEST_RULES;
      await element.refresh();
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.notOk(node);
    });
  });

  describe('appendRule()', function() {
    let element;
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('Should append an empty rule', function() {
      assert.isUndefined(element.items, 'items is undefined');
      element.appendRule();
      assert.typeOf(element.items, 'array', 'items is an array');
      assert.lengthOf(element.items, 1, 'array has one item');
    });

    it('Appending empty item does not fire host-rules-changed custom event', async () => {
      element._storeDelay = 5;
      const spy = sinon.spy();
      element.addEventListener('host-rules-changed', spy);
      element.appendRule();
      await aTimeout(10);
      assert.isFalse(spy.called);
    });
  });

  describe('openExportAll()', () => {
    let element;
    beforeEach(async () => {
      window.HOST_RULES = TEST_RULES;
      element = await basicFixture();
      await aTimeout();
    });

    it('Calls _deselectMainMenu()', () => {
      const spy = sinon.spy(element, '_deselectMainMenu');
      element.openExportAll();
      assert.isTrue(spy.called);
    });

    it('sets _exportOptionsOpened', () => {
      element.openExportAll();
      assert.isTrue(element._exportOptionsOpened);
    });

    it('sets _exportItems', () => {
      element.openExportAll();
      assert.deepEqual(element._exportItems, element.items);
    });
  });

  describe('Export options', function() {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    it('_exportAllFile() calls _doExportItems with data', () => {
      const dest = 'file';
      element._doExportItems = function(items, detail) {
        assert.deepEqual(items, element.items);
        assert.typeOf(detail.options, 'object');
        assert.equal(detail.options.provider, dest);
        assert.equal(detail.options.file, 'arc-host-rules.json');
      };
      element._exportAllFile();
    });

    it('Dispatches arc-data-export event', (done) => {
      window.addEventListener('arc-data-export', function f(e) {
        window.removeEventListener('arc-data-export', f);
        assert.isTrue(e.cancelable, 'Event is cancelable');
        assert.isTrue(e.bubbles, 'Event bubbles');
        assert.equal(e.detail.options.file, 'test.json');
        assert.equal(e.detail.options.provider, 'file');
        assert.typeOf(e.detail.data, 'object');
        assert.deepEqual(e.detail.data.cookies, element.items);
        done();
      });
      element._doExportItems(element.items, {
        options: {
          provider: 'file',
          file: 'test.json'
        }
      });
    });

    it('dispatches GA exception when event not handled', async () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element._doExportItems(element.items, {
        options: {
          provider: 'file',
          file: 'test.json'
        }
      });
      assert.isTrue(spy.called);
    });
  });

  describe('_deleteAllClick()', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    it('Calls _deselectMainMenu()', () => {
      const spy = sinon.spy(element, '_deselectMainMenu');
      element._deleteAllClick();
      assert.isTrue(spy.called);
    });

    it('Opens working dialog', () => {
      element._deleteAllClick();
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      assert.isTrue(dialog.opened);
    });
  });

  describe('_onClearDialogResult()', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    it('Ignores not confirmed dialog', () => {
      const spy = sinon.spy();
      element.addEventListener('destroy-model', spy);
      element._onClearDialogResult({
        detail: {
          confirmed: false
        }
      });
      assert.isFalse(spy.called);
    });

    it('dispatches destroy-model event', () => {
      const spy = sinon.spy();
      element.addEventListener('destroy-model', spy);
      element._onClearDialogResult({
        detail: {
          confirmed: true
        }
      });
      assert.isTrue(spy.called);
    });
  });

  describe('_generateFileName()', () => {
    let element;
    beforeEach(async () => {
      element = await noAutoFixture();
    });

    it('returns file name', () => {
      assert.equal(element._generateFileName(), 'arc-host-rules.json');
    });
  });

  describe('host-rules-changed', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    function fire(rule, cancelable) {
      if (typeof cancelable === 'undefined') {
        cancelable = false;
      }
      const e = new CustomEvent('host-rules-changed', {
        cancelable,
        bubbles: true,
        detail: {
          rule
        }
      });
      document.body.dispatchEvent(e);
    }

    it('updates existing rule', () => {
      const rule = Object.assign({}, element.items[0]);
      rule.from = 'test';
      fire(rule);
      assert.equal(element.items[0].from, 'test');
    });

    it('adds new rule', () => {
      const rule = DataGenerator.generateHostRuleObject();
      fire(rule);
      assert.lengthOf(element.items, 6);
    });

    it('ignores cancelable events', () => {
      const rule = DataGenerator.generateHostRuleObject();
      fire(rule, true);
      assert.lengthOf(element.items, 5);
    });
  });

  describe('host-rules-deleted', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    function fire(id, cancelable) {
      if (typeof cancelable === 'undefined') {
        cancelable = false;
      }
      const e = new CustomEvent('host-rules-deleted', {
        cancelable,
        bubbles: true,
        detail: {
          id
        }
      });
      document.body.dispatchEvent(e);
    }

    it('removes existing rule', () => {
      fire(element.items[0]._id);
      assert.lengthOf(element.items, 4);
    });

    it('ignores cancelable events', () => {
      fire(element.items[0]._id, true);
      assert.lengthOf(element.items, 5);
    });
  });

  describe('data-imported', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    function fire(id) {
      const e = new CustomEvent('data-imported', {
        bubbles: true,
        detail: {}
      });
      document.body.dispatchEvent(e);
    }

    it('calles refresh', () => {
      const spy = sinon.spy(element, 'refresh');
      fire();
      assert.isTrue(spy.called);
    });
  });

  describe('datastore-destroyed', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    function fire(datastore) {
      const e = new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore
        }
      });
      document.body.dispatchEvent(e);
    }

    it('clears items for host-rules data store', () => {
      fire('host-rules');
      assert.lengthOf(element.items, 0);
    });

    it('clears items for [host-rules] data store', () => {
      fire(['host-rules']);
      assert.lengthOf(element.items, 0);
    });

    it('clears items for all data store', () => {
      fire('all');
      assert.lengthOf(element.items, 0);
    });

    it('ignores other stores', () => {
      fire('saved');
      assert.lengthOf(element.items, 5);
    });
  });

  describe('All data export', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    it('opens export options from main menu', () => {
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      assert.isTrue(element._exportOptionsOpened);
    });

    it('sets export items to all items', () => {
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      assert.deepEqual(element._exportItems, element.items);
    });

    it('opening export dialog closes main menu and removes selection', async () => {
      const menu = element.shadowRoot.querySelector('#mainMenu');
      MockInteractions.tap(menu);
      // This won't full open the dropdown but it is not relevant
      await aTimeout();
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      await aTimeout();
      assert.isFalse(menu.opened);
      const opts = element.shadowRoot.querySelector('#mainMenuOptions');
      assert.equal(opts.selected, null);
    });

    it('opens export dialog', async () => {
      const node = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(node);
      await aTimeout(100);
      const dialog = element.shadowRoot.querySelector('#exportOptionsContainer');
      const display = getComputedStyle(dialog).display;
      assert.notEqual(display, 'none');
    });

    it('exports data when export dialog is accepted', async () => {
      element.openExportAll();
      const spy = sinon.spy(element, '_dispatchExportData');
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('accept', {
        detail: {
          options: {}
        }
      }));
      assert.isTrue(spy.calledOnce);
      const itemsArg = spy.args[0][0];
      assert.deepEqual(itemsArg, element.items, 'items are set');
      const detailArg = spy.args[0][1];
      assert.typeOf(detailArg, 'object', 'has the detail argument');
      assert.equal(detailArg.options.kind, 'ARC#HostRules', 'has "kind" property on the options');
    });

    it('opens drive export toast conformation', async () => {
      element.addEventListener('arc-data-export', (e) => {
        e.detail.result = Promise.resolve();
      });
      element._doExportItems(true, {
        options: {
          provider: 'drive'
        }
      });
      await aTimeout();
      const toast = element.shadowRoot.querySelector('#driveSaved');
      assert.isTrue(toast.opened);
    });

    it('clears _exportItems when export finishes', async () => {
      element._doExportItems(true, {
        options: {
          provider: 'file'
        }
      });
      await aTimeout();
      assert.isUndefined(element._exportItems);
    });

    it('opens error toast when export error', async () => {
      element.addEventListener('arc-data-export', (e) => {
        e.detail.result = Promise.reject(new Error('test'));
      });
      element._doExportItems(true, {
        options: {
          provider: 'drive'
        }
      });
      await aTimeout();
      const toast = element.shadowRoot.querySelector('#errorToast');
      assert.isTrue(toast.opened, 'the toast is opened');
      assert.equal(toast.text, 'test', 'Error message is set');
    });

    it('closes export dialog when it is accepted', async () => {
      element.openExportAll();
      await aTimeout();
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('accept', {
        detail: {
          options: {}
        }
      }));
      assert.isFalse(element._exportOptionsOpened);
    });

    it('cancels export when export dialog is cancelled', async () => {
      element.openExportAll();
      await aTimeout();
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('cancel'));
      assert.isFalse(element._exportOptionsOpened, 'dialog is closed');
      assert.isUndefined(element._exportItems, 'items are cleared');
    });
  });

  describe('All data delete', () => {
    let element;
    beforeEach(async () => {
      const data = DataGenerator.generateHostRulesData({ size: 5 });
      element = await dataFixture(data);
    });

    it('opens delete confirmation dialog', () => {
      const node = element.shadowRoot.querySelector('[data-action="delete-all"]');
      MockInteractions.tap(node);
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      assert.isTrue(dialog.opened);
    });

    it('opening delete dialog closes main menu and removes selection', async () => {
      const menu = element.shadowRoot.querySelector('#mainMenu');
      MockInteractions.tap(menu);
      await aTimeout();
      const node = element.shadowRoot.querySelector('[data-action="delete-all"]');
      MockInteractions.tap(node);
      await aTimeout();
      assert.isFalse(menu.opened);
      const opts = element.shadowRoot.querySelector('#mainMenuOptions');
      assert.equal(opts.selected, null);
    });

    it('requests file export for all items', async () => {
      const spy = sinon.spy(element, '_dispatchExportData');
      const node = element.shadowRoot.querySelector('[data-action="delete-export-all"]');
      MockInteractions.tap(node);
      assert.isTrue(spy.calledOnce);
      const itemsArg = spy.args[0][0];
      assert.deepEqual(itemsArg, element.items, 'items are set');
      const detailArg = spy.args[0][1];
      assert.typeOf(detailArg, 'object', 'has the detail argument');
      assert.equal(detailArg.options.kind, 'ARC#HostRules', 'has "kind" property on the options');
      assert.equal(detailArg.options.provider, 'file', 'has "provider" property on the options');
      assert.notEmpty(detailArg.options.file, 'has "file" property on the options');
    });

    it('does not delete data when dialog is cancelled', async () => {
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      dialog.opened = true;
      await aTimeout();
      const spy = sinon.spy();
      element.addEventListener('destroy-model', spy);
      MockInteractions.click(element);
      await aTimeout(100);
      assert.isFalse(dialog.opened);
      assert.isFalse(spy.called);
    });

    it('dispatches destroy-model event when accepted', async () => {
      const spy = sinon.spy();
      element.addEventListener('destroy-model', spy);
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      dialog.opened = true;
      await aTimeout();
      const node = element.shadowRoot.querySelector('[dialog-confirm]');
      MockInteractions.tap(node);
      await aTimeout(100);
      assert.isFalse(dialog.opened, 'dialog is not opened');
      assert.isTrue(spy.calledOnce, 'delete event is dispatched');
    });

    it('opens error toast when delete error', async () => {
      element.addEventListener('destroy-model', (e) => {
        e.detail.result = [Promise.reject(new Error('test'))];
      });
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      dialog.opened = true;
      await aTimeout();
      const node = element.shadowRoot.querySelector('[dialog-confirm]');
      MockInteractions.tap(node);
      await aTimeout(100);
      const toast = element.shadowRoot.querySelector('#errorToast');
      assert.isTrue(toast.opened, 'delete error toast is rendered');
    });
  });

  describe('deleting a rule', () => {
    before(async () => {
      await DataGenerator.insertHostRulesData({
        size: 5
      });
    });

    after(async () => {
      await DataGenerator.destroyHostRulesData();
    });

    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('removes an item from the data store', async () => {
      const node = element.shadowRoot.querySelector('host-rules-editor-item');
      const spy = sinon.spy();
      element.addEventListener('host-rules-deleted', spy);
      node.dispatchEvent(new CustomEvent('remove-rule'));
      assert.isTrue(spy.calledOnce, 'event is dispatched');
      await aTimeout();
      await spy.args[0][0].detail.result;
      assert.lengthOf(element.items, 4);
    });

    it('removes not saved item', async () => {
      const fab = element.shadowRoot.querySelector('paper-fab');
      MockInteractions.tap(fab);
      await aTimeout();
      const nodes = element.shadowRoot.querySelectorAll('host-rules-editor-item');
      const node = nodes[nodes.length - 1];
      const spy = sinon.spy();
      element.addEventListener('host-rules-deleted', spy);
      node.dispatchEvent(new CustomEvent('remove-rule'));
      assert.isFalse(spy.called, 'event is not dispatched');
      assert.lengthOf(element.items, 4);
    });
  });
});
