import { FaEye, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';

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
    <div className="overflow-x-auto">
      <table className="min-w-full h-full bg-white border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left text-gray-600">Mã đề tài</th>
            <th className="py-2 px-4 border-b text-left text-gray-600">Tiêu đề</th>
            <th className="py-2 px-4 border-b text-left text-gray-600">Ngày tạo</th>
            <th className="py-2 px-4 border-b text-left text-gray-600">Ngày cập nhật</th>
            <th className="py-2 px-4 border-b text-left text-gray-600">Trạng thái</th>
            <th className="py-2 px-4 border-b text-left text-gray-600">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentTopics.length > 0 ? (
            currentTopics.map((topic) => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{topic.topicCode}</td>
                <td className="py-2 px-4 border-b">{topic.title}</td>
                <td className="py-2 px-4 border-b">{topic.createdAt}</td>
                <td className="py-2 px-4 border-b">{topic.updateAt}</td>
                <td className="py-2 px-4 border-b">
                  <div className="relative" ref={(el) => (dropdownRefs.current[topic.id] = el)}>
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === topic.id ? null : topic.id)}
                      className="flex items-center text-gray-600 hover:text-gray-800"
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
                            className="w-full p-2 text-left hover:bg-blue-100 flex items-center"
                          >
                            {statusConfig[status].icon}
                            <span className="ml-2">{statusConfig[status].label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2">
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
              <td colSpan="6" className="py-4 text-center text-gray-600">
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