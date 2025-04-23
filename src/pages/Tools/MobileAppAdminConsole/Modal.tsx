import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Plus, Trash, X } from "lucide-react";
import React from "react";
import { MenuStructure } from "./TreeView";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModalProps {
  showModal: boolean;
  editable: MenuStructure;
  setEditable: React.Dispatch<React.SetStateAction<MenuStructure>>;
  handleX: () => void;
  saveMenu: () => void;
}

export default function Modal({
  showModal,
  editable,
  setEditable,
  handleX,
  saveMenu,
}: ModalProps) {
  const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

  const toSnakeCase = (str: string) =>
    str
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "")
      .toLowerCase();

  const handleAddSubmenu = () => {
    const newSubMenu = { name: "", routeName: "" };

    setEditable((prev) => ({
      ...prev,
      subMenus: [...prev.subMenus, newSubMenu],
    }));
  };

  const handleSubmenuChange = (index: number, value: string) => {
    const updatedSubMenus = [...editable.subMenus];

    updatedSubMenus[index] = {
      ...updatedSubMenus[index],
      name: value,
      routeName: toSnakeCase(value),
    };

    setEditable({
      ...editable,
      subMenus: updatedSubMenus,
    });
  };

  const handleMenuItemChange = (
    subMenuIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const updatedSubMenus = [...editable.subMenus];
    const subMenu = updatedSubMenus[subMenuIndex];

    if (subMenu.menuItems) {
      const updatedMenuItems = [...subMenu.menuItems];
      updatedMenuItems[itemIndex] = {
        ...updatedMenuItems[itemIndex],
        name: value,
        routeName: toSnakeCase(value),
      };

      updatedSubMenus[subMenuIndex] = {
        ...subMenu,
        menuItems: updatedMenuItems,
      };

      setEditable({ ...editable, subMenus: updatedSubMenus });
    }
  };

  const addMenuItem = (subMenuIndex: number) => {
    const newMenuItem = { name: "", routeName: "" };
    setEditable((prev) => {
      const updatedSubMenus = [...prev.subMenus];
      const target = updatedSubMenus[subMenuIndex];

      if (!target) return prev;

      target.menuItems = [...(target.menuItems || []), newMenuItem];

      return { ...prev, subMenus: updatedSubMenus };
    });
  };

  const handleDeleteSubmenu = (i: number) => {
    const newSubmenus = editable.subMenus.filter((_, index) => index !== i);
    setEditable((prev) => ({ ...prev, subMenus: newSubmenus }));
  };

  const handleDeleteMenuItem = (submenuIndex: number, itemIndex: number) => {
    const updatedSubMenus = [...editable.subMenus];

    const menuItems = updatedSubMenus[submenuIndex].menuItems;
    if (menuItems) {
      updatedSubMenus[submenuIndex].menuItems = menuItems.filter(
        (_, i) => i !== itemIndex
      );
    }

    setEditable({ ...editable, subMenus: updatedSubMenus });
  };

  return (
    <div>
      {showModal && (
        <CustomModal4>
          <div className="min-w-[700px] pb-4">
            <div className="bg-winter-300 h-[2rem] w-full flex justify-between items-center px-4">
              <p>Menu Structure</p>
              <button onClick={handleX}>
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-1 px-4 mt-4">
              <p>Name:</p>

              <input
                type="text"
                value={editable.submenu}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditable((prev) => ({ ...prev, submenu: e.target.value }))
                }
                className="border-b w-full focus:outline-none"
              />
            </div>

            {/**SubMenus */}
            <div className="pl-8 pr-4 mt-4">
              <div className="flex items-center justify-between cursor-pointer">
                <p>Submenus:</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-[0.3rem] rounded-full bg-winter-400"
                        onClick={handleAddSubmenu}
                      >
                        <Plus size={16} color="white" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="mr-24">
                      <p>Add new Submenu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {editable.subMenus.map((item, index) => (
                <div key={index}>
                  <div className="flex gap-1 mt-4 relative">
                    <p>{index + 1}.</p>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSubmenuChange(index, e.target.value)
                      }
                      className="border-b w-full focus:outline-none"
                    />
                    <div className="absolute right-0 bottom-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-[0.3rem] rounded-full  mr-1"
                              onClick={() => addMenuItem(index)}
                            >
                              <Plus size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="mr-16">
                            <p>Add new menu-item</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-[0.3rem] rounded-full "
                              onClick={() => handleDeleteSubmenu(index)}
                            >
                              <Trash size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="mr-20">
                            <p>Delete Submenu</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="pl-12 mt-4">
                    {item.menuItems &&
                      item.menuItems.map((mi, miIndex) => (
                        <div
                          className="flex items-center mt-2 gap-1 relative"
                          key={miIndex}
                        >
                          <p>{alphabet[miIndex]}.</p>

                          <input
                            type="text"
                            value={mi.name}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              handleMenuItemChange(
                                index,
                                miIndex,
                                e.target.value
                              )
                            }
                            className="border-b w-full focus:outline-none"
                          />
                          <div className="absolute right-0 bottom-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="p-[0.3rem] rounded-full "
                                    onClick={() =>
                                      handleDeleteMenuItem(index, miIndex)
                                    }
                                  >
                                    <Trash size={16} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="mr-24">
                                  <p>Delete menu-item</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full flex items-center justify-end mt-4 px-4">
              <button
                className="px-6 py-2 bg-green-500 rounded-md hover:bg-green-400 text-white"
                onClick={saveMenu}
              >
                Save
              </button>
            </div>
          </div>
        </CustomModal4>
      )}
    </div>
  );
}
