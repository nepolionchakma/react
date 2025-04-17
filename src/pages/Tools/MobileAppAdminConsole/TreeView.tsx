import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import React, { useEffect, useState } from "react";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
interface MenuItem {
  name: string;
  routeName: string;
  menuItems?: MenuItem[];
}

interface MenuStructure {
  submenu: string;
  subMenus: MenuItem[];
}

interface IMenuTypes {
  menu_id: number;
  menu_code: string;
  menu_name: string;
  menu_desc: string;
  menu_structure: MenuStructure[];
}

const TreeView = () => {
  const api = useAxiosPrivate();
  const [data, setData] = useState<IMenuTypes[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          "https://procg.viscorp.app/api/v1/mobile-menu"
        );
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <MenuTreeView data={data} searchTerm={searchTerm.toLowerCase()} />
    </div>
  );
};

const MenuTreeView: React.FC<{ data: IMenuTypes[]; searchTerm: string }> = ({
  data,
  searchTerm,
}) => {
  return (
    <div>
      {data.map((menu) => (
        <div key={menu.menu_id} className="mb-4">
          <div className="text-2xl font-bold">{menu.menu_name}</div>
          <div className="text-sm text-gray-600">{menu.menu_desc}</div>
          {menu.menu_structure.map((menuStructure, index) => (
            <TreeNode
              key={index}
              node={menuStructure}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface TreeNodeProps {
  node: MenuStructure;
  searchTerm: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, searchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasMatch =
      node.submenu.toLowerCase().includes(searchTerm) ||
      node.subMenus.some(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.routeName?.toLowerCase().includes(searchTerm) ||
          (item.menuItems &&
            item.menuItems.some(
              (subItem) =>
                subItem.name.toLowerCase().includes(searchTerm) ||
                subItem.routeName?.toLowerCase().includes(searchTerm)
            ))
      );
    setIsOpen(searchTerm ? hasMatch : false);
  }, [searchTerm]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div>
      <div className="flex items-center cursor-pointer" onClick={toggleMenu}>
        {isOpen ? (
          <ChevronDownIcon className="w-5 h-5 mr-2" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 mr-2" />
        )}
        <span className="font-semibold text-lg">{node.submenu}</span>
      </div>
      {isOpen && (
        <div className="pl-5">
          {node.subMenus.map((submenu, index) => (
            <TreeNodeItem key={index} node={submenu} searchTerm={searchTerm} />
          ))}
        </div>
      )}
    </div>
  );
};

interface TreeNodeItemProps {
  node: MenuItem;
  searchTerm: string;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, searchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasMatch =
      node.name.toLowerCase().includes(searchTerm) ||
      node.routeName?.toLowerCase().includes(searchTerm) ||
      (node.menuItems &&
        node.menuItems.some(
          (subItem) =>
            subItem.name.toLowerCase().includes(searchTerm) ||
            subItem.routeName?.toLowerCase().includes(searchTerm)
        ));
    setIsOpen(searchTerm ? hasMatch! : false);
  }, [searchTerm]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div>
      <div
        className="flex items-center cursor-pointer ml-5"
        onClick={toggleMenu}
      >
        {node.menuItems ? (
          isOpen ? (
            <ChevronDownIcon className="w-5 h-5 mr-2" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 mr-2" />
          )
        ) : (
          <span className="w-5 h-5 mr-2" />
        )}
        <span className="ml-5 text-md">{node.name}</span>
      </div>
      {isOpen && node.menuItems && (
        <div className="pl-5">
          {node.menuItems.map((subItem, index) => (
            <TreeNodeItem key={index} node={subItem} searchTerm={searchTerm} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeView;
