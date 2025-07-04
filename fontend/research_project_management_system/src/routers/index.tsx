import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import UnauthorizedPage from '../components/UnauthorizedPage';
import LoginPage from '../pages/auth/LoginPage';
import AdminLayout from '../pages/admin/layout';
import LecturerLayout from '../pages/lecturer/layout';
import ManagerStudents from '../pages/admin/account/StudentManager';
import LecturerGroup from '../pages/lecturer/groups/LecturerGroup';
import ManagerLectures from '../pages/admin/account/LecturerManager';
import ManageTopics from '../pages/admin/topics/TopicManager';
import LecturerTopics from '../pages/lecturer/topics/LecturerTopic';
import LecturerStudent from '../pages/lecturer/students/LecturerStudent';
import NotFoundPage from '../pages/404/index';
import ManagerDashboard from '../pages/admin/dashboard/index';
import ProtectedAdmin from './ProtectedAdmin';
// import ProtectedStudent from './ProtectedStudent';
import ProtectedLecturer from './ProtectedLecturer';
import Test from '../pages/lecturer/topics/Test';
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
  // {
  //   path: '/student',
  //   element: (
  //    <ProtectedAdmin>
  //     </ProtectedAdmin>
  //   ),
  // },
  {
    path: '/lecturer',
    element: (
      <ProtectedLecturer>
        <LecturerLayout />
      </ProtectedLecturer>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <ManagerDashboard /> },
      { path: 'manage-topics', element: <LecturerTopics /> },
      { path: 'manage-students', element: <LecturerStudent /> },
      { path: 'manage-groups', element: <LecturerGroup /> },
      { path: 'test', element: <Test /> },
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;