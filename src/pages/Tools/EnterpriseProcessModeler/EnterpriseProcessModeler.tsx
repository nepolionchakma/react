import SubSubMenuItem from "@/components/Breadcrumbs/SubSubMenuItem/SubSubMenuItem";
import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/menu.json";
const EnterpriseProcessModeler = () => {
  const menus = menu as MenuData[];

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {/* Change menu name here */}
            {item.menu === "Tools" &&
              item.subMenus.map((menu) => {
                return (
                  <div key={menu.name}>
                    {/* Change menu name here */}
                    {menu.name === "Enterprise Process Modeler" &&
                      menu.subMenus && <SubSubMenuItem {...menu} />}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};
export default EnterpriseProcessModeler;
