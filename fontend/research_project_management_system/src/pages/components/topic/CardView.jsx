import { FaEye, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import CardTopic from '../../components/cards/Card';

const CardView = ({
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {currentTopics.length > 0 ? (
        currentTopics.map((topic) => (
          <div
            key={topic.id}
            className={`relative p-4 border-2 ${statusConfig[topic.status].border} rounded hover:scale-[1.02] transition duration-300`}
          >
            <CardTopic topic={topic} />
            <div className="absolute top-2 right-2 flex space-x-2">
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
              <div className="relative" ref={(el) => (dropdownRefs.current[topic.id] = el)}>
                <button
                  onClick={() => setOpenDropdownId(openDropdownId === topic.id ? null : topic.id)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                  title="Thay đổi trạng thái"
                >
                  {statusConfig[topic.status].icon}
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
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600 col-span-2">Không tìm thấy đề tài nào.</p>
      )}
    </div>
  );
};

export default CardView;