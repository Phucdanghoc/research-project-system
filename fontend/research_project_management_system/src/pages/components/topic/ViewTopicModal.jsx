import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../store';
import { FaBook, FaTimes, FaUsers, FaUserCircle } from 'react-icons/fa';
import { FacultyMajors, StatusConfig, TopicCategory } from '../../../types/enum';
import { getLecturerByIdAsync } from '../../../store/slices/lecturerSlice';
import { getTopicByIdAsync } from '../../../store/slices/topicSlice';
import DOMPurify from 'dompurify';
import { useSelector } from 'react-redux';

const ViewTopicModal = ({ isOpen, onClose, topicId }) => {
  const dispatch = useAppDispatch();
  const { topic } = useSelector((state) => state.topics);
  const [activeTab, setActiveTab] = useState('topicInfo');

  useEffect(() => {
    console.log(`ViewTopicModal isOpen: ${isOpen}, topicId: ${topicId}`);
    if (isOpen && topicId) {
      dispatch(getTopicByIdAsync(topicId));
    }
  }, [isOpen, topicId, dispatch]);

  useEffect(() => {
    if (isOpen && topic?.lecturer_id) {
      dispatch(getLecturerByIdAsync(topic.lecturer_id));
    }
  }, [isOpen, topic?.lecturer_id, dispatch]);

  if (!isOpen || !topicId || !topic) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-blue-50">
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

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex space-x-2 p-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('topicInfo')}
              className={`px-4 py-2 text-sm font-medium flex items-center ${
                activeTab === 'topicInfo'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FaBook className="mr-2" /> Thông tin đề tài
            </button>
            {topic.lecturer && (
              <button
                onClick={() => setActiveTab('lecturerInfo')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${
                  activeTab === 'lecturerInfo'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <FaUserCircle className="mr-2" /> Thông tin giảng viên
              </button>
            )}
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 text-sm font-medium flex items-center ${
                activeTab === 'description'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FaBook className="mr-2" /> Mô tả
            </button>
            <button
              onClick={() => setActiveTab('requirement')}
              className={`px-4 py-2 text-sm font-medium flex items-center ${
                activeTab === 'requirement'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FaBook className="mr-2" /> Yêu cầu
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 text-sm font-medium flex items-center ${
                activeTab === 'groups'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <FaUsers className="mr-2" /> Nhóm thực hiện
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50 hide-scrollbar">
          {/* Topic Information Tab */}
          {activeTab === 'topicInfo' && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">Thông tin đề tài</h3>
              <div className="space-y-3 text-sm">
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
          )}

          {/* Lecturer Information Tab */}
          {activeTab === 'lecturerInfo' && topic.lecturer && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">Thông tin giảng viên</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-medium text-gray-800">Họ tên:</span> {topic.lecturer.name || 'Không có'}</p>
                <p><span className="font-medium text-gray-800">Mã GV:</span> {topic.lecturer.lecturer_code || 'Không có'}</p>
                <p><span className="font-medium text-gray-800">Email:</span> {topic.lecturer.email || 'Không có'}</p>
                <p><span className="font-medium text-gray-800">SĐT:</span> {topic.lecturer.phone || 'Không có'}</p>
                <p><span className="font-medium text-gray-800">Khoa:</span> {FacultyMajors[topic.lecturer.faculty]?.name || 'Không có'}</p>
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">Mô tả</h3>
              <div
                className="prose prose-sm max-w-none text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-200"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(topic.description || '<p>Không có mô tả</p>'),
                }}
              />
            </div>
          )}

          {/* Requirement Tab */}
          {activeTab === 'requirement' && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">Yêu cầu</h3>
              <div
                className="prose prose-sm max-w-none text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-200"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(topic.requirement || '<p>Không có yêu cầu</p>'),
                }}
              />
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">Nhóm thực hiện</h3>
              {topic.groups && topic.groups.length > 0 ? (
                topic.groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-4 mb-4"
                  >
                    <h4 className="text-base font-medium text-gray-800 mb-3">Nhóm: {group.name}</h4>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-800">ID Nhóm:</span> {group.id}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-800">Tên nhóm:</span> {group.name}
                      </p>
                      <p className="text-gray-700">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            group.defense_id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {group.defense_id ? 'Đã đăng ký bảo vệ' : 'Chưa đăng ký bảo vệ'}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                        {new Date(group.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Không có nhóm nào được gán cho đề tài này.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
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
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ViewTopicModal;