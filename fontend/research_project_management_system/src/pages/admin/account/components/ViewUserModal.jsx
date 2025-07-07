import { useEffect } from 'react';
import { getStudentByIdAsync, clearError } from '../../../../store/auth/studentSlice';
import {  useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../store';

const ViewUserModal = ({ isOpen, onClose, userId }) => {
  const dispatch = useAppDispatch();
  const { student, loading, error } = useSelector((state) => state.students);

  useEffect(() => {
    console.log('ViewUserModal isOpen:', isOpen, 'userId:', userId);
    
    if (isOpen && userId) {
      dispatch(getStudentByIdAsync(userId));
    }
    return () => {
      dispatch(clearError());
    };
  }, [isOpen, userId, dispatch]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
          <p className="text-red-600">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Chi tiết tài khoản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
              <p className="p-2 bg-gray-100 rounded">{student.name}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="p-2 bg-gray-100 rounded">{student.email}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <p className="p-2 bg-gray-100 rounded">{student.role}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã sinh viên</label>
              <p className="p-2 bg-gray-100 rounded">{student.student_code || 'N/A'}</p>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
              <p className="p-2 bg-gray-100 rounded">{student.class_name || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoa</label>
              <p className="p-2 bg-gray-100 rounded">{student.faculty || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
              <p className="p-2 bg-gray-100 rounded">{student.major || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm</label>
              <p className="p-2 bg-gray-100 rounded">
                {student.groups?.length > 0
                  ? student.groups.map((group) => group.name).join(', ')
                  : 'Không có nhóm'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;