import SubMenuItem from "@/components/Breadcrumbs/SubMenuItem/SubMenuItem";
import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/menu.json";
const Tools = () => {
  const menus = menu as MenuData[];

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {/* Change menu name here */}
            {item.menu === "Tools" && <SubMenuItem {...item} />}
          </div>
        );
      })}
    </div>
  );
};
export default Tools;
