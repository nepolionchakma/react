import SubMenuItem from "@/components/Breadcrumbs/SubMenuItem/SubMenuItem";
import { MenuItem } from "@/hooks/useFilterMenu";
// import { MenuData } from "@/components/Sidebar/Sidbar";
import menu from "@/Menu/menu.json";

const AsynchronousRequestsAndTaskSchedules = () => {
  const menus = menu as MenuItem[];

  return (
    <div>
      {menus.map((item) => {
        return (
          <div key={item.menu}>
            {item.menu === "Asynchronous Requests and Task Schedules" && (
              <SubMenuItem {...item} />
            )}
          </div>
        );
      })}
    </div>
  );
};
export default AsynchronousRequestsAndTaskSchedules;
