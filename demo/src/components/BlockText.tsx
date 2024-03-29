import { TextInput } from "react-admin";
import { BlockDefinition, BlockRecord } from "../../../src/types";

export const blockText: BlockDefinition<
  { text: string },
  { title?: string } | undefined
> = {
  id: "text",
  label: "Text",
  formDefaultValue: {
    text: "Example text 😊",
  },
  FormComponent: () => {
    return <TextInput source="text" multiline fullWidth />;
  },
  PreviewComponent: ({ block: { data }, context }) => {
    return (
      <div style={{ border: "1px solid green" }}>
        <p>{data?.text}</p>
        {!!context?.title && <p>Context title: {context.title}</p>}
      </div>
    );
  },
};

export default blockText;
