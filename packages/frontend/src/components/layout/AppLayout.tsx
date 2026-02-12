import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          <div key={pathname} className="mx-auto max-w-5xl animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
