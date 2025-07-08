import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileAsync, changePasswordAsync, clearError } from '../../store/slices/userSlice';
import { FacultyMajors } from '../../types/enum';

// Function to generate random color
const getRandomColor = () => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const dispatch = useDispatch();
  const { profile, loading, error: asyncError } = useSelector((state) => state.users);

  // Fetch user profile on mount
  useEffect(() => {
    dispatch(getProfileAsync());
    return () => {
      dispatch(clearError()); // Clear error when component unmounts
    };
  }, [dispatch]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setLocalError(null);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    dispatch(clearError());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLocalError(null);
    dispatch(clearError());
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setLocalError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    try {
      await dispatch(changePasswordAsync({ oldPassword, newPassword })).unwrap();
      handleCloseModal();
      alert('Đổi mật khẩu thành công!');
    } catch (err) {
      setLocalError(asyncError || 'Đổi mật khẩu thất bại');
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

  // Render loading state or error if profile is not available
  if (!profile && loading) {
    return <div className="container mx-auto p-6">Đang tải...</div>;
  }

  if (!profile && asyncError) {
    return <div className="container mx-auto p-6 text-red-500">Lỗi: {asyncError}</div>;
  }

  if (!profile) {
    return <div className="container mx-auto p-6">Không tìm thấy thông tin người dùng</div>;
  }

  const isLecturer = profile.role === 'lecturer';

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center w-full md:w-1/3">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 mb-4">
            {getInitials(profile.name)}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">{profile.name}</h2>
          <span className="text-sm text-gray-500 mb-2">
            {profile.role === 'student' ? 'Sinh viên' : profile.role === 'lecturer' ? 'Giảng viên' : profile.role}
          </span>
          {isLecturer && (
            <div className="mt-2 mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Nhóm đăng ký ({profile.lecture_groups?.length || 0})</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {profile.lecture_groups?.map((group, index) => (
                  <div
                    key={group.id}
                    className={`w-8 h-8 rounded-full ${getRandomColor()} flex items-center justify-center text-white text-sm font-bold`}
                    title={group.name}
                  >
                    {getInitials(group.name)}
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <Info label="Email" value={profile.email} />
            <Info label="Số điện thoại" value={profile.phone || '-'} />
            <Info
              label="Giới tính"
              value={profile.gender === 'Female' ? 'Nữ' : profile.gender === 'Male' ? 'Nam' : '-'}
            />
            <Info label="Ngày sinh" value={formatDate(profile.birth)} />
            {!isLecturer && <Info label="Mã sinh viên" value={profile.student_code || '-'} />}
            {!isLecturer && <Info label="Lớp" value={profile.class_name || '-'} />}
            <Info label="Khoa" value={FacultyMajors[profile.faculty]?.name || '-'} />
            {!isLecturer && (
              <Info
                label="Chuyên ngành"
                value={
                  FacultyMajors[profile.faculty]?.majors?.find((m) => m.code === profile.major)?.name ||
                  'Không rõ'
                }
              />
            )}
            <Info label="Mã giảng viên" value={profile.lecturer_code || '-'} />
            {!isLecturer && (
              <Info label="Nhóm" value={profile.groups?.length > 0 ? profile.groups.join(', ') : '-'} />
            )}
           
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
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
              <Step active={!!newPassword && !!confirmPassword}>3</Step>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Mật khẩu cũ</label>
                <input
                  type={showPassword ? 'text' : 'password'}
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
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type={showPassword ? 'text' : 'password'}
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
              {(localError || asyncError) && (
                <p className="text-red-500 text-sm mb-4">{localError || asyncError}</p>
              )}
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
        <span
          className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
            active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
        {children}
        </span>
    );
}

export default ProfilePage;