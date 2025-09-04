import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import React from "react";
import { BlocksInputWhitoutDndContext } from "./BlocksInputWhitoutDndContext";
import type { BlockInputProps } from "./types";

export const BlocksInput = <C extends Record<string, any> | undefined>(
  props: BlockInputProps<C>,
) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <BlocksInputWhitoutDndContext<C> {...props} />
    </DndProvider>
  );
};
