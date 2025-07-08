import { FaEye, FaEdit, FaTrash, FaChevronDown, FaPlusCircle, FaKey, FaKeycdn, FaRegCaretSquareLeft } from 'react-icons/fa';
import { TopicCategory } from '../../../types/enum';
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
  handleResetPassword,
  handleStatusChange,
  handleCreateGroup,
  statuses,
  isAdmin = false,
}) => {
  return (
    <div>
      <table className="w-full bg-white shadow-md  text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            <th className="py-2 px-4">Mã đề tài</th>
            <th className="py-2 px-4">Tên đề tài</th>
            {/* <th className="py-2 px-4">Mô tả</th> */}
            {/* <th className="py-2 px-4">Yêu cầu</th> */}
            {/* <th className="py-2 px-4">Số lượng đề tài</th> */}
            <th className="py-2 px-4">SL</th>
            <th className="py-2 px-4">Trạng thái</th>
            {isAdmin && <th className="py-2 px-4">Giảng viên</th>}
            <th className="py-2 px-4">Danh mục</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Hành động</th>
            {!isAdmin &&  <th className='py-2 px-4'>Tạo nhóm</th>}
          </tr>
        </thead>
        <tbody>
          {currentTopics.length > 0 ? (
            currentTopics.map((topic) => (
              <tr key={topic.id} className="hover:bg-blue-100">
                <td className="py-2 px-4 border-b">{topic.topic_code}</td>
                <td className="py-2 px-4 border-b font-bold">{topic.title}</td>
                <td className="py-2 px-4 border-b">
                  {topic.groups?.length > 0 ? (
                    <div className="flex items-center">
                      {topic.groups.slice(0, 4).map((group, idx) => (
                        <div className="relative group" key={group.id}>
                          <div
                            className={`w-8 h-8 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-sm font-semibold
                            ${idx !== 0 ? '-ml-3' : ''}`}
                          >
                            {group.name?.slice(0, 1).toUpperCase() || "G"}
                          </div>
                          <span className="absolute left-1/2 -translate-x-1/2 top-10 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            Nhóm : {group.name}
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
                    <span className="text-gray-500">Chưa có</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="relative inline-block" ref={(el) => (dropdownRefs.current[topic.id] = el)}>
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === topic.id ? null : topic.id)}
                          className="flex items-center  text-gray-600 hover:text-gray-800"
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
                      </>
                    ) : (
                      <button
                        disabled
                        className="flex items-center text-gray-400 cursor-not-allowed bg-transparent"
                        tabIndex={-1}
                      >
                        {statusConfig[topic.status].icon}
                        <span className="ml-2">{statusConfig[topic.status].label}</span>
                      </button>
                    )}
                  </div>
                </td>

                {isAdmin && <td className="py-2 px-4 border-b">{topic.lecturer ? topic.lecturer.name : '-'}</td>}
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
                    {isAdmin && (
                     <>
                      <button
                        onClick={() => handleDeleteTopic(topic)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                      
                      </>
                    )}

                  </div>
                </td >
                {!isAdmin && (
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => handleCreateGroup(topic)}
                        className="text-blue-600 hover:text-blue-800 flex gap-1 items-center"
                        title="Tạo nhóm"
                      >
                        <FaPlusCircle className="text-base" />
                        <span className="text-sm">Tạo nhóm</span>
                      </button>
                    </div>
                  </td>
                )}
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