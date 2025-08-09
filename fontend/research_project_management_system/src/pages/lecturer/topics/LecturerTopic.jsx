import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useAppDispatch } from '../../../store/index';
import TableView from '../../components/topic/TableView';
import AddEditTopicModal from '../../components/topic/AddEditTopicModal';
import ViewTopicModal from '../../components/topic/ViewTopicModal';
import { FacultyMajors } from '../../../types/enum';
import {
  updateTopicAsync,
  clearError,
  getTopicByMeAsync,
} from '../../../store/slices/topicSlice';
import { toast } from 'react-toastify';
import AddEditGroupModal from '../../components/groups/AddEditGroupModal';
import { createGroupAsync } from '../../../store/slices/groupSlice';

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

const LecturerTopic = () => {
  const dispatch = useAppDispatch();
  const { topics, loading, error, current_page, total_pages } = useSelector((state) => state.topics);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupFormData, setGroupFormData] = useState(null);
  const dropdownRefs = useRef({});

  const handleOpenGroupModal = useCallback((topic) => {
    console.log(`Opening group modal for topic: ${topic}`);
    setSelectedTopic(topic);
    setGroupFormData({
      name: '',
      topic_id: topic?.id || '',
      student_ids: [],
      title: topic?.title || '',
    });
    setIsGroupModalOpen(true);
  }, []);

  const handleSubmitGroup = useCallback(
    async (formData) => {
      console.log('Submitting group form data:', formData);
      
      try {
        await dispatch(createGroupAsync(formData)).unwrap().then((res) => {
          if (res) {
            toast.success('Nhóm đã được tạo/cập nhật thành công!');
            setIsGroupModalOpen(false);
            setGroupFormData(null);
          } else {
            toast.error('Tạo/cập nhật nhóm thất bại!');
          }
        });

      } catch (error) {
        toast.error('Tạo/cập nhật nhóm thất bại!');
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const params = { page: currentPage, per_page: TOPICS_PER_PAGE };
    if (searchQuery.trim()) {
      dispatch(getTopicByMeAsync({ keyword: searchQuery, ...params }));
    } else if (selectedStatus !== 'all') {
      dispatch(getTopicByMeAsync({ status: selectedStatus, ...params }));
    } else {
      dispatch(getTopicByMeAsync(params));
    }
  }, [dispatch, currentPage, searchQuery, selectedStatus]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const majors = FacultyMajors[formData.faculty]?.majors.map((m) => m.code) || [];
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
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsGroupModalOpen(false);
    setGroupFormData(null);
    dispatch(clearError());
  }, [dispatch]);

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
    console.log(`Viewing topic: ${topic.title}`);

    setSelectedTopic(topic);
    setIsViewModalOpen(true);
  }, []);
  const validateTopicBeforeOpen = (topic) => {
    if (!topic.title?.trim()) return false;
    if (!topic.topic_code?.trim()) return false;
    if (!topic.description?.trim()) return false;
    if (!topic.requirement?.trim()) return false;
    if (!topic.category?.trim()) return false;
    return true;
  };
  const handleSubmitForApproval = useCallback(
    async (topicId, status) => {
      const topic = topics.find((t) => t.id === topicId);
      if (topic) {
        try {
          if (status === 'open' && !validateTopicBeforeOpen(topic)) {
            toast.error('Vui lòng điền đầy đủ thông tin trước khi mở đề tài!');
            return;
          }
          await dispatch(updateTopicAsync({ ...topic, status: status })).unwrap();
          toast.success('Gửi duyệt đề tài thành công!');
          dispatch(getTopicByMeAsync({ page: currentPage, per_page: TOPICS_PER_PAGE }));
        } catch (error) {
          toast.error('Gửi duyệt đề tài thất bại!');
        }
      }
      setOpenDropdownId(null);
    },
    [dispatch, topics, currentPage]
  );

  const handleSubmitTopic = useCallback(
    async (e) => {
      e.preventDefault();
      if (!selectedTopic) return;
      const topicData = {
        id: selectedTopic.id,
        ...formData,
        topic_quantity: parseInt(formData.topic_quantity) || 0,
        student_quantity: parseInt(formData.student_quantity) || 0,
        lecturer_id: parseInt(formData.lecturer_id) || null,
      };
      try {
        await dispatch(updateTopicAsync(topicData)).unwrap();
        resetFormAndClose();
        dispatch(getTopicByMeAsync({ page: currentPage, per_page: TOPICS_PER_PAGE }));
        toast.success('Cập nhật đề tài thành công!');
      } catch (error) {
        toast.error('Cập nhật đề tài thất bại!');
      }
    },
    [dispatch, formData, selectedTopic, resetFormAndClose, currentPage]
  );

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
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Đề tài của tôi</h1>
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
      </div>

      <TableView
        currentTopics={topics}
        statusConfig={statusConfig}
        dropdownRefs={dropdownRefs}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        handleViewTopic={handleViewTopic}
        handleEditTopic={handleEditTopic}
        handleDeleteTopic={null}
        handleCreateGroup={handleOpenGroupModal}
        handleStatusChange={handleSubmitForApproval}
        statuses={STATUSES}
        isAdmin={false}
      />

      {total_pages > 1 && (
        <nav className="flex justify-center mt-4 gap-2" aria-label="Phân trang">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-1 rounded ${currentPage === 1 || loading
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
              className={`px-3 py-1 rounded ${currentPage === index + 1
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
            className={`px-3 py-1 rounded ${currentPage === total_pages || loading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            aria-label="Trang sau"
          >
            Sau
          </button>
        </nav>
      )}

      {isEditModalOpen && (
        <AddEditTopicModal
          isOpen={isEditModalOpen}
          onClose={resetFormAndClose}
          onSubmit={handleSubmitTopic}
          formData={formData}
          onInputChange={handleInputChange}
          statuses={STATUSES}
          isEdit={true}
          isLecturer={true}
        />)}
      <ViewTopicModal
        isOpen={isViewModalOpen}
        onClose={resetFormAndClose}
        // topic={selectedTopic}
        topicId={selectedTopic ? selectedTopic.id : null}
      />
      {groupFormData && (
        <AddEditGroupModal
          isOpen={isGroupModalOpen}
          onClose={resetFormAndClose}
          onSubmit={handleSubmitGroup}
          groupData={groupFormData}
          isEdit={!!groupFormData?.id}
          topic={selectedTopic}
          
          isLecture={true}
        />
      )}
    </div>
  );
};

export default LecturerTopic;