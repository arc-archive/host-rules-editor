import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

h2 {
  margin-left: 16px;
  font-size: var(--arc-font-headline-font-size);
  font-weight: var(--arc-font-headline-font-weight);
  letter-spacing: var(--arc-font-headline-letter-spacing);
  line-height: var(--arc-font-headline-line-height);
  flex: 1;
}

h3 {
  margin-left: 16px;
  font-size: var(--arc-font-subhead-font-size);
  font-weight: var(--arc-font-subhead-font-weight);
  line-height: var(--arc-font-subhead-line-height);
}

paper-progress {
  width: 100%;
}

.error-toast {
  background-color: var(--warning-primary-color, #FF7043);
  color: var(--warning-contrast-color, #fff);
}

.add-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.empty-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
}

host-rules-editor-item {
  padding: 0 16px;
}

host-rules-tester {
  margin: 8px 16px;
  padding: 8px;
  border: 1px #e5e5e5 solid;
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

#exportOptionsContainer {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--cookie-manager-bottom-sheet-right, 40px);
  left: var(--cookie-manager-bottom-sheet-left, auto);
}
`;
