import { useState, useEffect, memo } from 'react';
import { useAppDispatch } from '../../../store';
import { searchLecturersAsync } from '../../../store/slices/lecturerSlice';
import { TopicCategory } from '../../../types/enum';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import { useDebouncedCallback } from 'use-debounce';
import EditorToolbar from '../../../components/EditorWithToolbar';
import ListItem from '@tiptap/extension-list-item';
import { useSelector } from 'react-redux';

const AddEditTopicModal = ({ isOpen, onClose, onSubmit, formData, onInputChange, statuses, isEdit, isLecturer = false }) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading, error } = useSelector((state) => state.lecturers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstSearch, setFirstSearch] = useState(false);

  const editorConfig = {
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
      }),
      ListItem,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
      Image.configure({
        HTMLAttributes: { class: 'rounded-md max-w-full max-h-[500px] object-contain mx-auto' },
      }),
      Link.configure({ openOnClick: false }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none', // Tailwind classes
      },
    },
  };

  const descriptionEditor = useEditor({
    ...editorConfig,
    content: formData.description || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('Description Editor Updated:', html);
      onInputChange({ target: { name: 'description', value: html } });
    },
  });

  const requirementEditor = useEditor({
    ...editorConfig,
    content: formData.requirement || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('Requirement Editor Updated:', html);
      onInputChange({ target: { name: 'requirement', value: html } });
    },
  });

  useEffect(() => {
    if (descriptionEditor && isOpen) {
      descriptionEditor.commands.setContent(formData.description || '<p></p>');
    }
  }, [descriptionEditor, isOpen]);

  useEffect(() => {
    if (requirementEditor && isOpen) {
      requirementEditor.commands.setContent(formData.requirement || '<p></p>');
    }
  }, [requirementEditor, isOpen]);

  useEffect(() => {
    if (!firstSearch) {
      console.log('Setting initial search term:', formData);
      
      setSearchTerm(formData.lecturer_name || '');
    }
  }, [formData.lecturer_name, firstSearch]);

  const statusConfig = {
    open: { label: 'Hoạt động' },
    closed: { label: 'Không hoạt động' },
    pending: { label: 'Chờ duyệt' },
  };

  const debouncedSearch = useDebouncedCallback((term) => {
    if (term.length >= 2) {
      console.log(`Searching lecturers with term: ${term}`);
      
      dispatch(searchLecturersAsync({ keyword: term }));
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, 300);

  const handleSearchLecturers = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFirstSearch(true);
    debouncedSearch(term);
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
    <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {isEdit ? 'Chỉnh sửa đề tài' : 'Thêm đề tài'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đề tài</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Nhập tên đề tài"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã đề tài</label>
              <input
                type="text"
                disabled
                name="topic_code"
                value={formData.topic_code}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Số lượng sinh viên</label>
              <input
                type="number"
                name="student_quantity"
                value={formData.student_quantity}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors bg-gray-50 text-gray-800"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
                disabled={isLecturer}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors bg-gray-50 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giảng viên</label>
              <input
                type="text"
                disabled={isLecturer}
                value={searchTerm}
                onChange={handleSearchLecturers}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nhập tên hoặc mã giảng viên"
              />
              {isDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-3 text-center text-gray-600">Đang tải...</div>
                  ) : error ? (
                    <div className="p-3 text-center text-red-500">Lỗi: {error}</div>
                  ) : lecturers.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600">
                          <th className="py-2.5 px-4 font-medium">Mã</th>
                          <th className="py-2.5 px-4 font-medium">Họ tên</th>
                          <th className="py-2.5 px-4 font-medium">Khoa</th>
                          <th className="py-2.5 px-4 font-medium">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lecturers.map((lecturer) => (
                          <tr
                            key={lecturer.id}
                            onClick={() => handleSelectLecturer(lecturer)}
                            className="hover:bg-teal-50 cursor-pointer transition-colors"
                          >
                            <td className="py-2.5 px-4 border-b border-gray-200">{lecturer.lecturer_code}</td>
                            <td className="py-2.5 px-4 border-b border-gray-200">{lecturer.name}</td>
                            <td className="py-2.5 px-4 border-b border-gray-200">{lecturer.faculty || '-'}</td>
                            <td className="py-2.5 px-4 border-b border-gray-200">{lecturer.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-3 text-center text-gray-600">Không tìm thấy giảng viên</div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
              <select
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-colors bg-gray-50 text-gray-800"
              >
                <option value="">Chọn danh mục (nếu có)</option>
                {Object.entries(TopicCategory).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
              <EditorToolbar editor={descriptionEditor} />
              <EditorContent editor={descriptionEditor} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Yêu cầu</label>
              <EditorToolbar editor={requirementEditor} />
              <EditorContent editor={requirementEditor} />

            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {isEdit ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(AddEditTopicModal);