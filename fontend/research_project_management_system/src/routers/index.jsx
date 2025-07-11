import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ProtectedAdmin from './ProtectedAdmin';
import ProtectedLecturer from './ProtectedLecturer';
import UnauthorizedPage from '../components/UnauthorizedPage';
import LoginPage from '../pages/auth/LoginPage';
import AdminLayout from '../pages/admin/layout';
import LecturerLayout from '../pages/lecturer/layout';
import ManagerDashboard from '../pages/admin/dashboard';
import ManagerStudents from '../pages/admin/account/StudentManager';
import ManagerLecturers from '../pages/admin/account/LecturerManager';
import ManageTopics from '../pages/admin/topics/TopicManager';
import LecturerTopics from '../pages/lecturer/topics/LecturerTopic';
import LecturerStudent from '../pages/lecturer/students/LecturerStudent';
import LecturerGroup from '../pages/lecturer/groups/LecturerGroup';
import ProfilePage from '../pages/profile/ProfilePage';
import Test from '../pages/lecturer/topics/Test';
import NotFoundPage from '../pages/404';
import DashboardStudent from '../pages/student/dashboard/DashboardStudent';
import { GroupStudent } from '../pages/student/group/GroupStudent';
import StudentLayout from '../pages/student/layout';
import ProtectedStudent from './ProtectedStudent';
import StudentTopic from '../pages/student/topic/TopicStudent';
import ManagerGroup from '../pages/admin/group/ManagerGroup';

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
      { path: 'manage-lecturers', element: <ManagerLecturers /> },
      { path: 'manage-topics', element: <ManageTopics /> },
      { path: 'manage-groups', element: <ManagerGroup /> },
      { path: 'setup-areas', element: <ManagerStudents /> },
    ],
  },
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
      { path: 'profile', element: <ProfilePage /> },
      { path: 'test', element: <Test /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedStudent>
        <StudentLayout />
      </ProtectedStudent>
    ), children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardStudent /> },
      { path: 'student-topics', element: <StudentTopic /> },
      { path: 'student-groups', element: <GroupStudent /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;