import { FaEye, FaCheckCircle, FaPlusCircle } from 'react-icons/fa';
import { TopicCategory } from '../../../types/enum';
import { TimeService } from '../../../utils/time';

const GridView = ({
  currentTopics,
  statusConfig,
  handleViewTopic,
  handleCreateGroup,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentTopics.length > 0 ? (
        currentTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-600"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-800 truncate">{topic.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewTopic(topic)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Xem chi tiết"
                >
                  <FaEye className="text-xl" />
                </button>
                <button
                  onClick={() => handleCreateGroup(topic)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Đăng ký nhóm"
                >
                  <FaPlusCircle className="text-xl" />
                  <span className="text-sm">Đăng ký nhóm</span>
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Mã đề tài:</span> {topic.topic_code}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Danh mục:</span> {TopicCategory[topic.category] || '-'}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Ngày tạo:</span> {TimeService.convertDateStringToDDMMYYYY(topic.created_at)}
            </div>
            <div className="text-sm text-gray-600 mb-2 flex items-center">
              <span className="font-semibold mr-2">Trạng thái:</span>
              <div className="flex items-center">
                {statusConfig[topic.status].icon}
                <span className="ml-2">{statusConfig[topic.status].label}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Nhóm:</span>
              {topic.groups?.length > 0 ? (
                <div className="flex items-center mt-2">
                  {topic.groups.slice(0, 4).map((group, idx) => (
                    <div className="relative group" key={group.id}>
                      <div
                        className={`w-8 h-8 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-sm font-semibold
                        ${idx !== 0 ? '-ml-3' : ''}`}
                      >
                        {group.name?.slice(0, 1).toUpperCase() || "G"}
                      </div>
                      <span className="absolute left-1/2 -translate-x-1/2 top-10 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                        Nhóm: {group.name}
                      </span>
                    </div>
                  ))}
                  {topic.groups.length > 4 && (
                    <div className="-ml-3 w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-700 text-sm font-semibold">
                      +{topic.groups.length - 4}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-500 ml-2">Chưa có</span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-gray-600 py-4">
          Không tìm thấy đề tài nào.
        </div>
      )}
    </div>
  );
};

export default GridView;