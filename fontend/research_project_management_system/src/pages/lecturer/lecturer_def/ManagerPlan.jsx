import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateLecturerDefenseAsync,
  clearError,
} from '../../../store/slices/lecturerDefenseSlice';
import { getMyDefensesAsync } from '../../../store/slices/defensesSlice';
import { toast } from 'react-toastify';
import { FaEdit, FaLock } from 'react-icons/fa';
import Pagination from '../../components/students/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import EditPointCommentModal from '../../components/defenses/EditPointCommentModal';
import ViewGroupModal from '../../components/groups/ViewGroupModal';
import { TokenService } from '../../../services/token';

const MyDefensesView = () => {
  const dispatch = useDispatch();
  const { defenses, total_count, current_page, total_pages, loading, error: defenseError } = useSelector(
    (state) => state.defenses || {
      defenses: [],
      total_count: 0,
      current_page: 1,
      total_pages: 1,
      loading: false,
      error: null,
    }
  );
  const { error: lecturerDefenseError } = useSelector(
    (state) => state.lecturerDefenses || { error: null }
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLecturerDefense, setSelectedLecturerDefense] = useState(null);
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);
  const [isShowGroupDetail, setIsShowGroupDetail] = useState(false);
  const lastFetchedPage = useRef(null);
  const per_page = 10;

  const fetchMyDefenses = async () => {
    const pageKey = `${currentPage}_${per_page}`;
    console.log('Fetching defenses for page:', pageKey);
    
   

    setTableLoading(true);
    try {
      await dispatch(getMyDefensesAsync({ page: currentPage, per_page })).unwrap();
      lastFetchedPage.current = pageKey;
    } catch (err) {
      toast.error('Lỗi khi tải danh sách buổi bảo vệ');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDefenses();
  }, [currentPage, dispatch]);

  useEffect(() => {
    if (defenseError || lecturerDefenseError) {
      toast.error(defenseError || lecturerDefenseError);
      dispatch(clearError());
    }
  }, [defenseError, lecturerDefenseError, dispatch]);

 
  const isGroupLocked = (group) => {
    if (!group?.lock_at) return false;
    const currentTime = new Date();
    const lockTime = new Date(group.lock_at);
    return currentTime > lockTime;
  };

  const handleEditClick = (lecturerDefense, defense) => {
    const group = defense.groups?.[0];
    if (isGroupLocked(group)) {
      toast.warning('Không thể chỉnh sửa điểm. Nhóm đã bị khóa.');
      return;
    }

    setSelectedLecturerDefense(lecturerDefense);
    setSelectedDefense(defense);
    setIsModalOpen(true);
  };

  const handleSave = async (id, formData) => {
    try {
      await dispatch(updateLecturerDefenseAsync({
        id: id,
        lecturerDefense: {
          point: formData.point,
          comment: formData.comment,
        },
      })).unwrap();

      await fetchMyDefenses();
      toast.success('Cập nhật điểm và nhận xét thành công');
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật');
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

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isDefenseDone = (endTime) => {
    if (!endTime) return false;
    const currentTime = new Date();
    const endDateTime = new Date(endTime);
    return currentTime > endDateTime;
  };

  const handleViewGroupDetail = (lecturerDefense) => {
    setSelectedLecturerDefense(lecturerDefense);
    setIsShowGroupDetail(true);
  };

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Buổi bảo vệ của tôi</h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="table-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          id="table-view"
          role="tabpanel"
          aria-labelledby="table-tab"
        >
          {tableLoading || loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <>
              <table className="w-full bg-white shadow-md rounded-lg text-center">
                <thead>
                  <tr className="bg-blue-400 text-white">
                    <th className="py-2 px-4">Mã buổi bảo vệ</th>
                    <th className="py-2 px-4">Tên buổi bảo vệ</th>
                    <th className="py-2 px-4">Nhóm</th>
                    <th className="py-2 px-4">Ngày bảo vệ</th>
                    <th className="py-2 px-4">Thời gian bắt đầu</th>
                    <th className="py-2 px-4">Thời gian kết thúc</th>
                    <th className="py-2 px-4">Hội đồng bảo vệ</th>
                    <th className="py-2 px-4">Điểm</th>
                    <th className="py-2 px-4">Trạng thái</th>
                    <th className="py-2 px-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {defenses.length > 0 ? (
                    defenses.map((defense) => {
                      const group = defense.groups?.[0];
                      const isDone = isDefenseDone(defense.end_time);
                      const isLocked = isGroupLocked(group);
                      const currentUser = TokenService.getUser();
                      const myLecturerDefense = defense.lecturer_defenses && defense.lecturer_defenses.find(
                        (ld) => ld.lecturer_id === currentUser?.id
                      ) || null;

                      return (
                        <tr
                          key={defense.id}
                          className={`hover:bg-blue-100 ${isLocked ? 'bg-red-50' : ''}`}
                        >
                          <td className="py-2 px-4 border-b">{defense.defense_code || '-'}</td>
                          <td className="py-2 px-4 border-b font-bold">{defense.name}</td>
                          <td
                            className="py-2 px-4 border-b font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleViewGroupDetail(defense.lecturer_defenses[0])}
                          >
                            {group?.name || '-'}
                          </td>
                          <td className="py-2 px-4 border-b">{formatDate(defense.date)}</td>
                          <td className="py-2 px-4 border-b">{formatTime(defense.start_time)}</td>
                          <td className="py-2 px-4 border-b">{formatTime(defense.end_time)}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex justify-center space-x-2">
                              {defense.lecturer_defenses.map((ld) => (
                                <div
                                  key={ld.id}
                                  className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold"
                                  title={ld.lecturer.name}
                                >
                                  {getFirstLetter(ld.lecturer.name)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-4 border-b">
                            {myLecturerDefense && (
                              <div key={myLecturerDefense.id}>
                                <span className={`font-medium ${isLocked ? 'text-gray-500' : 'text-blue-600'}`}>
                                  {myLecturerDefense.point || '-'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {isLocked ? (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center text-red-600 mb-1">
                                  <FaLock className="mr-1" />
                                  <span className="text-xs">Đã khóa</span>
                                </div>
                                {group?.lock_at && (
                                  <span className="text-xs text-gray-500">
                                    {formatDateTime(group.lock_at)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-green-600 text-xs">Có thể chỉnh sửa</span>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b space-x-2 justify-center">
                            {myLecturerDefense && (
                              <>
                                {isLocked ? (
                                  <button
                                    disabled
                                    className="text-gray-400 cursor-not-allowed"
                                    title="Nhóm đã bị khóa, không thể chỉnh sửa"
                                  >
                                    <FaEdit />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleEditClick(myLecturerDefense, defense)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Chỉnh sửa điểm và nhận xét"
                                  >
                                    <FaEdit />
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="py-4 text-center text-gray-600">
                        Không tìm thấy buổi bảo vệ nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                total={total_count}
                perPage={per_page}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {isModalOpen && (
        <EditPointCommentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          lecturerDefense={selectedLecturerDefense}
          defense={selectedDefense}
          onSubmit={handleSave}
        />
      )}

      {isShowGroupDetail && selectedLecturerDefense && (
        <ViewGroupModal
          isOpen={isShowGroupDetail}
          onClose={() => setIsShowGroupDetail(false)}
          groupId={selectedLecturerDefense.group?.id}
        />
      )}
    </div>
  );
};

export default MyDefensesView;