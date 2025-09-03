import { createContext, useCallback, useContext, useState } from "react";
import { useFieldArray } from "react-hook-form";
import {
  BlockDefinition,
  BlockRecord,
  DefaultContext,
  NonUndefined,
} from "./types";
import { nanoid } from "nanoid";

export const useBlockInput = <
  P extends Record<string, any>,
  C extends DefaultContext | undefined,
>({
  source,
  blockDefinitions,
  defaultContextId,
  contexts = [],
}: {
  source: string;
  blockDefinitions: Array<BlockDefinition<P, C>>;
  defaultContextId?: string;
  contexts?: NonUndefined<C>[];
}) => {
  const [contextId, setContextId] = useState<string | undefined>(
    defaultContextId || contexts?.[0]?.id,
  );
  const context: C | undefined = contexts.find((c) => c.id === contextId);
  const onContextChange = setContextId;

  const { fields, remove, move, append, insert } = useFieldArray({
    name: source,
  });
  const blocks: BlockRecord[] = fields as any;

  const [isCreateBlockDialogOpen, setIsCreateBlockDialogOpen] = useState(false);
  const onBlockCreate = useCallback(
    (blockDefinitionId: string) => {
      const blockDefinition = blockDefinitions.find(
        (bd) => bd.id === blockDefinitionId,
      );
      if (!blockDefinition) {
        return;
      }

      const newBlockData = {
        ...blockDefinition.formDefaultValue,
        id: nanoid(),
      };

      if (blockDefinition.FormComponent) {
        setEditBlockDefinitionState({
          blockDefinitionId: blockDefinitionId,
          blockData: newBlockData as any,
        });
      } else {
        append({
          type: blockDefinitionId,
          data: newBlockData,
        });
      }
    },
    [append, blockDefinitions],
  );
  const onCreateBlockRequest = useCallback(() => {
    setIsCreateBlockDialogOpen(true);
  }, []);
  const onCloseCreateBlockDialog = useCallback(() => {
    setIsCreateBlockDialogOpen(false);
  }, []);

  const [editBlockDefinitionState, setEditBlockDefinitionState] = useState<
    | {
        blockDefinitionId: string;
        blockData: P;
        blockId?: string;
      }
    | undefined
  >(undefined);
  const editBlockDefinition = blockDefinitions.find(
    (bd) => bd.id === editBlockDefinitionState?.blockDefinitionId,
  );
  const onBlockFormClose = useCallback(() => {
    setEditBlockDefinitionState(undefined);
  }, []);
  const onBlockFormSave = useCallback(
    (values: P) => {
      onBlockFormClose();

      const newBlock = {
        type: editBlockDefinitionState?.blockDefinitionId || "",
        data: values,
      } as BlockRecord;

      if (editBlockDefinitionState?.blockId) {
        const prevIndex = blocks.findIndex(
          (block) => block.id === editBlockDefinitionState?.blockId,
        );
        if (prevIndex !== -1) {
          remove(prevIndex);
          insert(prevIndex, newBlock);
          return;
        }
      }
      append(newBlock);
    },
    [
      append,
      insert,
      remove,
      onBlockFormClose,
      blocks,
      editBlockDefinitionState,
    ],
  );
  const onBlockEdit = useCallback(
    (index: number) => {
      const blockDefinition = blockDefinitions.find(
        (bd) => bd.id === blocks[index].type,
      );
      if (!blockDefinition || !blockDefinition.FormComponent) {
        return;
      }
      setEditBlockDefinitionState({
        blockDefinitionId: blocks[index].type,
        blockData: blocks[index].data,
        blockId: blocks[index].id,
      });
    },
    [blocks, blockDefinitions],
  );

  const onBlockMove = move;
  const onBlockUp = useCallback(
    (index: number) => {
      if (index === 0) {
        return;
      }
      move(index, index - 1);
    },
    [move],
  );
  const onBlockDown = useCallback(
    (index: number) => {
      if (index === blocks.length - 1) {
        return;
      }
      move(index, index + 1);
    },
    [move, blocks],
  );
  const onBlockDelete = useCallback(
    (index: number) => {
      if (window.confirm("Are you sure?")) {
        remove(index);
      }
    },
    [remove],
  );

  return {
    blockDefinitions,
    blocks,
    context,
    contexts,
    onContextChange,
    onBlockCreate,
    isCreateBlockDialogOpen,
    onCreateBlockRequest,
    onCloseCreateBlockDialog,
    editBlockDefinition,
    editBlockDefinitionState,
    onBlockFormClose,
    onBlockFormSave,
    onBlockEdit,
    onBlockMove,
    onBlockUp,
    onBlockDown,
    onBlockDelete,
  };
};

const blockInputContext = createContext<
  ReturnType<typeof useBlockInput> | undefined
>(undefined);

export const BlockInputContextProvider = blockInputContext.Provider;

export const useBlockInputContext = () => {
  const context = useContext(blockInputContext);
  if (!context) {
    throw new Error(
      "useBlockInputContext must be used within a BlocksInput component",
    );
  }
  return context;
};
