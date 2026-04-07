import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  menuClasses,
  sidebarClasses,
} from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { useGlobalContext } from "@/Context/GlobalContext/GlobalContext";
import { useFilteredMenu } from "@/hooks/useFilterMenu";

const Sidbar = () => {
  const { open } = useGlobalContext();
  const location = useLocation();
  const pathname = location.pathname;

  // ✅ single source of truth
  const menuData = useFilteredMenu();

  // 🔹 Active styles
  const getMenuItemStyle = (path: string) => {
    return pathname === path
      ? "text-red-600 bg-white rounded-md"
      : "bg-[#F3F8FF]";
  };

  const getSubMenuStyle = (paths: string[] = []) => {
    return paths.includes(pathname)
      ? "bg-winter-100 duration-500 rounded-md"
      : "";
  };

  const getSubMenuItemStyle = (paths: string[] = []) => {
    return paths.includes(pathname)
      ? "bg-[#F3F8FF]"
      : "bg-[#F3F8FF]";
  };

  return (
    <Sidebar
      collapsed={!open}
      transitionDuration={1000}
      className="h-[calc(100vh-3rem)] text-[14px] z-40"
      style={{ position: "fixed" }}
      rootStyles={{
        ["." + sidebarClasses.container]: {
          width: open ? "18rem" : "5rem",
          borderRight: "1px solid #e5e7eb",
          transition: "1s",
          paddingRight: 10,
          paddingLeft: 10,
          backgroundColor: "#fbfbfb",
        },
        border: "none",
      }}
    >
      <Menu
        rootStyles={{
          ["." + menuClasses.button]: {
            paddingLeft: 0,
            paddingRight: 10,
            ":hover": {
              background: "#B4C4D9",
            },
          },
          ["." + menuClasses.subMenuContent]: {
            width: open ? "100%" : 250,
            borderEndStartRadius: 5,
            borderEndEndRadius: 5,
            paddingRight: open ? 10 : 5,
            paddingLeft: open ? 20 : 5,
            backgroundColor: "#F3F8FF",
          },
        }}
      >
        {menuData.map((menu) =>
          menu.subMenus ? (
            // 🔹 Top-level with children
            <SubMenu
              key={menu.path}
              label={menu.menu || menu.name}
              className={`my-1 ${getSubMenuStyle(menu.paths)}`}
              icon={
                menu.menuIcon && (
                  <img
                    src={menu.menuIcon}
                    alt={`${menu.menu} icon`}
                    className="w-[20px] h-[20px]"
                  />
                )
              }
              rootStyles={{
                ["." + menuClasses.button]: {
                  ":hover": {
                    borderRadius: 5,
                  },
                },
                ["." + menuClasses.label]: {
                  whiteSpace: "wrap",
                  marginLeft: open ? 0 : 7,
                },
              }}
            >
              {menu.subMenus.map((subMenuItem: any) =>
                subMenuItem.subMenus ? (
                  // 🔹 Nested submenu
                  <SubMenu
                    key={subMenuItem.path}
                    label={subMenuItem.name}
                    className={`my-1 ${getSubMenuItemStyle(
                      subMenuItem.paths || []
                    )}`}
                    rootStyles={{
                      ["." + menuClasses.label]: {
                        paddingLeft: open ? 25 : 0,
                      },
                      ["." + menuClasses.menuItemRoot]: {
                        width: open ? "100%" : "95.5%",
                      },
                    }}
                  >
                    {subMenuItem.subMenus.map((subItem: any) => (
                      <MenuItem
                        key={subItem.path}
                        component={<Link to={subItem.path} />}
                        className={`my-1 ${getMenuItemStyle(
                          subItem.path
                        )}`}
                        rootStyles={{
                          ["." + menuClasses.label]: {
                            paddingLeft: open ? 20 : 17,
                            marginLeft: 0,
                            fontSize: 12,
                          },
                        }}
                      >
                        <div className="flex gap-2">
                          <span className="w-[1px] h-[1px] p-[2px] rounded-full bg-current mt-[7px]" />
                          {subItem.name}
                        </div>
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  // 🔹 Single level item
                  <MenuItem
                    key={subMenuItem.path}
                    component={<Link to={subMenuItem.path} />}
                    className={`my-1 ${getMenuItemStyle(
                      subMenuItem.path
                    )}`}
                    rootStyles={{
                      ["." + menuClasses.label]: {
                        paddingLeft: open ? 27 : 10,
                        marginLeft: 0,
                        fontSize: 12,
                      },
                    }}
                  >
                    <div className="flex gap-2">
                      <span className="w-[1px] h-[1px] p-[2px] rounded-full bg-current mt-[7px]" />
                      {subMenuItem.name}
                    </div>
                  </MenuItem>
                )
              )}
            </SubMenu>
          ) : (
            // 🔹 Top-level without children (future-safe)
            <MenuItem
              key={menu.path}
              component={<Link to={menu.path} />}
              className={`my-1 ${getMenuItemStyle(menu.path)}`}
            >
              {menu.menu || menu.name}
            </MenuItem>
          )
        )}
      </Menu>
    </Sidebar>
  );
};

export default Sidbar;