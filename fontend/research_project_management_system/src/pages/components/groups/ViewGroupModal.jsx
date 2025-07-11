import { useEffect, useState } from 'react';
import { FaUsers, FaTimes, FaUserCircle, FaUniversity, FaBook } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupAsync } from '../../../store/slices/groupSlice';
import { TimeService } from '../../../utils/time';
import DOMPurify from 'dompurify';
import { StudentCard } from '../../../components/cards/StudentCard';
import { TopicCategory } from '../../../types/enum';

const TabButton = ({ label, icon, isActive, onClick }) => (
  <button
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      isActive ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

const TabContent = ({ children }) => (
  <div className="p-5 bg-white rounded-b-lg border border-gray-200">{children}</div>
);

const ViewGroupModal = ({ isOpen, onClose, groupId }) => {
  const dispatch = useDispatch();
  const { group, loading: groupLoading, error: groupError } = useSelector((state) => state.groups);
  const [activeTab, setActiveTab] = useState('groupInfo');

  useEffect(() => {
    if (isOpen && groupId) {
      dispatch(getGroupAsync(groupId));
    }
  }, [isOpen, groupId, dispatch]);

  if (!isOpen || !group) return null;

  const topic = group.topics?.[0];
  const tabs = [
    { id: 'groupInfo', label: 'Thông tin nhóm', icon: <FaUsers className="text-blue-600" /> },
    topic && { id: 'topicInfo', label: 'Thông tin đề tài', icon: <FaBook className="text-blue-600" /> },
    topic?.description && { id: 'description', label: 'Mô tả đề tài', icon: <FaBook className="text-blue-600" /> },
    topic?.requirement && { id: 'requirement', label: 'Yêu cầu đề tài', icon: <FaBook className="text-blue-600" /> },
    { id: 'lecturerInfo', label: 'Thông tin giảng viên', icon: <FaUserCircle className="text-blue-600" /> },
    { id: 'studentList', label: 'Danh sách sinh viên', icon: <FaUsers className="text-blue-600" /> },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center p-2 sm:p-6 transition-all duration-300 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 bg-blue-50 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaUsers className="mr-2 text-blue-600" /> Chi tiết nhóm: {group.name}
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
            {groupLoading && <p className="text-base text-gray-500">Đang tải thông tin nhóm...</p>}
            {groupError && <p className="text-base text-red-600">Lỗi: {groupError}</p>}
            {!groupLoading && !groupError && (
              <TabContent>
                {activeTab === 'groupInfo' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Tên nhóm:</span> {group.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Mã nhóm:</span> {group.group_code || 'Không có'}
                    </p>
                    <p className="text-gray-600">
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
                          ? 'Đang chờ duyệt'
                          : group.status === 'accepted'
                          ? 'Đã duyệt'
                          : group.status === 'denied'
                          ? 'Đã từ chối'
                          : group.status || 'Không xác định'}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Trạng thái bảo vệ:</span>{' '}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          group.defense_id ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {group.defense_id ? 'Đã đăng ký bảo vệ' : 'Chưa đăng ký bảo vệ'}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                      {TimeService.convertDateStringToDDMMYYYY(group.created_at)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Ngày cập nhật:</span>{' '}
                      {TimeService.convertDateStringToDDMMYYYY(group.updated_at)}
                    </p>
                  </div>
                )}

                {activeTab === 'topicInfo' && topic && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Tên đề tài:</span> {topic.title}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Mã đề tài:</span> {topic.topic_code}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Danh mục:</span>{' '}
                      {topic.category === 'GRADUATION' ? 'Đồ án tốt nghiệp' : TopicCategory[topic.category] || 'Không có'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Trạng thái:</span>{' '}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          topic.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : topic.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {topic.status === 'pending'
                          ? 'Đang chờ'
                          : topic.status === 'open'
                          ? 'Đang mở'
                          : topic.status || 'Không xác định'}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Số lượng sinh viên:</span>{' '}
                      {topic.student_quantity || 0}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Ngày tạo:</span>{' '}
                      {TimeService.convertDateStringToDDMMYYYY(topic.created_at)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-800">Ngày cập nhật:</span>{' '}
                      {TimeService.convertDateStringToDDMMYYYY(topic.updated_at)}
                    </p>
                  </div>
                )}

                {activeTab === 'description' && topic?.description && (
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.description || '<p>Không có mô tả</p>') }}
                  />
                )}

                {activeTab === 'requirement' && topic?.requirement && (
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.requirement || '<p>Không có yêu cầu</p>') }}
                  />
                )}

                {activeTab === 'lecturerInfo' && (
                  <div>
                    {group.lecturer ? (
                      <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <FaUserCircle className="text-gray-400 bg-gray-100 rounded-full p-1" size={70} />
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Họ tên:</span> {group.lecturer.name || 'Không có'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Mã giảng viên:</span>{' '}
                            {group.lecturer.lecturer_code || 'Không có'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Email:</span>{' '}
                            {group.lecturer.email || 'Không có'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Số điện thoại:</span>{' '}
                            {group.lecturer.phone || 'Không có'}
                          </p>
                          <p className="text-gray-600">
                            <FaUniversity className="text-blue-400 inline mr-2" />
                            <span className="font-medium text-gray-800">Khoa:</span>{' '}
                            {group.lecturer.faculty || 'Không có'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Ngày sinh:</span>{' '}
                            {group.lecturer.birth
                              ? TimeService.convertDateStringToDDMMYYYY(group.lecturer.birth)
                              : 'Không có'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">Không tìm thấy thông tin giảng viên.</p>
                    )}
                  </div>
                )}

                {activeTab === 'studentList' && (
                  <div>
                    {group.students?.length > 0 ? (
                      <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.students.map((student) => (
                          <StudentCard key={student.id} student={student} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">Không có sinh viên trong nhóm.</p>
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

export default ViewGroupModal;