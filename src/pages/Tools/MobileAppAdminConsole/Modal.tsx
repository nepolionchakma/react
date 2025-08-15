import CustomModal4 from "@/components/CustomModal/CustomModal4";
import {
  CirclePlus,
  EllipsisVertical,
  File,
  Folder,
  Plus,
  Trash,
  X,
} from "lucide-react";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Alert from "@/components/Alert/Alert";

interface TreeNode {
  id: string;
  name: string;
  order: number;
  routeName?: string;
  children?: TreeNode[];
}

interface ModalProps {
  showModal: boolean;
  editable: TreeNode;
  setEditable: React.Dispatch<React.SetStateAction<TreeNode>>;
  handleX: () => void;
  saveMenu: () => void;
}

interface EditorProps {
  index: number; // still useful for React key
  item: TreeNode;
  siblings: TreeNode[]; // 👈 NEW
  onChange: (updated: TreeNode) => void;
  onDelete: () => void;
  level: number;
  parentIndices: number[];
}

const Modal = ({
  showModal,
  editable,
  setEditable,
  handleX,
  saveMenu,
}: ModalProps) => {
  const formatToUnderscore = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("_");

  const updateNodeById = (
    node: TreeNode,
    id: string,
    updater: (n: TreeNode) => TreeNode
  ): TreeNode => {
    if (node.id === id) {
      return updater(node);
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) =>
          updateNodeById(child, id, updater)
        ),
      };
    }

    return node;
  };

  const deleteNodeById = (node: TreeNode, idToDelete: string): TreeNode => {
    if (!node.children) return node;

    const filteredChildren = node.children
      .map((child) => deleteNodeById(child, idToDelete))
      .filter((child) => child.id !== idToDelete);

    const updatedNode: TreeNode = { ...node };

    if (filteredChildren.length === 0) {
      delete updatedNode.children;
      updatedNode.routeName = formatToUnderscore(updatedNode.name);
      updatedNode.order = 1;
    } else {
      updatedNode.children = filteredChildren;
      updatedNode.routeName = undefined;
      updatedNode.order = 0;
    }

    return updatedNode;
  };

  const RecursiveEditor: React.FC<EditorProps> = ({
    item,
    onChange,
    onDelete,
    siblings,
    level,
    parentIndices,
  }) => {
    const [name, setName] = React.useState(item.name);

    React.useEffect(() => {
      setName(item.name); // in case parent updates externally
    }, [item.name]);

    const isSubmenu = Array.isArray(item.children);

    const submenuIndex = siblings
      .filter((sibling) => Array.isArray(sibling.children))
      .findIndex((sibling) => sibling.id === item.id);

    const menuItemIndex = siblings
      .filter((sibling) => !Array.isArray(sibling.children))
      .findIndex((sibling) => sibling.id === item.id);

    const currentIndices = [...parentIndices, submenuIndex + 1];

    const displayLabel = isSubmenu
      ? `${level}.${submenuIndex + 1}` // Submenu: 6.1
      : level - 1 !== 0
      ? `${level - 1}.${
          currentIndices[currentIndices.length - 2]
        }.${String.fromCharCode(97 + menuItemIndex)}`
      : `${currentIndices[currentIndices.length - 2]}.${String.fromCharCode(
          97 + menuItemIndex
        )}`;

    const handleBlur = () => {
      if (name !== item.name) {
        const updated = { ...item, name };
        if (!isSubmenu) {
          updated.routeName = formatToUnderscore(name);
        } else {
          updated.routeName = undefined;
        }
        onChange(updated);
      }
    };

    const addChild = (asSubmenu: boolean) => {
      const newChild: TreeNode = {
        id: uuidv4(),
        name: "",
        order: 1,
        ...(asSubmenu ? { children: [] } : { routeName: "" }),
      };

      const updated = {
        ...item,
        children: [...(item.children || []), newChild],
        order: 0,
        routeName: undefined,
      };
      onChange(updated);
    };

    return (
      <div className={`mt-4`} style={{ paddingLeft: `30px` }}>
        <div className="flex items-center gap-1">
          {isSubmenu ? <Folder size={16} /> : <File size={16} />}
          <p>{displayLabel}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            placeholder={isSubmenu ? "Submenu Name" : "Menu Item Name"}
            className="border-b w-full focus:outline-none"
          />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical strokeWidth={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-20">
              {isSubmenu && (
                <>
                  <button
                    className="flex gap-1 items-center hover:bg-winter-100 w-full px-2 py-1  rounded-md"
                    onClick={() => addChild(true)}
                  >
                    <CirclePlus size={16} />
                    <p>Submenu</p>
                  </button>
                  <DropdownMenuSeparator />
                  <button
                    className="flex gap-1 items-center hover:bg-winter-100 w-full px-2 py-1  rounded-md"
                    onClick={() => addChild(false)}
                  >
                    <Plus size={16} />
                    <p>Menu Item</p>
                  </button>
                  <DropdownMenuSeparator />
                </>
              )}
              <Alert
                disabled={false}
                actionName="delete"
                onContinue={onDelete}
                customButton={
                  <button className="flex gap-1 items-center hover:bg-winter-100 w-full px-2 py-1  rounded-md">
                    <Trash size={16} />
                    <p>Delete</p>
                  </button>
                }
              >
                <p>
                  {isSubmenu ? "Submenu:" : "Menu Item:"} {name}
                </p>
              </Alert>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* {isSubmenu && (
            <>
              <CustomTooltip tooltipTitle="Add Submenu">
                <button onClick={() => addChild(true)}>
                  <CirclePlus size={16} />
                </button>
              </CustomTooltip>
              <CustomTooltip
                tooltipTitle="Add Menu Item"
                tooltipAdjustmentStyle="mr-8"
              >
                <button onClick={() => addChild(false)}>
                  <Plus size={16} />
                </button>
              </CustomTooltip>
            </>
          )}
          <CustomTooltip tooltipTitle="Delete" tooltipAdjustmentStyle="mr-8">
            <button onClick={onDelete}>
              <Trash size={16} />
            </button>
          </CustomTooltip> */}
        </div>

        {isSubmenu &&
          item.children?.map((child, index) => (
            <RecursiveEditor
              index={index}
              key={child.id}
              item={child}
              siblings={item.children!}
              onChange={(updatedChild) => {
                setEditable((prev) =>
                  updateNodeById(prev, child.id, () => updatedChild)
                );
              }}
              onDelete={() => {
                setEditable((prev) => deleteNodeById(prev, child.id));
              }}
              level={level + 1}
              parentIndices={currentIndices}
            />
          ))}
      </div>
    );
  };

  return (
    <>
      {showModal && (
        <CustomModal4 className="w-[700px]">
          <div className="flex justify-between px-2 items-center bg-[#CEDEF2] h-[41px]">
            <p>Menu Structure</p>
            <button onClick={handleX}>
              <X size={20} />
            </button>
          </div>
          <div className="max-h-[90vh] overflow-auto scrollbar-thin p-4">
            <div className="flex gap-2 px-4 py-2">
              <p>Name:</p>
              <input
                required
                type="text"
                value={editable.name}
                onChange={(e) =>
                  setEditable((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border-b w-full focus:outline-none"
              />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVertical strokeWidth={1.5} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-20">
                  <DropdownMenuItem>
                    <button
                      className="flex gap-1 items-center"
                      onClick={() =>
                        setEditable((prev) => ({
                          ...prev,
                          children: [
                            ...(prev.children || []),
                            {
                              id: uuidv4(),
                              name: "",
                              order: 1,
                              children: [],
                            },
                          ],
                        }))
                      }
                    >
                      <CirclePlus size={16} />
                      <p>Submenu</p>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button
                      className="flex gap-1 items-center"
                      onClick={() =>
                        setEditable((prev) => ({
                          ...prev,
                          children: [
                            ...(prev.children || []),
                            {
                              id: uuidv4(),
                              name: "",
                              order: 1,
                              routeName: "",
                            },
                          ],
                        }))
                      }
                    >
                      <Plus size={16} />
                      <p>Menu Item</p>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="pl-8 pr-4 mt-4">
              <div className="flex items-center justify-between cursor-pointer">
                <p>Submenus:</p>
              </div>

              {editable.children?.map((child, index) => (
                <RecursiveEditor
                  index={index}
                  key={child.id}
                  item={child}
                  siblings={editable.children!}
                  onChange={(updatedChild) => {
                    setEditable((prev) =>
                      updateNodeById(prev, child.id, () => updatedChild)
                    );
                  }}
                  onDelete={() => {
                    setEditable((prev) => deleteNodeById(prev, child.id));
                  }}
                  level={1}
                  parentIndices={[editable.order || 1]}
                />
              ))}
            </div>

            <div className="w-full flex items-center justify-end mt-4 px-4">
              <button
                className="px-6 py-2 bg-black rounded-md hover:bg-black/80 text-white"
                onClick={saveMenu}
              >
                Ok
              </button>
            </div>
          </div>
        </CustomModal4>
      )}
    </>
  );
};

export default Modal;
