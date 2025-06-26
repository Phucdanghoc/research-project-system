import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import CardView from './components/CardView';
import TableView from './components/TableView';
import AddEditTopicModal from './components/AddEditTopicModal';
import ViewTopicModal from './components/ViewTopicModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { FaCheckCircle, FaHandMiddleFinger, FaTimesCircle } from 'react-icons/fa';
const initialTopics = [
  {
    id: 1,
    title: 'Topic 1',
    topicCode: 'T001',
    createdAt: '2025-01-01',
    updateAt: '2025-01-02',
    status: 'active',
    description: 'Description for Topic 1',
    requirement: 'Requirement for Topic 1',
  },
  {
    id: 2,
    title: 'Topic 2',
    topicCode: 'T002',
    createdAt: '2025-02-01',
    updateAt: '2025-02-02',
    status: 'inactive',
    description: 'Description for Topic 2',
    requirement: 'Requirement for Topic 2',
  },
  {
    id: 3,
    title: 'Topic 3',
    topicCode: 'T003',
    createdAt: '2025-03-01',
    updateAt: '2025-03-02',
    status: 'active',
    description: 'Description for Topic 3',
    requirement: 'Requirement for Topic 3',
  },
  {
    id: 4,
    title: 'Topic 4',
    topicCode: 'T004',
    createdAt: '2025-04-01',
    updateAt: '2025-04-02',
    status: 'pending',
    description: 'Description for Topic 4',
    requirement: 'Requirement for Topic 4',
  },
];

const statusConfig = {
  active: { icon: <FaCheckCircle className="text-green-600" />, label: 'Active', border: 'border-green-600' },
  inactive: { icon: <FaTimesCircle className="text-red-600" />, label: 'Inactive', border: 'border-red-600' },
  pending: { icon: <FaHandMiddleFinger className="text-yellow-600" />, label: 'Pending', border: 'border-yellow-600' },
};

const ManageTopics = () => {
  const { user } = useSelector((state) => state.auth);
  const [topics, setTopics] = useState(initialTopics);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    topicCode: '',
    status: '',
    description: '',
    requirement: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('card'); // New state for view mode
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const topicsPerPage = 4;
  const dropdownRefs = useRef({});
  const statuses = ['active', 'inactive', 'pending'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref && ref.contains(event.target))) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.topicCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus ? topic.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = filteredTopics.slice(indexOfFirstTopic, indexOfLastTopic);

  const handleAddTopic = () => {
    setFormData({ title: '', topicCode: '', status: '', description: '', requirement: '' });
    setIsAddModalOpen(true);
  };

  const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    setFormData({
      title: topic.title,
      topicCode: topic.topicCode,
      status: topic.status,
      description: topic.description,
      requirement: topic.requirement,
    });
    setIsEditModalOpen(true);
  };

  const handleViewTopic = (topic) => {
    setSelectedTopic(topic);
    setIsViewModalOpen(true);
  };

  const handleDeleteTopic = (topic) => {
    setSelectedTopic(topic);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = (topicId, newStatus) => {
    setTopics(topics.map((topic) =>
      topic.id === topicId
        ? { ...topic, status: newStatus, updateAt: new Date().toISOString().split('T')[0] }
        : topic
    ));
    setOpenDropdownId(null);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const newTopic = {
      id: topics.length + 1,
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
      updateAt: new Date().toISOString().split('T')[0],
    };
    setTopics([...topics, newTopic]);
    setIsAddModalOpen(false);
    setFormData({ title: '', topicCode: '', status: '', description: '', requirement: '' });
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    setTopics(
      topics.map((topic) =>
        topic.id === selectedTopic.id
          ? { ...topic, ...formData, updateAt: new Date().toISOString().split('T')[0] }
          : topic
      )
    );
    setIsEditModalOpen(false);
    setSelectedTopic(null);
    setFormData({ title: '', topicCode: '', status: '', description: '', requirement: '' });
  };

  const handleConfirmDelete = () => {
    setTopics(topics.filter((topic) => topic.id !== selectedTopic.id));
    setIsDeleteModalOpen(false);
    setSelectedTopic(null);
    if (currentTopics.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedTopic(null);
    setFormData({ title: '', topicCode: '', status: '', description: '', requirement: '' });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Quản lý đề tài</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề hoặc mã đề tài..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2 sm:mb-0"
        />
        <select
          value={selectedStatus}
          onChange={handleStatusFilterChange}
          className="w-full sm:w-40 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusConfig[status].label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddTopic}
          className="w-full sm:w-48 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Thêm đề tài
        </button>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="w-full sm:w-40 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="card">Card View</option>
          <option value="table">Table View</option>
        </select>
      </div>

      {viewMode === 'card' ? (
        <CardView
          currentTopics={currentTopics}
          statusConfig={statusConfig}
          dropdownRefs={dropdownRefs}
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
          handleViewTopic={handleViewTopic}
          handleEditTopic={handleEditTopic}
          handleDeleteTopic={handleDeleteTopic}
          handleStatusChange={handleStatusChange}
          statuses={statuses}
        />
      ) : (
        <TableView
          currentTopics={currentTopics}
          statusConfig={statusConfig}
          dropdownRefs={dropdownRefs}
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
          handleViewTopic={handleViewTopic}
          handleEditTopic={handleEditTopic}
          handleDeleteTopic={handleDeleteTopic}
          handleStatusChange={handleStatusChange}
          statuses={statuses}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Sau
          </button>
        </div>
      )}

      <AddEditTopicModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitAdd}
        formData={formData}
        onInputChange={handleInputChange}
        statuses={statuses}
        isEdit={false}
      />

      <AddEditTopicModal
        isOpen={isEditModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitEdit}
        formData={formData}
        onInputChange={handleInputChange}
        statuses={statuses}
        isEdit={true}
      />

      <ViewTopicModal
        isOpen={isViewModalOpen}
        onClose={closeModal}
        topic={selectedTopic}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        itemName={selectedTopic?.title || ''}
      />
    </div>
  );
};

export default ManageTopics;