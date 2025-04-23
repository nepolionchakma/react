import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import {
  Dot,
  ChevronRightIcon,
  Pencil,
  Trash,
  Expand,
  Minimize,
  Plus,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Modal from "./Modal";

interface MenuItem {
  name: string;
  routeName?: string;
  menuItems?: MenuItem[];
}

export interface MenuStructure {
  submenu: string;
  subMenus: MenuItem[];
}

interface IMenuTypes {
  menu_id: number;
  menu_code: string;
  menu_name: string;
  menu_desc: string;
  menu_structure: MenuStructure[];
}

const TreeView = () => {
  const api = useAxiosPrivate();
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const { toast } = useToast();
  const [data, setData] = useState<IMenuTypes[]>([]);
  const [menuData, setMenuData] = useState<MenuStructure[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState("");
  const [editable, setEditable] = useState<MenuStructure>({
    submenu: "",
    subMenus: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("");

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
  }, [api, url]);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const allKeys: Record<string, boolean> = {};
    menuData.forEach((menu) => {
      allKeys[menu.submenu] = true;
      menu.subMenus.forEach((sub) => {
        if ("menuItems" in sub) allKeys[`${menu.submenu}-${sub.name}`] = true;
      });
    });
    setOpenMenus(allKeys);
  };

  const collapseAll = () => {
    setOpenMenus({});
  };

  const handleEditClick = (submenu: string) => {
    setSelected(submenu);
    setShowModal(true);
    const selectedSubmenu = menuData.find((item) => item.submenu === submenu);
    if (selectedSubmenu) {
      setEditable(selectedSubmenu);
    }
  };

  const handleX = () => {
    setShowModal(false);
    setSelected("");
    setEditable({
      submenu: "",
      subMenus: [],
    });
  };

  const saveMenu = () => {
    if (selected === "" && editable.subMenus.length > 0) {
      setMenuData((prev) => [...prev, editable]);
      setShowModal(false);
      setTimeout(() => {
        setSelected("");
        setEditable({
          submenu: "",
          subMenus: [],
        });
      }, 200);
    } else {
      const index = menuData.findIndex((item) => item.submenu === selected);
      if (index !== -1) {
        menuData[index] = editable;
      }
      setShowModal(false);
      setTimeout(() => {
        setSelected("");
        setEditable({
          submenu: "",
          subMenus: [],
        });
      }, 200);
    }
    toast({ title: "Don't forget to save the changed data to the Database" });
  };

  const handleDelete = (name: string) => {
    const newMenuData = menuData.filter((item) => item.submenu !== name);
    setMenuData(newMenuData);
  };

  const saveToDatabase = async () => {
    try {
      const res = await api.put(`${url}/mobile-menu/${data[0].menu_id}`, {
        menu_code: data[0].menu_code,
        menu_name: data[0].menu_name,
        menu_desc: data[0].menu_desc,
        menu_structure: menuData,
      });
      if (res.status === 201) {
        toast({ title: "The menu structure has been updated to the Database" });
      }
    } catch (error) {
      toast({ title: "Error updating the menu structure." });
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        {/**Expand All Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={expandAll}
                className="w-8 h-8 flex justify-center items-center bg-winter-400 rounded-full hover:bg-winter-300"
              >
                <Expand size={18} color="white" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Expand All</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/**Collasp All Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={collapseAll}
                className="w-8 h-8 flex justify-center items-center bg-winter-400 rounded-full hover:bg-winter-300"
              >
                <Minimize size={18} color="white" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Collasp All</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/**Add New Submenu Button */}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="w-8 h-8 flex justify-center items-center bg-winter-400 rounded-full hover:bg-winter-300"
                onClick={() => setShowModal(true)}
              >
                <Plus size={18} color="white" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new submenu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/**Save to Database Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="w-8 h-8 flex justify-center items-center bg-winter-400 rounded-full hover:bg-winter-300"
                onClick={saveToDatabase}
              >
                <Save size={18} color="white" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save to Database</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {menuData.map((menu) => (
        <div key={menu.submenu} className="mb-2">
          <div
            className="cursor-pointer flex items-center gap-4 text-lg"
            onMouseOver={() => setHovered(menu.submenu)}
            onMouseLeave={() => setHovered("")}
          >
            <div
              className="flex items-center gap-1"
              onClick={() => toggleMenu(menu.submenu)}
            >
              <ChevronRightIcon size={20} />
              <p>{menu.submenu}</p>
            </div>
            {hovered === menu.submenu && (
              <div className="flex items-center gap-1">
                {/**Edit Submenu Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-[0.3rem] rounded-full bg-winter-400"
                        onClick={() => handleEditClick(menu.submenu)}
                      >
                        <Pencil size={16} color="white" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Submenu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/**Delete Submenu */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-[0.3rem] rounded-full bg-winter-400"
                        onClick={() => handleDelete(menu.submenu)}
                      >
                        <Trash size={16} color="white" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Submenu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <div
            className={`pl-4 transition-all duration-300 ease-in-out overflow-hidden ${
              openMenus[menu.submenu] ? "max-h-screen" : "max-h-0"
            }`}
          >
            {menu.subMenus.map((sub) => (
              <div key={sub.name} className="mt-1">
                {"menuItems" in sub ? (
                  <>
                    <div
                      className="cursor-pointer flex items-center gap-1"
                      onClick={() => toggleMenu(`${menu.submenu}-${sub.name}`)}
                    >
                      <ChevronRightIcon size={20} />
                      <p className="text-gray-700">{sub.name}</p>
                    </div>
                    <div
                      className={`pl-4 transition-all duration-300 ease-in-out overflow-hidden ${
                        openMenus[`${menu.submenu}-${sub.name}`]
                          ? "max-h-screen"
                          : "max-h-0"
                      }`}
                    >
                      {sub.menuItems !== undefined &&
                        sub.menuItems.map((item) => (
                          <div
                            key={item.routeName}
                            className="flex items-center gap-1 mt-1"
                          >
                            <Dot size={20} />
                            <p className="text-sm text-gray-600">{item.name}</p>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    {" "}
                    <Dot size={20} />
                    <p className="text-sm text-gray-600">{sub.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal
        showModal={showModal}
        editable={editable}
        setEditable={setEditable}
        handleX={handleX}
        saveMenu={saveMenu}
      />
    </div>
  );
};

export default TreeView;
