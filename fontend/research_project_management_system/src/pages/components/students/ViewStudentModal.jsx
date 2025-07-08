import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { getLecturerByIdAsync } from '../../../store/auth/lecturerSlice';

const ViewStudentModal = ({ isOpen, onClose, student }) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading: lecturersLoading, error: lecturersError } = useAppDispatch((state) => state.lecturers);

  useEffect(() => {
    if (isOpen && student?.lecturer_id) {
      dispatch(getLecturerByIdAsync(student.lecturer_id));
    }
  }, [isOpen, student?.lecturer_id, dispatch]);

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center">
            <FaUserCircle className="mr-2" /> Chi tiết sinh viên
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
            title="Đóng"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin sinh viên</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p><span className="font-medium text-gray-700">Mã sinh viên:</span> {student.student_code}</p>
            <p><span className="font-medium text-gray-700">Họ tên:</span> {student.name}</p>
            <p><span className="font-medium text-gray-700">Email:</span> {student.email}</p>
            <p><span className="font-medium text-gray-700">Khoa:</span> {student.faculty || 'Không có'}</p>
            <p><span className="font-medium text-gray-700">Chuyên ngành:</span> {student.major || 'Không có'}</p>
            <p>
              <span className="font-medium text-gray-700">Ngày tạo:</span>{' '}
              {TimeService.convertDateStringToDDMMYYYY(student.created_at)}
            </p>
            <p>
              <span className="font-medium text-gray-700">Ngày cập nhật:</span>{' '}
              {TimeService.convertDateStringToDDMMYYYY(student.updated_at)}
            </p>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaUserCircle className="mr-2" /> Thông tin giảng viên
          </h3>
          {lecturersLoading ? (
            <p className="text-sm text-gray-600">Đang tải thông tin giảng viên...</p>
          ) : lecturersError ? (
            <p className="text-sm text-red-600">Lỗi: {lecturersError}</p>
          ) : lecturers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p><span className="font-medium text-gray-700">Họ tên:</span> {lecturers.name || 'Không có'}</p>
              <p><span className="font-medium text-gray-700">Mã giảng viên:</span> {lecturers.lecturer_code || 'Không có'}</p>
              <p><span className="font-medium text-gray-700">Email:</span> {lecturers.email || 'Không có'}</p>
              <p><span className="font-medium text-gray-700">Số điện thoại:</span> {lecturers.phone || 'Không có'}</p>
              <p><span className="font-medium text-gray-700">Ngày sinh:</span> {lecturers.birth || 'Không có'}</p>
              <p><span className="font-medium text-gray-700">Chuyên ngành:</span> {lecturers.major || 'Không có'}</p>
              <p><span className="font-medium text-gray-700">Khoa:</span> {lecturers.faculty || 'Không có'}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Không tìm thấy thông tin giảng viên.</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentModal;