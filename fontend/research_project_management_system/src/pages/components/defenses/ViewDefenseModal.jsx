import { useEffect, useState } from 'react';
import { FaTimes, FaUserCircle, FaUniversity, FaClock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getDefenseByIdAsync } from '../../../store/slices/defensesSlice';
import { TimeService } from '../../../utils/time';
import { FaCheckCircle, FaTimesCircle, FaRegCircle } from 'react-icons/fa';
import { useAppDispatch } from '../../../store';

const statusDefenseConfig = {
  not_defended: {
    icon: <FaRegCircle className="text-gray-500 mr-1" />,
    label: 'Chưa bảo vệ',
    border: 'border-gray-500',
    bg: 'bg-gray-100',
    text: 'text-gray-700'
  },
  waiting_defense: {
    icon: <FaClock className="text-yellow-600 mr-1" />,
    label: 'Đăng kí bảo vệ',
    border: 'border-yellow-600',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700'
  },
  approved: {
    icon: <FaCheckCircle className="text-green-600 mr-1" />,
    label: 'Đã duyệt',
    border: 'border-green-600',
    bg: 'bg-green-100',
    text: 'text-green-700'
  },
  rejected: {
    icon: <FaTimesCircle className="text-red-600 mr-1" />,
    label: 'Không duyệt',
    border: 'border-red-600',
    bg: 'bg-red-100',
    text: 'text-red-700'
  },
};

const TabButton = ({ label, icon, isActive, onClick }) => (
  <button
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

const TabContent = ({ children }) => (
  <div className="p-5 bg-white rounded-b-lg border border-gray-200">{children}</div>
);

const ViewDefenseModal = ({ isOpen, onClose, defenseId }) => {
  const dispatch = useAppDispatch();
  const { defense, loading, error } = useSelector((state) => state.defenses);
  const [activeTab, setActiveTab] = useState('defenseInfo');

  useEffect(() => {
    if (isOpen && defenseId) {
      dispatch(getDefenseByIdAsync(defenseId));
    }
  }, [isOpen, defenseId, dispatch]);

  if (!isOpen || !defense) return null;

  const tabs = [
    { id: 'defenseInfo', label: 'Thông tin buổi bảo vệ', icon: <FaClock className="text-blue-600" /> },
    { id: 'lecturerInfo', label: 'Thông tin giảng viên', icon: <FaUserCircle className="text-blue-600" /> },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center p-2 sm:p-6 transition-all duration-300 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 bg-blue-50 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaClock className="mr-2 text-blue-600" /> Chi tiết buổi bảo vệ: {defense.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
            title="Đóng"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          <div className="p-6 sm:p-8 bg-white flex-1 overflow-y-auto">
            {loading && <p className="text-base text-gray-500">Đang tải thông tin buổi bảo vệ...</p>}
            {error && <p className="text-base text-red-600">Lỗi: {error}</p>}
            {!loading && !error && (
              <TabContent>
                {activeTab === 'defenseInfo' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Tên buổi bảo vệ:</span> {defense.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Mã buổi bảo vệ:</span> {defense.defense_code || 'Không có'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Trạng thái:</span>{' '}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusDefenseConfig[defense.status]?.bg || 'bg-gray-100'} ${statusDefenseConfig[defense.status]?.text || 'text-gray-700'}`}
                      >
                        {statusDefenseConfig[defense.status]?.icon}
                        {statusDefenseConfig[defense.status]?.label || 'Không xác định'}
                      </span>
                    </p>
                  </div>
                )}

                {activeTab === 'lecturerInfo' && (
                  <div>
                    {defense.lecturers?.length > 0 ? (
                      <div className="space-y-6">
                        {defense.lecturers.map((lecturer) => (
                          <div key={lecturer.id} className="flex flex-col sm:flex-row gap-6 items-center border-b border-gray-200 pb-4">
                            <FaUserCircle className="text-gray-400 bg-gray-100 rounded-full p-1" size={70} />
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                              <p className="text-gray-600">
                                <span className="font-medium text-gray-800">Họ tên:</span> {lecturer.name || 'Không có'}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium text-gray-800">Mã giảng viên:</span>{' '}
                                {lecturer.lecturer_code || 'Không có'}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium text-gray-800">Email:</span>{' '}
                                {lecturer.email || 'Không có'}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium text-gray-800">Số điện thoại:</span>{' '}
                                {lecturer.phone || 'Không có'}
                              </p>
                              <p className="text-gray-600">
                                <FaUniversity className="text-blue-400 inline mr-2" />
                                <span className="font-medium text-gray-800">Khoa:</span>{' '}
                                {lecturer.faculty || 'Không có'}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium text-gray-800">Ngày sinh:</span>{' '}
                                {lecturer.birth
                                  ? TimeService.convertDateStringToDDMMYYYY(lecturer.birth)
                                  : 'Không có'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">Không tìm thấy thông tin giảng viên.</p>
                    )}
                  </div>
                )}
              </TabContent>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDefenseModal;