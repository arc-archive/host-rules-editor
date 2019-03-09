[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/host-rules-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/host-rules-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/host-rules-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/host-rules-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/host-rules-editor)

## &lt;host-rules-editor&gt;

An element to render host rules mapping


```html
<host-rules-editor></host-rules-editor>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/host-rules-editor
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/host-rules-editor/host-rules-editor.js';
    </script>
  </head>
  <body>
    <host-rules-editor></host-rules-editor>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/host-rules-editor/host-rules-editor.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <host-rules-editor></host-rules-editor>
    `;
  }

  _authChanged(e) {
    console.log(e.detail);
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/host-rules-editor
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
