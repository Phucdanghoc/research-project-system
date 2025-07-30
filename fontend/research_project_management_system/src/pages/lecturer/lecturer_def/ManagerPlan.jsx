import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateLecturerDefenseAsync,
  clearError,
} from '../../../store/slices/lecturerDefenseSlice'; // Adjust path as needed
import { getMyDefensesAsync } from '../../../store/slices/defensesSlice'; // Adjust path as needed
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';
import Pagination from '../../components/students/Pagination'; // Adjust path as needed
import { motion, AnimatePresence } from 'framer-motion';
import EditPointCommentModal from '../../components/defenses/EditPointCommentModal'; // Adjust path as needed

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
  const lastFetchedPage = useRef(null);
  const per_page = 10;

  const fetchMyDefenses = async () => {
    const pageKey = `${currentPage}_${per_page}`;
    if (lastFetchedPage.current === pageKey) return;

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

  const handleEditClick = (lecturerDefense, defense) => {
    setSelectedLecturerDefense(lecturerDefense);
    setSelectedDefense(defense);
    setIsModalOpen(true);
  };

  const handleSave = (id, formData) => {
    dispatch(updateLecturerDefenseAsync({ id, lecturerDefense: formData }))
      .then(() => {
        toast.success('Cập nhật điểm và nhận xét thành công');
        fetchMyDefenses(); // Refresh data to reflect changes
      })
      .catch(() => {
        toast.error('Có lỗi xảy ra khi cập nhật');
      });
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

  const isDefenseDone = (endTime) => {
    if (!endTime) return false;
    const currentTime = new Date();
    const endDateTime = new Date(endTime);
    return currentTime > endDateTime;
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
                    <th className="py-2 px-4">Điểm</th>
                    <th className="py-2 px-4">Nhận xét</th>
                    <th className="py-2 px-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {defenses.length > 0 ? (
                    defenses.flatMap((defense) =>
                      defense.lecturer_defenses.map((ld) => {
                        const isDone = isDefenseDone(defense.end_time);
                        const isPointMissing = isDone && ld.point === null;
                        const isCommentMissing = isDone && !ld.comment;
                        return (
                          <tr
                            key={ld.id}
                            className={`hover:bg-blue-100 ${isDone ? 'bg-green-100' : ''}`}
                          >
                            <td className="py-2 px-4 border-b">{defense.defense_code || '-'}</td>
                            <td className="py-2 px-4 border-b font-bold">{defense.name}</td>
                            <td className="py-2 px-4 border-b">{ld.group.name} ({ld.group.group_code})</td>
                            <td className="py-2 px-4 border-b">{formatDate(defense.date)}</td>
                            <td className="py-2 px-4 border-b">{formatTime(defense.start_time)}</td>
                            <td className="py-2 px-4 border-b">{formatTime(defense.end_time)}</td>
                            <td className={`py-2 px-4 border-b ${isPointMissing ? 'bg-red-100' : ''}`}>
                              {ld.point ?? '-'}
                            </td>
                            <td className={`py-2 px-4 border-b ${isCommentMissing ? 'bg-red-100' : ''}`}>
                              {ld.comment || '-'}
                            </td>
                            <td className="py-2 px-4 border-b space-x-2 flex justify-center">
                              <button
                                onClick={() => handleEditClick(ld, defense)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-4 text-center text-gray-600">
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
    </div>
  );
};

export default MyDefensesView;