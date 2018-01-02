[![Build Status](https://travis-ci.org/advanced-rest-client/host-rules-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/host-rules-editor)  

# host-rules-editor

An element to render host rules mapping editor.

Host rules mapping allow ARC to redirect connection from one URI to another
without changinh the `host` header value. This element allows to enter mapping
rules and to test them agains arbitrary URL.

NOTE: This element does not provide data storing interface. Instead of operating
on a data store it sends custom events that should be handled by the hosting
application. Example inferface is included in `arc-models/host-rules-model` element.

NOTE: This element works with `arc-data-export` element to export data to a file.
You can use other way to handle `export-user-data` custom event to export host
rules data.

### Example
```
<arc-data-export></arc-data-export>
<host-rules-model></host-rules-model>
<host-rules-editor></host-rules-editor>
```

### Data model

The `items` property accepts an array of the following objects:

``` javascript
{
  from: String, // The from rule (may contain asterisks)
  to: String, // replacement value
  enabled: Boolean, // if false the rule is ignored
  comment: String // optional rule description
}
```

### Narrow view

The element does not recognizes screen size to render mobile like view. To render
narrow view (that fit mobile screen or narrow drawer etc) set `narrow` attribute
on the element

```html
<host-rules-editor narrow></host-rules-editor>
```

### Styling
`<host-rules-editor>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--host-rules-editor` | Mixin applied to the element | `{}`
`--inline-fom-action-icon-color` | Color of the icons in the form editor | `rgba(0, 0, 0, 0.74)`
`--inline-fom-action-icon-color-hover` | Color of the icons in the form editor when hovering | `--accent-color` or `rgba(0, 0, 0, 0.74)`
`--host-rules-editor-loader` | Mixin applied to the paper-progress element when loading rules | `{}`
`--host-rules-editor-empty-screen` | Mixin applied to the empty screen message | `{}`
`--host-rules-editor-item-input` | Mixin applied to the rules inputs | `{}`
`--host-rules-editor-item-comment-input` | Mixin applied to the comment textarea input | `{}`
`--host-rules-editor-item-comment-input-narrow` | Mixin applied to the comment textarea input in narrow view | `{}`
`--host-rules-editor-tutorial-toast` | Mixin applied to the tutorial toast element | `{}`



### Events
| Name | Description | Params |
| --- | --- | --- |
| host-rules-changed | Dispatched when value of a rule chnages.  Note that the rule maight not be yet saved when this event is fired.  The rule object contains all data received when dispatched `host-rules-list` event with altered data. If the model added other properties that can identify specific rule then it will be also included in `rule` object. | rule **Object** - Rule definition |
| host-rules-deleted | Dispatched when the user requested to delete rule entry.  Note that the rule maight not be yet saved when this event is fired. The model should check if the rule can be identified as a datastore object.  The rule object contains all data received when dispatched `host-rules-list` event with altered data. If the model added other properties that can identify specific rule then it will be also included in `rule` object.  This event is cancelable | rule **Object** - Rule definition |
| host-rules-list | Fired when the element request the list of available rules.  It expect the event to be canceled by event handler and `result` property to be set on the detail object which is a `Promise` resolved to list of results. | __none__ |
# host-rules-editor-item

Editor rule item editor.
Renders inputs to control host rules.



### Events
| Name | Description | Params |
| --- | --- | --- |
| remove-rule | Dispatched when the user request to remove the rule. Note that this event does not bubbles. | __none__ |
