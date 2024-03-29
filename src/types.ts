import { ComponentType } from "react";
import { UseFormReturn } from "react-hook-form";
import { DefaultContext } from "./BlocksInput";

export interface BlockRecord<Type extends string = any, Data = any> {
  type: Type;
  id: string;
  data?: Data;
}

export type BlockForm<C = DefaultContext> = ComponentType<{
  context: C;
  contexts: C[];
  onContextChange: (contextId: string) => void;
  form: UseFormReturn<any>;
}>;

export interface BlockDefinition<
  P extends Record<string, any> = Record<string, any>,
  C extends Record<string, any> | undefined = any,
> {
  id: string;
  group?: string;
  label: string;
  FormComponent?: BlockForm<
    C extends undefined ? undefined : DefaultContext & C
  >;
  formDefaultValue?: Partial<P>;
  disableInsert?: boolean;
  PreviewComponent?: IPreviewComponent<
    BlockRecord<any, P>,
    C extends undefined ? undefined : DefaultContext & C
  >;
}

export type IPreviewComponent<
  T extends BlockRecord = BlockRecord,
  C extends DefaultContext | undefined = undefined,
> = ComponentType<{
  block: T;
  context: C;
}>;
