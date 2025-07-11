import CustomModal4 from "@/components/CustomModal/CustomModal4";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import { CirclePlus, Plus, Trash, X } from "lucide-react";
import React from "react";
import { v4 as uuidv4 } from "uuid";

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
  index: number;
  item: TreeNode;
  onChange: (updated: TreeNode) => void;
  onDelete: () => void;
  level?: number;
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
    index,
    item,
    onChange,
    onDelete,
    level = 0,
  }) => {
    const isSubmenu = Array.isArray(item.children);

    const [name, setName] = React.useState(item.name);

    React.useEffect(() => {
      setName(item.name); // in case parent updates externally
    }, [item.name]);

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
      <div className={`mt-4`} style={{ paddingLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-2">
          <p>{`${level + 1}.${index + 1}.`}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            placeholder={isSubmenu ? "Submenu Name" : "Menu Item Name"}
            className="border-b w-full focus:outline-none"
          />
          {isSubmenu && (
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
          </CustomTooltip>
        </div>

        {isSubmenu &&
          item.children?.map((child, index) => (
            <RecursiveEditor
              index={index}
              key={child.id}
              item={child}
              onChange={(updatedChild) => {
                setEditable((prev) =>
                  updateNodeById(prev, child.id, () => updatedChild)
                );
              }}
              onDelete={() => {
                setEditable((prev) => deleteNodeById(prev, child.id));
              }}
              level={level + 1}
            />
          ))}
      </div>
    );
  };

  return (
    <>
      {showModal && (
        <CustomModal4>
          <div className="min-w-[700px] max-h-[80vh] overflow-y-auto overflow-x-auto pb-4 scrollbar-thin">
            <div className="bg-[#CEDEF2] px-4 py-2 w-full flex justify-between items-center fixed z-50">
              <p>Menu Structure</p>
              <button onClick={handleX}>
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 px-4 py-2 mt-12">
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
            </div>

            <div className="pl-8 pr-4 mt-4">
              <div className="flex items-center justify-between cursor-pointer">
                <p>Submenus:</p>
                <div className="flex gap-2">
                  <button
                    className="text-white rounded-md bg-winter-400 px-3 py-2 hover:bg-winter-300 flex gap-1"
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
                    <CirclePlus />
                    <p>Submenu</p>
                  </button>
                  <button
                    className="text-white rounded-md bg-winter-400 px-3 py-2 hover:bg-winter-300 flex gap-1"
                    onClick={() =>
                      setEditable((prev) => ({
                        ...prev,
                        children: [
                          ...(prev.children || []),
                          {
                            id: uuidv4(),
                            name: "",
                            order: 1,
                            routeName: "New_Item",
                          },
                        ],
                      }))
                    }
                  >
                    <Plus />
                    <p>Menu Item</p>
                  </button>
                </div>
              </div>

              {editable.children?.map((child, index) => (
                <RecursiveEditor
                  index={index}
                  key={child.id}
                  item={child}
                  onChange={(updatedChild) => {
                    setEditable((prev) =>
                      updateNodeById(prev, child.id, () => updatedChild)
                    );
                  }}
                  onDelete={() => {
                    setEditable((prev) => deleteNodeById(prev, child.id));
                  }}
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
