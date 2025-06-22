import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import UnauthorizedPage from '../components/UnauthorizedPage';
import LoginPage from '../pages/auth/LoginPage';
import AdminLayout from '../pages/admin/layout';
import ManagerUser from '../pages/admin/account/Manager';
import ManageTopics from '../pages/admin/topics/TopicManager';

// Define the router with TypeScript types
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
        element: <ManageTopics />,
      },
      {
        path: 'setup-committee',
        element: <ManagerUser />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;