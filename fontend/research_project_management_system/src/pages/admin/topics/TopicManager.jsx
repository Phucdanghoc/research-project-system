import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useAppDispatch } from '../../../store';
import TableView from './components/TableView';
import AddEditTopicModal from './components/AddEditTopicModal';
import ViewTopicModal from './components/ViewTopicModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import AddMultipleTopicsModal from './components/AddMultipleTopicsModal';
import { FacultyMajors } from '../../../types/enum';
import {
  fetchTopicsAsync,
  addTopicAsync,
  updateTopicAsync,
  deleteTopicAsync,
  clearError,
  searchTopicAsync,
  filterByStatusAsync,
  generateTopicAsync,
} from '../../../store/auth/topicSlice';
import { toast } from 'react-toastify';

const statusConfig = {
  open: { icon: <FaCheckCircle className="text-green-600" />, label: 'Mở', border: 'border-green-600' },
  closed: { icon: <FaTimesCircle className="text-red-600" />, label: 'Đóng', border: 'border-red-600' },
  pending: { icon: <FaClock className="text-yellow-600" />, label: 'Chờ duyệt', border: 'border-yellow-600' },
};

const initialFormData = {
  title: '',
  topic_code: '',
  description: '',
  requirement: '',
  topic_quantity: '',
  student_quantity: '',
  status: 'open',
  lecturer_id: '',
  lecturer_name: '',
  category: '',
  faculty: '',
  major: '',
};

const TOPICS_PER_PAGE = 10;
const STATUSES = ['open', 'closed', 'pending'];

const ManageTopics = () => {
  const dispatch = useAppDispatch();
  const { topics, loading, error, current_page, total_pages } = useSelector((state) => state.topics);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMultipleModalOpen, setIsAddMultipleModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [availableMajors, setAvailableMajors] = useState([]);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const params = { page: currentPage, per_page: TOPICS_PER_PAGE };
    if (searchQuery.trim()) {
      dispatch(searchTopicAsync({ keyword: searchQuery, ...params }));
    } else if (selectedStatus !== 'all') {
      dispatch(filterByStatusAsync({ status: selectedStatus, ...params }));
    } else {
      dispatch(fetchTopicsAsync(params));
    }
  }, [dispatch, currentPage, searchQuery, selectedStatus]);

  // Handle error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Update available majors based on selected faculty
  useEffect(() => {
    const majors = FacultyMajors[formData.faculty]?.majors.map((m) => m.code) || [];
    setAvailableMajors(majors);
    if (!majors.includes(formData.major)) {
      setFormData((prev) => ({ ...prev, major: '' }));
    }
  }, [formData.faculty]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(dropdownRefs.current).some((ref) => ref?.contains(event.target))) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetFormAndClose = useCallback(() => {
    setFormData(initialFormData);
    setSelectedTopic(null);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    dispatch(clearError());
  }, [dispatch]);

  const handleAddTopic = useCallback(() => {
    setFormData(initialFormData);
    setIsAddModalOpen(true);
  }, []);

  const handleEditTopic = useCallback((topic) => {
    setSelectedTopic(topic);
    setFormData({
      title: topic.title || '',
      topic_code: topic.topic_code || '',
      description: topic.description || '',
      requirement: topic.requirement || '',
      topic_quantity: topic.topic_quantity?.toString() || '',
      student_quantity: topic.student_quantity?.toString() || '',
      status: topic.status || 'open',
      lecturer_id: topic.lecturer_id?.toString() || '',
      lecturer_name: topic.lecturer_name || '',
      category: topic.category || '',
      faculty: topic.faculty || '',
      major: topic.major || '',
    });
    setIsEditModalOpen(true);
  }, []);

  const handleViewTopic = useCallback((topic) => {
    setSelectedTopic(topic);
    setIsViewModalOpen(true);
  }, []);

  const handleDeleteTopic = useCallback((topic) => {
    setSelectedTopic(topic);
    setIsDeleteModalOpen(true);
  }, []);

  const handleAddMultipleTopics = useCallback(() => {
    setIsAddMultipleModalOpen(true);
  }, []);

  // Form submission
  const handleSubmitTopic = useCallback(
    async (e, isEdit) => {
      e.preventDefault();
      if (!isEdit && (!formData.lecturer_name || !formData.lecturer_id)) {
        toast.error('Vui lòng chọn giảng viên!');
        return;
      }
      const topicData = {
        ...(isEdit && selectedTopic ? { id: selectedTopic.id } : {}),
        ...formData,
        topic_quantity: parseInt(formData.topic_quantity) || 0,
        student_quantity: parseInt(formData.student_quantity) || 0,
        lecturer_id: parseInt(formData.lecturer_id) || null,
      };
      try {
        await dispatch(isEdit ? updateTopicAsync(topicData) : addTopicAsync(topicData)).unwrap();
        resetFormAndClose();
        dispatch(fetchTopicsAsync({ page: currentPage, per_page: TOPICS_PER_PAGE }));
        toast.success(isEdit ? 'Cập nhật đề tài thành công!' : 'Thêm đề tài thành công!');
      } catch (error) {
        toast.error(isEdit ? 'Cập nhật đề tài thất bại!' : 'Thêm đề tài thất bại!');
      }
    },
    [dispatch, formData, selectedTopic, resetFormAndClose, currentPage]
  );

  const handleSubmitMultipleTopics = useCallback(
    async (topics) => {
      try {
        await dispatch(generateTopicAsync(topics)).unwrap();
        setIsAddMultipleModalOpen(false);
        dispatch(fetchTopicsAsync({ page: currentPage, per_page: TOPICS_PER_PAGE }));
        toast.success('Thêm các đề tài thành công!');
      } catch (error) {
        toast.error('Thêm các đề tài thất bại!');
      }
    },
    [dispatch, currentPage]
  );

  const handleStatusChange = useCallback(
    async (topicId, newStatus) => {
      const topic = topics.find((t) => t.id === topicId);
      if (topic) {
        try {
          await dispatch(updateTopicAsync({ ...topic, status: newStatus })).unwrap();
          toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
          toast.error('Cập nhật trạng thái thất bại!');
        }
      }
      setOpenDropdownId(null);
    },
    [dispatch, topics]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTopic) return;
    try {
      await dispatch(deleteTopicAsync(selectedTopic.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedTopic(null);
      if (topics.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        dispatch(fetchTopicsAsync({ page: currentPage, per_page: TOPICS_PER_PAGE }));
      }
      toast.success('Xóa đề tài thành công!');
    } catch (error) {
      toast.error('Xóa đề tài thất bại!');
    }
  }, [dispatch, selectedTopic, topics.length, currentPage]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Quản lý đề tài</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm đề tài..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          aria-label="Tìm kiếm đề tài"
        />
        <select
          value={selectedStatus}
          onChange={handleStatusFilterChange}
          className="w-full sm:w-40 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          aria-label="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusConfig[status].label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddMultipleTopics}
          className="w-full sm:w-48 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          aria-label="Thêm đề tài"
        >
          Thêm đề tài
        </button>
      </div>

      <TableView
        currentTopics={topics}
        statusConfig={statusConfig}
        dropdownRefs={dropdownRefs}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        handleViewTopic={handleViewTopic}
        handleEditTopic={handleEditTopic}
        handleDeleteTopic={handleDeleteTopic}
        handleStatusChange={handleStatusChange}
        statuses={STATUSES}
      />

      {total_pages > 1 && (
        <nav className="flex justify-center mt-4 gap-2" aria-label="Phân trang">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-1 rounded ${
              currentPage === 1 || loading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Trang trước"
          >
            Trước
          </button>
          {Array.from({ length: total_pages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              disabled={loading}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${loading ? 'cursor-not-allowed' : ''}`}
              aria-label={`Trang ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === total_pages || loading}
            className={`px-3 py-1 rounded ${
              currentPage === total_pages || loading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Trang sau"
          >
            Sau
          </button>
        </nav>
      )}

      <AddEditTopicModal
        isOpen={isAddModalOpen}
        onClose={resetFormAndClose}
        onSubmit={(e) => handleSubmitTopic(e, false)}
        formData={formData}
        onInputChange={handleInputChange}
        statuses={STATUSES}
        isEdit={false}
        facultyMajors={FacultyMajors}
        availableMajors={availableMajors}
      />
      <AddEditTopicModal
        isOpen={isEditModalOpen}
        onClose={resetFormAndClose}
        onSubmit={(e) => handleSubmitTopic(e, true)}
        formData={formData}
        onInputChange={handleInputChange}
        statuses={STATUSES}
        isEdit={true}
        facultyMajors={FacultyMajors}
        availableMajors={availableMajors}
      />
      <AddMultipleTopicsModal
        isOpen={isAddMultipleModalOpen}
        onClose={() => setIsAddMultipleModalOpen(false)}
        onSubmit={handleSubmitMultipleTopics}
      />
      <ViewTopicModal
        isOpen={isViewModalOpen}
        onClose={resetFormAndClose}
        topic={selectedTopic}
        facultyMajors={FacultyMajors}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={resetFormAndClose}
        onConfirm={handleConfirmDelete}
        itemName={selectedTopic?.title || ''}
      />
    </div>
  );
};

export default ManageTopics;