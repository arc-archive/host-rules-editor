# host-rules-editor

An element to render a list of host rule mappings.

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/host-rules-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/host-rules-editor)

[![Tests and publishing](https://github.com/advanced-rest-client/host-rules-editor/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/host-rules-editor/actions/workflows/deployment.yml)

## Host rules

ARC's host rules allows to create internal mapping for the request engine to alter the connection URI keeping original `Host` header.
This allows to tests virtual hosts configuration on the server.

When a request is made the rules are evaluated one after another to produce final request URL. This allows to define multiple rules that works on a previous evaluated URL.
Lear more about host rules in [ARC's wiki](https://github.com/advanced-rest-client/arc-electron/wiki/Host-rules).

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/host-rules-editor
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
