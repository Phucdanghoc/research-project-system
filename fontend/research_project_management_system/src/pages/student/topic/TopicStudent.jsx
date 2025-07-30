import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaCheckCircle } from 'react-icons/fa';
import { useAppDispatch } from '../../../store/index';
import GridView from '../../components/topic/GridView';
import ViewTopicModal from '../../components/topic/ViewTopicModal';
import AddEditGroupModal from '../../components/groups/AddEditGroupModal';
import { getTopicsInFacultyAsync, clearError } from '../../../store/slices/topicSlice';
import { createGroupAsync } from '../../../store/slices/groupSlice';
import { toast } from 'react-toastify';

const statusConfig = {
  open: { icon: <FaCheckCircle className="text-green-600" />, label: 'Mở', border: 'border-green-600' },
};

const TOPICS_PER_PAGE = 10;

const StudentTopic = () => {
  const dispatch = useAppDispatch();
  const { topics, loading, error, current_page, total_pages } = useSelector((state) => state.topics);
  const currentStudentId = useSelector((state) => state.auth.user?.id); 
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [groupFormData, setGroupFormData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const params = { page: currentPage, per_page: TOPICS_PER_PAGE, status: 'open' };
    if (searchQuery.trim()) {
      dispatch(getTopicsInFacultyAsync({ keyword: searchQuery, ...params }));
    } else {
      dispatch(getTopicsInFacultyAsync(params));
    }
  }, [dispatch, currentPage, searchQuery]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const resetFormAndClose = useCallback(() => {
    setSelectedTopic(null);
    setIsViewModalOpen(false);
    setIsGroupModalOpen(false);
    setGroupFormData(null);
    dispatch(clearError());
  }, [dispatch]);

  const handleViewTopic = useCallback((topic) => {
    setSelectedTopic(topic);
    setIsViewModalOpen(true);
  }, []);

  const handleOpenGroupModal = useCallback((topic) => {
    setGroupFormData({
      name: '',
      topic_id: topic?.id || '',
      description: '',
      student_ids: currentStudentId ? [currentStudentId] : [],
      student_lead_id: currentStudentId?.toString() || '',
    });
    setSelectedTopic(topic);
    setIsGroupModalOpen(true);
  }, [currentStudentId]);

  const handleSubmitGroup = useCallback(
    async (formData) => {
      console.log('formData', formData);
      try {
        await dispatch(createGroupAsync(formData)).unwrap().then((res) => {
          if (res) {
            toast.success('Đăng ký nhóm thành công!');
            setIsGroupModalOpen(false);
            setGroupFormData(null);
            dispatch(getTopicsInFacultyAsync({ page: currentPage, per_page: TOPICS_PER_PAGE, status: 'open' }));
          } else {
            toast.error('Đăng ký nhóm thất bại!');
          }
        });
      } catch (error) {
        toast.error('Đăng ký nhóm thất bại!');
      }
    },
    [dispatch, currentPage]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Danh sách đề tài</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm đề tài..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          aria-label="Tìm kiếm đề tài"
        />
      </div>

      <GridView
        currentTopics={topics}
        statusConfig={statusConfig}
        handleViewTopic={handleViewTopic}
        handleCreateGroup={handleOpenGroupModal}
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

      <ViewTopicModal
        isOpen={isViewModalOpen}
        onClose={resetFormAndClose}
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
          currentStudentId={currentStudentId}
        />
      )}
    </div>
  );
};

export default StudentTopic;