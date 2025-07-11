import { FaUserCircle, FaTimes, FaUsers } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { useState } from 'react';

const TabButton = ({ label, icon, isActive, onClick }) => (
  <button
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      isActive ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
    onClick={onClick}
    aria-selected={isActive}
    role="tab"
  >
    {icon}
    {label}
  </button>
);

const TabContent = ({ children }) => (
  <div className="p-5 bg-white rounded-b-lg border border-gray-200" role="tabpanel">
    {children}
  </div>
);

const ViewStudentModal = ({ isOpen, onClose, student }) => {
  const [activeTab, setActiveTab] = useState('studentInfo');

  if (!isOpen || !student) return null;

  const tabs = [
    { id: 'studentInfo', label: 'Thông tin sinh viên', icon: <FaUserCircle className="text-blue-600" /> },
    { id: 'groupInfo', label: 'Thông tin nhóm', icon: <FaUsers className="text-blue-600" /> },
  ];

  return (
    <div className="fixed rounded-lg inset-0 rounded-lg bg-gray-600/60 flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 bg-blue-50 border-b border-gray-200">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaUserCircle className="mr-2 text-blue-600" /> Chi tiết sinh viên: <span className="ml-2 text-blue-700">{student.name}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200"
            title="Đóng"
            aria-label="Đóng modal"
          >
            <FaTimes size={24}  color='red'/>
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200" role="tablist">
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

          <div className="p-2 sm:p-4 bg-white flex-1 overflow-y-auto">
            {activeTab === 'studentInfo' && (
              <TabContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <p>
                    <span className="font-medium text-gray-800">Mã sinh viên:</span>{' '}
                    <span className="font-semibold text-blue-700">{student.student_code}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Họ tên:</span>{' '}
                    <span className="font-semibold text-blue-700">{student.name}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Email:</span>{' '}
                    <span className="text-gray-600">{student.email || 'Không có'}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Khoa:</span>{' '}
                    <span className="text-gray-600">{student.faculty || 'Không có'}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Chuyên ngành:</span>{' '}
                    <span className="text-gray-600">{student.major || 'Không có'}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                    <span className="text-gray-600">{TimeService.convertDateStringToDDMMYYYY(student.created_at)}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Ngày cập nhật:</span>{' '}
                    <span className="text-gray-600">{TimeService.convertDateStringToDDMMYYYY(student.updated_at)}</span>
                  </p>
                </div>
              </TabContent>
            )}

            {activeTab === 'groupInfo' && (
              <TabContent>
                {student.groups && student.groups.length > 0 ? (
                  student.groups.map((group, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                      <p>
                        <span className="font-medium text-gray-800">Tên nhóm:</span>{' '}
                        <span className="font-semibold text-blue-700">{group.name || 'Không có'}</span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Mã nhóm:</span>{' '}
                        <span className="text-gray-600">{group.group_code || 'Không có'}</span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Trạng thái:</span>{' '}
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            group.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : group.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {group.status === 'pending'
                            ? 'Đang chờ'
                            : group.status === 'accepted'
                            ? 'Đã duyệt'
                            : group.status === 'denied'
                            ? 'Đã từ chối'
                            : group.status || 'Không xác định'}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                        <span className="text-gray-600">
                          {TimeService.convertDateStringToDDMMYYYY(group.created_at) || 'Không có'}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-800">Ngày cập nhật:</span>{' '}
                        <span className="text-gray-600">
                          {TimeService.convertDateStringToDDMMYYYY(group.updated_at) || 'Không có'}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Không tìm thấy thông tin nhóm.</p>
                )}
              </TabContent>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentModal;