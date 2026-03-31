import { Link, useLocation } from "react-router-dom";
import menuData from "../../Menu/menu.json";
import { ChevronRight } from "lucide-react";

interface MenuItem {
  name?: string;
  menu?: string;
  path: string;
  paths?: string[];
  subMenus?: MenuItem[];
}

// 🔥 recursive full trail finder
const findFullTrail = (
  menus: MenuItem[],
  targetPath: string,
  trail: { name: string; path: string }[] = [],
): { name: string; path: string }[] | null => {
  for (const menu of menus) {
    const label = menu.name || menu.menu || "";
    const newTrail = [...trail, { name: label, path: menu.path }];

    // ✅ exact match
    if (menu.path === targetPath) {
      return newTrail;
    }

    // ✅ match inside paths → go deeper if possible
    if (menu.paths?.includes(targetPath)) {
      if (menu.subMenus) {
        const deep = findFullTrail(menu.subMenus, targetPath, newTrail);
        if (deep) return deep;
      }
      return newTrail;
    }

    // ✅ recursive
    if (menu.subMenus) {
      const found = findFullTrail(menu.subMenus, targetPath, newTrail);
      if (found) return found;
    }
  }

  return null;
};

const Breadcrumb = () => {
  const location = useLocation();

  const trail = findFullTrail(menuData as MenuItem[], location.pathname) || [];

  const breadcrumbs = [{ name: "Home", path: "/" }, ...trail];

  return (
    <nav className="my-2 flex items-center flex-wrap">
      {breadcrumbs.map((item, index) => (
        <span key={item.path} className="flex items-center">
          {index < breadcrumbs.length - 1 ? (
            <Link to={item.path} className="underline text-blue-600">
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-700">{item.name}</span>
          )}

          {index < breadcrumbs.length - 1 && (
            <ChevronRight strokeWidth={1} className="mx-1 inline-block" />
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
