import { fixture, assert, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../host-rules-editor-item.js';

describe('<host-rules-editor-item>', function() {
  async function basicFixture() {
    return await fixture(html`<host-rules-editor-item
      from="a"
      to="b"
      comment="c"
      enabled></host-rules-editor-item>`);
  }

  function getButton(element, action) {
    return element.shadowRoot.querySelector(`[data-action="${action}"]`);
  }

  it('toggleComment opens the comment section', async () => {
    const element = await basicFixture();
    const button = getButton(element, 'comment');
    MockInteractions.tap(button);
    assert.isTrue(element.commentOpened);
  });

  it('dispatches remove-rule custom event', async () => {
    const element = await basicFixture();
    const spy = sinon.spy();
    element.addEventListener('remove-rule', spy);
    const button = getButton(element, 'delete');
    MockInteractions.tap(button);
    assert.isTrue(spy.calledOnce);
  });

  it('dispatches property-changed event for enabled change', async () => {
    const element = await basicFixture();
    const spy = sinon.spy();
    element.addEventListener('property-changed', spy);
    const button = getButton(element, 'enable');
    MockInteractions.tap(button);
    assert.isTrue(spy.calledOnce, 'event is dispatched');
    const { detail } = spy.args[0][0];
    assert.equal(detail.name, 'enabled', 'name is set');
    assert.equal(detail.value, false, 'value is set');
  });

  it('dispatches property-changed event for "from" change', async () => {
    const element = await basicFixture();
    const spy = sinon.spy();
    element.addEventListener('property-changed', spy);
    const input = element.shadowRoot.querySelector('.host-from');
    input.value = 'test';
    assert.isTrue(spy.calledOnce, 'event is dispatched');
    const { detail } = spy.args[0][0];
    assert.equal(detail.name, 'from', 'name is set');
    assert.equal(detail.value, 'test', 'value is set');
  });

  it('dispatches property-changed event for "to" change', async () => {
    const element = await basicFixture();
    const spy = sinon.spy();
    element.addEventListener('property-changed', spy);
    const input = element.shadowRoot.querySelector('.to-field');
    input.value = 'test';
    assert.isTrue(spy.calledOnce, 'event is dispatched');
    const { detail } = spy.args[0][0];
    assert.equal(detail.name, 'to', 'name is set');
    assert.equal(detail.value, 'test', 'value is set');
  });

  it('dispatches property-changed event for "comment" change', async () => {
    const element = await basicFixture();
    const spy = sinon.spy();
    element.addEventListener('property-changed', spy);
    const input = element.shadowRoot.querySelector('[name="comment"]');
    input.value = 'test';
    assert.isTrue(spy.calledOnce, 'event is dispatched');
    const { detail } = spy.args[0][0];
    assert.equal(detail.name, 'comment', 'name is set');
    assert.equal(detail.value, 'test', 'value is set');
  });
});
