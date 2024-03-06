import { ComponentType } from "react";
import { UseFormReturn } from "react-hook-form";
import { DefaultContext } from "./BlocksInput";

type IBlockTypes<T extends BlockRecord> = T["type"];

export interface BlockRecord<Type extends string = any, Data = any> {
  type: Type;
  id: string;
  data?: Data;
}

export type BlockForm<C = DefaultContext> = ComponentType<{
  context: C;
  contexts: C[];
  onContextChange: (contextId: string) => void;
  form: UseFormReturn;
}>;

export interface BlockDefinition<C = DefaultContext, T extends BlockRecord = BlockRecord> {
  id: IBlockTypes<T>;
  group?: string;
  label: string;
  FormComponent?: BlockForm<C>;
  formDefaultValue?: any;
  disableInsert?: boolean;
  PreviewComponent?: IPreviewComponent<C, T>;
}

export type IPreviewComponent<
  C = DefaultContext,
  T extends BlockRecord = BlockRecord,
> = ComponentType<{
  block: T;
  context: C;
}>;
