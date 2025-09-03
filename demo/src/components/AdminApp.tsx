"use client";
import { dataProvider } from "@/app/dataProvider";
import { Admin, Resource } from "react-admin";
import { PagesEdit, PagesList } from "./ResourcePage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const AdminApp = () => (
  <DndProvider backend={HTML5Backend}>
    <Admin dataProvider={dataProvider}>
      <Resource name="pages" list={PagesList} edit={PagesEdit} />
    </Admin>
  </DndProvider>
);

export default AdminApp;
