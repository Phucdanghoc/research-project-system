import { useState } from 'react';
import { useAppDispatch } from '../../../store/index';
import { searchLecturersAsync } from '../../../store/auth/lecturerSlice';
import { toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { FacultyMajors } from '../../../types/enum';

const AddMultipleTopicsModal = ({ isOpen, onClose, onSubmit }) => {
    const dispatch = useAppDispatch();
    const { lecturers, loading, error } = useSelector((state) => state.lecturers);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        lecturer_id: 0,
        quantity: 1,
    });

    const handleSearchLecturers = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length >= 2) {
            dispatch(searchLecturersAsync({ keyword: term }));
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }
    };

    const handleSelectLecturer = (lecturer) => {
        setFormData((prev) => ({ ...prev, lecturer_id: lecturer.id }));
        setSearchTerm(lecturer.name || '');
        setIsDropdownOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleClose = () => {
        setSearchTerm('');
        setIsDropdownOpen(false);
        setFormData({ lecturer_id: 0, quantity: 1 });
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.lecturer_id === 0) {
            toast.error('Vui lòng chọn giảng viên!');
            return;
        }
        if (formData.quantity < 1) {
            toast.error('Số lượng đề tài phải lớn hơn 0!');
            return;
        }

        const topic = {
            lecturer_id: formData.lecturer_id,
            quantity: formData.quantity,
        };

        onSubmit(topic);
        handleClose();
    };

    const selectedLecturer = lecturers ?? lecturers.find((lecturer) => lecturer.id === formData.lecturer_id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Thêm nhiều đề tài</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 relative">
                        <label className="block text-sm font-medium text-gray-700">Giảng viên</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchLecturers}
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập tên hoặc mã giảng viên"
                        />
                        {isDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                                {loading ? (
                                    <div className="p-2 text-center text-gray-600">Đang tải...</div>
                                ) : error ? (
                                    <div className="p-2 text-center text-red-600">Lỗi: {error}</div>
                                ) : lecturers.length > 0 ? (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-2 px-4 text-left font-medium text-gray-600">Mã</th>
                                                <th className="py-2 px-4 text-left font-medium text-gray-600">Họ tên</th>
                                                <th className="py-2 px-4 text-left font-medium text-gray-600">Khoa</th>
                                                <th className="py-2 px-4 text-left font-medium text-gray-600">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lecturers.map((lecturer) => (
                                                <tr
                                                    key={lecturer.id}
                                                    onClick={() => handleSelectLecturer(lecturer)}
                                                    className="hover:bg-blue-100 cursor-pointer"
                                                >
                                                    <td className="py-2 px-4 border-b">{lecturer.lecturer_code}</td>
                                                    <td className="py-2 px-4 border-b">{lecturer.name}</td>
                                                    <td className="py-2 px-4 border-b">{lecturer.faculty || '-'}</td>
                                                    <td className="py-2 px-4 border-b">{lecturer.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-2 text-center text-gray-600">Không tìm thấy giảng viên</div>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedLecturer && (
                        <div className="w-full md:w-1/2">
                            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
                                <div className="flex items-center mb-3">
                                    <FaUserCircle className="text-3xl text-blue-600 mr-3" />
                                    <h3 className="text-lg font-semibold text-gray-700">{selectedLecturer.name || '-'}</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                                    <p><strong>Mã giảng viên:</strong> {selectedLecturer.lecturer_code || '-'}</p>
                                    <p><strong>Email:</strong> {selectedLecturer.email || '-'}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedLecturer.phone || '-'}</p>
                                    <p><strong>Ngày sinh:</strong> {selectedLecturer.birth || '-'}</p>
                                    <p><strong>Khoa:</strong> {FacultyMajors[selectedLecturer.faculty].name || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Số lượng đề tài</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            required
                            min="1"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Thêm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMultipleTopicsModal;