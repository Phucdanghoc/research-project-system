import { useEffect, useState } from 'react';
import { FaUsers, FaTimes, FaChevronDown, FaChevronUp, FaUserCircle, FaUniversity, FaBook } from 'react-icons/fa';
import { getGroupAsync } from '../../../store/slices/groupSlice';
import { TimeService } from '../../../utils/time';
import DOMPurify from 'dompurify';
import { useSelector, useDispatch } from 'react-redux';
import { StudentCard } from '../../../components/cards/StudentCard';

const ViewGroupModal = ({ isOpen, onClose, groupId }) => {
  const dispatch = useDispatch();
  const { group, loading: groupLoading, error: groupError } = useSelector((state) => state.groups);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedRequirement, setExpandedRequirement] = useState(false);
  const [expandedGroupInfo, setExpandedGroupInfo] = useState(true);
  const [expandedLecturerInfo, setExpandedLecturerInfo] = useState(true);
  const [expandedStudentList, setExpandedStudentList] = useState(true);
  const [expandedTopicInfo, setExpandedTopicInfo] = useState(true);

  useEffect(() => {
    if (isOpen && groupId) {
      dispatch(getGroupAsync(groupId));
    }
  }, [isOpen, groupId, dispatch]);

  if (!isOpen || !group) return null;

  return (
    <div
      className={`fixed inset-0 bg-gray-900/80 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-blue-50 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaUsers className="mr-2 text-blue-600" /> Chi tiết nhóm: {group.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
            title="Đóng"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 bg-white space-y-6 overflow-y-auto">
          {groupLoading && <p className="text-base text-gray-500">Đang tải thông tin nhóm...</p>}
          {groupError && <p className="text-base text-red-600">Lỗi: {groupError}</p>}
          {!groupLoading && !groupError && (
            <>
              {/* Group Information */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div
                  className="flex justify-between items-center cursor-pointer p-3 bg-blue-100 rounded-t-lg"
                  onClick={() => setExpandedGroupInfo(!expandedGroupInfo)}
                >
                  <h3 className="text-xl font-semibold text-blue-700">Thông tin nhóm</h3>
                  {expandedGroupInfo ? (
                    <FaChevronUp className="text-blue-600" />
                  ) : (
                    <FaChevronDown className="text-blue-600" />
                  )}
                </div>
                {expandedGroupInfo && (
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Mã nhóm:</span> {group.id}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Tên nhóm:</span> {group.name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Mã nhóm:</span>{' '}
                        {group.group_code || 'Không có'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Trạng thái:</span>{' '}
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${group.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : group.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {group.status === 'pending'
                            ? 'Đang chờ'
                            : group.status === 'approved'
                              ? 'Đã duyệt'
                              : group.status || 'Không xác định'}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Trạng thái bảo vệ:</span>{' '}
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${group.defense_id ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
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
                  </div>
                )}
              </div>

              {group.topics && group.topics.length > 0 && (
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div
                    className="flex justify-between items-center cursor-pointer p-3 bg-blue-100 rounded-t-lg"
                    onClick={() => setExpandedTopicInfo(!expandedTopicInfo)}
                  >
                    <h3 className="text-xl font-semibold text-blue-700 flex items-center">
                      <FaBook className="mr-2" /> Thông tin đề tài
                    </h3>
                    {expandedTopicInfo ? (
                      <FaChevronUp className="text-blue-600" />
                    ) : (
                      <FaChevronDown className="text-blue-600" />
                    )}
                  </div>
                  {expandedTopicInfo && (
                    <div className="p-5">
                      {group.topics.map((topic) => (
                        <div key={topic.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Tên đề tài:</span> {topic.title}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Mã đề tài:</span> {topic.topic_code}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Danh mục:</span>{' '}
                            {topic.category === 'GRADUATION' ? 'Đồ án tốt nghiệp' : topic.category || 'Không có'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">Trạng thái:</span>{' '}
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${topic.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : topic.status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {topic.status === 'pending'
                                ? 'Đang chờ'
                                : topic.status === 'approved'
                                  ? 'Đã duyệt'
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
                      ))}
                    </div>
                  )}
                </div>
              )}
              {group.topics && group.topics[0]?.description && (
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div
                    className="flex justify-between items-center cursor-pointer p-3 bg-blue-50 rounded-t-lg"
                    onClick={() => setExpandedDescription(!expandedDescription)}
                  >
                    <h3 className="text-xl font-semibold text-blue-700">Mô tả đề tài</h3>
                    {expandedDescription ? (
                      <FaChevronUp className="text-blue-600" />
                    ) : (
                      <FaChevronDown className="text-blue-600" />
                    )}
                  </div>
                  {expandedDescription && (
                    <div
                      className="prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-b-lg border-t border-gray-200"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(group.topics[0].description || '<p>Không có mô tả</p>'),
                      }}
                    />
                  )}
                </div>
              )}

              {group.topics && group.topics[0]?.requirement && (
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div
                    className="flex justify-between items-center cursor-pointer p-3 bg-red-50 rounded-t-lg"
                    onClick={() => setExpandedRequirement(!expandedRequirement)}
                  >
                    <h3 className="text-xl font-semibold text-red-700">Yêu cầu đề tài</h3>
                    {expandedRequirement ? (
                      <FaChevronUp className="text-red-600" />
                    ) : (
                      <FaChevronDown className="text-red-600" />
                    )}
                  </div>
                  {expandedRequirement && (
                    <div
                      className="prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-b-lg border-t border-gray-200"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(group.topics[0].requirement || '<p>Không có yêu cầu</p>'),
                      }}
                    />
                  )}
                </div>
              )}
              <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-md">
                <div
                  className="flex justify-between items-center cursor-pointer p-4 bg-blue-100 rounded-t-2xl"
                  onClick={() => setExpandedLecturerInfo(!expandedLecturerInfo)}
                >
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="text-blue-600 text-2xl" />
                    <h3 className="text-xl font-bold text-blue-700">Thông tin giảng viên</h3>
                  </div>
                  {expandedLecturerInfo ? (
                    <FaChevronUp className="text-blue-600 text-xl" />
                  ) : (
                    <FaChevronDown className="text-blue-600 text-xl" />
                  )}
                </div>
                {expandedLecturerInfo && (
                  <div className="p-5 bg-white rounded-b-2xl border-t border-gray-100">
                    {group.lecturer ? (
                      <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <div className="flex-shrink-0">
                          <FaUserCircle className="text-gray-400 bg-gray-100 rounded-full p-1" size={70} />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">Họ tên:</span>
                            <span className="text-gray-700">{group.lecturer.name || 'Không có'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">Mã giảng viên:</span>
                            <span className="text-gray-700">{group.lecturer.lecturer_code || 'Không có'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">Email:</span>
                            <span className="text-gray-700">{group.lecturer.email || 'Không có'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">Số điện thoại:</span>
                            <span className="text-gray-700">{group.lecturer.phone || 'Không có'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUniversity className="text-blue-400" />
                            <span className="font-medium text-gray-800">Khoa:</span>
                            <span className="text-gray-700">{group.lecturer.faculty || 'Không có'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">Ngày sinh:</span>
                            <span className="text-gray-700">
                              {group.lecturer.birth
                                ? TimeService.convertDateStringToDDMMYYYY(group.lecturer.birth)
                                : 'Không có'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">Không tìm thấy thông tin giảng viên.</p>
                    )}
                  </div>
                )}
              </div>


              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div
                  className="flex justify-between items-center cursor-pointer p-3 bg-blue-100 rounded-t-lg"
                  onClick={() => setExpandedStudentList(!expandedStudentList)}
                >
                  <h3 className="text-xl font-semibold text-blue-700">Danh sách sinh viên</h3>
                  {expandedStudentList ? (
                    <FaChevronUp className="text-blue-600" />
                  ) : (
                    <FaChevronDown className="text-blue-600" />
                  )}
                </div>
                {expandedStudentList && (
                  <div className="p-5">
                    {group.students && group.students.length > 0 ? (
                      <div className="space-y-3">
                        {group.students.map((student) => (
                          <StudentCard key={student.id} student={student} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">Không có sinh viên trong nhóm.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
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

export default ViewGroupModal;