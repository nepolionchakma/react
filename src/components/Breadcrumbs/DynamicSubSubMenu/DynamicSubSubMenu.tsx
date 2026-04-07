import { useParams } from "react-router-dom";
import SubSubMenuItem from "@/components/Breadcrumbs/SubSubMenuItem/SubSubMenuItem";
// import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/menu.json";
import { MenuItem } from "@/hooks/useFilterMenu";
const DynamicSubSubMenu = () => {
  const menus = menu as MenuItem[];

  const { route } = useParams();
  const name = route?.split("-").join(" ");

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {item.subMenus?.map((menu) => {
              return (
                <div key={menu.name}>
                  {menu.name?.toLowerCase() === name && menu.subMenus && (
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
export default DynamicSubSubMenu;
