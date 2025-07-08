import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { changePasswordAsync } from '../../store/slices/userSlice';
import { useAppDispatch } from '../../store';
import { FacultyMajors } from '../../types/enum';

const user = {
  id: 44,
  email: "ngoc.do@sv.edu.vn",
  created_at: "2025-07-04T09:49:31.630Z",
  updated_at: "2025-07-04T09:49:31.630Z",
  role: "student",
  name: "Đỗ Thị Ngọc",
  gender: "female",
  phone: "0979123456",
  birth: null,
  student_code: "S230010",
  class_name: "Lớp QTKD02",
  faculty: "QTKD",
  major: "KDQT",
  lecturer_code: null,
  groups: [],
  lecture_groups: []
};

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useAppDispatch();
  const { loading, error: asyncError } = useSelector((state) => state.users);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError(null);
    setOldPassword('');
    setCurrentPassword('');
    setConfirmPassword('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (currentPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    try {
      await dispatch(changePasswordAsync({ oldPassword, currentPassword })).unwrap();
      handleCloseModal();
      alert('Đổi mật khẩu thành công!');
    } catch (err) {
      setError(asyncError || 'Đổi mật khẩu thất bại');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center w-full md:w-1/3">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 mb-4">
            {getInitials(user.name)}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">{user.name}</h2>
          <span className="text-sm text-gray-500 mb-2">{user.role === 'student' ? 'Sinh viên' : user.role}</span>
          <button
            onClick={handleOpenModal}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow"
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-white shadow-lg rounded-xl p-8 w-full md:w-2/3">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Thông tin cá nhân</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Info label="Email" value={user.email} />
            <Info label="Số điện thoại" value={user.phone || '-'} />
            <Info label="Giới tính" value={user.gender === 'female' ? 'Nữ' : user.gender === 'male' ? 'Nam' : '-'} />
            <Info label="Ngày sinh" value={formatDate(user.birth)} />
            <Info label="Mã sinh viên" value={user.student_code} />
            <Info label="Lớp" value={user.class_name} />
            <Info label="Khoa" value={FacultyMajors[user.faculty].name} />
            <Info label="Chuyên ngành" value={FacultyMajors?.[user.faculty]?.majors?.find(m => m.code === user.major)?.name || 'Không rõ'} />
            <Info label="Mã giảng viên" value={user.lecturer_code || '-'} />
            <Info label="Nhóm" value={user.groups.length > 0 ? user.groups.join(', ') : '-'} />
            <Info label="Nhóm giảng dạy" value={user.lecture_groups.length > 0 ? user.lecture_groups.join(', ') : '-'} />
            <Info label="Ngày tạo" value={formatDate(user.created_at)} />
            <Info label="Ngày cập nhật" value={formatDate(user.updated_at)} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Đổi mật khẩu</h2>
            <div className="flex items-center gap-2 mb-6">
              <Step active>1</Step>
              <span className="text-gray-400">→</span>
              <Step active={!!oldPassword}>2</Step>
              <span className="text-gray-400">→</span>
              <Step active={!!currentPassword && !!confirmPassword}>3</Step>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Mật khẩu cũ</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Mật khẩu mới</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  id="showPassword"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((v) => !v)}
                  className="mr-2"
                />
                <label htmlFor="showPassword" className="text-sm text-gray-600">Hiện mật khẩu</label>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400 font-medium"
                >
                  {loading ? 'Đang xử lý...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Info row component
function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className="text-base text-gray-800">{value}</div>
    </div>
  );
}

// Step indicator for modal
function Step({ active, children }) {
  return (
    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
      {children}
    </span>
  );
}

export default ProfilePage;