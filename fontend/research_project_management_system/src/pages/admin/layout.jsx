import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import CustomNavbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const AdminLayout = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(true);

  // if (!isAuthenticated || !user || user.role !== 'admin') {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`flex-1 flex flex-col ${isOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;