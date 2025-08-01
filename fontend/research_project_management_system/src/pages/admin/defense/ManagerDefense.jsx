import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { fetchDefensesAsync, searchDefensesAsync, addDefenseAsync, updateDefenseAsync, deleteDefenseAsync } from '../../../store/slices/defensesSlice';
import TableViewDefense from '../../components/defenses/DefenseTableView';
import CalendarViewDefense from '../../components/defenses/CalendarViewDefense';
import AddEditDefenseModal from '../../components/defenses/AddEditDefenses';
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ViewDefenseModal from '../../components/defenses/ViewDefenseModal';

const DefenseManager = () => {
  const dispatch = useAppDispatch();
  const { defenses, total, page, per_page, loading, error } = useSelector((state) => state.defenses || { 
    defenses: [], total: 0, page: 1, per_page: 10, loading: false, error: null 
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [tableLoading, setTableLoading] = useState(false);
  const [isViewModalOpen , setIsViewModalOpen] = useState(false);
  const lastFetchedPage = useRef(null);

  const fetchTableDefenses = async () => {
    if (activeTab !== 'table') return;
    
    const pageKey = `${currentPage}_${per_page}`;
    if (lastFetchedPage.current === pageKey) return;

    setTableLoading(true);
    try {
      await dispatch(fetchDefensesAsync({ page: currentPage, per_page })).unwrap();
      lastFetchedPage.current = pageKey;
    } catch (err) {
      console.error('Error fetching table defenses:', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'table') {
      fetchTableDefenses();
    }
  }, [activeTab, currentPage, per_page]);

  useEffect(() => {
    if (activeTab === 'table' && searchTerm.trim()) {
      setTableLoading(true);
      dispatch(searchDefensesAsync(searchTerm)).then(() => {
        setTableLoading(false);
        setCurrentPage(1);
      }).catch(() => {
        setTableLoading(false);
      });
    }
  }, [searchTerm, dispatch, activeTab]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = ({ searchTerm: newSearchTerm }) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleAddDefense = () => {
    setSelectedDefense(null);
    setIsEdit(false);
    setIsAddEditModalOpen(true);
  };

  const handleEditDefense = (defense) => {
    setSelectedDefense(defense);
    setIsEdit(true);
    setIsAddEditModalOpen(true);
  };

  const handleViewDefense = (defense) => {
    setSelectedDefense(defense);
    setIsViewModalOpen(true);
  };

  const handleDeleteDefense = async (defense) => {
    if (window.confirm('Bạn có chắc muốn xóa buổi bảo vệ này?')) {
      try {
        if (!defense || !defense.id) {
          toast.error('Buổi bảo vệ không hợp lệ!');
          return;
        }
        await dispatch(deleteDefenseAsync(defense.id)).unwrap();
        toast.success('Xóa buổi bảo vệ thành công');
        if (activeTab === 'table') {
          fetchTableDefenses();
        }
      } catch (err) {
        toast.error('Lỗi khi xóa buổi bảo vệ');
      }
    }
  };

  const handleSubmitDefense = async (formData) => {
    try {
      if (isEdit) {
        await dispatch(updateDefenseAsync({ id: selectedDefense.id, defenseData: formData })).unwrap();
        toast.success('Cập nhật buổi bảo vệ thành công');
      } else {
        await dispatch(addDefenseAsync(formData)).unwrap();
        toast.success('Thêm buổi bảo vệ thành công');
      }
      
      setIsAddEditModalOpen(false);
      if (activeTab === 'table') {
        fetchTableDefenses();
      }
    } catch (err) {
      toast.error(`Lỗi khi ${isEdit ? 'cập nhật' : 'thêm'} buổi bảo vệ`);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'calendar') {
      setSearchTerm('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý buổi bảo vệ (Admin)</h1>
        <button
          onClick={handleAddDefense}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm buổi bảo vệ
        </button>
      </div>

      <div className="mb-4">
        <div className="flex border-b border-gray-200" role="tablist">
          <button
            onClick={() => handleTabChange('table')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'table' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
            role="tab"
            aria-selected={activeTab === 'table'}
            aria-controls="table-view"
            id="table-tab"
          >
            Table View
          </button>
          <button
            onClick={() => handleTabChange('calendar')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'calendar' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
            role="tab"
            aria-selected={activeTab === 'calendar'}
            aria-controls="calendar-view"
            id="calendar-tab"
          >
            Xem lịch
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          id={activeTab === 'table' ? 'table-view' : 'calendar-view'}
          role="tabpanel"
          aria-labelledby={activeTab === 'table' ? 'table-tab' : 'calendar-tab'}
        >
          {activeTab === 'table' ? (
            <>

              {tableLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
              ) : (
                <TableViewDefense
                  defenses={defenses}
                  onViewDefense={handleViewDefense}
                  onEditDefense={handleEditDefense}
                  onDeleteDefense={handleDeleteDefense}
                  isAdmin={true}
                />
              )}

              <Pagination
                total={total}
                perPage={per_page}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <CalendarViewDefense
              onViewDefense={handleViewDefense}
              onEditDefense={handleEditDefense}
              onDeleteDefense={handleDeleteDefense}
              dispatch={dispatch}
              isAdmin={true}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {isAddEditModalOpen && (
        <AddEditDefenseModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          defense={selectedDefense}
          isEdit={isEdit}
          onSubmit={handleSubmitDefense}
        />
      )}
      {isViewModalOpen && selectedDefense && (
        <ViewDefenseModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          defenseId={selectedDefense?.id}
        />
      )
      }
    </div>
  );
};

export default DefenseManager;