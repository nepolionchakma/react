import SubMenuItem from "@/components/Breadcrumbs/SubMenuItem/SubMenuItem";
import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/topAndDropDownMenu.json";

const NotificatonsRoutes = () => {
  const menus = menu as MenuData[];

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {item.menu === "Notifications" && <SubMenuItem {...item} />}
          </div>
        );
      })}
    </div>
  );
};
export default NotificatonsRoutes;
