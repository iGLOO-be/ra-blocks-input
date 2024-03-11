import type { Identifier, XYCoord } from "dnd-core";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import {
  ErrorBoundary,
  ErrorComponent,
} from "next/dist/client/components/error-boundary";
import { HTML5Backend } from "react-dnd-html5-backend";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { DefaultValues, useFieldArray } from "react-hook-form";
import { BlockDefinition, BlockRecord } from "./types";
import clsx from "clsx";
import { Box, Button, Dialog, IconButton, alpha, styled } from "@mui/material";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Check,
  Close,
  Delete,
  Edit,
  Visibility,
} from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { nanoid } from "nanoid";
import { entries } from "lodash";

export type DefaultContext = {
  id: string;
  label: string;
  [key: string]: any;
};
type NonUndefined<T> = T extends undefined ? never : T;

const useBlockInput = <
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
  const [contextId, setContextId] = React.useState<string | undefined>(
    defaultContextId || contexts?.[0]?.id,
  );
  const context: C | undefined = contexts.find((c) => c.id === contextId);
  const onContextChange = setContextId;

  const { fields, remove, move, append, insert } = useFieldArray({
    name: source,
  });
  const blocks: BlockRecord[] = fields as any;

  const [isCreateBlockDialogOpen, setIsCreateBlockDialogOpen] =
    React.useState(false);
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
          blockData: newBlockData,
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

  const [editBlockDefinitionState, setEditBlockDefinitionState] =
    React.useState<
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
const useBlockInputContext = () => {
  const context = useContext(blockInputContext);
  if (!context) {
    throw new Error(
      "useBlockInputContext must be used within a BlocksInput component",
    );
  }
  return context;
};

export const BlocksInput = <C extends Record<string, any> | undefined>({
  source,
  blockDefinitions,
  defaultContextId,
  contexts,
}: {
  source: string;
  blockDefinitions: BlockDefinition<any, any>[];
  defaultContextId?: string;
  contexts?: NonUndefined<
    C extends undefined ? DefaultContext : DefaultContext & C
  >[];
}) => {
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
    <blockInputContext.Provider value={blockInput as any}>
      <DndProvider backend={HTML5Backend}>
        <BlocksInputView />
      </DndProvider>
    </blockInputContext.Provider>
  );
};

const BlocksInputView = () => {
  const { blocks } = useBlockInputContext();
  return (
    <div style={{ width: "100%" }}>
      <Header />
      <CreateBlockDialog />
      <EditBlockDialog />
      <PreviewBlocks />
      {blocks.length > 0 && <Footer />}
    </div>
  );
};

const Header = () => (
  <div className="flex flex-row-reverse justify-between items-center mb-4">
    <CreateBlockButton />
    <ContextSelector />
  </div>
);

const Footer = () => (
  <div className="flex flex-col justify-between items-end mt-4">
    <CreateBlockButton />
  </div>
);

const ContextSelector = () => {
  const { context, contexts, onContextChange } = useBlockInputContext();
  const onChange = useCallback(
    (e?: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e?.target.value;
      const context = contexts.find((c) => c.id === value);
      if (context) {
        onContextChange(context.id);
      }
    },
    [contexts, onContextChange],
  );
  const renderContext = useCallback((context: DefaultContext) => {
    return (
      <option key={context.id} value={context.id}>
        {context.label}
      </option>
    );
  }, []);

  if (!contexts.length) {
    return null;
  }

  return (
    <select
      value={context?.id}
      onChange={(e) => onChange(e)}
      className="border border-gray-300 rounded-md p-2"
    >
      {contexts.map(renderContext)}
    </select>
  );
};

const CreateBlockButton = () => {
  const { onCreateBlockRequest } = useBlockInputContext();
  const onButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onCreateBlockRequest();
    },
    [onCreateBlockRequest],
  );
  return (
    <Button
      color="primary"
      onClick={onButtonClick}
      variant="contained"
      size="small"
      sx={{
        fontSize: 12,
        padding: "10px 15px",
      }}
      startIcon={<Add />}
    >
      Add
    </Button>
  );
};

const PreviewBlocks = () => {
  const {
    blockDefinitions,
    blocks,
    onBlockEdit,
    onBlockMove,
    onBlockUp,
    onBlockDown,
    onBlockDelete,
  } = useBlockInputContext();

  const [selectedBlockId, setSelectedBlockId] = React.useState<string>();

  const renderBlock = useCallback(
    (block: BlockRecord, index: number) => {
      const blockDefinition = blockDefinitions.find(
        (bd) => bd.id === block.type,
      );
      if (!blockDefinition) {
        return null;
      }
      return (
        <PreviewBlock
          key={block.id}
          blockDefinition={blockDefinition as any}
          block={block}
          index={index}
          onSelect={() =>
            selectedBlockId === block.id
              ? setSelectedBlockId(undefined)
              : setSelectedBlockId(block.id)
          }
          isSelected={selectedBlockId === block.id}
          onEdit={() => onBlockEdit(index)}
          onMove={onBlockMove}
          onUp={() => onBlockUp(index)}
          onDown={() => onBlockDown(index)}
          onDelete={() => onBlockDelete(index)}
        />
      );
    },
    [
      blockDefinitions,
      onBlockEdit,
      onBlockMove,
      onBlockUp,
      onBlockDown,
      onBlockDelete,
      selectedBlockId,
    ],
  );

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setSelectedBlockId(undefined);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedBlockId(undefined);
        return;
      }
      if (!selectedBlockId) {
        return;
      }
      const index = blocks.findIndex((block) => block.id === selectedBlockId);
      if (event.shiftKey) {
        if (event.key === "ArrowUp" && event.shiftKey) {
          if (index > 0) {
            onBlockUp(index);
          }
        }
        if (event.key === "ArrowDown") {
          if (index < blocks.length - 1) {
            onBlockDown(index);
          }
        }
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        onBlockDelete(index);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBlockId, blocks, onBlockUp, onBlockDown, onBlockDelete]);

  return <div ref={ref}>{blocks.map(renderBlock)}</div>;
};

interface DragItem {
  index: number;
}
const PreviewBlock = <T extends BlockRecord, C extends DefaultContext>({
  blockDefinition,
  block,
  index,
  onSelect,
  isSelected,
  onEdit,
  onMove,
  onUp,
  onDown,
  onDelete,
}: {
  blockDefinition: BlockDefinition<T, C>;
  block: T;
  index: number;
  onSelect: () => void;
  isSelected: boolean;
  onEdit: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: "card",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: () => {
      return { index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const { context } = useBlockInputContext();
  const PreviewComponent = blockDefinition.PreviewComponent;
  if (!PreviewComponent) {
    return null;
  }

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      onClick={onSelect}
      onDoubleClick={onEdit}
      className={clsx(
        "relative group cursor-pointer transition-transform",
        isSelected && "shadow-md",
        // Scale seems to make overflow hidden
        // isSelected && "scale-[1.01]"
      )}
    >
      <div>
        <CustomErrorBoundary>
          <PreviewComponent block={block} context={context as any} />
        </CustomErrorBoundary>
      </div>
      <div
        className={clsx([
          "absolute",
          "top-0",
          "right-0",
          "left-0",
          "bottom-0",
          "opacity-0",
          "transition",
          "rounded-sm",
          "border-2",
          "border-dashed",
          isSelected
            ? "opacity-100 border-opacity-60 border-blue-500 z-20"
            : [
                "border-white",
                "z-10",
                "group-hover:opacity-100",
                "group-hover:border-blue-500",
                "group-hover:border-opacity-30",
              ],
        ])}
      >
        <div
          className={clsx([
            "absolute",
            "z-30",
            "right-5",
            "top-5",
            "bg-white",
            "p-5",
            "rounded-sm",
            "border-2",
            "border-dashed",
            "border-opacity-30",
            "border-blue-500",
            "transition-transform",
            isSelected
              ? "translate-y-0 opacity-95 visible"
              : "-translate-y-1/2 opacity-0 hidden",
          ])}
        >
          <PreviewBlockActions
            title={blockDefinition.label}
            allowEdit={blockDefinition.FormComponent !== undefined}
            onEdit={onEdit}
            onUp={onUp}
            onDown={onDown}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};
const PreviewBlockActions = ({
  onEdit,
  allowEdit,
  onUp,
  onDown,
  onDelete,
  title,
}: {
  onEdit: () => void;
  allowEdit: boolean;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
  title: string;
}) => {
  return (
    <div className="flex items-center">
      <div className="font-bold mr-5 text-greydk">{title}</div>
      <IconButton
        size="small"
        sx={{
          marginRight: "15px",
          color: "#D32F2F",
          borderColor: "#D32F2F",
          "&:hover": {
            backgroundColor: alpha("#D32F2F", 0.12),
            // Reset on mouse devices
            "@media (hover: none)": {
              backgroundColor: "transparent",
            },
          },
        }}
        onClick={() => {
          onDelete();
        }}
      >
        <Delete
          sx={{
            fontSize: 18,
          }}
        />
      </IconButton>
      {allowEdit && (
        <Button
          sx={{
            marginRight: "15px",
          }}
          color="primary"
          size="small"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onEdit();
          }}
          startIcon={
            <Edit
              sx={{
                fontSize: 18,
              }}
            />
          }
        >
          Edit
        </Button>
      )}
      <IconButton
        color="primary"
        size="small"
        sx={{
          border: "1px solid rgba(0,75,141,0.25)",
          borderRadius: "5px 0 0 5px",
          borderRight: "none",
        }}
        onClick={(event) => {
          event.stopPropagation();
          onUp();
        }}
      >
        <ArrowUpward
          sx={{
            fontSize: 18,
          }}
        />
      </IconButton>
      <IconButton
        color="primary"
        size="small"
        sx={{
          border: "1px solid rgba(0,75,141,0.25)",
          borderRadius: "0 5px 5px 0",
        }}
        onClick={(event) => {
          event.stopPropagation();
          onDown();
        }}
      >
        <ArrowDownward
          sx={{
            fontSize: 18,
          }}
        />
      </IconButton>
    </div>
  );
};

const CreateBlockDialog = () => {
  const {
    blockDefinitions,
    onBlockCreate,
    isCreateBlockDialogOpen,
    onCloseCreateBlockDialog,
  } = useBlockInputContext();

  const groupedBlockDefinitions = entries(
    blockDefinitions
      .filter((blockDefinition) => !blockDefinition.disableInsert)
      .reduce(
        (acc, blockDefinition) => {
          if (blockDefinition.group) {
            if (!acc[blockDefinition.group]) {
              acc[blockDefinition.group] = [];
            }
            acc[blockDefinition.group].push(blockDefinition);
          } else {
            if (!acc[""]) {
              acc[""] = [];
            }
            acc[""].push(blockDefinition);
          }
          return acc;
        },
        {} as Record<string, BlockDefinition[]>,
      ),
  );

  const onSelect = useCallback(
    (blockDefinitionId: string) => {
      onBlockCreate(blockDefinitionId);
      onCloseCreateBlockDialog();
    },
    [onBlockCreate, onCloseCreateBlockDialog],
  );
  const renderOption = useCallback(
    (blockDefinition: BlockDefinition) => {
      return (
        <CreateBlockDialogCard
          key={blockDefinition.id}
          blockDefinition={blockDefinition}
          onSelect={onSelect}
        />
      );
    },
    [onSelect],
  );

  return (
    <Dialog
      open={isCreateBlockDialogOpen}
      onClose={onCloseCreateBlockDialog}
      maxWidth="lg"
    >
      {isCreateBlockDialogOpen && (
        <div className="flex flex-col p-5">
          {groupedBlockDefinitions.map(([group, blockDefinitions]) => {
            return (
              <div key={group}>
                {group && <h2 className="text-lg font-bold mb-3">{group}</h2>}
                <div className="grid grid-cols-4 gap-4 justify-between mb-5">
                  {blockDefinitions.map(renderOption)}
                </div>
              </div>
            );
          })}
          <div className="border-t border-gray-200 pt-2">
            <Button
              onClick={onCloseCreateBlockDialog}
              size="small"
              startIcon={<Close />}
              sx={{
                fontSize: 12,
                padding: "10px 15px",
                marginRight: 15,
              }}
              color="primary"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
const CreateBlockDialogCard = ({
  blockDefinition,
  onSelect,
}: {
  blockDefinition: BlockDefinition;
  onSelect: (blockDefinitionId: string) => void;
}) => {
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(blockDefinition.id);
    },
    [blockDefinition.id, onSelect],
  );
  return (
    <button
      onClick={onClick}
      className="p-5 border border-gray-200 rounded-md hover:bg-gray-100"
    >
      {blockDefinition.label}
    </button>
  );
};

const EditBlockDialog = () => {
  const {
    editBlockDefinition,
    onBlockFormClose,
    onBlockFormSave,
    editBlockDefinitionState,
  } = useBlockInputContext();
  const isOpen = !!editBlockDefinition;
  return (
    <Dialog
      open={isOpen}
      fullScreen
      onClose={onBlockFormClose}
      fullWidth
      disableEnforceFocus={true}
    >
      {isOpen && (
        <EditBlockDialogForm
          blockDefinition={editBlockDefinition}
          onCancel={onBlockFormClose}
          onSave={onBlockFormSave}
          initialValues={editBlockDefinitionState?.blockData}
        />
      )}
    </Dialog>
  );
};

const FormContainer = styled(Box)(({ theme }) => ({
  "& .RaSimpleFormIterator-line": {
    flexDirection: "column",
    borderRadius: "5px",
    border: "2px dashed white",
    padding: "10px",
  },
  "& .RaSimpleFormIterator-form": {
    alignItems: "normal !important",
  },
  "& .RaSimpleFormIterator-line:hover": {
    border: `1px dashed ${theme.palette.primary.main}`,
  },
  "& .RaArrayInput-label": {
    fontSize: "16px",
    fontWeight: "bold",
  },
}));

const EditBlockDialogForm = <
  P extends Record<string, any>,
  C extends DefaultContext | undefined,
>({
  blockDefinition,
  initialValues,
  onCancel,
  onSave,
}: {
  blockDefinition: BlockDefinition<P, C> | undefined;
  initialValues?: DefaultValues<P>;
  onCancel: () => void;
  onSave: (values: P) => void;
}) => {
  const { context, contexts, onContextChange } = useBlockInputContext();
  const form = useForm({
    defaultValues: initialValues,
  });
  form.watch();
  const { handleSubmit } = form;

  const FormComponent = blockDefinition?.FormComponent;
  if (!FormComponent) {
    return null;
  }

  const PreviewComponent = blockDefinition?.PreviewComponent;

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col flex-1 overflow-hidden"
        onSubmit={handleSubmit((values) => {
          onSave(values);
        })}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>{blockDefinition.label}</div>
          <div>
            <Button
              onClick={onCancel}
              size="small"
              startIcon={<Close />}
              sx={{
                fontSize: 12,
                padding: "10px 15px",
                marginRight: "15px",
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              variant="contained"
              size="small"
              sx={{
                fontSize: 12,
                padding: "10px 15px",
              }}
              startIcon={<Check />}
            >
              Submit
            </Button>
          </div>
        </div>
        <PanelGroup direction="horizontal">
          <Panel
            defaultSize={30}
            minSize={20}
            style={{
              overflowY: "auto",
            }}
            className="flex"
          >
            <div className="p-5 flex-1">
              <FormContainer>
                <FormComponent
                  context={context as any}
                  contexts={contexts as any}
                  onContextChange={onContextChange}
                  form={form}
                />
              </FormContainer>
            </div>
          </Panel>
          <PanelResizeHandle
            className={clsx([
              "border-l-2",
              "border-r-2",
              "border-gray-200",
              "opacity-0",
              "transition-opacity",
              "hover:opacity-100",
            ])}
          />
          <Panel
            defaultSize={70}
            minSize={20}
            className={clsx(
              "flex",
              "flex-col",
              "flex-1",
              "overflow-auto",
              "border-l",
              "border-gray-200",
            )}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div className="flex items-center">
                <Visibility fontSize="small" className="mr-2" />
                <h1>Preview your content</h1>
              </div>
              <div>
                <ContextSelector />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {PreviewComponent && (
                <CustomErrorBoundary>
                  <PreviewComponent
                    block={
                      {
                        type: blockDefinition.id,
                        data: form.getValues(),
                      } as BlockRecord
                    }
                    context={context as any}
                  />
                </CustomErrorBoundary>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </form>
    </FormProvider>
  );
};

const CustomErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary errorComponent={CustomErrorBoundaryErrorComponent}>
      {children}
    </ErrorBoundary>
  );
};

const CustomErrorBoundaryErrorComponent: ErrorComponent = ({
  error,
  reset,
}) => (
  <div className="m-5">
    <h1 className="mb-4 text-red-500 text-2xl"> Something went wrong</h1>

    <pre className="mb-4">{error.message}</pre>

    <Button onClick={() => reset()} variant="contained">
      Reset
    </Button>
  </div>
);
