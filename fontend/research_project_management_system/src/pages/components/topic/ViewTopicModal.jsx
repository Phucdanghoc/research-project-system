import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../store';
import { FaBook, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FacultyMajors, StatusConfig, TopicCategory } from '../../../types/enum';
import { getLecturerByIdAsync } from '../../../store/auth/lecturerSlice';
import { getTopicByIdAsync } from '../../../store/auth/topicSlice';
import DOMPurify from 'dompurify';
import { useSelector } from 'react-redux';

const ViewTopicModal = ({ isOpen, onClose, topicId }) => {
  const dispatch = useAppDispatch();
  const { topic } = useSelector((state) => state.topics);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedRequirement, setExpandedRequirement] = useState(false);

  useEffect(() => {
    if (isOpen && topicId) {
      dispatch(getTopicByIdAsync(topicId));
    }
  }, [isOpen, topicId, dispatch]);

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

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-blue-50 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <FaBook className="text-blue-600" /> {topic.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
            title="Đóng"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50">
          {/* Topic & Lecturer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">Thông tin đề tài</h3>
              <div className="space-y-3">
                <p><span className="font-medium text-gray-800">Mã đề tài:</span> {topic.topic_code}</p>
                <p>
                  <span className="font-medium text-gray-800">Trạng thái:</span>{' '}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${StatusConfig[topic.status]?.className || 'bg-gray-100 text-gray-600'}`}>
                    {StatusConfig[topic.status]?.label || topic.status}
                  </span>
                </p>
                <p><span className="font-medium text-gray-800">Danh mục:</span> {TopicCategory[topic.category] || topic.category || 'Không có'}</p>
                <p><span className="font-medium text-gray-800">Ngày tạo:</span> {new Date(topic.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </div>
            {topic.lecturer && (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">Thông tin giảng viên</h3>
                <div className="space-y-3">
                  <p><span className="font-medium text-gray-800">Họ tên:</span> {topic.lecturer.name || 'Không có'}</p>
                  <p><span className="font-medium text-gray-800">Mã GV:</span> {topic.lecturer.lecturer_code || 'Không có'}</p>
                  <p><span className="font-medium text-gray-800">Email:</span> {topic.lecturer.email || 'Không có'}</p>
                  <p><span className="font-medium text-gray-800">SĐT:</span> {topic.lecturer.phone || 'Không có'}</p>
                  <p><span className="font-medium text-gray-800">Khoa:</span> {FacultyMajors[topic.lecturer.faculty]?.name || 'Không có'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description & Requirement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div
                className="flex justify-between items-center cursor-pointer p-3 bg-blue-100 rounded-lg"
                onClick={() => setExpandedDescription(!expandedDescription)}
              >
                <label className="text-lg font-semibold text-blue-700">Mô tả</label>
                {expandedDescription ? (
                  <FaChevronUp className="text-blue-600" />
                ) : (
                  <FaChevronDown className="text-blue-600" />
                )}
              </div>
              {expandedDescription && (
                <div
                  className="prose prose-sm max-w-none text-gray-700 mt-2 p-4 bg-white rounded-lg border border-gray-200"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(topic.description || '<p>Không có mô tả</p>'),
                  }}
                />
              )}
            </div>
            <div>
              <div
                className="flex justify-between items-center cursor-pointer p-3 bg-red-100 rounded-lg"
                onClick={() => setExpandedRequirement(!expandedRequirement)}
              >
                <label className="text-lg font-semibold text-red-700">Yêu cầu</label>
                {expandedRequirement ? (
                  <FaChevronUp className="text-red-600" />
                ) : (
                  <FaChevronDown className="text-red-600" />
                )}
              </div>
              {expandedRequirement && (
                <div
                  className="prose prose-sm max-w-none text-gray-700 mt-2 p-4 bg-white rounded-lg border border-gray-200"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(topic.requirement || '<p>Không có yêu cầu</p>'),
                  }}
                />
              )}
            </div>
          </div>

          {/* Groups */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Nhóm thực hiện</h3>
            {topic.groups && topic.groups.length > 0 ? (
              topic.groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 mb-4"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-100"
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
                    <div className="flex flex-wrap gap-x-8 gap-y-2 px-4 pb-4">
                      <p className="text-gray-700 mb-0">
                        <span className="font-medium text-gray-800">ID Nhóm:</span> {group.id}
                      </p>
                      <p className="text-gray-700 mb-0">
                        <span className="font-medium text-gray-800">Tên nhóm:</span> {group.name}
                      </p>
                      <p className="text-gray-700 mb-0">
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
                      <p className="text-gray-700 mb-0">
                        <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                        {new Date(group.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-base text-gray-500">Không có nhóm nào được gán cho đề tài này.</p>
            )}
          </div>
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

        <style>{`
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
            font-size: 0.95rem;
            color: #374151;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ViewTopicModal;