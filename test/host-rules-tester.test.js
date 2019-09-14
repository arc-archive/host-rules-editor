import { fixture, assert, html } from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../host-rules-tester.js';

describe('<host-rules-tester>', function() {
  async function basicFixture() {
    return await fixture(html`<host-rules-tester></host-rules-tester>`);
  }

  describe('basics', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    const rules = [{
      from: 'domain.com',
      to: 'localhost'
    }];

    it('sets URL when input value change', () => {
      const input  = element.shadowRoot.querySelector('anypoint-input');
      input.value = 'https://domain.com';
      assert.equal(element.url, input.value);
    });

    it('Sets error when rules are not set', function() {
      element.testUrl();
      assert.equal(element._result, 'Define rules first.');
    });

    it('Sets error when url is not set', function() {
      element.rules = rules;
      element.testUrl();
      assert.equal(element._result, 'Define the URL first.');
    });

    it('Evaluates the rules', function() {
      element.rules = rules;
      element.url = 'domain.com/test';
      element.testUrl();
      assert.equal(element._result, 'localhost/test');
    });

    it('evaluates the rule on enter', () => {
      const input  = element.shadowRoot.querySelector('anypoint-input');
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.equal(element._result, 'Define rules first.');
    });
  });

  describe('_evaluate()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    const rules = [{
      from: 'domain.com',
      to: 'localhost',
      enabled: true
    }, {
      from: 'other.com',
      to: '127.0.0.1',
      enabled: false
    }, {
      from: '',
      to: '192.168.1.1',
      enabled: true
    }];

    it('evaluates a rule', () => {
      element.url = 'https://domain.com/path';
      element.rules = rules;
      const result = element._evaluate();
      assert.equal(result, 'https://localhost/path');
    });

    it('ignores disabled rules', () => {
      element.url = 'https://other.com/path';
      element.rules = rules;
      const result = element._evaluate();
      assert.equal(result, 'https://other.com/path');
    });

    it('ignores rules without "from" value', () => {
      element.url = '';
      element.rules = rules;
      const result = element._evaluate();
      assert.equal(result, '');
    });

    it('executes rules in order', () => {
      const items = Array.from(rules);
      items.push({
        from: 'localhost',
        to: '192.168.1.1',
        enabled: true
      });
      element.url = 'https://domain.com/path';
      element.rules = items;
      const result = element._evaluate();
      assert.equal(result, 'https://192.168.1.1/path');
    });
  });
});
