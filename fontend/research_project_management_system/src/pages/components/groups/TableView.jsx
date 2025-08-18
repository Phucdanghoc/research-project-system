import { FaEye, FaEdit, FaTrash, FaChevronDown, FaPlus, FaLock } from 'react-icons/fa';
import { FaCheckCircle, FaTimesCircle, FaClock, FaRegCircle } from 'react-icons/fa';
import { useRef, useState, useMemo } from 'react';
import LockModal from '../../../components/LockModal';
import { TimeService } from '../../../utils/time';      // adjust path if different

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

/**
 * Props:
 * - groups: Array<Group>
 * - onCreatePlan(group)
 * - onViewGroup(group)
 * - onEditGroup(group)
 * - onDeleteGroup(groupId)
 * - onBulkLock(ids: number[], isoOrNull: string | null)
 * - onStatusChange(groupId, status)
 * - onDefenseStatusChange(groupId, status)
 * - onBulkAddDefense(ids: number[])
 * - isAdmin?: boolean
 */
const TableView = ({
  groups,
  onCreatePlan,
  onViewGroup,
  onEditGroup,
  onDeleteGroup,
  onBulkLock,
  onStatusChange,
  onDefenseStatusChange,
  onBulkAddDefense,
  isAdmin = false
}) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openDropdownDefenseId, setOpenDropdownDefenseId] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const dropdownRefs = useRef({});

  // Bulk lock modal
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // Single edit lock modal + selected group
  const [openEdit, setOpenEdit] = useState(false);
  const [editGroup, setEditGroup] = useState(null);

  const selectedIds = useMemo(() => Array.from(selectedGroups), [selectedGroups]);

  const handleChangeStatus = (id, status) => {
    onStatusChange(id, status);
    setOpenDropdownId(null);
  };

  const handleSelectGroup = (groupId) => {
    const next = new Set(selectedGroups);
    next.has(groupId) ? next.delete(groupId) : next.add(groupId);
    setSelectedGroups(next);
  };

  // Eligible lists
  const groupsForAddDefense = groups.filter(g => !g.defense_id && g.def_status !== 'approved');
  const groupsForLock = groups.filter(g => g.defense_id && !g.lock_at);

  const canShowBulkDefense = isAdmin && groupsForAddDefense.length > 0;
  const canShowBulkLock = isAdmin && groupsForLock.length > 0;

  const selectedValidGroupsForDefense = selectedIds.filter(id =>
    groupsForAddDefense.some(g => g.id === id)
  );
  const selectedValidGroupsForLock = selectedIds.filter(id =>
    groupsForLock.some(g => g.id === id)
  );

  const handleBulkLockConfirm = (dateOrNull) => {
    if (!dateOrNull) return; // bulk lock modal in "new" mode always picks a date
    onBulkLock(selectedValidGroupsForLock, dateOrNull.toISOString());
    
    setIsLockModalOpen(false);
    setSelectedGroups(new Set());
  };

  return (
    <div>
      {/* ===== Bulk Add Defense Bar ===== */}
      {canShowBulkDefense && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedGroups.size === groupsForAddDefense.length && groupsForAddDefense.length > 0}
                  onChange={() => {
                    if (selectedGroups.size === groupsForAddDefense.length && groupsForAddDefense.length > 0) {
                      setSelectedGroups(new Set());
                    } else {
                      setSelectedGroups(new Set(groupsForAddDefense.map(g => g.id)));
                    }
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  Chọn tất cả nhóm có thể tạo hội đồng ({groupsForAddDefense.length})
                </span>
              </label>
              {selectedValidGroupsForDefense.length > 0 && (
                <span className="text-sm text-green-600">
                  Đã chọn {selectedValidGroupsForDefense.length} nhóm cho tạo hội đồng
                </span>
              )}
            </div>
            {selectedValidGroupsForDefense.length > 0 && (
              <button
                onClick={() => onBulkAddDefense(selectedValidGroupsForDefense)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" />
                Tạo hội đồng bảo vệ cho {selectedValidGroupsForDefense.length} nhóm
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== Bulk Lock Bar ===== */}
      {canShowBulkLock && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedGroups.size === groupsForLock.length && groupsForLock.length > 0}
                  onChange={() => {
                    if (selectedGroups.size === groupsForLock.length && groupsForLock.length > 0) {
                      setSelectedGroups(new Set());
                    } else {
                      setSelectedGroups(new Set(groupsForLock.map(g => g.id)));
                    }
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  Chọn tất cả nhóm có thể khóa ({groupsForLock.length})
                </span>
              </label>
              {selectedValidGroupsForLock.length > 0 && (
                <span className="text-sm text-blue-600">
                  Đã chọn {selectedValidGroupsForLock.length} nhóm cho khóa
                </span>
              )}
            </div>
            {selectedValidGroupsForLock.length > 0 && (
              <button
                onClick={() => setIsLockModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaLock className="mr-2" />
                Khóa {selectedValidGroupsForLock.length} nhóm đã chọn
              </button>
            )}
          </div>
        </div>
      )}

      <table className="w-full bg-white shadow-md rounded-lg text-center">
        <thead>
          <tr className="bg-blue-400 text-white">
            {isAdmin && <th className="py-2 px-4">Chọn</th>}
            <th className="py-2 px-4">Mã nhóm</th>
            <th className="py-2 px-4">Tên nhóm</th>
            <th className="py-2 px-4">Giảng viên</th>
            <th className="py-2 px-4">Ngày tạo</th>
            <th className="py-2 px-4">Trạng thái</th>
            <th className="py-2 px-4">Trạng thái bảo vệ</th>
            <th className="py-2 px-4">Thời gian khóa</th>
            <th className="py-2 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {groups.length > 0 ? (
            groups.map((group) => {
              const canAddDefense = !group.defense_id && group.def_status !== 'approved';
              const canLock = !!group.defense_id; // can set/modify lock if group has defense
              const canSelect = canAddDefense || canLock;

              return (
                <tr key={group.id} className="hover:bg-blue-100">
                  {/* Selection checkbox */}
                  {isAdmin && (
                    <td className="py-2 px-4 border-b">
                      {canSelect ? (
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
                  <td className="py-2 px-4 border-b">
                    {TimeService.convertDateStringToDDMMYYYY(group.created_at)}
                  </td>

                  {/* Status (non-admin can change, admin view-only) */}
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
                            <div className="absolute z-50 right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg">
                              {statuses.map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleChangeStatus(group.id, status)}
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

                  {/* Defense status (admin can change) */}
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
                            <div className="absolute z-50 right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg">
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

                  {/* Lock time + inline edit */}
                  <td className="py-2 px-4 border-b">
                    <div className="flex items-center justify-center gap-2">
                      <span>
                        {group.lock_at
                          ? TimeService.convertDateStringToDDMMYYYY(group.lock_at)
                          : '-'}
                      </span>

                      {isAdmin && canLock && (
                        <button
                          onClick={() => { setEditGroup(group); setOpenEdit(true); }}
                          className="text-blue-600 hover:text-blue-800 border px-2 py-1 rounded text-xs"
                          title={group.lock_at ? 'Đổi thời gian khóa' : 'Đặt thời gian khóa'}
                        >
                          <FaEdit />
                        </button>
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
                          <button
                            onClick={() => onDeleteGroup(group.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>

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
              );
            })
          ) : (
            <tr>
              <td colSpan={isAdmin ? '9' : '8'} className="py-4 text-center text-gray-600">
                Không tìm thấy nhóm nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== Bulk Lock Modal ===== */}
      <LockModal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        onConfirm={(d) => handleBulkLockConfirm(d)}
        selectedCount={selectedValidGroupsForLock.length}
        min={new Date()}
      />

      {/* ===== Single Edit Lock Modal ===== */}
      <LockModal
        mode="edit"
        isOpen={openEdit}
        onClose={() => { setOpenEdit(false); setEditGroup(null); }}
        initialDate={editGroup?.lock_at ? new Date(editGroup.lock_at) : null}
        onConfirm={(d) => {
          if (!editGroup) return;
          if (d) {
            onBulkLock([editGroup.id], d.toISOString());
          } else {
            onBulkLock([editGroup.id], null); // clear lock_at
          }
          setOpenEdit(false);
          setEditGroup(null);
        }}
        onClear={() => {
          if (!editGroup) return;
          onBulkLock([editGroup.id], null);
          setOpenEdit(false);
          setEditGroup(null);
        }}
        min={new Date()}
      />
    </div>
  );
};

export default TableView;
