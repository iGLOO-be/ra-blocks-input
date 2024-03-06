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
        <BlocksInput
          source="blocks"
          blockDefinitions={[blockText]}
          contexts={[{ id: "default", label: "Default" }]}
          defaultContextId="default"
        />
      </SimpleForm>
    </Edit>
  );
};
