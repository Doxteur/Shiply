import { Outlet } from 'react-router';
import Sidebar from '../Sidebar';

export const RootLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
