[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/host-rules-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/host-rules-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/host-rules-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/host-rules-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/host-rules-editor)

## &lt;host-rules-editor&gt;

An element to render host rules mapping.

### Host rules

ARC's host rules allows to create internal mapping for the request engine to alter the connection URI keeping original `Host` header.
This allows to tests virtual hosts configuration on the server.

When a request is made the rules are evaluated one after another to produce final request URL. This allows to define multiple rules that works on a previous evaluated URL.
Lear more about host rules in [ARC's wiki](https://github.com/advanced-rest-client/arc-electron/wiki/Host-rules).

## Usage

### Installation
```
npm install --save @advanced-rest-client/host-rules-editor
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/host-rules-editor/host-rules-editor.js';
import '@advanced-rest-client/arc-models/host-rules-model.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <host-rules-model></host-rules-model>
    <host-rules-editor></host-rules-editor>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/host-rules-editor
cd host-rules-editor
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
