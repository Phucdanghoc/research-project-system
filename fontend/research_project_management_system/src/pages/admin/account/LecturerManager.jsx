import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaEye, FaEdit, FaTrash, FaKey, FaPlus, FaFileCsv } from 'react-icons/fa';
import { useAppDispatch } from '../../../store/index';
import TableAdmin from './components/Table';
import AddEditUserModal from './components/AddEditUserModal';
import ViewUserModal from './components/ViewUserModal';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import ImportCsvModal from '../../../components/ImportCsvModal';
import { FacultyMajors } from '../../../types/enum';
import {
  fetchLecturersAsync,
  searchLecturersAsync,
  addLecturerAsync,
  updateLecturerAsync,
  deleteLecturerAsync,
  importLecturersFromExcel,
  clearError,
} from '../../../store/slices/lecturerSlice';
import { toast } from 'react-toastify';
import { resetPasswordAsync } from '../../../store/slices/userSlice';
import { debounce } from 'lodash';

const ManageLecturers = () => {
  const dispatch = useAppDispatch();
  const { lecturers, loading, error, current_page, total_pages } = useSelector((state) => state.lecturers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'lecturer',
    lecturer_code: '',
    birth : '',
    faculty: '',
    phone: '',
    gender: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const lecturersPerPage = 10;

  useEffect(() => {
    if (searchQuery.trim()) {
      dispatch(searchLecturersAsync({ keyword: searchQuery, page: currentPage, per_page: lecturersPerPage }));
    } else {
      dispatch(fetchLecturersAsync({ page: currentPage, per_page: lecturersPerPage }));
    }
  }, [dispatch, currentPage, searchQuery]);

  const handleAddLecturer = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'lecturer',
      lecturer_code: '',
    birth : '',

      faculty: '',
      phone: '',
      gender: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditLecturer = (lecturer) => {
    setSelectedLecturer(lecturer);
    setFormData({
      name: lecturer.name || '',
      email: lecturer.email || '',
      password: '',
      role: 'lecturer',
      birth: lecturer.birth || '',
      lecturer_code: lecturer.lecturer_code || '',
      faculty: lecturer.faculty || '',
      phone: lecturer.phone || '',
      gender: lecturer.gender || '',
    });
    setIsEditModalOpen(true);
  };

  const handleViewLecturer = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsViewModalOpen(true);
  };

  const handleDeleteLecturer = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const newLecturer = { ...formData };
    try {
      await dispatch(addLecturerAsync(newLecturer)).unwrap();
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'lecturer',
        birth: '',
        lecturer_code: '',
        faculty: '',
        phone: '',
        gender: '',
      });
      dispatch(fetchLecturersAsync({ page: currentPage, per_page: lecturersPerPage }));
      toast.success('Thêm giảng viên mới thành công!');
    } catch (error) {
      toast.error('Thêm giảng viên mới thất bại!');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const updatedLecturer = { id: selectedLecturer.id, ...formData };
    try {
      await dispatch(updateLecturerAsync(updatedLecturer)).unwrap();
      setIsEditModalOpen(false);
      setSelectedLecturer(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'lecturer',
        birth: '',
        lecturer_code: '',
        faculty: '',
        phone: '',
        gender: '',
      });
      dispatch(fetchLecturersAsync({ page: currentPage, per_page: lecturersPerPage }));
      toast.success('Cập nhật thông tin giảng viên thành công!');
    } catch (error) {
      toast.error('Cập nhật thông tin giảng viên thất bại!');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteLecturerAsync(selectedLecturer.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedLecturer(null);
      if (lecturers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        if (searchQuery.trim()) {
          dispatch(searchLecturersAsync({ keyword: searchQuery, page: currentPage, per_page: lecturersPerPage }));
        } else {
          dispatch(fetchLecturersAsync({ page: currentPage, per_page: lecturersPerPage }));
        }
      }
      toast.success('Xóa giảng viên thành công!');
    } catch (error) {
      toast.error('Xóa giảng viên thất bại!');
    }
  };

  const handleResetPassword = async (lecturer) => {
    try {
      await dispatch(resetPasswordAsync(lecturer.email)).unwrap();
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (error) {
      toast.error('Đặt lại mật khẩu thất bại!');
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
    setSelectedLecturer(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'lecturer',
      lecturer_code: '',
      birth: '',
      faculty: '',
      phone: '',
      gender: '',
    });
    dispatch(clearError());
  };

  const handleSearchChange = debounce((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, 300);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await dispatch(importLecturersFromExcel(file)).unwrap();
      dispatch(fetchLecturersAsync({ page: 1, per_page: lecturersPerPage }));
      setCurrentPage(1);
      toast.success('Nhập danh sách giảng viên từ CSV thành công!');
    } catch (error) {
      toast.error('Nhập danh sách giảng viên từ CSV thất bại!');
    }
    e.target.value = null;
  };

  const tableColumns = useMemo(
    () => [
      {
        header: 'Tên',
        key: 'name',
        render: (item) => <span className="font-semibold text-gray-800">{item.name}</span>,
      },
      { header: 'Email', key: 'email' },
      { header: 'Mã giảng viên', key: 'lecturer_code' },
      {
        header: 'Khoa',
        key: 'faculty',
        render: (item) => FacultyMajors[item.faculty]?.name || item.faculty || 'Không có',
      },
      { header: 'Số điện thoại', key: 'phone' },
      { header: 'Ngày sinh', key: 'birth' },
      {
        header: 'Giới tính',
        key: 'gender',
        render: (item) =>
          item.gender?.toLowerCase() === 'male'
            ? 'Nam'
            : item.gender?.toLowerCase() === 'female'
              ? 'Nữ'
              : 'Không có',
      },
    ],
    []
  );

  const tableActions = useMemo(
    () => (item) => (
      <div className="flex space-x-2">
        <button
          onClick={() => handleViewLecturer(item)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition"
          title="Xem chi tiết"
          aria-label="Xem chi tiết giảng viên"
        >
          <FaEye className="text-lg" />
        </button>
        <button
          onClick={() => handleEditLecturer(item)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition"
          title="Sửa"
          aria-label="Sửa thông tin giảng viên"
        >
          <FaEdit className="text-lg" />
        </button>
        <button
          onClick={() => handleDeleteLecturer(item)}
          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition"
          title="Xóa"
          aria-label="Xóa giảng viên"
        >
          <FaTrash className="text-lg" />
        </button>
        <button
          onClick={() => handleResetPassword(item)}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition"
          title="Đặt lại mật khẩu"
          aria-label="Đặt lại mật khẩu giảng viên"
        >
          <FaKey className="text-lg" />
        </button>
      </div>
    ),
    []
  );

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Quản lý giảng viên</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email hoặc mã giảng viên..."
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2 sm:mb-0"
        />
        <button
          onClick={handleAddLecturer}
          className="w-full sm:w-48 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mb-2 sm:mb-0"
        >
          Thêm giảng viên
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="w-full sm:w-48 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-center"
        >
          Tải lên CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <TableAdmin
          columns={tableColumns}
          data={lecturers}
          actions={tableActions}
          emptyMessage={loading ? 'Đang tải...' : 'Không tìm thấy giảng viên nào.'}
        />
      </div>
      {total_pages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-1 rounded ${currentPage === 1 || loading
              ? 'bg-gray-200 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Trước
          </button>
          {[...Array(total_pages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              disabled={loading}
              className={`px-3 py-1 rounded ${currentPage === index + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === total_pages || loading}
            className={`px-3 py-1 rounded ${currentPage === total_pages || loading
              ? 'bg-gray-200 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Sau
          </button>
        </div>
      )}

      <AddEditUserModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitAdd}
        formData={formData}
        isLectuer={true}
        onInputChange={handleInputChange}
        isEdit={false}
        fields={[
          { name: 'name', label: 'Tên', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
          { name: 'lecturer_code', label: 'Mã giảng viên', type: 'text', required: true },
          {
            name: 'faculty',
            label: 'Khoa',
            type: 'select',
            required: true,
            options: [
              { value: '', label: 'Chọn khoa' },
              ...Object.keys(FacultyMajors).map((key) => ({
                value: key,
                label: FacultyMajors[key].name,
              })),
            ],
          },
          { name: 'phone', label: 'Số điện thoại', type: 'text' },
          { name: 'birth', label: 'Ngày sinh', type: 'date' },
          {
            name: 'gender',
            label: 'Giới tính',
            type: 'select',
            options: [
              { value: '', label: 'Chọn giới tính' },
              { value: 'Male', label: 'Nam' },
              { value: 'Female', label: 'Nữ' },
            ],
          },
        ]}
      />

      <AddEditUserModal
        isOpen={isEditModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitEdit}
        formData={formData}
        isLectuer={true}

        onInputChange={handleInputChange}
        isEdit={true}
        fields={[
          { name: 'name', label: 'Tên', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Mật khẩu (để trống nếu không đổi)', type: 'password' },
          { name: 'lecturer_code', label: 'Mã giảng viên', type: 'text', required: true },
          {
            name: 'faculty',
            label: 'Khoa',
            type: 'select',
            required: true,
            options: [
              { value: '', label: 'Chọn khoa' },
              ...Object.keys(FacultyMajors).map((key) => ({
                value: key,
                label: FacultyMajors[key].name,
              })),
            ],
          },
          { name: 'phone', label: 'Số điện thoại', type: 'text' },
          { name: 'birth', label: 'Ngày sinh', type: 'date' },
          {
            name: 'gender',
            label: 'Giới tính',
            type: 'select',
            options: [
              { value: '', label: 'Chọn giới tính' },
              { value: 'Male', label: 'Nam' },
              { value: 'Female', label: 'Nữ' },
            ],
          },
        ]}
      />
      {isViewModalOpen && (
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={closeModal}
          userId={selectedLecturer?.id}
        />
      )}



      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeModal}
          onConfirm={handleDelete}
          itemName={selectedLecturer?.name}
        />
      )}

      {isImportModalOpen && (
        <ImportCsvModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            dispatch(fetchLecturersAsync({ page: 1, per_page: lecturersPerPage }));
            setCurrentPage(1);
          }}
          onUpload={handleCsvUpload}
        />
      )}
    </div>
  );
};

export default ManageLecturers;