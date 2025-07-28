import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileAsync, changePasswordAsync, clearError } from '../../store/slices/userSlice';
import { FacultyMajors } from '../../types/enum';
import { FaUserCircle } from 'react-icons/fa';

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
      dispatch(clearError());
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
    if (!date) return 'Không có';
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

  if (!profile && loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-gray-600 text-lg animate-pulse">Đang tải...</div>
      </div>
    );
  }

  if (!profile && asyncError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-red-500 text-lg">Lỗi: {asyncError}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-gray-600 text-lg">Không tìm thấy thông tin người dùng</div>
      </div>
    );
  }

  const isLecturer = profile.role === 'lecturer';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4 sm:p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-4xl flex flex-col transform transition-all duration-300 hover:shadow-3xl">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
              {getInitials(profile.name)}
            </div>
            <span className={`absolute bottom-0 right-0 px-2 sm:px-3 py-1 text-xs font-semibold text-white rounded-full ${isLecturer ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isLecturer ? 'Giảng viên' : 'Sinh viên'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{profile.name}</h2>
          <p className="text-gray-500 text-sm">{profile.email}</p>
        </div>

        {/* Two-Column Section with Vertical Divider */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          {/* Left Section: Personal Information */}
          <div className="flex-1 sm:border-r sm:border-gray-200 pr-0 sm:pr-8">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Thông tin cá nhân</h3>
            <div className="space-y-3">
              <Info label="Email" value={profile.email} />
              <Info label="Số điện thoại" value={profile.phone || 'Không có'} />
              <Info
                label="Giới tính"
                value={profile.gender === 'Female' ? 'Nữ' : profile.gender === 'Male' ? 'Nam' : 'Không có'}
              />
              <Info label="Ngày sinh" value={formatDate(profile.birth)} />
            </div>
          </div>

          {/* Right Section: Role-Specific Information */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
              Thông tin {isLecturer ? 'giảng viên' : 'sinh viên'}
            </h3>
            <div className="space-y-3">
              {isLecturer ? (
                <>
                  <Info label="Mã giảng viên" value={profile.lecturer_code || 'Không có'} />
                  <Info label="Khoa" value={FacultyMajors[profile.faculty]?.name || 'Không có'} />
                  <Info
                    label="Nhóm đăng ký"
                    value={
                      profile.lecture_groups?.length > 0 ? (
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {profile.lecture_groups.map((group) => (
                            <div
                              key={group.id}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getRandomColor()} flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-transform`}
                              title={group.name}
                            >
                              {getInitials(group.name)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-red-500 text-white text-xs sm:text-sm font-medium">
                          Chưa có
                        </span>
                      )
                    }
                  />
                </>
              ) : (
                <>
                  <Info label="Mã sinh viên" value={profile.student_code || 'Không có'} />
                  <Info label="Lớp" value={profile.class_name || 'Không có'} />
                  <Info label="Khoa" value={FacultyMajors[profile.faculty]?.name || 'Không có'} />
                  <Info
                    label="Chuyên ngành"
                    value={
                      FacultyMajors[profile.faculty]?.majors?.find((m) => m.code === profile.major)?.name ||
                      'Không có'
                    }
                  />
                  <Info
                    label="Nhóm"
                    value={
                      profile.groups?.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {profile.groups.map((group, index) => (
                            <div
                              key={index}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs sm:text-sm font-semibold"
                              title={group.name}
                            >
                              {group.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-red-500 text-white text-xs sm:text-sm font-medium">
                          Chưa có
                        </span>
                      )
                    }
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenModal}
          className="mt-6 sm:mt-8 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg self-center"
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg relative transform transition-all duration-300 scale-100">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold"
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Đổi mật khẩu</h2>
            <div className="flex items-center gap-3 mb-6">
              <Step active>1</Step>
              <span className="text-gray-400">→</span>
              <Step active={!!oldPassword}>2</Step>
              <span className="text-gray-400">→</span>
              <Step active={!!newPassword && !!confirmPassword}>3</Step>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  id="showPassword"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((v) => !v)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600">Hiện mật khẩu</label>
              </div>
              {(localError || asyncError) && (
                <p className="text-red-500 text-sm mb-4">{localError || asyncError}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 sm:px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
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
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-800 mt-1 sm:mt-0">{value}</span>
    </div>
  );
}

// Step indicator for modal
function Step({ active, children }) {
  return (
    <span
      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
        } transition`}
    >
      {children}
    </span>
  );
}

export default ProfilePage;