import { User, FileText, Upload, FileStack, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: FileText, label: 'Create Note', path: '/app' },
    { icon: Upload, label: 'Upload Syllabus', path: '/app/uploadfile' },
    { icon: FileStack, label: 'All Files', path: '/app/allfiles' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-56 bg-slate-200 text-white flex flex-col z-10">
      {/* User Profile */}
      <div className="p-6 border-b-2 border-gray-400/40">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-700 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-blue-500">John Doe</h3>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive =
            item.path === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                ${
                  isActive
                    ? 'bg-cyan-800 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t-2 border-gray-400/40">
        <button
          type="button"
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-100 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
