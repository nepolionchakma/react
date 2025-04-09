import SubSubMenuItem from "@/components/Breadcrumbs/SubSubMenuItem/SubSubMenuItem";
import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/menu.json";
const Administration = () => {
  const menus = menu as MenuData[];

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {item.menu === "Asynchronous Request Manager (ARM)" &&
              item.subMenus.map((menu) => {
                return (
                  <div key={menu.name}>
                    {/* Change menu name here */}
                    {menu.name === "Administration" && menu.subMenus && (
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
export default Administration;
