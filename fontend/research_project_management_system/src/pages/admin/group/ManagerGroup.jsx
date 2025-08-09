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
import FilterStatusDefBar from '../../../components/FilterBarStatus';

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
  const [defStatus, setDefStatus] = useState('');


  useEffect(() => {
    console.log('ManagerGroup useEffect - faculty:', faculty, 'searchTerm:', searchTerm, 'currentPage:', currentPage, 'defStatus:', defStatus);
    
    const shouldSearch = searchTerm.trim() || defStatus;

    const action = shouldSearch
      ? searchGroupsAsync({
        keyword: searchTerm,
        def_status: defStatus,
        page: currentPage,
      })
      : fetchGroupsAsync({
        faculty,
        page: currentPage,
      });

    dispatch(action);
  }, [searchTerm, defStatus, faculty, currentPage]);


  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = ({ faculty, searchTerm, def_status }) => {
    // setFaculty(faculty);
    setSearchTerm(searchTerm);
    setDefStatus(def_status);
    setCurrentPage(1);
  };


  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsEdit(false);
    setIsAddEditModalOpen(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setIsEdit(true);
    setIsAddEditModalOpen(true);
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    setIsViewModalOpen(true);
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhóm này?')) {
      dispatch(deleteGroupAsync(id))
        .unwrap()
        .then(() => {
          toast.success('Xóa nhóm thành công');
          dispatch(fetchGroupsAsync({ faculty, page: currentPage, per_page }));
        })
        .catch((err) => {
          toast.error(err.message || 'Xóa nhóm thất bại');
        });
    }
  };

  const handleCreatePlan = (group) => {
    setSelectedGroup(group);
    setIsCreatePlanModalOpen(true);
  };

  const handleAddDefense = (group) => {
    setSelectedGroup(group);
    setIsAddDefenseModalOpen(true);
  };

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
      </div>
      <FilterStatusDefBar onFilterChange={handleFilterChange} />
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