import SubSubMenuItem from "@/components/Breadcrumbs/SubSubMenuItem/SubSubMenuItem";
import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/menu.json";
const Controls = () => {
  const menus = menu as MenuData[];

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {item.menu === "Enterprise Security Controls" &&
              item.subMenus.map((menu) => {
                return (
                  <div key={menu.name}>
                    {/* Change menu name here */}
                    {menu.name === "Controls" && menu.subMenus && (
                      <SubSubMenuItem {...menu} />
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};
export default Controls;
