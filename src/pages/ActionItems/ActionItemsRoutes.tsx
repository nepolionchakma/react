import SubMenuItem from "@/components/Breadcrumbs/SubMenuItem/SubMenuItem";
import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/topAndDropDownMenu.json";

const ActionItems = () => {
  const menus = menu as MenuData[];

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {item.menu === "Action Items" && <SubMenuItem {...item} />}
          </div>
        );
      })}
    </div>
  );
};
export default ActionItems;
