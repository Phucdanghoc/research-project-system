import { FaBook, FaEye, FaPlusCircle } from 'react-icons/fa';
import { TopicCategory } from '../../../types/enum';
import { TimeService } from '../../../utils/time';

const getRandomColor = () => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500',
    'bg-teal-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const GridView = ({
  currentTopics,
  statusConfig,
  handleViewTopic,
  handleCreateGroup,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {currentTopics.length > 0 ? (
        currentTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-xl shadow-md p-6 border-l-5 border-1 border-blue-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[70%]">{topic.title}</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleViewTopic(topic)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition"
                  title="Xem chi tiết"
                >
                  <FaEye className="text-lg" />
                </button>
                <button
                  onClick={() => handleCreateGroup(topic)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 p-2 rounded-full hover:bg-blue-100 transition"
                  title="Đăng ký nhóm"
                >
                  <FaPlusCircle className="text-lg" />
                  <span className="text-sm font-medium hidden sm:inline">Đăng ký</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Mã đề tài:</span>
                <span className="text-gray-800">{topic.topic_code}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Danh mục:</span>
                <span className="text-gray-800">{TopicCategory[topic.category] || 'Không có'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Ngày tạo:</span>
                <span className="text-gray-800">{TimeService.convertDateStringToDDMMYYYY(topic.created_at)}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Trạng thái:</span>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[topic.status]?.className || 'bg-gray-100 text-gray-600'}`}>
                    {statusConfig[topic.status]?.icon}
                    <span className="ml-1">{statusConfig[topic.status]?.label || topic.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Nhóm:</span>
                {topic.groups?.length > 0 ? (
                  <div className="flex items-center">
                    {topic.groups.slice(0, 4).map((group, idx) => (
                      <div className="relative group" key={group.id}>
                        <div
                          className={`w-8 h-8 rounded-full ${getRandomColor()} border-2 border-white flex items-center justify-center text-white text-xs font-semibold
                          ${idx !== 0 ? '-ml-2' : ''}`}
                        >
                          {group.name?.slice(0, 1).toUpperCase() || 'G'}
                        </div>
                        <span className="absolute left-1/2 -translate-x-1/2 top-10 whitespace-nowrap px-3 py-1 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                          Nhóm: {group.name}
                        </span>
                      </div>
                    ))}
                    {topic.groups.length > 4 && (
                      <div className="-ml-2 w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-700 text-xs font-semibold">
                        +{topic.groups.length - 4}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">Chưa có</span>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <FaBook className="text-gray-400 text-4xl mb-4" />
          <p className="text-gray-600 text-lg font-medium">Không tìm thấy đề tài nào</p>
          <p className="text-gray-500 text-sm mt-1">Vui lòng kiểm tra lại hoặc liên hệ quản trị viên</p>
        </div>
      )}
    </div>
  );
};

export default GridView;