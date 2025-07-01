import { FaEye, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import { FacultyMajors, TopicCategory } from '../../../types/enum';
import { TimeService } from '../../../utils/time';
const TableView = ({
  currentTopics,
  statusConfig,
  dropdownRefs,
  openDropdownId,
  setOpenDropdownId,
  handleViewTopic,
  handleEditTopic,
  handleDeleteTopic,
  handleStatusChange,
  statuses,
}) => {
  return (
    <div>
      <table className="w-full bg-white shadow-md rounded-lg text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            <th className="py-2 px-4">Mã đề tài</th>
            <th className="py-2 px-4">Tên đề tài</th>
            {/* <th className="py-2 px-4">Mô tả</th> */}
            {/* <th className="py-2 px-4">Yêu cầu</th> */}
            {/* <th className="py-2 px-4">Số lượng đề tài</th> */}
            <th className="py-2 px-4">SL</th>
            <th className="py-2 px-4">Trạng thái</th>
            <th className="py-2 px-4">Giảng viên</th>
            <th className="py-2 px-4">Danh mục</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentTopics.length > 0 ? (
            currentTopics.map((topic) => (
              <tr key={topic.id} className="hover:bg-blue-100">
                <td className="py-2 px-4 border-b">{topic.topic_code}</td>
                <td className="py-2 px-4 border-b font-bold">{topic.title}</td>
                <td className="py-2 px-4 border-b">{topic.student_quantity}</td>
                <td className="py-2 px-4 border-b">
                  <div className="relative inline-block" ref={(el) => (dropdownRefs.current[topic.id] = el)}>
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === topic.id ? null : topic.id)}
                      className="flex items-center text-gray-600 hover:text-gray-800 "
                    >
                      {statusConfig[topic.status].icon}
                      <span className="ml-2">{statusConfig[topic.status].label}</span>
                      <FaChevronDown className={`ml-1 transition-transform ${openDropdownId === topic.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdownId === topic.id && (
                      <div className="absolute z-10 right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg">
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(topic.id, status)}
                            className="w-full p-2 hover:bg-blue-100 flex items-center"
                          >
                            {statusConfig[status].icon}
                            <span className="ml-2">{statusConfig[status].label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4 border-b">{topic.lecturer_name || '-'}</td>
                <td className="py-2 px-4 border-b">{TopicCategory[topic.category] || '-'}</td>
                <td className="py-2 px-4 border-b">{TimeService.convertDateStringToDDMMYYYY(topic.created_at)}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => handleViewTopic(topic)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditTopic(topic)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(topic)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="py-4 text-center text-gray-600">
                Không tìm thấy đề tài nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;