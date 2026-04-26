import { Link, useLocation } from 'react-router-dom';
import { Home, Package, BarChart3, Settings } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

const menuItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/stock', icon: Package, label: 'Estoque' },
  { path: '/reports', icon: BarChart3, label: 'Relatórios' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const location = useLocation();
  const companyName = useSettingsStore((s) => s.companyName);

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{companyName || 'Sistema Estoque'}</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
