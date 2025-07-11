import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { getStudentInFacultyAsync } from '../../../store/slices/studentSlice';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import EditorToolbar from '../../../components/EditorWithToolbar';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

const editorConfig = {
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] }, bulletList: {}, orderedList: {}, blockquote: {} }),
    ListItem,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Color,
    TextStyle,
    Image.configure({ HTMLAttributes: { class: 'rounded-md max-w-full max-h-[500px] object-contain mx-auto' } }),
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: { class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none' },
  },
};

const AddEditGroupModal = ({ isOpen, onClose, onSubmit, groupData, isEdit, topic, currentStudentId }) => {
  const dispatch = useAppDispatch();
  const { students, loading: studentsLoading } = useSelector((state) => state.students);
  const [formData, setFormData] = useState({
    name: '',
    topic_id: topic?.id?.toString() || '',
    description: '<p></p>',
    student_ids: currentStudentId ? [currentStudentId] : [],
    student_lead_id: currentStudentId?.toString() || '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const descriptionEditor = useEditor({
    ...editorConfig,
    content: formData.description,
    onUpdate: ({ editor }) => setFormData((prev) => ({ ...prev, description: editor.getHTML() })),
  });

  const debouncedSearch = useCallback(
    debounce((query) => dispatch(getStudentInFacultyAsync({ page: 1, per_page: 100, search: query })), 300),
    [dispatch]
  );

  useEffect(() => {
    if (isEdit && groupData) {
      setFormData({
        name: groupData.name || '',
        topic_id: groupData.topics?.[0]?.id?.toString() || '',
        description: groupData.description || '<p></p>',
        student_ids: groupData.students?.map((student) => student.id) || [],
        student_lead_id: groupData.student_lead_id?.toString() || '',
      });
    }
  }, [isEdit, groupData]);

  useEffect(() => {
    if (isOpen && descriptionEditor) {
      descriptionEditor.commands.setContent(formData.description);
    }
  }, [isOpen, descriptionEditor, formData.description]);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = useCallback(
    (studentId, hasGroup) => {
      if (!isEdit && studentId === currentStudentId && formData.student_ids.includes(studentId)) return;
      if (!isEdit && hasGroup && studentId.toString() !== formData.student_lead_id) return;
      if (!formData.student_ids.includes(studentId) && formData.student_ids.length >= (topic?.topic_limit || 3)) return;

      setFormData((prev) => {
        const studentIds = prev.student_ids.includes(studentId)
          ? prev.student_ids.filter((id) => id !== studentId)
          : [...prev.student_ids, studentId];
        const studentLeadId = !studentIds.includes(parseInt(prev.student_lead_id))
          ? studentIds[0]?.toString() || ''
          : prev.student_lead_id;
        return { ...prev, student_ids: studentIds, student_lead_id: studentLeadId };
      });
    },
    [formData.student_ids, formData.student_lead_id, isEdit, currentStudentId, topic?.topic_limit]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.student_ids.includes(parseInt(formData.student_lead_id))) {
      toast.info('Trưởng nhóm phải là một trong các sinh viên được chọn.');
      return;
    }
    if (!isEdit && !formData.student_ids.includes(currentStudentId)) {
      toast.info('Bạn phải là thành viên của nhóm khi tạo nhóm.');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const currentStudentGroup = useMemo(
    () => (!isEdit && currentStudentId && students.find((s) => s.id === currentStudentId)?.groups?.[0]) || null,
    [students, currentStudentId, isEdit]
  );

  const selectedStudents = useMemo(
    () => students.filter((student) => formData.student_ids.includes(student.id)),
    [students, formData.student_ids]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{isEdit ? 'Chỉnh sửa thông tin nhóm' : 'Đăng ký nhóm'}</h4>
        {/* <h3 className="text-2xl font-semibold text-gray-800 mb-6">{topic?.title || 'Không xác định'}</h3> */}
        {currentStudentGroup && !isEdit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              Bạn đã thuộc nhóm <span className="font-semibold">{currentStudentGroup.name}</span>. Không thể tạo nhóm mới.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhóm</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên nhóm"
                required
                disabled={currentStudentGroup && !isEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trưởng nhóm</label>
              <select
                name="student_lead_id"
                value={formData.student_lead_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={selectedStudents.length === 0 || (!isEdit && currentStudentId) || currentStudentGroup}
                required
              >
                <option value="">Chọn trưởng nhóm</option>
                {selectedStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.student_code})
                    {student.id === currentStudentId && !isEdit ? ' (Bạn)' : ''}
                  </option>
                ))}
              </select>
              {!isEdit && currentStudentId && !currentStudentGroup && (
                <p className="text-sm text-gray-500 mt-1">Bạn sẽ là trưởng nhóm mặc định.</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả nhóm</label>
              <EditorToolbar editor={descriptionEditor} />
              <EditorContent editor={descriptionEditor} disabled={currentStudentGroup && !isEdit} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm sinh viên</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm kiếm theo tên hoặc mã sinh viên"
                disabled={currentStudentGroup && !isEdit}
              />
              {selectedStudents.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Sinh viên đã chọn ({selectedStudents.length}/{topic?.topic_limit || 3}):
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudents.map((student) => (
                      <div key={student.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        {student.name} ({student.student_code})
                        {student.id === currentStudentId && !isEdit ? (
                          <span className="ml-2 text-blue-600">(Bạn)</span>
                        ) : student.id.toString() === formData.student_lead_id ? (
                          <span className="ml-2 text-blue-600">(Trưởng nhóm)</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStudentToggle(student.id, student.groups.length > 0)}
                            className="ml-2 text-blue-600 hover:text-red-600"
                            disabled={currentStudentGroup && !isEdit}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Danh sách sinh viên</label>
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
                      {students
                        .filter((student) => isEdit || student.groups.length === 0)
                        .map((student) => {
                          const isInOtherGroup =
                            isEdit && student.groups.length > 0 && !student.groups.some((group) => group.id === groupData.id);
                          return (
                            <tr key={student.id} className={`border-b border-gray-100 ${isInOtherGroup ? 'bg-gray-300' : ''}`}>
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={formData.student_ids.includes(student.id)}
                                  onChange={() => handleStudentToggle(student.id, isInOtherGroup)}
                                  disabled={isInOtherGroup || (!isEdit && student.id === currentStudentId && formData.student_ids.includes(student.id))}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                                />
                              </td>
                              <td className="p-3 font-medium">
                                {student.name}
                                {student.id === currentStudentId && !isEdit ? ' (Bạn)' : ''}
                              </td>
                              <td className="p-3">{student.student_code}</td>
                              <td className="p-3">{student.class_name}</td>
                            </tr>
                          );
                        })}
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
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300"
              disabled={formData.student_ids.length === 0 || !formData.student_lead_id || (!isEdit && currentStudentGroup)}
            >
              {isEdit ? 'Cập nhật' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGroupModal;