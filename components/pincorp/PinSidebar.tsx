import React from 'react';
import { NavLink } from 'react-router-dom';
import { CubeIcon, BeakerIcon, ClipboardDocumentCheckIcon, XMarkIcon, RectangleGroupIcon, CpuChipIcon, TagIcon, ShoppingCartIcon, ChartBarIcon } from '../common/Icons';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  const activeClass = 'bg-sky-600 text-white';
  const inactiveClass = 'text-slate-300 hover:bg-sky-800 hover:text-white dark:text-slate-300 dark:hover:bg-slate-700';

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
      }
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </NavLink>
  );
};

interface PinSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSwitchApp: () => void;
}

const PinSidebar: React.FC<PinSidebarProps> = ({ isOpen, setIsOpen, onSwitchApp }) => {

  const navLinks = [
    { to: "/materials", icon: <CubeIcon className="h-6 w-6" />, label: "Nguyên vật liệu" },
    { to: "/boms", icon: <BeakerIcon className="h-6 w-6" />, label: "Công thức (BOM)" },
    { to: "/production", icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, label: "Sản xuất" },
    { to: "/products", icon: <TagIcon className="h-6 w-6" />, label: "Thành phẩm" },
    { to: "/sales", icon: <ShoppingCartIcon className="h-6 w-6" />, label: "Bán hàng" },
    { to: "/reports", icon: <ChartBarIcon className="h-6 w-6" />, label: "Báo cáo" },
  ];

  return (
    <aside className={`flex flex-col w-64 bg-slate-900 text-white h-full fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      <div className="flex items-center justify-between h-16 border-b border-slate-700/50 px-4">
        <div className="flex items-center w-full text-left overflow-hidden p-2 rounded-md">
          <CpuChipIcon className="w-8 h-8 text-sky-400 flex-shrink-0"/>
          <h1 className="text-xl font-bold ml-2 truncate" title="Sản xuất & Kinh doanh PIN">PIN Corp</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-2 -mr-2">
            <XMarkIcon className="w-6 h-6"/>
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {navLinks.map(link => (
            <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} onClick={() => setIsOpen(false)}/>
        ))}
      </nav>

      <div className="mt-auto p-2">
        <div className="px-2 py-2 border-t border-slate-700/50">
            <button
                onClick={onSwitchApp}
                className="flex items-center w-full px-4 py-3 my-1 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
            >
                <RectangleGroupIcon className="h-6 w-6" />
                <span className="ml-4 font-medium">Chuyển ứng dụng</span>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default PinSidebar;