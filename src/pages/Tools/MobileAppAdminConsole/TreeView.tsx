import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash,
  Expand,
  Minimize,
  Plus,
  Save,
  CircleChevronRight,
  CircleChevronDown,
  Dot,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Modal from "./Modal";
import CustomTooltip from "@/components/Tooltip/Tooltip";
import Alert from "@/components/Alert/Alert";

interface MenuItem {
  name: string;
  routeName: string;
}

interface Submenu {
  name: string;
  routeName?: string;
  menuItems?: MenuItem[];
  order: number;
}

export interface MenuStructure {
  submenu: string;
  subMenus: Submenu[];
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
  const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

  console.log(editable);

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
    if (!editable.submenu.trim()) {
      toast({
        title: "The main menu name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (editable.subMenus.length === 0) {
      toast({
        title: `There is no submenu in ${editable.submenu}`,
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < editable.subMenus.length; i++) {
      const submenu = editable.subMenus[i];

      // Check if submenu name is empty
      if (!submenu.name.trim()) {
        toast({
          title: `Submenu ${i + 1} name cannot be empty.`,
          variant: "destructive",
        });

        return;
      }

      if (submenu.menuItems) {
        for (let j = 0; j < submenu.menuItems.length; j++) {
          const menuItem = submenu.menuItems[j];
          if (!menuItem.name.trim()) {
            toast({
              title: `Menu item ${alphabet[j]}. under submenu ${
                i + 1
              } cannot be empty.`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

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
        <button
          onClick={expandAll}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          <Expand size={18} color="white" />
          <p>Expand All</p>
        </button>

        {/**Collasp All Button */}
        <button
          onClick={collapseAll}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          <Minimize size={18} color="white" />
          <p>Collasp All</p>
        </button>

        {/**Add New Submenu Button */}
        <button
          onClick={() => setShowModal(true)}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          <Plus size={18} color="white" />
          <p>Add Submenu</p>
        </button>

        {/**Save to Database Button */}
        <button
          onClick={saveToDatabase}
          className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
        >
          <Save size={18} color="white" />
          <p>Save to Database</p>
        </button>
      </div>

      {menuData.map((menu) => (
        <div key={menu.submenu} className="mb-2">
          <div
            className="cursor-pointer flex justify-between items-center gap-4 text-lg bg-light-200 p-2 rounded-md"
            onMouseOver={() => setHovered(menu.submenu)}
            onMouseLeave={() => setHovered("")}
          >
            <div
              className="flex items-center gap-1"
              onClick={() => toggleMenu(menu.submenu)}
            >
              {openMenus[menu.submenu] ? (
                <CircleChevronDown size={20} strokeWidth={1.5} />
              ) : (
                <CircleChevronRight size={20} strokeWidth={1.5} />
              )}
              <p>{menu.submenu}</p>
            </div>
            {hovered === menu.submenu && (
              <div className="flex items-center gap-1">
                {/**Edit Submenu Button */}
                <CustomTooltip tooltipTitle="Edit Submenu">
                  <button onClick={() => handleEditClick(menu.submenu)}>
                    <Pencil color="black" />
                  </button>
                </CustomTooltip>

                {/**Delete Submenu */}
                <Alert
                  disabled={false}
                  tooltipTitle="Delete Submenu"
                  actionName="delete"
                  onContinue={() => handleDelete(menu.submenu)}
                />
              </div>
            )}
          </div>

          <div
            className={`pl-4 transition-all duration-300 ease-in-out overflow-hidden ${
              openMenus[menu.submenu] ? "max-h-screen" : "max-h-0"
            }`}
          >
            {menu.subMenus
              .sort((a, b) => a.order - b.order)
              .map((sub) => (
                <div key={sub.name} className="mt-1">
                  {"menuItems" in sub ? (
                    <>
                      <div
                        className="cursor-pointer flex items-center gap-1"
                        onClick={() =>
                          toggleMenu(`${menu.submenu}-${sub.name}`)
                        }
                      >
                        {openMenus[`${menu.submenu}-${sub.name}`] ? (
                          <CircleChevronDown size={20} strokeWidth={1.5} />
                        ) : (
                          <CircleChevronRight size={20} strokeWidth={1.5} />
                        )}

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
                              className="flex items-center gap-1 mt-1 ml-4"
                            >
                              <Dot size={20} strokeWidth={1.5} />
                              <p className="text-sm text-gray-600">
                                {item.name}
                              </p>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      {" "}
                      <Dot size={20} strokeWidth={1.5} />
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
        alphabet={alphabet}
      />
    </div>
  );
};

export default TreeView;
