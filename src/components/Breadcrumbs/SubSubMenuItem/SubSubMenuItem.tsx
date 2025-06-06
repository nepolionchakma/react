import { subMenus } from "@/components/Sidebar/Sidbar";
import { Link } from "react-router-dom";

const SubSubMenuItem = (menu: subMenus) => {
  return (
    <div>
      {menu.subMenus &&
        menu.subMenus.map((subMenu) => {
          return (
            <div key={subMenu.name}>
              {subMenu.path && (
                <Link
                  to={subMenu.path}
                  className="text-blue-600 max-w-max hover:underline inline-block"
                >
                  <p>{subMenu.name}</p>
                </Link>
              )}
            </div>
          );
        })}
    </div>
  );
};
export default SubSubMenuItem;
