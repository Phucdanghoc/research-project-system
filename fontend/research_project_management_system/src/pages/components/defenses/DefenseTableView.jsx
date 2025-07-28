import { FaEye, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { useRef, useState } from 'react';

const statusDefenseConfig = {
  waiting: {
    icon: <FaClock className="text-yellow-600 mr-1" />,
    label: 'Chưa hoạt động',
    border: 'border-yellow-600',
  },
  done: {
    icon: <FaCheckCircle className="text-green-600 mr-1" />,
    label: 'Đang hoạt động',
    border: 'border-green-600',
  },
};

const defenseStatuses = ['waiting', 'done'];

const DefenseTableView = ({ defenses, onViewDefense, onEditDefense, onDeleteDefense, onDefenseStatusChange, isAdmin = false }) => {
  const [openDropdownDefenseId, setOpenDropdownDefenseId] = useState(null);
  const dropdownRefs = useRef({});

  const handleChangeDefenseStatus = (id, status) => {
    onDefenseStatusChange(id, status);
    setOpenDropdownDefenseId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div>
      <table className="w-full bg-white shadow-md rounded-lg text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            <th className="py-2 px-4">Mã buổi bảo vệ</th>
            <th className="py-2 px-4">Tên buổi bảo vệ</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Trạng thái</th>
            <th className="py-2 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {defenses.length > 0 ? (
            defenses.map((defense) => (
              <tr key={defense.id} className="hover:bg-blue-100">
                <td className="py-2 px-4 border-b">{defense.defense_code || '-'}</td>
                <td className="py-2 px-4 border-b font-bold">{defense.name}</td>
                <td className="py-2 px-4 border-b">{formatDate(defense.created_at) || '-'}</td>
                <td className="py-2 px-4 border-b">
                  <div className="relative inline-block" ref={(el) => (dropdownRefs.current[defense.id] = el)}>
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => setOpenDropdownDefenseId(openDropdownDefenseId === defense.id ? null : defense.id)}
                          className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                          {statusDefenseConfig[defense.status]?.icon}
                          <span className="ml-2">{statusDefenseConfig[defense.status]?.label || 'Không xác định'}</span>
                          <FaChevronDown
                            className={`ml-1 transition-transform ${openDropdownDefenseId === defense.id ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openDropdownDefenseId === defense.id && (
                          <div className="absolute z-50 right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg">
                            {defenseStatuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => handleChangeDefenseStatus(defense.id, status)}
                                className="w-full p-2 hover:bg-blue-100 flex items-center text-left"
                              >
                                {statusDefenseConfig[status].icon}
                                <span className="ml-2">{statusDefenseConfig[status].label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        {statusDefenseConfig[defense.status]?.icon}
                        <span className="ml-2">{statusDefenseConfig[defense.status]?.label || 'Không xác định'}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4 border-b space-x-2 justify-center">
                  <button
                    onClick={() => onViewDefense(defense)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => onEditDefense(defense)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDeleteDefense(defense)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-600">
                Không tìm thấy buổi bảo vệ nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DefenseTableView;