import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaChevronDown } from 'react-icons/fa';
import CardTopic from '../../../components/cards/Card';
import AddEditTopicModal from './components/AddEditTopicModal';
import ViewTopicModal from './components/ViewTopicModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

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
  pending: { icon: <FaHourglassHalf className="text-yellow-600" />, label: 'Pending', border: 'border-yellow-600' },
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {currentTopics.length > 0 ? (
          currentTopics.map((topic) => (
            <div
              key={topic.id}
              className={`relative p-4 border-2  border ${statusConfig[topic.status].border} rounded hover:scale-[1.02] transition duration-300`}
            >
              <CardTopic topic={topic} />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleViewTopic(topic)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Xem chi tiết"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => handleEditTopic(topic)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Sửa"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteTopic(topic)}
                  className="text-red-600 hover:text-red-800"
                  title="Xóa"
                >
                  <FaTrash />
                </button>
                <div className="relative" ref={(el) => (dropdownRefs.current[topic.id] = el)}>
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === topic.id ? null : topic.id)}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                    title="Thay đổi trạng thái"
                  >
                    {statusConfig[topic.status].icon}
                    <FaChevronDown className={`ml-1 transition-transform ${openDropdownId === topic.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdownId === topic.id && (
                    <div className="absolute z-10 right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(topic.id, status)}
                          className="w-full p-2 text-left hover:bg-blue-100 flex items-center"
                        >
                          {statusConfig[status].icon}
                          <span className="ml-2">{statusConfig[status].label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-2">Không tìm thấy đề tài nào.</p>
        )}
      </div>
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