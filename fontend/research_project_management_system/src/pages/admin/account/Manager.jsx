import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useAppDispatch } from '../../../store/index';
import TableAdmin from './components/Table';
import AddEditUserModal from './components/AddEditUserModal';
import ViewUserModal from './components/ViewUserModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import {
  fetchStudentsAsync,
  searchStudentsAsync,
  addStudentAsync,
  updateStudentAsync,
  deleteStudentAsync,
  importStudentsFromExcel,
  clearError,
} from '../../../store/auth/studentSlice';

const ManageStudents = () => {
  const dispatch = useAppDispatch();
  const { students, loading, error, current_page, total_pages } = useSelector((state) => state.students);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    student_code: '',
    class_name: '',
    faculty: '',
    major: '',
    phone: '',
    gender: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    if (searchQuery.trim()) {
      console.log('searchQuery', searchQuery);
      
      dispatch(searchStudentsAsync({ keyword: searchQuery, page: currentPage, per_page: studentsPerPage }));
    } else {
      dispatch(fetchStudentsAsync({ page: currentPage, per_page: studentsPerPage }));
    }
  }, [dispatch, currentPage, searchQuery]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddStudent = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      student_code: '',
      class_name: '',
      faculty: '',
      major: '',
      phone: '',
      gender: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      password: '',
      student_code: student.student_code || '',
      class_name: student.class_name || '',
      faculty: student.faculty || '',
      major: student.major || '',
      phone: student.phone || '',
      gender: student.gender || '',
    });
    setIsEditModalOpen(true);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const newStudent = { ...formData, role: 'student' };
    try {
      await dispatch(addStudentAsync(newStudent)).unwrap();
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        student_code: '',
        class_name: '',
        faculty: '',
        major: '',
        phone: '',
        gender: '',
      });
      dispatch(fetchStudentsAsync({ page: currentPage, per_page: studentsPerPage }));
    } catch (error) {
      console.error('Add student failed:', error);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const updatedStudent = { id: selectedStudent.id, ...formData, role: 'student' };
    try {
      await dispatch(updateStudentAsync(updatedStudent)).unwrap();
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        student_code: '',
        class_name: '',
        faculty: '',
        major: '',
        phone: '',
        gender: '',
      });
      dispatch(fetchStudentsAsync({ page: currentPage, per_page: studentsPerPage }));
    } catch (error) {
      console.error('Update student failed:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteStudentAsync(selectedStudent.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      if (students.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        if (searchQuery.trim()) {
          dispatch(searchStudentsAsync({ keyword: searchQuery, page: currentPage, per_page: studentsPerPage }));
        } else {
          dispatch(fetchStudentsAsync({ page: currentPage, per_page: studentsPerPage }));
        }
      }
    } catch (error) {
      console.error('Delete student failed:', error);
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
    setSelectedStudent(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      student_code: '',
      class_name: '',
      faculty: '',
      major: '',
      phone: '',
      gender: '',
    });
    dispatch(clearError());
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await dispatch(importStudentsFromExcel(file)).unwrap();
      dispatch(fetchStudentsAsync({ page: 1, per_page: studentsPerPage }));
      setCurrentPage(1);
    } catch (error) {
      console.error('CSV import failed:', error);
      alert('Có lỗi khi nhập sinh viên từ CSV. Vui lòng thử lại.');
    }

    e.target.value = null;
  };

  const tableColumns = [
    {
      header: 'Tên',
      key: 'name',
      render: (item) => <span className="font-bold">{item.name}</span>,
    },
    { header: 'Email', key: 'email' },
    { header: 'Mã sinh viên', key: 'student_code' },
    { header: 'Lớp', key: 'class_name' },
    { header: 'Khoa', key: 'faculty' },
    { header: 'Chuyên ngành', key: 'major' },
    { header: 'Sđt', key: 'phone' },
    { header: 'Giới tính', key: 'gender' },
  ];

  const tableActions = (item) => (
    <>
      <button
        onClick={() => handleViewStudent(item)}
        className="text-blue-600 hover:text-blue-800"
        title="Xem chi tiết"
      >
        <FaEye />
      </button>
      <button
        onClick={() => handleEditStudent(item)}
        className="text-blue-600 hover:text-blue-800"
        title="Sửa"
      >
        <FaEdit />
      </button>
      <button
        onClick={() => handleDeleteStudent(item)}
        className="text-red-600 hover:text-red-800"
        title="Xóa"
      >
        <FaTrash />
      </button>
    </>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Quản lý sinh viên</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email hoặc mã sinh viên..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2 sm:mb-0"
        />
        <button
          onClick={handleAddStudent}
          className="w-full sm:w-48 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mb-2 sm:mb-0"
        >
          Thêm sinh viên
        </button>
        <label className="w-full sm:w-48 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-center cursor-pointer">
          Tải lên CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <TableAdmin
          columns={tableColumns}
          data={students}
          actions={tableActions}
          emptyMessage={loading ? 'Đang tải...' : 'Không tìm thấy sinh viên nào.'}
        />
      </div>
      {total_pages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-1 rounded ${
              currentPage === 1 || loading
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
            disabled={currentPage === total_pages || loading}
            className={`px-3 py-1 rounded ${
              currentPage === total_pages || loading
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
        onInputChange={handleInputChange}
        isEdit={false}
        fields={[
          { name: 'name', label: 'Tên', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
          { name: 'student_code', label: 'Mã sinh viên', type: 'text', required: true },
          { name: 'class_name', label: 'Lớp', type: 'text', required: true },
          { name: 'faculty', label: 'Khoa', type: 'text', required: true },
          { name: 'major', label: 'Chuyên ngành', type: 'text', required: true },
          { name: 'phone', label: 'Số điện thoại', type: 'text' },
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
        onInputChange={handleInputChange}
        isEdit={true}
        fields={[
          { name: 'name', label: 'Tên', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Mật khẩu (để trống nếu không đổi)', type: 'password' },
          { name: 'student_code', label: 'Mã sinh viên', type: 'text', required: true },
          { name: 'class_name', label: 'Lớp', type: 'text', required: true },
          { name: 'faculty', label: 'Khoa', type: 'text', required: true },
          { name: 'major', label: 'Chuyên ngành', type: 'text', required: true },
          { name: 'phone', label: 'Số điện thoại', type: 'text' },
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

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={closeModal}
        user={selectedStudent}
        fields={[
          { label: 'Tên', key: 'name' },
          { label: 'Email', key: 'email' },
          { label: 'Mã sinh viên', key: 'student_code' },
          { label: 'Lớp', key: 'class_name' },
          { label: 'Khoa', key: 'faculty' },
          { label: 'Chuyên ngành', key: 'major' },
          { label: 'Số điện thoại', key: 'phone' },
          { label: 'Giới tính', key: 'gender' },
        ]}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        itemName={selectedStudent?.name || ''}
      />
    </div>
  );
};

export default ManageStudents;