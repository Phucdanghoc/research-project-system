// src/components/TitleHandler.tsx
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const routeTitleMap = {
  '/login': 'Đăng nhập',
  '/unauthorized': 'Không có quyền truy cập',
  '/admin/dashboard': 'Trang quản lý - Dashboard',
  '/admin/manage-students': 'Quản lý sinh viên',
  '/admin/manage-lecturers': 'Quản lý giảng viên',
  '/admin/manage-topics': 'Quản lý đề tài',
  '/admin/manage-groups': 'Quản lý nhóm',
  '/lecturer/dashboard': 'Giảng viên - Dashboard',
  '/lecturer/manage-topics': 'Giảng viên - Quản lý đề tài',
  '/lecturer/manage-students': 'Giảng viên - Quản lý sinh viên',
  '/lecturer/manage-groups': 'Giảng viên - Quản lý nhóm',
  '/lecturer/profile': 'Hồ sơ giảng viên',
  '/student/dashboard': 'Sinh viên - Dashboard',
  '/student/student-topics': 'Sinh viên - Đề tài',
  '/student/student-groups': 'Sinh viên - Nhóm',
  '/student/profile': 'Hồ sơ sinh viên',
  '/404': 'Không tìm thấy trang',
};

const TitleHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const title = routeTitleMap[location.pathname] || 'Trang quản trị';
    document.title = title;
  }, [location.pathname]);

  return null;
};

export default TitleHandler;
