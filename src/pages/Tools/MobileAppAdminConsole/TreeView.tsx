import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import {
  CircleChevronRight,
  CircleChevronDown,
  CircleDot,
  Expand,
  Minimize,
  Plus,
  Pencil,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Modal from "./Modal";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Alert from "@/components/Alert/Alert";
import { v4 as uuidv4 } from "uuid";
import { putData } from "@/Utility/funtion";
import Spinner from "@/components/Spinner/Spinner";

interface TreeNode {
  id: string;
  name: string;
  order: number;
  routeName?: string;
  children?: TreeNode[];
}

interface IMenuTypes {
  menu_id: number;
  menu_code: string;
  menu_name: string;
  menu_desc: string;
  menu_structure: TreeNode[];
}

const TreeView = () => {
  const api = useAxiosPrivate();
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const { toast } = useToast();
  const [data, setData] = useState<IMenuTypes[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [menuData, setMenuData] = useState<TreeNode[]>([]);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState("");
  const [editable, setEditable] = useState<TreeNode>({
    id: uuidv4(),
    name: "",
    order: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("");
  // const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

  //Fetch Mobile Menu Structure
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`${url}/mobile-menu`);
        console.log(res);
        setData(res.data);
        setMenuData(res.data[0].menu_structure);
      } catch (error) {
        toast({ title: "Error fetching data from the Database" });
      }
    };
    fetchData();
  }, [api, toast, url]);

  const toggleNode = (path: string) => {
    setOpenNodes((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getAllPaths = (nodes: TreeNode[], parentPath = ""): string[] => {
    let paths: string[] = [];

    for (const node of nodes) {
      const path = `${parentPath}/${node.name}`;
      if (node.children && node.children.length > 0) {
        paths.push(path);
        paths = [...paths, ...getAllPaths(node.children, path)];
      }
    }

    return paths;
  };

  const expandAll = () => {
    const allPaths = getAllPaths(menuData);
    const expandedState: Record<string, boolean> = {};
    allPaths.forEach((path) => {
      expandedState[path] = true;
    });
    setOpenNodes(expandedState);
  };

  const collapseAll = () => {
    setOpenNodes({});
  };

  const handleEditClick = (name: string) => {
    setSelected(name);
    setShowModal(true);
    const selectedSubmenu = menuData.find((item) => item.name === name);
    if (selectedSubmenu) {
      setEditable(selectedSubmenu);
    }
  };

  const handleX = () => {
    setShowModal(false);
    setSelected("");
    setEditable({
      id: "",
      name: "",
      order: 0,
    });
  };

  const saveMenu = () => {
    const hasValidationError = (node: TreeNode): string | null => {
      if (!node.name.trim()) {
        return "All name fields must be filled at every level.";
      }

      if (node.children) {
        if (node.children.length === 0) {
          return `Submenu "${node.name}" must contain at least one menu item.`;
        }

        const hasMenuItem = node.children.some((child) => !!child.routeName);
        if (!hasMenuItem) {
          return `Submenu "${node.name}" must contain at least one menu item.`;
        }

        for (const child of node.children) {
          const error = hasValidationError(child);
          if (error) return error;
        }
      }

      return null;
    };

    const errorMessage = hasValidationError(editable);

    if (errorMessage) {
      toast({
        variant: "destructive",
        description: errorMessage,
      });
      return;
    }

    if (selected === "") {
      if (editable.children?.length === 0) {
        toast({
          description: `Submenu ${editable.name} must contain children`,
          variant: "destructive",
        });
        return;
      } else {
        setMenuData((prev) => [...prev, editable]);
      }
    } else {
      const index = menuData.findIndex((item) => item.name === selected);
      if (index !== -1) {
        const updated = [...menuData];
        updated[index] = editable;
        setMenuData(updated);
      }
    }

    setShowModal(false);
    setTimeout(() => {
      setSelected("");
      setEditable({
        id: "",
        name: "",
        order: 0,
      });
    }, 200);

    toast({
      title: "Don't forget to save the changed data to the Database",
    });
  };

  const handleDelete = (name: string) => {
    const newMenuData = menuData.filter((item) => item.name !== name);
    setMenuData(newMenuData);
  };

  const saveToDatabase = async () => {
    const putParams = {
      baseURL: url,
      url: `/mobile-menu/${data[0].menu_id}`,
      setLoading: setIsSaving,
      payload: {
        menu_code: data[0].menu_code,
        menu_name: data[0].menu_name,
        menu_desc: data[0].menu_desc,
        menu_structure: menuData,
      },
    };

    await putData(putParams);
  };

  const renderTree = (nodes: TreeNode[], parentPath = "", level = 0) => {
    return nodes
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((node) => {
        const path = `${parentPath}/${node.name}`;
        const hasChildren =
          Array.isArray(node.children) && node.children.length > 0;
        const isOpen = openNodes[path];

        return (
          <div key={path} className={`mt-2 ${level !== 0 && "pl-8"}`}>
            <div
              className={`cursor-pointer flex justify-between items-center ${
                hasChildren &&
                level === 0 &&
                "h-10 w-full px-2 bg-light-200 rounded-md"
              } `}
              onMouseOver={() => setHovered(node.name)}
              onMouseLeave={() => setHovered("")}
            >
              <div
                className="flex gap-1 items-center"
                onClick={() => hasChildren && toggleNode(path)}
              >
                {hasChildren ? (
                  isOpen ? (
                    <CircleChevronDown size={18} />
                  ) : (
                    <CircleChevronRight size={18} />
                  )
                ) : (
                  <CircleDot size={16} />
                )}
                <p className="text-sm text-gray-700">{node.name}</p>
                {node.routeName && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({node.routeName})
                  </span>
                )}
              </div>

              {hovered === node.name && level === 0 && (
                <div className="flex items-center gap-1">
                  <CustomTooltip tooltipTitle="Edit Submenu">
                    <button onClick={() => handleEditClick(node.name)}>
                      <Pencil color="black" />
                    </button>
                  </CustomTooltip>

                  <Alert
                    disabled={false}
                    tooltipTitle="Delete Submenu"
                    actionName="delete"
                    onContinue={() => handleDelete(node.name)}
                  />
                </div>
              )}
            </div>

            {hasChildren && isOpen && (
              <div>{renderTree(node.children!, path, level + 1)}</div>
            )}
          </div>
        );
      });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={expandAll}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          <Expand size={16} />
          Expand All
        </button>

        <button
          onClick={collapseAll}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          <Minimize size={16} />
          Collapse All
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          <Plus size={18} color="white" />
          <p>Add Submenu</p>
        </button>

        <button
          onClick={saveToDatabase}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          {isSaving ? (
            <Spinner color="white" size="30" />
          ) : (
            <>
              {" "}
              <Save size={18} color="white" />
              <p>Save to Database</p>
            </>
          )}
        </button>
      </div>

      <div>{renderTree(menuData)}</div>

      <Modal
        showModal={showModal}
        editable={editable}
        setEditable={setEditable}
        handleX={handleX}
        saveMenu={saveMenu}
        // alphabet={alphabet}
      />
    </div>
  );
};

export default TreeView;
