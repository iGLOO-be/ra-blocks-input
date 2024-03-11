import React from "react";
import {
  Datagrid,
  Edit,
  List,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";
import { BlocksInput } from "@igloo-be/ra-blocks-input";
import blockText from "./BlockText";
import blockList from "./BlockList";

export const PagesList: React.FC = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
    </Datagrid>
  </List>
);

export const PagesEdit: React.FC = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" />
        <div className="mb-7 w-full">
          <BlocksInput source="blocks" blockDefinitions={[blockText]} />
        </div>
        <BlocksInput
          source="blocksWithContext"
          blockDefinitions={[blockText, blockList]}
          contexts={[
            { id: "default", label: "Default", title: "Default Context" },
            { id: "other", label: "Other", title: "other Context" },
          ]}
          defaultContextId="default"
        />
      </SimpleForm>
    </Edit>
  );
};
