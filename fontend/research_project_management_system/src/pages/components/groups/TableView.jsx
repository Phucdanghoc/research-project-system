import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const statusConfig = {
  accepted: { icon: <FaCheckCircle className="text-green-600 mr-1" />, label: 'Đã duyệt', border: 'border-green-600' },
  denied: { icon: <FaTimesCircle className="text-red-600 mr-1" />, label: 'Không duyệt', border: 'border-red-600' },
  pending: { icon: <FaClock className="text-yellow-600 mr-1" />, label: 'Chờ duyệt', border: 'border-yellow-600' },
};


const TableView = ({ groups, onViewGroup, onEditGroup, onDeleteGroup, onStatusChange, isAdmin = false }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow-md rounded-lg text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            <th className="py-2 px-4">Mã nhóm</th>
            <th className="py-2 px-4">Tên nhóm</th>
            <th className="py-2 px-4">Giảng viên</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Trạng thái</th>
            <th className="py-2 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {groups.length > 0 ? (
            groups.map((group) => (
              <tr key={group.id} className="hover:bg-blue-100">
                <td className="py-2 px-4 border-b">{group.group_code || '-'}</td>
                <td className="py-2 px-4 border-b font-bold">{group.name}</td>
                <td className="py-2 px-4 border-b">{group.lecturer?.name || '-'}</td>
                <td className="py-2 px-4 border-b">{TimeService.convertDateStringToDDMMYYYY(group.created_at)}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex items-center justify-center  space-x-2 border-blue-600 rounded-md  px-2 py-1">
                    {statusConfig[group.status]?.icon}
                    <select
                      disabled={!isAdmin}
                      value={group.status}
                      onChange={(e) => onStatusChange(group.id, e.target.value)}
                      className="px-2 py-1   text-sm"
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                <td className="py-2 px-4 border-b space-x-2 justify-center">
                  <button
                    onClick={() => onViewGroup(group)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => onEditGroup(group)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDeleteGroup(group.id)}
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
              <td colSpan="7" className="py-4 text-center text-gray-600">
                Không tìm thấy nhóm nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;