import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { createGroupAsync, updateGroupAsync, deleteGroupAsync, fetchGroupsAsync } from '../../../store/slices/groupSlice';
import FilterBar from '../../components/students/FilterBar';
import TableView from '../../components/groups/TableView';
import AddEditGroupModal from '../../components/groups/AddEditGroupModal';
import ViewGroupModal from '../../components/groups/ViewGroupModal';
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ManagerGroup   = () => {
  const dispatch = useAppDispatch();
  const { groups, total, page, per_page, loading, error } = useSelector((state) => state.groups);
  const [faculty, setFaculty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    dispatch(fetchGroupsAsync({ faculty, search: searchTerm, page: currentPage, per_page }));
  }, [searchTerm, currentPage, per_page, faculty, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, dispatch]);

  const handleFilterChange = ({ faculty, searchTerm }) => {
    setFaculty(faculty);
    setSearchTerm(searchTerm);
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
      dispatch(deleteGroupAsync(id)).then(() => {
        toast.success('Xóa nhóm thành công');
      });
    }
  };

  const handleSubmitGroup = (formData) => {
    if (isEdit) {
      dispatch(updateGroupAsync({ id: selectedGroup.id, groupData: formData })).then(() => {
        toast.success('Cập nhật nhóm thành công');
      });
    } else {
      dispatch(createGroupAsync(formData)).then(() => {
        toast.success('Thêm nhóm thành công');
      });
    }
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
            onViewGroup={handleViewGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
          />
          <Pagination
            total={total}
            perPage={per_page}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      <AddEditGroupModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleSubmitGroup}
        groupData={selectedGroup}
        isEdit={isEdit}
      />
      <ViewGroupModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        groupId={selectedGroup ? selectedGroup.id : null}
        dispatch={dispatch}
      />
    </div>
  );
};

export default ManagerGroup ;