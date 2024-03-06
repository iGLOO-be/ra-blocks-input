"use client";
import { dataProvider } from "@/app/dataProvider";
import { Admin, Resource } from "react-admin";
import { PagesEdit, PagesList } from "./ResourcePage";

const AdminApp = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="pages" list={PagesList} edit={PagesEdit} />
  </Admin>
);

export default AdminApp;
