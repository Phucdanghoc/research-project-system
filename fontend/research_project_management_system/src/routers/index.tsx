import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import UnauthorizedPage from '../components/UnauthorizedPage';
import LoginPage from '../pages/auth/LoginPage';
import AdminLayout from '../pages/admin/layout';
import ManagerUser from '../pages/admin/account/Manager';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'manage-plan',
        element: <ManagerUser />,
      },
      {
        path: 'manage-topics',
        element: <ManagerUser />,
      },
      {
        path: 'setup-committee',
        element: <ManagerUser />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
