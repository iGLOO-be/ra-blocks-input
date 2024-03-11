import React from "react";
import {
  Datagrid,
  Edit,
  FormTab,
  List,
  TabbedForm,
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

const blockDefinitions = [blockText, blockList];

export const PagesEdit: React.FC = () => {
  return (
    <Edit>
      <TabbedForm>
        <FormTab label="Details">
          <TextInput source="name" />
        </FormTab>
        <FormTab label="Without context">
          <BlocksInput source="blocks" blockDefinitions={blockDefinitions} />
        </FormTab>
        <FormTab label="With contexts">
          <BlocksInput
            source="blocksWithContext"
            blockDefinitions={blockDefinitions}
            contexts={[
              { id: "default", label: "Default", title: "Default Context" },
              { id: "other", label: "Other", title: "other Context" },
            ]}
            defaultContextId="default"
          />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};
