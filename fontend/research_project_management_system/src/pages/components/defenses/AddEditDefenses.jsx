import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { searchLecturersAsync } from '../../../store/slices/lecturerSlice';
import debounce from 'lodash/debounce';
import { useAppDispatch } from '../../../store';
import { addDefenseAsync } from '../../../store/slices/defencesSlice';

const toUTCISOPlus7 = (localDateTime) => {
  if (!localDateTime) return '';
  const date = new Date(localDateTime);
  const offset = 7 * 60; // +7 hours in minutes
  const utcDate = new Date(date.getTime() + offset * 60 * 1000);
  return utcDate.toISOString();
};

const statusOptions = ['waiting', 'done'];

const AddDefenseModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading: lecturersLoading } = useSelector((state) => state.lecturers);
  const [formData, setFormData] = useState({
    name: '',
    defense_time: '',
    start_time: '',
    end_time: '',
    lecturer_ids: [],
    status: 'waiting',
  });
  const [errors, setErrors] = useState({
    name: '',
    defense_time: '',
    start_time: '',
    end_time: '',
    lecturer_ids: '',
    general: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        console.log(`Searching lecturers with query: ${query}`);
        
        dispatch(searchLecturersAsync({ page: 1, per_page: 3, keyword: query }));
      }, 300),
    [dispatch]
  );

  useEffect(() => {
    if (isOpen) {
      debouncedSearch(searchQuery);
    }
    return () => debouncedSearch.cancel();
  }, [isOpen, searchQuery, debouncedSearch]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  // Handle lecturer selection
  const handleLecturerToggle = useCallback(
    (lecturerId) => {
      setFormData((prev) => {
        const lecturerIds = prev.lecturer_ids.includes(lecturerId)
          ? prev.lecturer_ids.filter((id) => id !== lecturerId)
          : prev.lecturer_ids.length >= 3
          ? prev.lecturer_ids
          : [...prev.lecturer_ids, lecturerId];
        return { ...prev, lecturer_ids: lecturerIds };
      });
      setErrors((prev) => ({ ...prev, lecturer_ids: '' }));
    },
    []
  );

  // Validate form inputs
  const validateForm = useCallback(() => {
    const newErrors = {
      name: formData.name ? '' : 'Tên buổi bảo vệ là bắt buộc',
      lecturer_ids: formData.lecturer_ids.length > 0 ? '' : 'Chọn ít nhất một giảng viên',
      general: '',
    };
    if (formData.lecturer_ids.length > 3) {
      newErrors.lecturer_ids = 'Chỉ được chọn tối đa 3 giảng viên';
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      console.log(`Submitting defense with data:`, formData);
      
      const defenseData = {
        name: formData.name,
        defense_time: toUTCISOPlus7(formData.defense_time),
        start_time: toUTCISOPlus7(formData.start_time),
        end_time: toUTCISOPlus7(formData.end_time),
        lecturer_ids: formData.lecturer_ids,
        status: formData.status,
      };

      dispatch(addDefenseAsync(defenseData))
        .unwrap()
        .then(() => {
          setFormData({
            name: '',
            defense_time: '',
            start_time: '',
            end_time: '',
            lecturer_ids: [],
            status: 'waiting_defense',
          });
          setSearchQuery('');
          onClose();
          onSubmit?.();
        })
        .catch((error) => {
          setErrors((prev) => ({ ...prev, general: error.message || 'Tạo buổi bảo vệ thất bại' }));
        });
    },
    [dispatch, formData, onClose, onSubmit]
  );

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const selectedLecturers = useMemo(
    () => lecturers.filter((lecturer) => formData.lecturer_ids.includes(lecturer.id)),
    [lecturers, formData.lecturer_ids]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-600">Thêm Buổi Bảo Vệ</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tên Buổi Bảo Vệ
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên buổi bảo vệ"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="search_lecturers" className="block text-sm font-medium text-gray-700">
              Tìm Kiếm Giảng Viên
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm kiếm theo tên hoặc mã giảng viên"
            />
            {selectedLecturers.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Giảng viên đã chọn ({selectedLecturers.length}/3):
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedLecturers.map((lecturer) => (
                    <div
                      key={lecturer.id}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
                    >
                      {lecturer.name} {lecturer.code && `(${lecturer.code})`}
                      <button
                        type="button"
                        onClick={() => handleLecturerToggle(lecturer.id)}
                        className="ml-1 text-blue-600 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label htmlFor="lecturer_ids" className="block text-sm font-medium text-gray-700 mt-2">
              Danh Sách Giảng Viên
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
              {lecturersLoading ? (
                <p className="text-sm text-gray-500">Đang tải giảng viên...</p>
              ) : lecturers.length > 0 ? (
                <table className="w-full text-sm text-gray-800">
                  <thead>
                    <tr className="border-b border-gray-200 sticky top-0 bg-gray-50">
                      <th className="p-2 text-left font-medium">Chọn</th>
                      <th className="p-2 text-left font-medium">Tên</th>
                      <th className="p-2 text-left font-medium">Mã Giảng Viên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturers.map((lecturer) => (
                      <tr key={lecturer.id} className="border-b border-gray-100 hover:bg-gray-100">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={formData.lecturer_ids.includes(lecturer.id)}
                            onChange={() => handleLecturerToggle(lecturer.id)}
                            disabled={
                              !formData.lecturer_ids.includes(lecturer.id) &&
                              formData.lecturer_ids.length >= 3
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="p-2 font-medium">{lecturer.name}</td>
                        <td className="p-2">{lecturer.lecturer_code || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">Không tìm thấy giảng viên.</p>
              )}
            </div>
            {errors.lecturer_ids && <p className="text-red-600 text-sm mt-1">{errors.lecturer_ids}</p>}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Trạng Thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'waiting'
                    ? 'Chờ bảo vệ'
                    : status === 'done'
                    ? 'Đã bảo vệ xong'
                    : status === 'done'
                    }
                </option>
              ))}
            </select>
          </div>
          {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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

export default AddDefenseModal;