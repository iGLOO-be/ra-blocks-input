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

export interface BlockDefinition<T extends BlockRecord = BlockRecord, C extends (Record<string, any> | undefined) = any> {
  id: IBlockTypes<T>;
  group?: string;
  label: string;
  FormComponent?: BlockForm<C extends undefined ? undefined : DefaultContext & C>;
  formDefaultValue?: any;
  disableInsert?: boolean;
  PreviewComponent?: IPreviewComponent<T, C extends undefined ? undefined : DefaultContext & C>;
}

export type IPreviewComponent<
  T extends BlockRecord = BlockRecord,
  C extends (DefaultContext | undefined) = undefined,
> = ComponentType<{
  block: T;
  context: C;
}>;
