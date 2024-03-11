import { ArrayInput, SimpleFormIterator, TextInput } from "react-admin";
import { BlockDefinition } from "../../../src/types";

export const blockList: BlockDefinition = {
  id: "list",
  label: "List",
  formDefaultValue: {
    links: [{ url: "https://example.com" }],
  },
  FormComponent: () => {
    return (
      <>
        <ArrayInput source="links">
          <SimpleFormIterator>
            <TextInput source="url" />
          </SimpleFormIterator>
        </ArrayInput>
      </>
    );
  },
  PreviewComponent: ({ block }) => {
    return <pre>{JSON.stringify(block.data, null, 2)}</pre>;
  },
};

export default blockList;
