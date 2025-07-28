import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { 
  createGroupAsync, 
  updateGroupAsync, 
  deleteGroupAsync, 
  fetchGroupsAsync, 
  searchGroupsAsync,
  patchGroupAsync 
} from '../../../store/slices/groupSlice';
import { useSelector } from 'react-redux';
import FilterBar from '../../components/students/FilterBar';
import TableView from '../../components/groups/TableView';
import AddEditGroupModal from '../../components/groups/AddEditGroupModal';
import ViewGroupModal from '../../components/groups/ViewGroupModal';
import CreatePlanModal from '../../components/plans/CreatePlanModal';
import BulkDefenseModal from '../../components/defenses/BulkDefenseModal'; // Import BulkDefenseModal
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import AddDefenseModal from '../../components/defenses/AddEditDefenses'; // Assuming AddDefenseModal is available

const ManagerGroup = () => {
  const dispatch = useAppDispatch();
  const { groups, total, page, per_page, loading, error } = useSelector((state) => state.groups);
  const [faculty, setFaculty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isAddDefenseModalOpen, setIsAddDefenseModalOpen] = useState(false);
  const [isBulkDefenseModalOpen, setIsBulkDefenseModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  // Fetch groups on page, faculty, or per_page change
  useEffect(() => {
    dispatch(fetchGroupsAsync({ faculty, page: currentPage, per_page }));
  }, [currentPage, per_page, faculty, dispatch]);

  // Search groups when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(searchGroupsAsync(searchTerm));
      setCurrentPage(1);
    }
  }, [searchTerm, dispatch]);

  // Display error toast if error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle filter changes from FilterBar
  const handleFilterChange = ({ faculty, searchTerm }) => {
    setFaculty(faculty);
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  // Open modal to add a new group
  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsEdit(false);
    setIsAddEditModalOpen(true);
  };

  // Open modal to edit a group
  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setIsEdit(true);
    setIsAddEditModalOpen(true);
  };

  // Open modal to view group details
  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    setIsViewModalOpen(true);
  };

  // Delete a group with confirmation
  const handleDeleteGroup = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhóm này?')) {
      dispatch(deleteGroupAsync(id))
        .unwrap()
        .then(() => {
          toast.success('Xóa nhóm thành công');
        })
        .catch((err) => {
          toast.error(err.message || 'Xóa nhóm thất bại');
        });
    }
  };

  // Open modal to create a defense plan for a group
  const handleCreatePlan = (group) => {
    setSelectedGroup(group);
    setIsCreatePlanModalOpen(true);
  };

  // Open modal to add a defense for a group
  const handleAddDefense = (group) => {
    setSelectedGroup(group);
    setIsAddDefenseModalOpen(true);
  };

  // Open modal to bulk add defenses for selected groups
  const handleBulkAddDefense = (groupIds) => {
    setSelectedGroupIds(groupIds);
    setIsBulkDefenseModalOpen(true);
  };

  // Handle submission of group form (add/edit)
  const handleSubmitGroup = (formData) => {
    if (isEdit) {
      dispatch(updateGroupAsync({ id: selectedGroup.id, groupData: formData }))
        .unwrap()
        .then(() => {
          toast.success('Cập nhật nhóm thành công');
          setIsAddEditModalOpen(false);
        })
        .catch((err) => {
          toast.error(err.message || 'Cập nhật nhóm thất bại');
        });
    } else {
      dispatch(createGroupAsync(formData))
        .unwrap()
        .then(() => {
          toast.success('Thêm nhóm thành công');
          setIsAddEditModalOpen(false);
        })
        .catch((err) => {
          toast.error(err.message || 'Thêm nhóm thất bại');
        });
    }
  };

  // Handle submission of defense plan
  const handleSubmitPlan = () => {
    setIsCreatePlanModalOpen(false);
    dispatch(fetchGroupsAsync({ faculty, page: currentPage, per_page })); // Refresh groups
  };

  // Handle submission of single defense
  const handleSubmitDefense = () => {
    setIsAddDefenseModalOpen(false);
    dispatch(fetchGroupsAsync({ faculty, page: currentPage, per_page })); // Refresh groups
  };

  // Handle submission of bulk defenses
  const handleSubmitBulkDefense = () => {
    setIsBulkDefenseModalOpen(false);
    setSelectedGroupIds([]);
    dispatch(fetchGroupsAsync({ faculty, page: currentPage, per_page })); // Refresh groups
  };

  // Handle status change for a group
  const handleStatusChange = (id, status) => {
    dispatch(patchGroupAsync({ id, status }))
      .unwrap()
      .then(() => {
        toast.success('Cập nhật trạng thái thành công');
      })
      .catch((err) => {
        toast.error(err.message || 'Cập nhật trạng thái thất bại');
      });
  };

  // Handle defense status change for a group
  const handleDefenseStatusChange = (id, def_status) => {
    dispatch(patchGroupAsync({ id, def_status }))
      .unwrap()
      .then(() => {
        toast.success('Cập nhật trạng thái bảo vệ thành công');
      })
      .catch((err) => {
        toast.error(err.message || 'Cập nhật trạng thái bảo vệ thất bại');
      });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý nhóm (Admin)</h1>
        <button
          onClick={handleAddGroup}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm nhóm
        </button>
      </div>
      <FilterBar onFilterChange={handleFilterChange} />
      {loading ? (
        <p className="text-center text-gray-600">Đang tải...</p>
      ) : (
        <>
          <TableView
            groups={groups}
            onCreatePlan={handleCreatePlan}
            onViewGroup={handleViewGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onStatusChange={handleStatusChange}
            onDefenseStatusChange={handleDefenseStatusChange}
            onAddDefense={handleAddDefense}
            onBulkAddDefense={handleBulkAddDefense}
            isAdmin={true}
          />
          <Pagination
            total={total}
            perPage={per_page}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      {isAddEditModalOpen && (
        <AddEditGroupModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          group={selectedGroup}
          isEdit={isEdit}
          onSubmit={handleSubmitGroup}
        />
      )}
      {isViewModalOpen && selectedGroup && (
        <ViewGroupModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          groupId={selectedGroup?.id}
        />
      )}
      {isCreatePlanModalOpen && selectedGroup && (
        <CreatePlanModal
          isOpen={isCreatePlanModalOpen}
          onClose={() => setIsCreatePlanModalOpen(false)}
          groupId={selectedGroup?.id}
          onSubmit={handleSubmitPlan}
        />
      )}
      {isAddDefenseModalOpen && selectedGroup && (
        <AddDefenseModal
          isOpen={isAddDefenseModalOpen}
          onClose={() => setIsAddDefenseModalOpen(false)}
          onSubmit={handleSubmitDefense}
          defense={null} // No defense data for new defense
        />
      )}
      {isBulkDefenseModalOpen && (
        <BulkDefenseModal
          isOpen={isBulkDefenseModalOpen}
          onClose={() => setIsBulkDefenseModalOpen(false)}
          selectedGroupIds={selectedGroupIds}
          groups={groups}
          onSubmit={handleSubmitBulkDefense}
        />
      )}
    </div>
  );
};

export default ManagerGroup;