import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  console.log(`isAuthenticated: ${isAuthenticated}`);
  
  if (loading) {
    return <Loading />;
  }


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <main className="flex-1 p-6 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;