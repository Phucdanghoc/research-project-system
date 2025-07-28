import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { fetchPlansAsync, searchPlansAsync, createPlanAsync, updatePlanAsync, deletePlanAsync } from '../../../store/slices/planSlice';
import TableViewPlan from '../../components/plans/TableViewPlan';
import CalendarViewPlan from '../../components/plans/CalendarViewPlan';
import AddEditPlanModal from '../../components/plans/AddEditPlanModal';
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const PlanManager = () => {
  const dispatch = useAppDispatch();
  const { plans, total, page, per_page, loading, error } = useSelector((state) => state.plans || { 
    plans: [], total: 0, page: 1, per_page: 10, loading: false, error: null 
  });
  
  const [faculty, setFaculty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('table');

  // Separate loading states for table and calendar
  const [tableLoading, setTableLoading] = useState(false);

  // Function to fetch plans for table view only
  const fetchTablePlans = useCallback(async () => {
    if (activeTab !== 'table') return;
    
    setTableLoading(true);
    try {
      await dispatch(fetchPlansAsync({ page: currentPage, per_page })).unwrap();
    } catch (err) {
      console.error('Error fetching table plans:', err);
    } finally {
      setTableLoading(false);
    }
  }, [dispatch, currentPage, per_page, activeTab]);

  // Only fetch table data when in table view
  useEffect(() => {
    if (activeTab === 'table') {
      fetchTablePlans();
    }
  }, [activeTab, fetchTablePlans]);

  // Handle search - only for table view
  useEffect(() => {
    if (activeTab === 'table' && searchTerm.trim()) {
      setTableLoading(true);
      dispatch(searchPlansAsync(searchTerm)).then(() => {
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
    console.log(`Faculty: ${faculty}, Search term: ${newSearchTerm}`);
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setIsEdit(false);
    setIsAddEditModalOpen(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsEdit(true);
    setIsAddEditModalOpen(true);
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    toast.info('Chức năng xem chi tiết kế hoạch chưa được triển khai.');
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa kế hoạch này?')) {
      try {
        await dispatch(deletePlanAsync(id)).unwrap();
        toast.success('Xóa kế hoạch thành công');
        
        // Refresh data for current view
        if (activeTab === 'table') {
          fetchTablePlans();
        }
        // Calendar will automatically refresh when plans state updates
      } catch (err) {
        toast.error('Lỗi khi xóa kế hoạch');
      }
    }
  };

  const handleSubmitPlan = async (formData) => {
    try {
      if (isEdit) {
        await dispatch(updatePlanAsync({ id: selectedPlan.id, planData: formData })).unwrap();
        toast.success('Cập nhật kế hoạch thành công');
      } else {
        await dispatch(createPlanAsync(formData)).unwrap();
        toast.success('Thêm kế hoạch thành công');
      }
      
      setIsAddEditModalOpen(false);
      
      // Refresh data for current view
      if (activeTab === 'table') {
        fetchTablePlans();
      }
      // Calendar will automatically refresh when plans state updates
    } catch (err) {
      toast.error(`Lỗi khi ${isEdit ? 'cập nhật' : 'thêm'} kế hoạch`);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset search when switching to calendar view
    if (tab === 'calendar') {
      setSearchTerm('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý kế hoạch (Admin)</h1>
        <button
          onClick={handleAddPlan}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm kế hoạch
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
              {/* Search functionality only for table view */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm kế hoạch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {tableLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
              ) : (
                <TableViewPlan
                  plans={plans}
                  onViewPlan={handleViewPlan}
                  onEditPlan={handleEditPlan}
                  onDeletePlan={handleDeletePlan}
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
            <CalendarViewPlan
              onEditPlan={handleEditPlan}
              onDeletePlan={handleDeletePlan}
              onViewPlan={handleViewPlan}
              isAdmin={true}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {isAddEditModalOpen && (
        <AddEditPlanModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          plan={selectedPlan}
          isEdit={isEdit}
          onSubmit={handleSubmitPlan}
        />
      )}
    </div>
  );
};

export default PlanManager;