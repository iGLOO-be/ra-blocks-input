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
  // Basic
  <BlocksInput
    source="blocks"
    blockDefinitions={[blockText]}
  />

  // With context: id and label are required
  <BlocksInput
    source="blocks"
    blockDefinitions={[blockText]}
    contexts={[{ id: "default", label: "Default" }]}
    defaultContextId="default"
  />

  // Specify additional context properties
  <BlocksInput<{ foo?: string }>
    source="blocks"
    blockDefinitions={[blockText]}
    contexts={[
      { id: "default", label: "Default" },
      { id: "other", label: "Other", foo: "bar" }
    ]}
    defaultContextId="default"
  />
</SimpleForm>
```

## Block definitions

```tsx
export const blockText: BlockDefinition = {
  id: "text",
  label: "Text",
  formDefaultValue: {
    text: "Example text 😊",
  },
  FormComponent: () => {
    return <TextInput source="text" multiline />;
  },
  PreviewComponent: ({ block, context }) => {
    return <div>{block.data?.text}</div>;
  },
};
```

Specify the type of data and context

```ts
BlockDefinition<
  {
    text: string;
  },
  {
    foo?: string;
  }
>
```
