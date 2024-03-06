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
