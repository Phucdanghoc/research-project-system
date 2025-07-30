import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useRef, useState } from 'react';

const LecturerDefenseTableView = ({ lecturerDefenses, onViewLecturerDefense, onEditLecturerDefense, onDeleteLecturerDefense, onBatchDeleteLecturerDefense, isAdmin = false }) => {
  const [selectedLecturerDefenses, setSelectedLecturerDefenses] = useState([]);
  const dropdownRefs = useRef({});

  // Handle checkbox selection
  const handleSelectLecturerDefense = (lecturerDefenseId) => {
    setSelectedLecturerDefenses((prev) =>
      prev.includes(lecturerDefenseId)
        ? prev.filter((id) => id !== lecturerDefenseId)
        : [...prev, lecturerDefenseId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLecturerDefenses.length === lecturerDefenses.length) {
      setSelectedLecturerDefenses([]);
    } else {
      setSelectedLecturerDefenses(lecturerDefenses.map((ld) => ld.id));
    }
  };

  // Handle batch delete
  const handleBatchDelete = () => {
    if (selectedLecturerDefenses.length === 0) {
      alert('Vui lòng chọn ít nhất một giảng viên-buổi bảo vệ để xóa.');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedLecturerDefenses.length} giảng viên-buổi bảo vệ?`)) {
      onBatchDeleteLecturerDefense(selectedLecturerDefenses);
      setSelectedLecturerDefenses([]);
    }
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

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleBatchDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 disabled:bg-gray-400"
            disabled={selectedLecturerDefenses.length === 0}
          >
            Xóa {selectedLecturerDefenses.length > 0 ? `(${selectedLecturerDefenses.length})` : ''} giảng viên-buổi bảo vệ
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
                  checked={selectedLecturerDefenses.length === lecturerDefenses.length && lecturerDefenses.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            <th className="py-2 px-4">Mã buổi bảo vệ</th>
            <th className="py-2 px-4">Tên buổi bảo vệ</th>
            <th className="py-2 px-4">Giảng viên</th>
            <th className="py-2 px-4">Điểm</th>
            <th className="py-2 px-4">Bình luận</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {lecturerDefenses.length > 0 ? (
            lecturerDefenses.map((ld) => (
              <tr key={ld.id} className="hover:bg-blue-100">
                {isAdmin && (
                  <td className="py-2 px-4 border-b">
                    <input
                      type="checkbox"
                      checked={selectedLecturerDefenses.includes(ld.id)}
                      onChange={() => handleSelectLecturerDefense(ld.id)}
                    />
                  </td>
                )}
                <td className="py-2 px-4 border-b">{ld.defense.defense_code || '-'}</td>
                <td className="py-2 px-4 border-b font-bold">{ld.defense.name}</td>
                <td className="py-2 px-4 border-b">{ld.lecturer.name}</td>
                <td className="py-2 px-4 border-b">{ld.point !== null ? ld.point : '-'}</td>
                <td className="py-2 px-4 border-b">{ld.comment || '-'}</td>
                <td className="py-2 px-4 border-b">{formatDate(ld.created_at)}</td>
                <td className="py-2 px-4 border-b space-x-2 justify-center flex">
                  <button
                    onClick={() => onViewLecturerDefense(ld)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => onEditLecturerDefense(ld)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDeleteLecturerDefense(ld)}
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
                Không tìm thấy giảng viên-buổi bảo vệ nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LecturerDefenseTableView;