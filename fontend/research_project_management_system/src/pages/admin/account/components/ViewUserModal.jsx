import { useEffect } from 'react';
import { getStudentByIdAsync, clearError } from '../../../../store/slices/studentSlice';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../store';

export const FacultyMajors = {
  CNTT: {
    name: 'Khoa Công nghệ Thông tin',
    majors: [
      { code: 'KTPM', name: 'Kỹ thuật Phần mềm' },
      { code: 'ATTT', name: 'An toàn Thông tin' },
      { code: 'TTNT', name: 'Trí tuệ Nhân tạo' },
      { code: 'KHDL', name: 'Khoa học Dữ liệu' },
      { code: 'IOT', name: 'Internet vạn vật' },
    ],
  },
  KTCN: {
    name: 'Khoa Kỹ thuật Máy tính',
    majors: [
      { code: 'KTDT', name: 'Kỹ thuật Điện tử' },
      { code: 'CNPM', name: 'Công nghệ Phần mềm' },
      { code: 'HTTT', name: 'Hệ thống Thông tin' },
      { code: 'KTMT', name: 'Kỹ thuật Máy tính' },
    ],
  },
  QTKD: {
    name: 'Khoa Quản trị Kinh doanh',
    majors: [
      { code: 'QTKD', name: 'Quản trị Kinh doanh' },
      { code: 'MKT', name: 'Marketing Kỹ thuật số' },
      { code: 'KDQT', name: 'Kinh doanh Quốc tế' },
      { code: 'TCKT', name: 'Tài chính Kế toán' },
    ],
  },
  NN: {
    name: 'Khoa Ngôn ngữ',
    majors: [
      { code: 'NNAN', name: 'Ngôn ngữ Anh' },
      { code: 'NNJP', name: 'Ngôn ngữ Nhật' },
      { code: 'NNHN', name: 'Ngôn ngữ Hàn' },
    ],
  },
  TK: {
    name: 'Khoa Thiết kế',
    majors: [
      { code: 'TKDH', name: 'Thiết kế Đồ họa' },
      { code: 'TKCN', name: 'Thiết kế Công nghiệp' },
      { code: 'TKNT', name: 'Thiết kế Nội thất' },
    ],
  },
  DL: {
    name: 'Khoa Du lịch',
    majors: [
      { code: 'QTDL', name: 'Quản trị Du lịch và Lữ hành' },
      { code: 'QLKS', name: 'Quản lý Khách sạn' },
    ],
  },
};

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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
          <p className="text-red-600 text-center mb-6">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  // Map faculty and major codes to their names
  const facultyName = FacultyMajors[student.faculty]?.name || student.faculty || 'N/A';
  const majorName = FacultyMajors[student.faculty]?.majors.find(m => m.code === student.major)?.name || student.major || 'N/A';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-xl w-full max-w-3xl shadow-2xl transform transition-transform duration-300 scale-100">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Chi tiết tài khoản</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tên</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.email}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mã sinh viên</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.student_code || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Giới tính</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.gender || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                {student.birth ? new Date(student.birth).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lớp</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{student.class_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Khoa</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{facultyName}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Chuyên ngành</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{majorName}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nhóm</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                {student.groups?.length > 0
                  ? student.groups.map((group) => group.name).join(', ')
                  : 'Không có nhóm'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mã nhóm</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                {student.groups?.length > 0
                  ? student.groups.map((group) => group.group_code).join(', ')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày tạo</label>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800">
                {student.created_at ? new Date(student.created_at).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;