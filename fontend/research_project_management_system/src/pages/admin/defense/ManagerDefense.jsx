import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { fetchDefensesAsync, searchDefensesAsync, deleteDefenseAsync, addDefenseAsync, updateDefenseAsync } from '../../../store/slices/defensesSlice';
import FilterBar from '../../components/students/FilterBar';
import TableView from '../../components/defenses/DefenseTableView';
import AddEditDefenseModal from '../../components/defenses/AddEditDefenses';
import ViewDefenseModal from '../../components/defenses/ViewDefenseModal';
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';

const DefenseManager = () => {
  const dispatch = useAppDispatch();
  const { defenses, total_count: total, current_page: page, total_pages, loading, error } = useSelector((state) => state.defenses);
  const [faculty, setFaculty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const per_page = 10;

  useEffect(() => {
    dispatch(fetchDefensesAsync({ faculty, page: currentPage, per_page }));
  }, [currentPage, per_page, faculty, dispatch]);

  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(searchDefensesAsync({ keyword: searchTerm, page: currentPage, per_page }));
      setCurrentPage(1);
    }
  }, [searchTerm, dispatch, per_page]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = ({ faculty, searchTerm }) => {
    setFaculty(faculty);
    setSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleAddDefense = () => {
    setSelectedDefense(null);
    setIsEdit(false);
    setIsAddEditModalOpen(true);
  };

  const handleEditDefense = (defense) => {
    console.log(`Editing defense:`, defense);
    
    setSelectedDefense(defense);
    setIsEdit(true);
    setIsAddEditModalOpen(true);
  };

  const handleViewDefense = (defense) => {
    setSelectedDefense(defense);
    setIsViewModalOpen(true);
  };

  const handleDeleteDefense = (id) => {
    dispatch(deleteDefenseAsync(id)).then(() => {
      toast.success('Xóa buổi bảo vệ thành công');
      setIsDeleteModalOpen(false);
      if (searchTerm) {
        dispatch(searchDefensesAsync({ keyword: searchTerm, page: currentPage, per_page }));
      }
      else {
        dispatch(fetchDefensesAsync({ faculty, page: currentPage, per_page }));
      }
    });
  };

  const handleSubmitDefense = (formData) => {
    if (isEdit) {
      dispatch(updateDefenseAsync({ id: selectedDefense.id, defense: formData })).then(() => {
        toast.success('Cập nhật buổi bảo vệ thành công');
      });
    } else {
      console.log(`Adding defense with data:`, formData);
      
      dispatch(addDefenseAsync(formData)).then(() => {
        toast.success('Thêm buổi bảo vệ thành công');
      });
    }
  };
  const showModalDelete = (defense) => {
    setSelectedDefense(defense);
    setIsDeleteModalOpen(true);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý buổi bảo vệ (Admin)</h1>
        <button
          onClick={handleAddDefense}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm buổi bảo vệ
        </button>
      </div>
      <FilterBar onFilterChange={handleFilterChange} />
      {loading ? (
        <p className="text-center text-gray-600">Đang tải...</p>
      ) : (
        <>
          <TableView
            defenses={defenses}
            onViewDefense={handleViewDefense}
            onEditDefense={handleEditDefense}
            onDeleteDefense={showModalDelete}
            onDefenseStatusChange={handleEditDefense}
            isAdmin={true}
          />
          <Pagination
            total={total}
            perPage={per_page}
            currentPage={page}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      {isAddEditModalOpen && (
        <AddEditDefenseModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          onSubmit={handleSubmitDefense}
          defense={selectedDefense? selectedDefense : null}

          isEdit={isEdit}
        />
      )}
      {isViewModalOpen && (
        <ViewDefenseModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          defense={selectedDefense}
        />
      )}
      {selectedDefense && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleDeleteDefense(selectedDefense.id)}
          itemName={selectedDefense?.name || ''}
        />
      )}

    </div>
  );
};

export default DefenseManager;