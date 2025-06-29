import { useState , useEffect } from 'react';
import { useAppDispatch } from '../../../../store';
import { searchLecturersAsync } from '../../../../store/auth/lecturerSlice';
import { TopicCategory } from '../../../../types/enum';
import { useSelector } from 'react-redux';


const AddEditTopicModal = ({ isOpen, onClose, onSubmit, formData, onInputChange, statuses, isEdit }) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading, error } = useSelector((state) => state.lecturers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstSearch, setFirstSearch] = useState(false);
  useEffect(() => {
    console.log('AddEditTopicModal formData:', formData);
    if (!firstSearch) {
      setSearchTerm(formData.lecturer_name || '');
    }
  }, [formData]);
  const statusConfig = {
    open: { label: 'Hoạt động' },
    closed: { label: 'Không hoạt động' },
    pending: { label: 'Chờ duyệt' },
  };
  const handleSearchLecturers = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFirstSearch(true);
    if (term.length >= 2) {
      dispatch(searchLecturersAsync({ keyword: term }));
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };
  const handleClose = () => {
    setSearchTerm('');
    setIsDropdownOpen(false);
    setFirstSearch(false);
    onClose();
  };

  const handleSelectLecturer = (lecturer) => {
    onInputChange({ target: { name: 'lecturer_id', value: lecturer.id } });
    setSearchTerm(lecturer.name || '');
    setIsDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Sửa đề tài' : 'Thêm đề tài'}</h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Tên đề tài</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Mã đề tài</label>
              <input
                type="text"
                disabled
                name="topic_code"
                value={formData.topic_code}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Số lượng sinh viên</label>
              <input
                type="number"
                name="student_quantity"
                value={formData.student_quantity}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Chọn trạng thái</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusConfig[status].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">Giảng viên</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchLecturers}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên hoặc mã giảng viên"
              />
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
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
                            <td className="py-2 px-4 border-b">{lecturer.faculty || "-"}</td>
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Danh mục</label>
              <select
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn danh mục (nếu có)</option>
                {Object.entries(TopicCategory).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Yêu cầu</label>
              <textarea
                name="requirement"
                value={formData.requirement}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                required
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default AddEditTopicModal;