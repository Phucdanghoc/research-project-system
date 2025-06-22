import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Papa from 'papaparse';
import TableAdmin from '../components/Table'; // Adjust the import path as needed
import AddEditUserModal from '../components/AddEditUserModal'; // Adjust the import path
import ViewUserModal from '../components/ViewUserModal'; // Adjust the import path
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'; // Adjust the import path

const initialUsers = [
  { id: 1, username: 'admin1', email: 'admin1@example.com', role: 'admin' },
  { id: 2, username: 'dean1', email: 'dean1@example.com', role: 'dean' },
  { id: 3, username: 'lecturer1', email: 'lecturer1@example.com', role: 'lecturer' },
  { id: 4, username: 'student1', email: 'student1@example.com', role: 'student' },
  { id: 5, username: 'advisor1', email: 'advisor1@example.com', role: 'advisor' },
  { id: 6, username: 'committee1', email: 'committee1@example.com', role: 'committee' },
  { id: 7, username: 'student2', email: 'student2@example.com', role: 'student' },
];

const ReviewCsvModal = ({ isOpen, onClose, onConfirm, pendingUsers, invalidRows }) => {
  if (!isOpen) return null;

  const tableColumns = [
    {
      header: 'Tên tài khoản',
      key: 'username',
      render: (item) => <span className="font-bold">{item.username}</span>,
    },
    { header: 'Email', key: 'email' },
    {
      header: 'Vai trò',
      key: 'role',
      render: (item) => (
        <span className="inline-block bg-green-500 text-white hover:bg-green-800 text-sm rounded-full px-4 py-1">
          {item.role}
        </span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Xem lại dữ liệu CSV</h2>
        {invalidRows.length > 0 && (
          <p className="text-red-600 mb-4">
            Có {invalidRows.length} dòng không hợp lệ đã bị bỏ qua.
          </p>
        )}
        {pendingUsers.length === 0 ? (
          <p className="text-gray-600 mb-4">Không có dữ liệu hợp lệ để thêm.</p>
        ) : (
          <div className="overflow-x-auto mb-4">
            <TableAdmin
              columns={tableColumns}
              data={pendingUsers}
              emptyMessage="Không có dữ liệu để hiển thị."
            />
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
          {pendingUsers.length > 0 && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Xác nhận
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState(initialUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const usersPerPage = 5;

  const roles = ['admin', 'dean', 'lecturer', 'student', 'advisor', 'committee'];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole ? u.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleAddUser = () => {
    setFormData({ username: '', email: '', password: '', role: '' });
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const newUser = { id: users.length + 1, ...formData };
    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    setFormData({ username: '', email: '', password: '', role: '' });
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...formData } : u)));
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setFormData({ username: '', email: '', password: '', role: '' });
  };

  const handleConfirmDelete = () => {
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    if (currentUsers.length === 1 && currentPage > 1) {
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
    setIsReviewModalOpen(false);
    setSelectedUser(null);
    setPendingUsers([]);
    setInvalidRows([]);
    setFormData({ username: '', email: '', password: '', role: '' });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const validUsers = [];
        const invalidRows = [];

        result.data.forEach((row, index) => {
          if (
            row.username &&
            row.email &&
            row.role &&
            roles.includes(row.role)
          ) {
            validUsers.push({
              id: users.length + validUsers.length + 1,
              username: row.username,
              email: row.email,
              role: row.role,
            });
          } else {
            invalidRows.push({ index: index + 2, row });
          }
        });

        if (validUsers.length > 0 || invalidRows.length > 0) {
          setPendingUsers(validUsers);
          setInvalidRows(invalidRows);
          setIsReviewModalOpen(true);
        } else {
          alert('Không có dữ liệu hợp lệ trong file CSV. Vui lòng kiểm tra định dạng.');
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Có lỗi khi đọc file CSV. Vui lòng thử lại.');
      },
    });

    e.target.value = null;
  };

  const handleConfirmCsv = () => {
    setUsers([...users, ...pendingUsers]);
    setIsReviewModalOpen(false);
    setPendingUsers([]);
    setInvalidRows([]);
    setCurrentPage(1);
  };

  const tableColumns = [
    {
      header: 'Tên tài khoản',
      key: 'username',
      render: (item) => <span className="font-bold">{item.username}</span>,
    },
    { header: 'Email', key: 'email' },
    {
      header: 'Vai trò',
      key: 'role',
      render: (item) => (
        <span className="inline-block bg-green-500 text-white hover:bg-green-800 text-sm rounded-full px-4 py-1">
          {item.role}
        </span>
      ),
    },
  ];

  const tableActions = (item) => (
    <>
      <button
        onClick={() => handleViewUser(item)}
        className="text-blue-600 hover:text-blue-800"
        title="Xem chi tiết"
      >
        <FaEye />
      </button>
      <button
        onClick={() => handleEditUser(item)}
        className="text-blue-600 hover:text-blue-800"
        title="Sửa"
      >
        <FaEdit />
      </button>
      <button
        onClick={() => handleDeleteUser(item)}
        className="text-red-600 hover:text-red-800"
        title="Xóa"
      >
        <FaTrash />
      </button>
    </>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Quản lý tài khoản</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2 sm:mb-0"
        />
        <select
          value={selectedRole}
          onChange={handleRoleChange}
          className="w-full sm:w-40 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2 sm:mb-0"
        >
          <option value="">Tất cả vai trò</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddUser}
          className="w-full sm:w-48 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mb-2 sm:mb-0"
        >
          Thêm tài khoản
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
          data={currentUsers}
          actions={tableActions}
          emptyMessage="Không tìm thấy tài khoản nào."
        />
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

      <AddEditUserModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitAdd}
        formData={formData}
        onInputChange={handleInputChange}
        roles={roles}
        isEdit={false}
      />

      <AddEditUserModal
        isOpen={isEditModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmitEdit}
        formData={formData}
        onInputChange={handleInputChange}
        roles={roles}
        isEdit={true}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={closeModal}
        user={selectedUser}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        itemName={selectedUser?.username || ''}
      />

      <ReviewCsvModal
        isOpen={isReviewModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmCsv}
        pendingUsers={pendingUsers}
        invalidRows={invalidRows}
      />
    </div>
  );
};

export default ManageUsers;