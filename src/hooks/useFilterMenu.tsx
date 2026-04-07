import { useMemo } from "react";
import menuData from "@/Menu/menu.json";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";

export interface MenuItem {
  name?: string;
  menu?: string;
  menuIcon?: string;
  path: string;
  paths?: string[];
  subMenus?: MenuItem[];
  endpoint_id?: number;
}

// 🔥 STRICT FILTER
const filterMenuByEndpoints = (
  menus: MenuItem[],
  endpointIds: number[],
): MenuItem[] => {
  return menus
    .map((menu) => {
      // 🔹 If has children
      if (menu.subMenus) {
        const filteredSubMenus = filterMenuByEndpoints(
          menu.subMenus,
          endpointIds,
        );

        // ❗ STRICT RULE:
        // keep only if ALL children are allowed
        if (
          filteredSubMenus.length === menu.subMenus.length &&
          filteredSubMenus.length > 0
        ) {
          return {
            ...menu,
            subMenus: filteredSubMenus,
          };
        }

        return null; // ❌ remove parent completely
      }

      // 🔹 Leaf node
      if (typeof menu.endpoint_id === "number") {
        return endpointIds.includes(menu.endpoint_id) ? menu : null;
      }

      // 🔹 No endpoint_id → always allowed
      return menu;
    })
    .filter(Boolean) as MenuItem[];
};

export const useFilteredMenu = (): MenuItem[] => {
  const { grantendEndpoints } = useGlobalContext();

  return useMemo(() => {
    const endpointIds =
      grantendEndpoints?.map((item) => item.api_endpoint_id) || [];

    return filterMenuByEndpoints(menuData as MenuItem[], endpointIds);
  }, [grantendEndpoints]);
};
