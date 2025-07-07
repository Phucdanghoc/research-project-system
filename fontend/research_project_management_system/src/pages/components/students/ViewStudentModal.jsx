import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';

const ViewStudentModal = ({ isOpen, onClose, student }) => {
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
            <FaUserCircle className="mr-2" /> Thông tin nhóm
          </h3>
          {student.groups && student.groups.length > 0 ? (
            student.groups.map((group, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                <p><span className="font-medium text-gray-700">Tên nhóm:</span> {group.name || 'Không có'}</p>
                <p><span className="font-medium text-gray-700">Mã nhóm:</span> {group.group_code || 'Không có'}</p>
                <p><span className="font-medium text-gray-700">Trạng thái:</span> {group.status || 'Không có'}</p>
                <p>
                  <span className="font-medium text-gray-700">Ngày tạo:</span>{' '}
                  {TimeService.convertDateStringToDDMMYYYY(group.created_at) || 'Không có'}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Ngày cập nhật:</span>{' '}
                  {TimeService.convertDateStringToDDMMYYYY(group.updated_at) || 'Không có'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">Không tìm thấy thông tin nhóm.</p>
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