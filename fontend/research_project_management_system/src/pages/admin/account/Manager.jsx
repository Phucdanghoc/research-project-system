import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';

const initialUsers = [
    { id: 1, username: 'admin1', email: 'admin1@example.com', role: 'admin' },
    { id: 2, username: 'dean1', email: 'dean1@example.com', role: 'dean' },
    { id: 3, username: 'lecturer1', email: 'lecturer1@example.com', role: 'lecturer' },
    { id: 4, username: 'student1', email: 'student1@example.com', role: 'student' },
    { id: 5, username: 'advisor1', email: 'advisor1@example.com', role: 'advisor' },
    { id: 6, username: 'committee1', email: 'committee1@example.com', role: 'committee' },
    { id: 7, username: 'student2', email: 'student2@example.com', role: 'student' },
];

const ManageUsers = () => {
    const { user } = useSelector((state) => state.auth);
    const [users, setUsers] = useState(initialUsers);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const roles = ['admin', 'dean', 'lecturer', 'student', 'advisor', 'committee'];

    // Filter and search users
    const filteredUsers = users.filter((u) => {
        const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole ? u.role === selectedRole : true;
        return matchesSearch && matchesRole;
    });

    // Pagination logic
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
        setSelectedUser(null);
        setFormData({ username: '', email: '', password: '', role: '' });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        setCurrentPage(1); // Reset to first page on filter
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

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
                    className="w-full sm:w-40 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full sm:w-48 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Thêm tài khoản
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full bg-white shadow-md rounded-lg text-center">
                    <thead>
                        <tr className="bg-blue-500 text-white">
                            <th className="py-2 px-4">Tên tài khoản</th>
                            <th className="py-2 px-4">Email</th>
                            <th className="py-2 px-4">Vai trò</th>
                            <th className="py-2 px-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-blue-100 ">
                                    <td className="py-2 px-4 font-bold">{u.username}</td>
                                    <td className="py-2 px-4">{u.email}</td>
                                    <td>
                                        <span className="inline-block bg-green-500 text-white hover:bg-green-800 text-sm rounded-full px-4 py-1">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 flex justify-center space-x-2">
                                        <button
                                            onClick={() => handleViewUser(u)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Xem chi tiết"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(u)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Sửa"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Xóa"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-4 text-gray-500">Không tìm thấy tài khoản nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        Trước
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold text-blue-600 mb-4">Thêm tài khoản</h2>
                        <form onSubmit={handleSubmitAdd}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Chọn vai trò</option>
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Thêm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold text-blue-600 mb-4">Sửa tài khoản</h2>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu (để trống nếu không đổi)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Chọn vai trò</option>
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold text-blue-600 mb-4">Chi tiết tài khoản</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản</label>
                            <p className="p-2 bg-gray-100 rounded">{selectedUser.username}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="p-2 bg-gray-100 rounded">{selectedUser.email}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                            <p className="p-2 bg-gray-100 rounded">{selectedUser.role}</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold text-blue-600 mb-4">Xác nhận xóa</h2>
                        <p className="mb-4 text-gray-700">Bạn có chắc muốn xóa tài khoản <strong>{selectedUser.username}</strong>?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;