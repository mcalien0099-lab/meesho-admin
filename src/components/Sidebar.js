"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, Settings, Tags, Image as ImageIcon, LogOut, Star } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/');
  };

  return (
    <aside className="w-64 h-screen bg-card border-r border-border text-card-foreground fixed left-0 top-0 flex flex-col transition-all duration-300 shadow-sm z-20">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="text-xl font-bold text-primary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground shadow-md">
            M
          </div>
         meesho Admin
        </span>
      </div>
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md font-medium' 
                      : 'hover:bg-primary/10 text-foreground hover:text-primary'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-primary-foreground' : 'text-foreground/70'} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-500/10 text-red-500 hover:text-red-600 font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
