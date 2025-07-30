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

const DefenseTableView = ({ defenses, onViewDefense, onEditDefense, onDeleteDefense, onDefenseStatusChange, onBatchDeleteDefense, isAdmin = false }) => {
  const [openDropdownDefenseId, setOpenDropdownDefenseId] = useState(null);
  const [selectedDefenses, setSelectedDefenses] = useState([]);
  const dropdownRefs = useRef({});

  // Handle checkbox selection
  const handleSelectDefense = (defenseId) => {
    setSelectedDefenses((prev) =>
      prev.includes(defenseId)
        ? prev.filter((id) => id !== defenseId)
        : [...prev, defenseId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedDefenses.length === defenses.length) {
      setSelectedDefenses([]);
    } else {
      setSelectedDefenses(defenses.map((defense) => defense.id));
    }
  };

  // Handle batch delete
  const handleBatchDelete = () => {
    if (selectedDefenses.length === 0) {
      alert('Vui lòng chọn ít nhất một buổi bảo vệ để xóa.');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedDefenses.length} buổi bảo vệ?`)) {
      onBatchDeleteDefense(selectedDefenses);
      setSelectedDefenses([]);
    }
  };

  const handleChangeDefenseStatus = (id, status) => {
    onDefenseStatusChange(id, status);
    setOpenDropdownDefenseId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleBatchDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 disabled:bg-gray-400"
            disabled={selectedDefenses.length === 0}
          >
            Xóa {selectedDefenses.length > 0 ? `(${selectedDefenses.length})` : ''} buổi bảo vệ
          </button>
        </div>
      )}
      <table className="w-full bg-white shadow-md rounded-lg text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            {isAdmin && (
              <th className="py-2 px-4">
                <input
                  type="checkbox"
                  checked={selectedDefenses.length === defenses.length && defenses.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            <th className="py-2 px-4">Mã buổi bảo vệ</th>
            <th className="py-2 px-4">Tên buổi bảo vệ</th>
            <th className="py-2 px-4">Ngày bảo vệ</th>
            <th className="py-2 px-4">Thời gian bắt đầu</th>
            <th className="py-2 px-4">Thời gian kết thúc</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {defenses.length > 0 ? (
            defenses.map((defense) => (
              <tr key={defense.id} className="hover:bg-blue-100">
                {isAdmin && (
                  <td className="py-2 px-4 border-b">
                    <input
                      type="checkbox"
                      checked={selectedDefenses.includes(defense.id)}
                      onChange={() => handleSelectDefense(defense.id)}
                    />
                  </td>
                )}
                <td className="py-2 px-4 border-b">{defense.defense_code || '-'}</td>
                <td className="py-2 px-4 border-b font-bold">{defense.name}</td>
                <td className="py-2 px-4 border-b">{formatDate(defense.date)}</td>
                <td className="py-2 px-4 border-b">{formatTime(defense.start_time)}</td>
                <td className="py-2 px-4 border-b">{formatTime(defense.end_time)}</td>
                <td className="py-2 px-4 border-b">{formatDate(defense.created_at)}</td>
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
              <td colSpan={isAdmin ? 8 : 7} className="py-4 text-center text-gray-600">
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