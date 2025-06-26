import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import UnauthorizedPage from '../components/UnauthorizedPage';
import LoginPage from '../pages/auth/LoginPage';
import AdminLayout from '../pages/admin/layout';
import ManagerStudents from '../pages/admin/account/StudentManager';
import ManagerLectures from '../pages/admin/account/LecturerManager';
import ManageTopics from '../pages/admin/topics/TopicManager';
import NotFoundPage from '../pages/404/index';
import ManagerDashboard from '../pages/admin/dashboard/index';
import ProtectedAdmin from './ProtectedAdmin';
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['admin', 'student', 'teacher']} />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
    ],
  },
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
    element: (
      <ProtectedAdmin>
        <AdminLayout />
      </ProtectedAdmin>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <ManagerDashboard /> },
      { path: 'manage-students', element: <ManagerStudents /> },
      { path: 'manage-lecturers', element: <ManagerLectures /> },
      { path: 'manage-topics', element: <ManageTopics /> },
      { path: 'setup-areas', element: <ManagerStudents /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <div>Trang Học Sinh (Chưa triển khai)</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div>Trang Giáo Viên (Chưa triển khai)</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;