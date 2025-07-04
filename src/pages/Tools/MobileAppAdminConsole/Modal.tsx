import CustomModal4 from "@/components/CustomModal/CustomModal4";
import { Plus, Trash, X } from "lucide-react";
import React from "react";
import { MenuStructure } from "./TreeView";
import CustomTooltip from "@/components/Tooltip/Tooltip";

interface ModalProps {
  showModal: boolean;
  editable: MenuStructure;
  setEditable: React.Dispatch<React.SetStateAction<MenuStructure>>;
  handleX: () => void;
  saveMenu: () => void;
  alphabet: string[];
}

export default function Modal({
  showModal,
  editable,
  setEditable,
  handleX,
  saveMenu,
  alphabet,
}: ModalProps) {
  const formatToUnderscore = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("_");
  };

  const handleAddSubmenu = () => {
    const newSubMenu = { name: "", routeName: "", order: 1 };

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
      routeName: formatToUnderscore(value),
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
        routeName: formatToUnderscore(value),
      };

      updatedSubMenus[subMenuIndex] = {
        ...subMenu,
        menuItems: updatedMenuItems,
        routeName: undefined,
        order: 0,
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
      (target.order = 0), (target.routeName = undefined);

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
      if (updatedSubMenus[submenuIndex].menuItems.length === 0) {
        updatedSubMenus[submenuIndex] = {
          ...updatedSubMenus[submenuIndex],
          order: 1,
          routeName: formatToUnderscore(updatedSubMenus[submenuIndex].name),
        };
      }
    }

    setEditable({ ...editable, subMenus: updatedSubMenus });
  };

  return (
    <div>
      {showModal && (
        <CustomModal4>
          <div className="min-w-[700px] max-h-[80vh] overflow-y-auto pb-4">
            <div className="bg-[#CEDEF2] px-[16px] py-[10px] w-full flex justify-between items-center fixed z-50">
              <p>Menu Structure</p>
              <button onClick={handleX}>
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-1 px-4 py-2 mt-12">
              <p>Name:</p>

              <input
                required
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
                <button
                  className="text-white rounded-md flex gap-1 items-center bg-winter-400 px-[14px] py-[10px] hover:bg-winter-300"
                  onClick={handleAddSubmenu}
                >
                  <Plus size={18} color="white" />
                  <p>Add Submenu</p>
                </button>
              </div>
              {editable.subMenus.map((item, index) => (
                <div key={index}>
                  <div className="flex gap-1 mt-4 relative">
                    <p>{index + 1}.</p>
                    <input
                      required
                      type="text"
                      value={item.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSubmenuChange(index, e.target.value)
                      }
                      className="border-b w-full focus:outline-none"
                    />
                    <div className="absolute right-0 bottom-1">
                      <CustomTooltip
                        tooltipTitle="Add Menu Item"
                        tooltipAdjustmentStyle="mr-10"
                      >
                        <button
                          className="p-[0.3rem] rounded-full  mr-1"
                          onClick={() => addMenuItem(index)}
                        >
                          <Plus size={16} />
                        </button>
                      </CustomTooltip>

                      <CustomTooltip
                        tooltipTitle="Delete Submenu"
                        tooltipAdjustmentStyle="mr-20"
                      >
                        <button
                          className="p-[0.3rem] rounded-full "
                          onClick={() => handleDeleteSubmenu(index)}
                        >
                          <Trash size={16} />
                        </button>
                      </CustomTooltip>
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
                            required
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
                            <CustomTooltip
                              tooltipTitle="Delete Menu Item"
                              tooltipAdjustmentStyle="mr-24"
                            >
                              <button
                                className="p-[0.3rem] rounded-full "
                                onClick={() =>
                                  handleDeleteMenuItem(index, miIndex)
                                }
                              >
                                <Trash size={16} />
                              </button>
                            </CustomTooltip>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full flex items-center justify-end mt-4 px-4">
              <button
                className="px-6 py-2 bg-black rounded-md hover:bg-black/80 text-white"
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
