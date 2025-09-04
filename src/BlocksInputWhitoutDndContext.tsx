import React from "react";
import { BlockInputProps, BlockRecord, DefaultContext } from "./types";
import { BlocksInputView } from "./BlocksInputView";
import { BlockInputContextProvider, useBlockInput } from "./context";

export const BlocksInputWhitoutDndContext = <
  C extends Record<string, any> | undefined,
>({
  source,
  blockDefinitions,
  defaultContextId,
  contexts,
}: BlockInputProps<C>) => {
  const blockInput = useBlockInput<
    BlockRecord,
    C extends undefined ? any : DefaultContext & C
  >({
    source,
    blockDefinitions,
    defaultContextId,
    contexts,
  });
  return (
    <BlockInputContextProvider value={blockInput as any}>
      <BlocksInputView />
    </BlockInputContextProvider>
  );
};
