import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlansByMeAsync, searchPlansAsync } from '../../../store/slices/planSlice';
import TableViewPlan from '../../components/plans/TableViewPlan';
import CalendarViewPlan from '../../components/plans/CalendarViewPlan';
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const LecturerPlansPage = () => {
  const dispatch = useDispatch();
  const { plans, total, page, per_page, loading, error } = useSelector((state) => state.plans || { 
    plans: [], total: 0, page: 1, per_page: 10, loading: false, error: null 
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('table');
  const [tableLoading, setTableLoading] = useState(false);

  // Function to fetch plans for table view
  const fetchTablePlans = useCallback(async () => {
    if (activeTab !== 'table') return;
    
    setTableLoading(true);
    try {
      await dispatch(fetchPlansByMeAsync({ page: currentPage, per_page })).unwrap();
    } catch (err) {
      console.error('Error fetching table plans:', err);
    } finally {
      setTableLoading(false);
    }
  }, [dispatch, currentPage, per_page, activeTab]);

  // Fetch table data when in table view
  useEffect(() => {
    if (activeTab === 'table') {
      fetchTablePlans();
    }
  }, [activeTab, fetchTablePlans]);

  // Handle search for table view
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

  // Display error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle view plan details
  const handleViewPlan = (plan) => {
    toast.info('Chức năng xem chi tiết kế hoạch chưa được triển khai.');
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'calendar') {
      setSearchTerm('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Defense Plans</h1>

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
            Calendar View
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
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {tableLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <TableViewPlan
                  plans={plans}
                  onViewPlan={handleViewPlan}
                  isAdmin={false}
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
              onViewPlan={handleViewPlan}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LecturerPlansPage;