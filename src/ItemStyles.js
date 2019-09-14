import { css } from 'lit-element';

export default css`
:host {
  display: block;
  flex: 1;
}

.editor {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.input-fields {
  display: flex;
  flex-direction: row;
  align-items: center;
}

:host([narrow]) .input-fields {
  flex-direction: column;
  align-items: flex-start;
}

:host([narrow]) anypoint-input {
  flex: auto;
  width: 100%;
}

:host([narrow]) .from-field {
  width: 100%;
}

anypoint-input,
.from-field,
.input-fields {
  flex: 1;
}

.from-field {
  display: flex;
  flex-direction: row;
  align-items: center;
}

:host([narrow]) .to-field {
  margin-left: 24px;
  margin-right: 12px;
}

.host-from {
  margin-right: 16px;
}

anypoint-textarea {
  margin-left: 24px;
  margin-right: 80px;
}

:host([narrow]) anypoint-textarea {
  margin-right: 92px;
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}
`;
