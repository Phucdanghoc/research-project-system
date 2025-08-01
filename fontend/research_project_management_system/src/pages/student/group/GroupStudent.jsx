import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch } from '../../../store';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import { FaUsers, FaUserCircle, FaUniversity, FaBook, FaUserPlus } from 'react-icons/fa';
import EditorToolbar from '../../../components/EditorWithToolbar';
import { fetchGroupByMeAsync, updateGroupAsync, deleteGroupAsync } from '../../../store/slices/groupSlice';
import { getStudentInFacultyAsync } from '../../../store/slices/studentSlice';
import DOMPurify from 'dompurify';
import { TimeService } from '../../../utils/time';
import { useSelector } from 'react-redux';
import { TopicCategory } from '../../../types/enum';
import { StudentCard } from '../../../components/cards/StudentCard';

export const GroupStudent = () => {
  const dispatch = useAppDispatch();
  const currentStudentId = useSelector((state) => state.auth.user?.id);

  const { groups, loading: groupLoading, error: groupError } = useSelector((state) => state.groups);
  const { students, loading: studentsLoading } = useSelector((state) => state.students);
  const group = groups?.[0];
  const [activeTab, setActiveTab] = useState('groupInfo');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingMembers, setIsEditingMembers] = useState(false);
  const [isInvitingMembers, setIsInvitingMembers] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [invitedStudentIds, setInvitedStudentIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const editorConfig = {
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, bulletList: {}, orderedList: {}, blockquote: {} }),
      ListItem,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Image.configure({ HTMLAttributes: { class: 'rounded-md max-w-full max-h-[500px] object-contain mx-auto' } }),
      Link.configure({ openOnClick: false }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-b-lg border-t border-gray-200',
      },
    },
  };

  const descriptionEditor = useEditor({
    ...editorConfig,
    content: formData.description || '<p></p>',
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    dispatch(fetchGroupByMeAsync({ page: 1, per_page: 10 }));
    dispatch(getStudentInFacultyAsync({ page: 1, per_page: 100, search: searchQuery }));
  }, [dispatch, searchQuery]);

  useEffect(() => {
    if (group && isEditingInfo) {
      setFormData({
        name: group.name || '',
        description: group.description || '<p></p>',
      });
      descriptionEditor?.commands.setContent(group.description || '<p></p>');
    }
    if (group && isEditingMembers) {
      setSelectedStudentIds(group.students?.map((s) => s.id) || []);
    }
  }, [group, isEditingInfo, isEditingMembers, descriptionEditor]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleDissolveGroup = async () => {
    if (window.confirm('Bạn có chắc muốn giải thể nhóm? Hành động này không thể hoàn tác.')) {
      try {
        await dispatch(deleteGroupAsync(group.id)).unwrap();
        toast.success('Nhóm đã được giải thể.');
        dispatch(fetchGroupByMeAsync({ page: 1, per_page: 10 }));
      } catch (error) {
        toast.error(`Lỗi khi giải thể nhóm: ${error}`);
      }
    }
  };

  const handleEditInfo = () => {
    setIsEditingInfo(true);
  };

  const handleSaveInfo = async () => {
    if (!formData.name) {
      toast.error('Tên nhóm không được để trống.');
      return;
    }
    try {
      await dispatch(updateGroupAsync({ id: group.id, groupData: { ...formData, student_lead_id: group.student_lead_id } })).unwrap();
      toast.success('Cập nhật thông tin nhóm thành công.');
      setIsEditingInfo(false);
      dispatch(fetchGroupByMeAsync({ page: 1, per_page: 10 }));
    } catch (error) {
      toast.error(`Lỗi khi cập nhật thông tin nhóm: ${error}`);
    }
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
    setFormData({ name: group?.name || '', description: group?.description || '<p></p>' });
  };

  const handleEditMembers = () => {
    setIsEditingMembers(true);
  };

  const handleSaveMembers = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error('Nhóm phải có ít nhất một thành viên.');
      return;
    }
    if (!selectedStudentIds.includes(group.student_lead_id)) {
      toast.error('Trưởng nhóm phải là một trong các thành viên được chọn.');
      return;
    }
    try {
      await dispatch(updateGroupAsync({ id: group.id, groupData: { name: group.name, student_ids: selectedStudentIds, student_lead_id: group.student_lead_id } })).unwrap();
      toast.success('Cập nhật thành viên thành công.');
      setIsEditingMembers(false);
      dispatch(fetchGroupByMeAsync({ page: 1, per_page: 10 }));
    } catch (error) {
      toast.error(`Lỗi khi cập nhật thành viên: ${error}`);
    }
  };

  const handleCancelEditMembers = () => {
    setIsEditingMembers(false);
    setSelectedStudentIds(group?.students?.map((s) => s.id) || []);
  };

  const handleSaveInviteMembers = async () => {
    if (invitedStudentIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sinh viên để mời.');
      return;
    }
    try {
      const currentStudentIds = group.students?.map(s => s.id) || [];
      const updatedStudentIds = [...new Set([...currentStudentIds, ...invitedStudentIds])];
      const topicLimit = group?.topics?.[0]?.student_quantity || 3;
      if (updatedStudentIds.length > topicLimit) {
        toast.error(`Nhóm không thể có quá ${topicLimit} thành viên.`);
        return;
      }
      await dispatch(updateGroupAsync({ id: group.id, groupData: { name: group.name, student_ids: updatedStudentIds, student_lead_id: group.student_lead_id } })).unwrap();
      toast.success('Mời thành viên thành công.');
      setIsInvitingMembers(false);
      setInvitedStudentIds([]);
      dispatch(fetchGroupByMeAsync({ page: 1, per_page: 10 }));
    } catch (error) {
      toast.error(`Lỗi khi mời thành viên: ${error}`);
    }
  };

  const handleCancelInviteMembers = () => {
    setIsInvitingMembers(false);
    setInvitedStudentIds([]);
  };

  const handleStudentToggle = (studentId) => {
    if (studentId === currentStudentId) {
      toast.info('Bạn không thể xóa chính mình khỏi nhóm.');
      return;
    }
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleInviteStudentToggle = (studentId) => {
    setInvitedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const isLeader = group?.student_lead_id === currentStudentId;

  const groupStudents = useMemo(() => group?.students || [], [group]);
  const groupLeader = useMemo(
    () => groupStudents.find((s) => s.id === group?.student_lead_id),
    [groupStudents, group]
  );
  const groupTopics = useMemo(() => group?.topics || [], [group]);
  const groupLecturer = useMemo(() => group?.lecturer, [group]);

  const availableInviteStudents = useMemo(
    () => students.filter((student) => !groupStudents.some((s) => s.id === student.id) && student.groups?.length === 0),
    [students, groupStudents]
  );

  const studentRows = useMemo(
    () =>
      groupStudents.map((student) => (
        <tr key={student.id} className="border-b border-gray-100">
          <td className="p-3">
            <input
              type="checkbox"
              checked={selectedStudentIds.includes(student.id)}
              onChange={() => handleStudentToggle(student.id)}
              disabled={student.id === currentStudentId || student.id === group?.student_lead_id}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
          </td>
          <td className="p-3 font-medium">
            {student.name}
            {student.id === currentStudentId ? ' (Bạn)' : ''}
            {student.id === group?.student_lead_id ? ' (Trưởng nhóm)' : ''}
          </td>
          <td className="p-3">{student.student_code}</td>
          <td className="p-3">{student.class_name}</td>
        </tr>
      )),
    [groupStudents, selectedStudentIds, currentStudentId, group, handleStudentToggle]
  );

  const studentChips = useMemo(
    () =>
      groupStudents.map((student) => (
        <StudentCard student={student} />
      )),
    [groupStudents, currentStudentId, group]
  );

  const inviteRows = useMemo(
    () =>
      availableInviteStudents.map((student) => (
        <tr key={student.id} className="border-b border-gray-100">
          <td className="p-3">
            <input
              type="checkbox"
              checked={invitedStudentIds.includes(student.id)}
              onChange={() => handleInviteStudentToggle(student.id)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </td>
          <td className="p-3 font-medium">{student.name}</td>
          <td className="p-3">{student.student_code}</td>
          <td className="p-3">{student.class_name}</td>
        </tr>
      )),
    [availableInviteStudents, invitedStudentIds, handleInviteStudentToggle]
  );

  if (!group && !groupLoading && !groupError) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">Bạn chưa thuộc nhóm nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-6xl max-h-[85vh] flex flex-col rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-blue-50 border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaUsers className="mr-2 text-blue-600" /> Nhóm của tôi
          </h2>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 p-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('groupInfo')}
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'groupInfo'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              <FaUsers className="mr-2" /> Thông tin nhóm
            </button>
            {groupTopics.length > 0 && (
              <button
                onClick={() => setActiveTab('topicInfo')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'topicInfo'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                  }`}
              >
                <FaBook className="mr-2" /> Thông tin đề tài
              </button>
            )}
            {groupLecturer && (
              <button
                onClick={() => setActiveTab('lecturerInfo')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'lecturerInfo'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                  }`}
              >
                <FaUserCircle className="mr-2" /> Giảng viên
              </button>
            )}
            <button
              onClick={() => setActiveTab('studentList')}
              className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'studentList'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              <FaUsers className="mr-2" /> Sinh viên ({groupStudents.length})
            </button>
            {isLeader && group.defense_id === null && (
              <button
                onClick={() => setActiveTab('inviteMembers')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'inviteMembers'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                  }`}
              >
                <FaUserPlus className="mr-2" /> Mời thành viên
              </button>
            )}
          </nav>
        </div>
        {/* Tab Content */}
        <div className="p-6 sm:p-8 bg-white space-y-6 overflow-y-auto">
          {groupLoading && <p className="text-base text-gray-500">Đang tải dữ liệu nhóm...</p>}
          {groupError && <p className="text-base text-red-600">Lỗi: {groupError}</p>}
          {group && (
            <>
              {/* Group Information Tab */}
              {activeTab === 'groupInfo' && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                    {isEditingInfo ? (
                      <>
                        <div>
                          <span className="font-medium text-gray-800">Tên nhóm: </span>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                            placeholder="Nhập tên nhóm"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-800">Mô tả nhóm: </span>
                          <EditorToolbar editor={descriptionEditor} />
                          <EditorContent editor={descriptionEditor} />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Tên nhóm: </span> {group.name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Mã nhóm: </span> {group.group_code || 'Không có'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Trạng thái: </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${group.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : group.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : group.status === 'denied'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {group.status === 'pending'
                              ? 'Đang chờ'
                              : group.status === 'accepted'
                                ? 'Đã duyệt'
                                : group.status === 'denied'
                                  ? 'Không duyệt'
                                  : group.status || 'Không xác định'}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Trạng thái bảo vệ: </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${group.defense_id ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}
                          >
                            {group.defense_id ? 'Đã đăng ký bảo vệ' : 'Chưa đăng ký bảo vệ'}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Trưởng nhóm: </span>
                          {groupLeader?.name || 'Không xác định'} ({groupLeader?.student_code})
                          {group.student_lead_id === currentStudentId ? ' (Bạn)' : ''}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Ngày tạo: </span>
                          {TimeService.convertDateStringToDDMMYYYY(group.created_at)}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">Ngày cập nhật: </span>
                          {TimeService.convertDateStringToDDMMYYYY(group.updated_at)}
                        </p>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-800">Mô tả nhóm: </span>
                          <div
                            className="prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-b-lg border-t border-gray-200"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(group.description || '<p>Chưa có mô tả</p>') }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Topic Information Tab */}
              {activeTab === 'topicInfo' && groupTopics.length > 0 && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  {groupTopics.map((topic) => (
                    <div key={topic.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Tên đề tài:</span> {topic.title}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Mã đề tài:</span> {topic.topic_code}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Danh mục: </span>
                        {TopicCategory[topic.category] || 'Không có'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Trạng thái: </span>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${topic.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : topic.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : topic.status === 'open'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {topic.status === 'pending'
                            ? 'Đang chờ'
                            : topic.status === 'approved'
                              ? 'Đã duyệt'
                              : topic.status === 'open'
                                ? 'Mở'
                                : topic.status || 'Không xác định'}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Số lượng sinh viên: </span>
                        {topic.student_quantity || 0}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Ngày tạo: </span>
                        {TimeService.convertDateStringToDDMMYYYY(topic.created_at)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Ngày cập nhật: </span>
                        {TimeService.convertDateStringToDDMMYYYY(topic.updated_at)}
                      </p>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-800">Mô tả đề tài:</span>
                        <div
                          className="prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-b-lg border-t border-gray-200"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.description || '<p>Chưa có mô tả</p>') }}
                        />
                      </div>
                      {topic.requirement && (
                        <div className="col-span-2">
                          <span className="font-medium text-gray-800">Yêu cầu đề tài:</span>
                          <div
                            className="prose prose-sm max-w-none text-gray-600 mt-2 p-4 bg-white rounded-b-lg border-t border-gray-200"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.requirement || '<p>Chưa có yêu cầu</p>') }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Lecturer Information Tab */}
              {activeTab === 'lecturerInfo' && groupLecturer && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="flex-shrink-0">
                      <FaUserCircle className="text-gray-400 bg-gray-100 rounded-full p-1" size={70} />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">Họ tên:</span>
                        <span className="text-gray-700">{groupLecturer.name || 'Không có'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">Mã giảng viên:</span>
                        <span className="text-gray-700">{groupLecturer.lecturer_code || 'Không có'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">Email:</span>
                        <span className="text-gray-700">{groupLecturer.email || 'Không có'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">Số điện thoại:</span>
                        <span className="text-gray-700">{groupLecturer.phone || 'Không có'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUniversity className="text-blue-400" />
                        <span className="font-medium text-gray-800">Khoa:</span>
                        <span className="text-gray-700">{groupLecturer.faculty || 'Không có'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">Ngày sinh:</span>
                        <span className="text-gray-700">
                          {groupLecturer.birth ? TimeService.convertDateStringToDDMMYYYY(groupLecturer.birth) : 'Không có'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student List Tab */}
              {activeTab === 'studentList' && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  {isEditingMembers ? (
                    <div className="space-y-4">
                      <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                        <table className="w-full text-sm text-gray-800">
                          <thead>
                            <tr className="border-b border-gray-200 sticky top-0 bg-gray-50">
                              <th className="p-3 text-left font-medium">Chọn</th>
                              <th className="p-3 text-left font-medium">Tên</th>
                              <th className="p-3 text-left font-medium">Mã sinh viên</th>
                              <th className="p-3 text-left font-medium">Lớp</th>
                            </tr>
                          </thead>
                          <tbody>{studentRows}</tbody>
                        </table>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleCancelEditMembers}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveMembers}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                          disabled={selectedStudentIds.length === 0}
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">{studentChips}</div>
                  )}
                </div>
              )}

              {activeTab === 'inviteMembers' && isLeader && group.defense_id === null && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm sinh viên</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors placeholder-gray-400"
                      placeholder="Tìm kiếm theo tên hoặc mã sinh viên"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                    {studentsLoading ? (
                      <p className="text-sm text-gray-500">Đang tải sinh viên...</p>
                    ) : availableInviteStudents.length > 0 ? (
                      <table className="w-full text-sm text-gray-800">
                        <thead>
                          <tr className="border-b border-gray-200 sticky top-0 bg-gray-50">
                            <th className="p-3 text-left font-medium">Chọn</th>
                            <th className="p-3 text-left font-medium">Tên</th>
                            <th className="p-3 text-left font-medium">Mã sinh viên</th>
                            <th className="p-3 text-left font-medium">Lớp</th>
                          </tr>
                        </thead>
                        <tbody>{inviteRows}</tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-gray-500">Không tìm thấy sinh viên có thể mời.</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={handleCancelInviteMembers}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveInviteMembers}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={invitedStudentIds.length === 0}
                    >
                      Mời
                    </button>
                  </div>
                </div>
              )}

              {isLeader && (
                <div className="p-2 border-t border-gray-400 flex justify-end flex-wrap gap-3">
                  {/* Nút giải thể nhóm */}
                  <button
                    onClick={handleDissolveGroup}
                    className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                    disabled={isEditingInfo || isEditingMembers || isInvitingMembers}
                  >
                    Giải thể nhóm
                  </button>

                  {/* Nút chỉnh sửa thành viên */}
                  <button
                    onClick={handleEditMembers}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={isEditingInfo || isInvitingMembers || activeTab !== 'studentList'}
                  >
                    Chỉnh sửa thành viên
                  </button>

                  {/* Nút chỉnh sửa thông tin */}
                  <button
                    onClick={handleEditInfo}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={isEditingMembers || isInvitingMembers || activeTab !== 'groupInfo'}
                  >
                    Chỉnh sửa thông tin
                  </button>

                  {isEditingInfo && activeTab === 'groupInfo' && (
                    <>
                      <button
                        onClick={handleCancelEditInfo}
                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveInfo}
                        className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                        disabled={!formData.name}
                      >
                        Lưu
                      </button>
                    </>
                  )}
                </div>
              )}

            </>
          )}
        </div>

        <style jsx>{`
          .prose :where(h1, h2, h3, p):not(:last-child) {
            margin-bottom: 0.5rem;
          }
          .prose h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
          }
          .prose h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
          }
          .prose h3 {
            font-size: 1.125rem;
            font-weight: 500;
            color: #1f2937;
          }
          .prose p {
            font-size: 0.875rem;
            color: #4b5563;
          }
        `}</style>
      </div>
    </div>
  );
};