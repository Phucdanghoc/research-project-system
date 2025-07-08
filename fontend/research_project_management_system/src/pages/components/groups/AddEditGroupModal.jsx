import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../../store';
import { getStudentInFacultyAsync } from '../../../store/auth/studentSlice';
import { useSelector } from 'react-redux';

const AddEditGroupModal = ({ isOpen, onClose, onSubmit, groupData, isEdit, topic }) => {
  const dispatch = useAppDispatch();
  const { students, loading: studentsLoading } = useSelector((state) => state.students);
  const [formData, setFormData] = useState({
    name: '',
    topic_id: '',
    student_ids: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (groupData) {
      setFormData({
        name: groupData.name || '',
        topic_id: groupData.topic_id || '',
        student_ids: groupData.student_ids || [],
      });
    } else {
      setFormData({
        name: '',
        topic_id: topic?.id?.toString() || '',
        student_ids: [],
      });
    }
  }, [isEdit, groupData, topic]);

  useEffect(() => {
    dispatch(getStudentInFacultyAsync({ page: 1, per_page: 100, search: searchQuery }));
  }, [searchQuery, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleStudentToggle = (studentId, hasGroup) => {
    if (hasGroup) return; // Prevent selection if student has a group
    if (formData.student_ids.length >= 3 && !formData.student_ids.includes(studentId)) {
      return; // Prevent adding more than 3 students
    }
    setFormData((prev) => ({
      ...prev,
      student_ids: prev.student_ids.includes(studentId)
        ? prev.student_ids.filter((id) => id !== studentId)
        : [...prev.student_ids, studentId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const selectedStudents = students.filter((student) => formData.student_ids.includes(student.id));

  return (
    <div
      className={`fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
        <>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Chỉnh sửa nhóm' : 'Thêm nhóm cho đề tài:'}
          </h4>
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            {topic?.title || 'Không xác định'}
          </h3>
        </>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhóm</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors placeholder-gray-400"
                placeholder="Nhập tên nhóm"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm sinh viên</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors placeholder-gray-400"
                placeholder="Tìm kiếm theo tên hoặc mã sinh viên"
              />
              {selectedStudents.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Sinh viên đã chọn ({selectedStudents.length}/3):
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {student.name} ({student.student_code})
                        <button
                          type="button"
                          onClick={() => handleStudentToggle(student.id, student.groups.length > 0)}
                          className="ml-2 text-blue-600 hover:text-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                Danh sách sinh viên
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                {studentsLoading ? (
                  <p className="text-sm text-gray-500">Đang tải sinh viên...</p>
                ) : students.length > 0 ? (
                  <table className="w-full text-sm text-gray-800">
                    <thead>
                      <tr className="border-b border-gray-200 sticky top-0 bg-gray-50">
                        <th className="p-3 text-left font-medium">Chọn</th>
                        <th className="p-3 text-left font-medium">Tên</th>
                        <th className="p-3 text-left font-medium">Mã sinh viên</th>
                        <th className="p-3 text-left font-medium">Lớp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          className={`border-b mb-2  border-gray-100 transition-colors ${student.groups.length > 0 ? 'bg-gray-300' : ''
                            }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={formData.student_ids.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id, student.has_group)}
                              disabled={student.groups.length > 0 || (formData.student_ids.length >= 3 && !formData.student_ids.includes(student.id))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3">{student.student_code}</td>
                          <td className="p-3">{student.class_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">Không tìm thấy sinh viên.</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300"
              disabled={formData.student_ids.length === 0}
            >
              {isEdit ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGroupModal;