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
  const url = import.meta.env.VITE_NODE_ENDPOINT_URL;
  const [data, setData] = useState<IMenuTypes[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`${url}/mobile-menu`);
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const toggleExpandAll = () => {
    setExpandAll((prevState) => !prevState);
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      <div className="mb-4">
        {/* Add Expand/Collapse All buttons */}
        <button
          className="bg-slate-400 px-2 rounded mr-2"
          onClick={toggleExpandAll}
        >
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <MenuTreeView
        data={data}
        searchTerm={searchTerm.toLowerCase()}
        expandAll={expandAll}
      />
    </div>
  );
};

const MenuTreeView: React.FC<{
  data: IMenuTypes[];
  searchTerm: string;
  expandAll: boolean;
}> = ({ data, searchTerm, expandAll }) => {
  return (
    <div>
      {data.map((menu) => (
        <div key={menu.menu_id} className="mb-4">
          <div className=" ">{menu.menu_name}</div>
          {menu.menu_structure.map((menuStructure, index) => (
            <TreeNode
              key={index}
              node={menuStructure}
              searchTerm={searchTerm}
              expandAll={expandAll}
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
  expandAll: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, searchTerm, expandAll }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (expandAll) {
      setIsOpen(true);
    } else {
      const hasMatch =
        node.submenu.toLowerCase().includes(searchTerm) ||
        node.subMenus.some(
          (item) =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.menuItems &&
              item.menuItems.some((subItem) =>
                subItem.name.toLowerCase().includes(searchTerm)
              ))
        );
      setIsOpen(searchTerm ? hasMatch : false);
    }
  }, [searchTerm, expandAll]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div>
      <div className="flex items-center cursor-pointer" onClick={toggleMenu}>
        {isOpen ? (
          <ChevronDownIcon size={15} />
        ) : (
          <ChevronRightIcon size={15} />
        )}
        <span className=" ">{node.submenu}</span>
      </div>
      {isOpen && (
        <div className="pl-5">
          {node.subMenus.map((submenu, index) => (
            <TreeNodeItem
              key={index}
              node={submenu}
              searchTerm={searchTerm}
              expandAll={expandAll}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TreeNodeItemProps {
  node: MenuItem;
  searchTerm: string;
  expandAll: boolean;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  searchTerm,
  expandAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (expandAll) {
      setIsOpen(true);
    } else {
      const hasMatch =
        node.name.toLowerCase().includes(searchTerm) ||
        (node.menuItems &&
          node.menuItems.some((subItem) =>
            subItem.name.toLowerCase().includes(searchTerm)
          ));
      setIsOpen(searchTerm ? hasMatch! : false);
    }
  }, [searchTerm, expandAll]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div>
      <div
        className="flex items-center cursor-pointer ml-5"
        onClick={toggleMenu}
      >
        {node.menuItems &&
          (isOpen ? (
            <ChevronDownIcon size={15} />
          ) : (
            <ChevronRightIcon size={15} />
          ))}
        <span className="ml-5 text-md">{node.name}</span>
      </div>
      {isOpen && node.menuItems && (
        <div className="pl-5">
          {node.menuItems.map((subItem, index) => (
            <TreeNodeItem
              key={index}
              node={subItem}
              searchTerm={searchTerm}
              expandAll={expandAll}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeView;
