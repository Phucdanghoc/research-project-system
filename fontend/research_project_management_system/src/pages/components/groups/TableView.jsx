import { FaEye, FaEdit, FaTrash, FaChevronDown, FaPlus } from 'react-icons/fa';
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
    label: 'Đã có kế hoạch',
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

const TableView = ({ 
  groups, 
  onCreatePlan, 
  onViewGroup, 
  onEditGroup, 
  onDeleteGroup, 
  onStatusChange, 
  onDefenseStatusChange, 
  onAddDefense,
  onBulkAddDefense,
  isAdmin = false 
}) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openDropdownDefenseId, setOpenDropdownDefenseId] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const dropdownRefs = useRef({});

  const handleChangeStataus = (id, status) => {
    onStatusChange(id, status);
    setOpenDropdownId(null);
  };

  const handleSelectGroup = (groupId) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleSelectAll = () => {
    const waitingDefenseGroups = groups.filter(group => 
      group.def_status === 'waiting_defense' && !group.has_defense
    );
    
    if (selectedGroups.size === waitingDefenseGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(waitingDefenseGroups.map(group => group.id)));
    }
  };

  const waitingDefenseGroupsWithoutDefense = groups.filter(group => 
    group.def_status === 'waiting_defense' && !group.has_defense
  );

  const canShowBulkDefense = waitingDefenseGroupsWithoutDefense.length > 0;
  const selectedValidGroups = Array.from(selectedGroups).filter(id => 
    waitingDefenseGroupsWithoutDefense.some(group => group.id === id)
  );

  return (
    <div>
      {/* Bulk Actions Bar */}
      {isAdmin && canShowBulkDefense && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedGroups.size === waitingDefenseGroupsWithoutDefense.length && waitingDefenseGroupsWithoutDefense.length > 0}
                  onChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-gray-700">
                  Chọn tất cả nhóm chờ bảo vệ ({waitingDefenseGroupsWithoutDefense.length})
                </span>
              </label>
              {selectedGroups.size > 0 && (
                <span className="text-sm text-blue-600">
                  Đã chọn {selectedGroups.size} nhóm
                </span>
              )}
            </div>
            {selectedValidGroups.length > 0 && (
              <button
                onClick={() => onBulkAddDefense(selectedValidGroups)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" />
                Tạo hội đồng bảo vệ cho {selectedValidGroups.length} nhóm
              </button>
            )}
          </div>
        </div>
      )}

      <table className="w-full bg-white shadow-md rounded-lg text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            {isAdmin && canShowBulkDefense && <th className="py-2 px-4">Chọn</th>}
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
                {/* Selection checkbox */}
                {isAdmin && canShowBulkDefense && (
                  <td className="py-2 px-4 border-b">
                    {group.def_status === 'waiting_defense' && !group.has_defense ? (
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.id)}
                        onChange={() => handleSelectGroup(group.id)}
                        className="rounded"
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                )}
                
                <td className="py-2 px-4 border-b">{group.group_code || '-'}</td>
                <td className="py-2 px-4 border-b font-bold">{group.name}</td>
                <td className="py-2 px-4 border-b">{group.lecturer?.name || '-'}</td>
                <td className="py-2 px-4 border-b">{TimeService.convertDateStringToDDMMYYYY(group.created_at)}</td>
                
                {/* Status dropdown */}
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

                {/* Defense status */}
                <td className="py-2 px-4 border-b">
                  <div className="relative inline-block" ref={(el) => (dropdownRefs.current[`def_${group.id}`] = el)}>
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
                      <div className="flex flex-col items-center">
                        <div className="flex items-center text-gray-600 mb-1">
                          {statusDefenseConfig[group.def_status].icon}
                          <span className="ml-2">{statusDefenseConfig[group.def_status].label}</span>
                        </div>

                        {group.def_status !== 'approved' && group.def_status !== 'waiting_defense' && (
                          <button
                            onClick={() => onDefenseStatusChange(group.id, 'waiting_defense')}
                            className="text-white hover:text-blue-800 rounded text-sm px-2 py-1 bg-blue-400"
                          >
                            Xét duyệt
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-2 px-4 border-b">
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => onViewGroup(group)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    
                    {isAdmin && (
                      <>
                        {!isAdmin && (
                          <button
                            onClick={() => onEditGroup(group)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                        
                        {/* Add Defense button for waiting_defense groups without defense */}
                        {group.def_status === 'waiting_defense' && !group.has_defense && (
                          <button
                            onClick={() => onAddDefense(group)}
                            className="text-green-600 hover:text-green-800"
                            title="Tạo hội đồng bảo vệ"
                          >
                            <FaPlus />
                          </button>
                        )}
                        
                        {/* Approve defense button for groups with waiting defense status and existing defense */}
                        {group.def_status === 'waiting_defense' && group.has_defense && (
                          <button
                            onClick={() => onCreatePlan(group)}
                            className="text-green-600 hover:text-green-800"
                            title="Duyệt bảo vệ"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin && canShowBulkDefense ? "8" : "7"} className="py-4 text-center text-gray-600">
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