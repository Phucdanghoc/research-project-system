import { useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { FaUserCircle, FaUsers, FaBook, FaTimes } from 'react-icons/fa';
import { StatusConfig, TopicCategory } from '../../../types/enum';
import { getLecturerByIdAsync } from '../../../store/auth/lecturerSlice';
import DOMPurify from 'dompurify';

const ViewTopicModal = ({ isOpen, onClose, topic }) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading: lecturersLoading, error: lecturersError } = useAppDispatch((state) => state.lecturers);

  useEffect(() => {
    if (isOpen && topic?.lecturer_id) {
      dispatch(getLecturerByIdAsync(topic.lecturer_id));
    }
  }, [isOpen, topic?.lecturer_id, dispatch]);

  if (!isOpen || !topic) return null;

  console.log('Lecturer:', lecturers);

  return (
    <div className="fixed inset-0 bg-gray-600/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center">
            <FaBook className="mr-2" /> Chi tiết đề tài
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đề tài</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium text-gray-700">ID:</span> {topic.id}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Tiêu đề:</span> {topic.title}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Mã đề tài:</span> {topic.topic_code}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Trạng thái:</span>{' '}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${StatusConfig[topic.status]?.className || 'text-gray-600 bg-gray-100'
                    }`}
                >
                  {StatusConfig[topic.status]?.label || topic.status}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Danh mục:</span>{' '}
                {TopicCategory[topic.category] || topic.category || 'Không có'}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Khoa:</span> {topic.faculty || 'Không có'}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Số lượng đề tài:</span> {topic.topic_quantity || 0}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Số lượng sinh viên:</span> {topic.student_quantity || 0}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Ngày tạo:</span>{' '}
                {new Date(topic.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Ngày cập nhật:</span>{' '}
                {new Date(topic.updated_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-blue-700 bg-blue-50 px-1 rounded mb-1 inline-block">Mô tả:</label>
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(topic.description || '<p>Không có mô tả</p>'),
                }}
              />
            </div>
            <hr className="my-3 border-t border-gray-400" />

            <div>
              <label className="block text-sm font-semibold text-red-700 bg-blue-50 px-1 rounded mb-1 inline-block">Yêu cầu:</label>
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(topic.requirement || '<p>Không có yêu cầu</p>'),
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaUserCircle className="mr-2" /> Thông tin giảng viên
          </h3>
          {lecturersLoading ? (
            <p className="text-sm text-gray-600">Đang tải thông tin giảng viên...</p>
          ) : lecturersError ? (
            <p className="text-sm text-red-600">Lỗi: {lecturersError}</p>
          ) : lecturers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p>
                <span className="font-medium text-gray-700">Họ tên:</span> {lecturers.name || 'Không có'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Mã giảng viên:</span>{' '}
                {lecturers.lecturer_code || 'Không có'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Email:</span> {lecturers.email || 'Không có'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Số điện thoại:</span> {lecturers.phone || 'Không có'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Ngày sinh:</span> {lecturers.birth || 'Không có'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Chuyên ngành:</span> {lecturers.major || 'Không có'}
              </p>
              <p>
                <span className="font-medium text-gray-700">Khoa:</span> {lecturers.faculty || 'Không có'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Không tìm thấy thông tin giảng viên.</p>
          )}
        </div>

        <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaUsers className="mr-2" /> Nhóm thực hiện
          </h3>
          {topic.groups && topic.groups.length > 0 ? (
            <div className="space-y-3">
              {topic.groups.map((group) => (
                <div key={group.id} className="p-3 bg-white rounded-md border border-gray-100 hover:bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">ID Nhóm:</span> {group.id}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Tên nhóm:</span> {group.name}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Giảng viên (ID):</span>{' '}
                      {group.lecturer_id || 'Không có'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">ID Buổi bảo vệ:</span>{' '}
                      {group.defense_id || 'Không có'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Ngày tạo:</span>{' '}
                      {new Date(group.created_at).toLocaleDateString('vi-VN')}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Ngày cập nhật:</span>{' '}
                      {new Date(group.updated_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Không có nhóm nào được gán cho đề tài này.</p>
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
              label.block.text-sm {
                font-weight: 600;
                color: #2563eb !important;
                background: #eff6ff;
                padding: 0 0.35rem;
                border-radius: 0.25rem;
                display: inline-block;
              }
            `}</style>
      </div>
    </div>
  );
};


export default ViewTopicModal;