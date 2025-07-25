import { useParams } from "react-router-dom";
import SubSubMenuItem from "@/components/Breadcrumbs/SubSubMenuItem/SubSubMenuItem";
import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/menu.json";
const DynamicSubSubMenu = () => {
  const menus = menu as MenuData[];

  const { route } = useParams();
  const name = route?.split("-").join(" ");

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {item.subMenus.map((menu) => {
              return (
                <div key={menu.name}>
                  {menu.name.toLowerCase() === name && menu.subMenus && (
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
// {
//   item.menu === "Enterprise Security Controls" &&
//     item.subMenus.map((menu) => {
//       return (
//         <div key={menu.name}>
//           {/* Change menu name here */}
//           {menu.name === "Access Models" && menu.subItems && (
//             <SubSubMenuItem {...menu} />
//           )}
//         </div>
//       );
//     });
// }
