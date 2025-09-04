# React-admin block-input

## Installation

```sh
npm install @igloo-be/ra-blocks-input react-dnd react-dnd-html5-backend
# or
yarn add @igloo-be/ra-blocks-input react-dnd react-dnd-html5-backend
# or
pnpm add @igloo-be/ra-blocks-input react-dnd react-dnd-html5-backend
```

### CSS

#### Tailwind v3

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

#### Tailwind v4

global.css
```css
@import "tailwindcss";
@source "../../node_modules/@igloo-be/ra-blocks-input/dist/*.{js,mjs}";
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
