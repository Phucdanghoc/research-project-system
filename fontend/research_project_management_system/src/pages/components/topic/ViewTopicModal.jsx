import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../store';
import { FaUserCircle, FaUsers, FaBook, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { StatusConfig, TopicCategory } from '../../../types/enum';
import { getLecturerByIdAsync } from '../../../store/auth/lecturerSlice';
import DOMPurify from 'dompurify';
import { useSelector } from 'react-redux';

const ViewTopicModal = ({ isOpen, onClose, topic }) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading: lecturersLoading, error: lecturersError } = useSelector((state) => state.lecturers);
  const [activeTab, setActiveTab] = useState('topic');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedRequirement, setExpandedRequirement] = useState(false);

  useEffect(() => {
    if (isOpen && topic?.lecturer_id) {
      dispatch(getLecturerByIdAsync(topic.lecturer_id));
    }
  }, [isOpen, topic?.lecturer_id, dispatch]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  if (!isOpen || !topic) return null;

  const tabs = [
    { id: 'topic', label: 'Thông tin đề tài', icon: <FaBook className="mr-2" /> },
    { id: 'lecturer', label: 'Giảng viên', icon: <FaUserCircle className="mr-2" /> },
    { id: 'groups', label: 'Nhóm thực hiện', icon: <FaUsers className="mr-2" /> },
  ];

  return (
    <div
      className={`fixed inset-0 bg-gray-900/80 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-blue-50 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaBook className="mr-2 text-blue-600" /> {topic.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
            title="Đóng"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 sm:px-6 py-3 text-base sm:text-base font-medium transition-colors ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white">
          {/* Topic Information */}
          {activeTab === 'topic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">ID:</span> {topic.id}
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Mã đề tài:</span> {topic.topic_code}
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Trạng thái:</span>{' '}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${StatusConfig[topic.status]?.className || 'text-gray-600 bg-gray-100'
                        }`}
                    >
                      {StatusConfig[topic.status]?.label || topic.status}
                    </span>
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Danh mục:</span>{' '}
                    {TopicCategory[topic.category] || topic.category || 'Không có'}
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Khoa:</span> {topic.faculty || 'Không có'}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Số lượng đề tài:</span> {topic.topic_quantity || 0}
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Số lượng sinh viên:</span> {topic.student_quantity || 0}
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                    {new Date(topic.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium text-gray-800">Ngày cập nhật:</span>{' '}
                    {new Date(topic.updated_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer p-3 bg-blue-50 rounded-lg"
                    onClick={() => setExpandedDescription(!expandedDescription)}
                  >
                    <label className="text-xl font-semibold text-blue-700">Mô tả</label>
                    {expandedDescription ? (
                      <FaChevronUp className="text-blue-600" />
                    ) : (
                      <FaChevronDown className="text-blue-600" />
                    )}
                  </div>
                  {expandedDescription && (
                    <div
                      className="prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-lg border border-gray-200"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(topic.description || '<p>Không có mô tả</p>'),
                      }}
                    />
                  )}
                </div>
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer p-3 bg-red-50 rounded-lg"
                    onClick={() => setExpandedRequirement(!expandedRequirement)}
                  >
                    <label className="text-xl font-semibold text-red-700">Yêu cầu</label>
                    {expandedRequirement ? (
                      <FaChevronUp className="text-red-600" />
                    ) : (
                      <FaChevronDown className="text-red-600" />
                    )}
                  </div>
                  {expandedRequirement && (
                    <div
                      className="prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-lg border border-gray-200"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(topic.requirement || '<p>Không có yêu cầu</p>'),
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lecturer Information */}
          {activeTab === 'lecturer' && (
            <div className="space-y-6">
              {lecturersLoading ? (
                <p className="text-base text-gray-500">Đang tải thông tin giảng viên...</p>
              ) : lecturersError ? (
                <p className="text-base text-red-600">Lỗi: {lecturersError}</p>
              ) : lecturers ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <p className="text-base text-gray-600">
                      <span className="font-medium text-gray-800">Họ tên:</span> {lecturers.name || 'Không có'}
                    </p>
                    <p className="text-base text-gray-600">
                      <span className="font-medium text-gray-800">Mã giảng viên:</span>{' '}
                      {lecturers.lecturer_code || 'Không có'}
                    </p>
                    <p className="text-base text-gray-600">
                      <span className="font-medium text-gray-800">Email:</span> {lecturers.email || 'Không có'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-base text-gray-600">
                      <span className="font-medium text-gray-800">Số điện thoại:</span> {lecturers.phone || 'Không có'}
                    </p>
                    <p className="text-base text-gray-600">
                      <span className="font-medium text-gray-800">Ngày sinh:</span> {lecturers.birth || 'Không có'}
                    </p>
                    <p className="text-base text-gray-600">
                      <span className="font-medium text-gray-800">Chuyên ngành:</span> {lecturers.major || 'Không có'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-base text-gray-500">Không tìm thấy thông tin giảng viên.</p>
              )}
            </div>
          )}

          {/* Groups Information */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              {topic.groups && topic.groups.length > 0 ? (
                topic.groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <h4 className="text-base font-medium text-gray-800">Nhóm: {group.name}</h4>
                      {expandedGroups[group.id] ? (
                        <FaChevronUp className="text-gray-500" />
                      ) : (
                        <FaChevronDown className="text-gray-500" />
                      )}
                    </div>
                    {expandedGroups[group.id] && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">ID Nhóm:</span> {group.id}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Tên nhóm:</span> {group.name}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Giảng viên (ID):</span>{' '}
                            {group.lecturer_id || 'Không có'}
                          </p>
                          <p className="text-gray-600">
                            {/* <span className="font-medium text-gray-800">ID Buổi bảo vệ:</span>{' '} */}
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-base font-semibold
                              ${group.defense_id
                                  ? 'bg-green-100 text-green-700'  
                                  : 'bg-yellow-100 text-yellow-700'
                                }`}
                            >
                              {group.defense_id ? 'Đã đăng kí bảo vệ' : 'Chưa đăng kí bảo vệ'}
                            </span>
                          </p>

                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                            {new Date(group.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-base text-gray-500">Không có nhóm nào được gán cho đề tài này.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>

        <style jsx>{`
          .prose :where(h1, h2, h3, p):not(:last-child) {
            margin-bottom: 0.5rem;
          }
          .prose h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
          }
          .prose h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
          }
          .prose h3 {
            font-size: 1.125rem;
            font-weight: 500;
            color: #1f2937;
          }
          .prose p {
            font-size: 0.875rem;
            color: #4b5563;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ViewTopicModal;