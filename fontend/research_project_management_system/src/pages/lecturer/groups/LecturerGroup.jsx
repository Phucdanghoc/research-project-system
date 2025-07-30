import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { createGroupAsync, updateGroupAsync, deleteGroupAsync, fetchGroupByMeAsync, updateGroupStatusAsync, updateGroupDefenseStatusByMeAsync } from '../../../store/slices/groupSlice';
import FilterBar from '../../components/students/FilterBar';
import TableView from '../../components/groups/TableView';
import AddEditGroupModal from '../../components/groups/AddEditGroupModal';
import ViewGroupModal from '../../components/groups/ViewGroupModal';
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const LecturerGroup = () => {
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
    dispatch(fetchGroupByMeAsync({ faculty, search: searchTerm, page: currentPage, per_page }));

  }, [searchTerm, currentPage, per_page, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, dispatch]);


  const searchAction = (searchTerm) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleFilterChange = ({ faculty, searchTerm }) => {
    setFaculty(faculty);
    setSearchTerm(searchTerm);
    setCurrentPage(1);
    // if (faculty) {
    //   dispatch(getGroupsAsync({ faculty, search: searchTerm, page: 1, per_page }));
    // }
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
  const handleChangeStatus = (id, status) => {
    console.log('id', id, 'status', status);
    
    dispatch(updateGroupStatusAsync({ id,  status  })).then(() => {
      toast.success('Cập nhật nhóm thành công');
    });
  };

  const handleChangeDefenseStatus = (id, status) => {
    dispatch(updateGroupDefenseStatusByMeAsync({ id, status })).then(() => {
      toast.success('Cập nhật trạng thái bảo vệ thành công');
    });
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
    console.log('formData', formData);
    
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
        <h1 className="text-3xl font-bold text-gray-800">Quản lý nhóm</h1>
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
            onStatusChange={handleChangeStatus}
            onDefenseStatusChange={handleChangeDefenseStatus}
            isAdmin={false}
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
          groupId={selectedGroup.id}
        />
      )}
    </div>
  );
};

export default LecturerGroup;