# React-admin block-input

## Installation

```sh
npm install @igloo-be/ra-blocks-input
# or
yarn add @igloo-be/ra-blocks-input
```

### CSS

tailwind.config.js
```js
module.exports = {
  content: [
    // ...
    "node_modules/@igloo-be/ra-blocks-input/dist/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Usage

```tsx
<SimpleForm>
  <BlocksInput
    source="blocks"
    blockDefinitions={[blockText]}
    contexts={[{ id: "default", label: "Default" }]}
    defaultContextId="default"
  />
</SimpleForm>
```

## Block definitions

```ts
import { TextInput } from "react-admin";
import { BlockDefinition } from "../../../src/types";

export const blockText: BlockDefinition = {
  id: "text",
  label: "Text",
  formDefaultValue: {
    text: "Example text 😊",
  },
  FormComponent: () => {
    return <TextInput source="text" multiline />;
  },
  PreviewComponent: ({ block }) => {
    return <div style={{ border: "1px solid green"}}>{block.data?.text}</div>;
  },
};

export default blockText;
```
