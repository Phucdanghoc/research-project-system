import { FaEye, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { FaCheckCircle, FaTimesCircle, FaClock, FaRegCircle } from 'react-icons/fa';
import { useRef, useState } from 'react';

const statusConfig = {
  accepted: { icon: <FaCheckCircle className="text-green-600 mr-1" />, label: 'Đã duyệt', border: 'border-green-600' },
  denied: { icon: <FaTimesCircle className="text-red-600 mr-1" />, label: 'Không duyệt', border: 'border-red-600' },
  pending: { icon: <FaClock className="text-yellow-600 mr-1" />, label: 'Chờ duyệt', border: 'border-yellow-600' },
};


const statusDefenseConfig = {
  not_defended: {
    icon: <FaRegCircle className="text-gray-500 mr-1" />,
    label: 'Chưa bảo vệ',
    border: 'border-gray-500',
  },
  waiting_defense: {
    icon: <FaClock className="text-yellow-600 mr-1" />,
    label: 'Đăng kí bảo vệ',
    border: 'border-yellow-600',
  },
  approved: {
    icon: <FaCheckCircle className="text-green-600 mr-1" />,
    label: 'Đã duyệt',
    border: 'border-green-600',
  },
  rejected: {
    icon: <FaTimesCircle className="text-red-600 mr-1" />,
    label: 'Không duyệt',
    border: 'border-red-600',
  },
};
const statuses = ['pending', 'accepted', 'denied'];
const defenseStatuses = ['not_defended', 'waiting_defense', 'approved', 'rejected'];

const TableView = ({ groups, onCreateDefense, onViewGroup, onEditGroup, onDeleteGroup, onStatusChange, onDefenseStatusChange, isAdmin = false }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openDropdownDefenseId, setOpenDropdownDefenseId] = useState(null);
  const dropdownRefs = useRef({});

  const handleChangeStataus = (id, status) => {
    onStatusChange(id, status);
    setOpenDropdownId(null);
  };

  return (
    <div>
      <table className="w-full bg-white shadow-md rounded-lg text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            <th className="py-2 px-4">Mã nhóm</th>
            <th className="py-2 px-4">Tên nhóm</th>
            <th className="py-2 px-4">Giảng viên</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Trạng thái</th>
            <th className="py-2 px-4">Trạng thái bảo vệ</th>
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
                  <div className="relative inline-block" ref={(el) => (dropdownRefs.current[group.id] = el)}>
                    {!isAdmin ? (
                      <>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === group.id ? null : group.id)}
                          className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                          {statusConfig[group.status].icon}
                          <span className="ml-2">{statusConfig[group.status].label}</span>
                          <FaChevronDown
                            className={`ml-1 transition-transform ${openDropdownId === group.id ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {openDropdownId === group.id && (
                          <div className="absolute z-1000 right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg">
                            {statuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  handleChangeStataus(group.id, status);
                                }}
                                className="w-full p-2 hover:bg-blue-100 flex items-center text-left"
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
                        {statusConfig[group.status].icon}
                        <span className="ml-2">{statusConfig[group.status].label}</span>
                      </button>
                    )}
                  </div>
                </td>


                <td className="py-2 px-4 border-b">
                  <div className="relative inline-block" ref={(el) => (dropdownRefs.current[group.id] = el)}>
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => setOpenDropdownDefenseId(openDropdownDefenseId === group.id ? null : group.id)}
                          className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                          {statusDefenseConfig[group.def_status].icon}
                          <span className="ml-2">{statusDefenseConfig[group.def_status].label}</span>
                          <FaChevronDown
                            className={`ml-1 transition-transform ${openDropdownDefenseId === group.id ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {openDropdownDefenseId === group.id && (
                          <div className="absolute z-50 right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg">
                            {defenseStatuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  onDefenseStatusChange(group.id, status);
                                  setOpenDropdownDefenseId(null);
                                }}
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
                      <div className="flex flex-rows items-center">
                        <div className="flex items-center text-gray-600 mb-1">
                          {statusDefenseConfig[group.def_status].icon}
                          <span className="ml-2">{statusDefenseConfig[group.def_status].label}</span>
                        </div>

                        {group.def_status !== 'approved' && group.def_status !== 'waiting_defense' && (
                          <button
                            onClick={() => onDefenseStatusChange(group.id, 'waiting_defense')}
                            className="text-white hover:text-blue-800 rounded text-sm px-2 py-1 bg-blue-400 ml-2"
                          >
                            Xét duyệt
                          </button>
                        )}
                      </div>
                    )}
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
                      {group.def_status === 'waiting_defense'
                        && (
                          <button
                            onClick={() => onCreateDefense(group.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Duyệt bảo vệ"
                          >
                            <FaCheckCircle />
                          </button>
                        )
                      }
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