import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useFilteredMenu } from "@/hooks/useFilterMenu";

// 🔹 Type
interface MenuItem {
  name?: string;
  menu?: string;
  path: string;
  paths?: string[];
  subMenus?: MenuItem[];
}

// 🔥 Recursive full trail finder (menu-based)
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

    // ✅ match inside paths
    if (menu.paths?.includes(targetPath)) {
      if (menu.subMenus) {
        const deep = findFullTrail(menu.subMenus, targetPath, newTrail);
        if (deep) return deep;
      }
      return newTrail;
    }

    // ✅ recursive search
    if (menu.subMenus) {
      const found = findFullTrail(menu.subMenus, targetPath, newTrail);
      if (found) return found;
    }
  }

  return null;
};

// 🔥 Fallback generator (for routes not in menu)
const generateFallbackTrail = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");

    const name = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return { name, path };
  });
};

const Breadcrumb = () => {
  const location = useLocation();
  const filteredMenu = useFilteredMenu();

  // 🔥 Use menu trail OR fallback
  const trail =
    findFullTrail(filteredMenu, location.pathname) ||
    generateFallbackTrail(location.pathname);

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
