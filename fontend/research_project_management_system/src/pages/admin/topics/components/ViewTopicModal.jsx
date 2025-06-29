import PropTypes from 'prop-types';
import { StatusConfig, TopicCategory } from '../../../../types/enum';

const ViewTopicModal = ({ isOpen, onClose, topic }) => {
  if (!isOpen || !topic) return null;

  // Status labels for display


  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Chi tiết đề tài</h2>

        {/* Row 1: Topic Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Thông tin đề tài
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">ID Đề tài</label>
                <p className="text-gray-900">{topic.id}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Tiêu đề</label>
                <p className="text-gray-900">{topic.title}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Mã đề tài</label>
                <p className="text-gray-900">{topic.topic_code}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Trạng thái</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    StatusConfig[topic.status]?.className || 'text-gray-600 bg-gray-100'
                  }`}
                >
                  {StatusConfig[topic.status]?.label || topic.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Danh mục</label>
                <p className="text-gray-900">{TopicCategory[topic.category] || topic.category || 'Không có'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Khoa</label>
                <p className="text-gray-900">{topic.faculty || 'Không có'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Số lượng đề tài</label>
                <p className="text-gray-900">{topic.topic_quantity || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Số lượng sinh viên</label>
                <p className="text-gray-900">{topic.student_quantity || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Ngày tạo</label>
                <p className="text-gray-900">
                  {new Date(topic.created_at).toLocaleString('vi-VN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Ngày cập nhật</label>
                <p className="text-gray-900">
                  {new Date(topic.updated_at).toLocaleString('vi-VN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Mô tả</label>
                <p className="text-gray-900 whitespace-pre-wrap">{topic.description || 'Không có'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Yêu cầu</label>
                <p className="text-gray-900 whitespace-pre-wrap">{topic.requirement || 'Không có'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Lecturer Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Thông tin giảng viên
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Giảng viên</label>
              <p className="text-gray-900">
                {topic.lecturer_name || topic.lecturer_id || 'Không có'}
                {topic.lecturer_id && ` (ID: ${topic.lecturer_id})`}
              </p>
            </div>
          </div>
        </div>

        {/* Row 3: Groups Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Nhóm thực hiện
          </h3>
          {topic.groups && topic.groups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-900">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 font-semibold text-gray-700">ID Nhóm</th>
                    <th className="py-2 px-4 font-semibold text-gray-700">Tên nhóm</th>
                    <th className="py-2 px-4 font-semibold text-gray-700">Giảng viên (ID)</th>
                    <th className="py-2 px-4 font-semibold text-gray-700">Ngày tạo</th>
                    <th className="py-2 px-4 font-semibold text-gray-700">Ngày cập nhật</th>
                    <th className="py-2 px-4 font-semibold text-gray-700">ID Buổi bảo vệ</th>
                  </tr>
                </thead>
                <tbody>
                  {topic.groups.map((group) => (
                    <tr key={group.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{group.id}</td>
                      <td className="py-2 px-4">{group.name}</td>
                      <td className="py-2 px-4">{group.lecturer_id || 'Không có'}</td>
                      <td className="py-2 px-4">
                        {new Date(group.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-2 px-4">
                        {new Date(group.updated_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-2 px-4">{group.defense_id || 'Không có'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Không có nhóm nào được gán cho đề tài này.</p>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

ViewTopicModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  topic: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    topic_code: PropTypes.string,
    description: PropTypes.string,
    requirement: PropTypes.string,
    topic_quantity: PropTypes.number,
    student_quantity: PropTypes.number,
    status: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    lecturer_id: PropTypes.number,
    lecturer_name: PropTypes.string,
    category: PropTypes.string,
    faculty: PropTypes.string,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        lecturer_id: PropTypes.number,
        created_at: PropTypes.string,
        updated_at: PropTypes.string,
        defense_id: PropTypes.number,
      })
    ),
  }),
};

export default ViewTopicModal;