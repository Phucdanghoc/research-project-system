import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../store';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { searchLecturersAsync } from '../../../store/slices/lecturerSlice'; // Assume searchGroupsAsync exists
import { getLecturerDefenseByIdAsync } from '../../../store/slices/lecturerDefenseSlice';
import { checkDefenseTimeAsync, addDefenseAsync, updateDefenseAsync, fetchDefensesAsync } from '../../../store/slices/defensesSlice';
import { useDebouncedCallback } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { fetchGroupsAsync } from '../../../store/slices/groupSlice';

const timeBlocks = [
  { start: '07:00', end: '09:00' },
  { start: '09:30', end: '11:30' },
  { start: '13:00', end: '15:00' },
  { start: '15:30', end: '17:30' },
];

const statusOptions = [
  { value: 'waiting', label: 'Chờ bảo vệ' },
  { value: 'done', label: 'Đã bảo vệ xong' },
];

const AddEditDefenseModal = ({ isOpen, onClose, onSubmit, defense }) => {
  const dispatch = useAppDispatch();
  const { lecturers, groups, loading: lecturersLoading, groupLoading: groupsLoading } = useSelector((state) => state.lecturers);
  const { lecturerDefenses, loading: lecturerDefensesLoading, error: lecturerDefensesError } = useSelector(
    (state) => state.lecturerDefenses
  );
  const { loading: timeCheckLoading, error: timeCheckError } = useSelector((state) => state.defenses);
  const isEditMode = !!defense?.id;

  const [formData, setFormData] = useState({
    name: defense?.name || '',
    date: defense?.date || '',
    start_time: defense?.start_time ? new Date(defense.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
    end_time: defense?.end_time ? new Date(defense.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
    lecturer_ids: [],
    group_ids: [],
    status: defense?.status || 'waiting',
  });
  const [errors, setErrors] = useState({
    name: '',
    date: '',
    time_block: '',
    lecturer_ids: '',
    group_ids: '',
    general: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [preExistingLecturers, setPreExistingLecturers] = useState([]);
  const [preExistingGroups, setPreExistingGroups] = useState([]);
  const [blockAvailability, setBlockAvailability] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const searchInputRef = useRef(null);
  const groupSearchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const groupDropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && defense?.id) {
      dispatch(getLecturerDefenseByIdAsync(defense.id))
        .unwrap()
        .then((data) => {

          const lecturerIds = [...new Set(data.lecturer_defenses.map((item) => item.lecturer_id))];
          const groupIds = [...new Set(data.lecturer_defenses.map((item) => item.group_id))];
          const lecturersData = data.lecturer_defenses.map((item) => ({
            id: item.lecturer_id,
            name: item.lecturer.name,
            lecturer_code: item.lecturer.email,
          }));
          const groupsData = data.lecturer_defenses
            .filter((item) => item.group)
            .map((item) => ({
              id: item.group.id,
              name: item.group.name,
              group_code: item.group.group_code,
            }));
          setFormData((prev) => ({
            ...prev,
            lecturer_ids: lecturerIds,
            group_ids: groupIds,
          }));
          setPreExistingLecturers([...new Set(lecturersData.map(JSON.stringify))].map(JSON.parse));
          setPreExistingGroups([...new Set(groupsData.map(JSON.stringify))].map(JSON.parse));
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            general: error.message || 'Không thể tải danh sách giảng viên hoặc nhóm hiện tại',
          }));
        });
    }
  }, [isOpen, defense?.id, dispatch]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.date || formData.lecturer_ids.length === 0 || formData.group_ids.length === 0) {
        setBlockAvailability({});
        return;
      }

      setAvailabilityLoading(true);
      const availability = {};

      for (const block of timeBlocks) {
        try {
          if (isEditMode && formData.start_time == block.start && formData.end_time == block.end && formData.date == defense.date) {
            availability[`${block.start}-${block.end}`] = true;
            continue;
          }
          const result = await dispatch(
            checkDefenseTimeAsync({
              lecturer_id: formData.lecturer_ids,
              group_ids: formData.group_ids,
              date: formData.date,
              start_time: block.start,
              end_time: block.end,
            })
          ).unwrap();
          availability[`${block.start}-${block.end}`] = !result.conflict;
        } catch (error) {
          availability[`${block.start}-${block.end}`] = false;
        }
      }

      setBlockAvailability(availability);
      setAvailabilityLoading(false);
    };

    checkAvailability();
  }, [formData.date, formData.lecturer_ids, formData.group_ids, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        searchInputRef.current &&
        dropdownRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        isGroupDropdownOpen &&
        groupSearchInputRef.current &&
        groupDropdownRef.current &&
        !groupSearchInputRef.current.contains(event.target) &&
        !groupDropdownRef.current.contains(event.target)
      ) {
        setIsGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isGroupDropdownOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const debouncedSearch = useDebouncedCallback((query) => {
    dispatch(
      searchLecturersAsync({
        page: 1,
        per_page: 10,
        keyword: query,
        def_id: defense?.id,
      })
    );
  }, 300);

  const debouncedGroupSearch = useDebouncedCallback((query) => {
    dispatch(
      fetchGroupsAsync({
        page: 1,
        per_page: 10,
        keyword: query,
      })
    );
  }, 300);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleLecturerToggle = useCallback((lecturerId) => {
    setFormData((prev) => {
      const lecturerIds = prev.lecturer_ids.includes(lecturerId)
        ? prev.lecturer_ids.filter((id) => id !== lecturerId)
        : prev.lecturer_ids.length >= 3
          ? prev.lecturer_ids
          : [...prev.lecturer_ids, lecturerId];
      return { ...prev, lecturer_ids: lecturerIds };
    });
    setErrors((prev) => ({ ...prev, lecturer_ids: '' }));
  }, []);

  const handleGroupToggle = useCallback((groupId) => {
    setFormData((prev) => {
      const groupIds = prev.group_ids.includes(groupId)
        ? prev.group_ids.filter((id) => id !== groupId)
        : prev.group_ids.length >= 3
          ? prev.group_ids
          : [...prev.group_ids, groupId];
      return { ...prev, group_ids: groupIds };
    });
    setErrors((prev) => ({ ...prev, group_ids: '' }));
  }, []);

  const handleSelectBlock = useCallback(
    (block) => {
      const key = `${block.start}-${block.end}`;
      if (blockAvailability[key]) {
        setFormData((prev) => ({
          ...prev,
          start_time: block.start,
          end_time: block.end,
        }));
        setErrors((prev) => ({ ...prev, time_block: '' }));
      }
    },
    [blockAvailability]
  );

  const validateForm = useCallback(() => {
    const newErrors = {
      name: formData.name ? '' : 'Tên hội đồng bảo vệ là bắt buộc',
      date: formData.date ? '' : 'Ngày là bắt buộc',
      time_block: formData.start_time && formData.end_time ? '' : 'Vui lòng chọn một khối thời gian',
      lecturer_ids: formData.lecturer_ids.length > 0 ? '' : 'Chọn ít nhất một giảng viên',
      group_ids: formData.group_ids.length > 0 ? '' : 'Chọn ít nhất một nhóm',
      general: '',
    };
    if (formData.lecturer_ids.length > 3) {
      newErrors.lecturer_ids = 'Chỉ được chọn tối đa 3 giảng viên';
    }
    if (formData.group_ids.length > 3) {
      newErrors.group_ids = 'Chỉ được chọn tối đa 3 nhóm';
    }
    if (formData.start_time && formData.end_time) {
      const key = `${formData.start_time}-${formData.end_time}`;
      if (!blockAvailability[key]) {
        newErrors.time_block = 'Khối thời gian này không khả dụng';
      }
    }
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  }, [formData, blockAvailability]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validateForm()) {
        toast.info('Vui lòng điền đầy đủ và đúng các trường bắt buộc.');
        return;
      }

      const defenseData = {
        name: formData.name,
        date: formData.date,
        start_time: formData.date ? `${formData.date}T${formData.start_time}:00+07:00` : '',
        end_time: formData.date ? `${formData.date}T${formData.end_time}:00+07:00` : '',
        lecturer_ids: formData.lecturer_ids,
        group_ids: formData.group_ids,
        status: formData.status,
      };

      const action = isEditMode
        ? updateDefenseAsync({ id: defense.id, defenseData }) 
        : addDefenseAsync(defenseData);


      dispatch(action)
        .unwrap()
        .then(() => {
          toast.success(isEditMode ? 'Cập nhật hội đồng bảo vệ thành công' : 'Tạo hội đồng bảo vệ thành công');
          setFormData({
            name: '',
            date: '',
            start_time: '',
            end_time: '',
            lecturer_ids: [],
            group_ids: [],
            status: 'waiting',
          });
          setSearchQuery('');
          setGroupSearchQuery('');
          setIsDropdownOpen(false);
          setIsGroupDropdownOpen(false);
          setPreExistingLecturers([]);
          setPreExistingGroups([]);
          setBlockAvailability({});
          dispatch(fetchDefensesAsync({ page: 1, per_page: 10 })); // Refresh groups
          onClose();
          // onSubmit?.();
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            general: error.message || (isEditMode ? 'Cập nhật hội đồng bảo vệ thất bại' : 'Tạo hội đồng bảo vệ thất bại'),
          }));
          toast.error(error.message || (isEditMode ? 'Cập nhật hội đồng bảo vệ thất bại' : 'Tạo hội đồng bảo vệ thất bại'));
        });
    },
    [dispatch, formData, onClose, onSubmit, defense?.id, isEditMode]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const handleGroupSearchChange = useCallback((e) => {
    setGroupSearchQuery(e.target.value);
    setIsGroupDropdownOpen(true);
    debouncedGroupSearch(e.target.value);
  }, [debouncedGroupSearch]);

  const allLecturers = useMemo(() => {
    const lecturerMap = new Map();
    preExistingLecturers.forEach((lecturer) => lecturerMap.set(lecturer.id, lecturer));
    lecturers.forEach((lecturer) => {
      if (!lecturerMap.has(lecturer.id)) {
        lecturerMap.set(lecturer.id, lecturer);
      }
    });
    return Array.from(lecturerMap.values());
  }, [lecturers, preExistingLecturers]);

  const allGroups = useMemo(() => {
    const groupMap = new Map();
    preExistingGroups.forEach((group) => groupMap.set(group.id, group));
    // groups.forEach((group) => {
    //   if (!groupMap.has(group.id)) {
    //     groupMap.set(group.id, group);
    //   }
    // });
    return Array.from(groupMap.values());
  }, [groups, preExistingGroups]);

  const selectedLecturers = useMemo(
    () => allLecturers.filter((lecturer) => formData.lecturer_ids.includes(lecturer.id)),
    [allLecturers, formData.lecturer_ids]
  );

  const selectedGroups = useMemo(
    () => allGroups.filter((group) => formData.group_ids.includes(group.id)),
    [allGroups, formData.group_ids]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-labelledby="add-defense-modal-title"
        aria-modal="true"
        tabIndex={-1}
        ref={modalRef}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id="add-defense-modal-title" className="text-xl font-bold text-blue-600">
              {isEditMode ? `Sửa Hội đồng bảo vệ (Mã: ${defense.defense_code})` : 'Thêm Hội đồng bảo vệ'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Đóng modal"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Tên Hội đồng bảo vệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên hội đồng bảo vệ"
                  aria-required="true"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                />
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Khối thời gian <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {timeBlocks.map((block) => {
                    const key = `${block.start}-${block.end}`;
                    const isAvailable = blockAvailability[key];
                    const isSelected = formData.start_time === block.start && formData.end_time === block.end;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => handleSelectBlock(block)}
                        disabled={!formData.date || !formData.lecturer_ids.length || !formData.group_ids.length || !isAvailable || availabilityLoading}
                        className={`p-3 border rounded text-sm font-medium text-center
                          ${isSelected ? 'bg-blue-600 text-white border-blue-600' : isAvailable ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'}
                          ${availabilityLoading || !formData.date || !formData.lecturer_ids.length || !formData.group_ids.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                        whileHover={{ scale: isAvailable && !availabilityLoading && formData.date && formData.lecturer_ids.length && formData.group_ids.length ? 1.05 : 1 }}
                        whileTap={{ scale: isAvailable && !availabilityLoading && formData.date && formData.lecturer_ids.length && formData.group_ids.length ? 0.95 : 1 }}
                        aria-label={`Chọn khối thời gian ${block.start} - ${block.end}`}
                        aria-disabled={!formData.date || !formData.lecturer_ids.length || !formData.group_ids.length || !isAvailable || availabilityLoading}
                      >
                        {block.start} - {block.end}
                        {isAvailable === false && <span className="block text-xs">Không khả dụng</span>}
                      </motion.button>
                    );
                  })}
                </div>
                {!formData.date && <p className="text-gray-500 text-sm mt-1">Vui lòng chọn ngày trước</p>}
                {!formData.lecturer_ids.length && <p className="text-gray-500 text-sm mt-1">Vui lòng chọn ít nhất một giảng viên trước</p>}
                {!formData.group_ids.length && <p className="text-gray-500 text-sm mt-1">Vui lòng chọn ít nhất một nhóm trước</p>}
                {errors.time_block && <p className="text-red-600 text-sm mt-1">{errors.time_block}</p>}
                {availabilityLoading && <p className="text-gray-500 text-sm mt-1">Đang kiểm tra thời gian...</p>}
              </div>
              <div className="relative">
                <label htmlFor="search_groups" className="block text-sm font-medium text-gray-700">
                  Tìm kiếm Nhóm <span className="text-red-500">*</span>
                </label>
                <input
                  id="search_groups"
                  type="text"
                  value={groupSearchQuery}
                  onChange={handleGroupSearchChange}
                  onFocus={() => setIsGroupDropdownOpen(true)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm theo tên hoặc mã nhóm"
                  ref={groupSearchInputRef}
                  aria-required="true"
                />
                <AnimatePresence>
                  {isGroupDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto"
                      ref={groupDropdownRef}
                    >
                      {groupsLoading ? (
                        <p className="p-4 text-sm text-gray-500">Đang tải nhóm...</p>
                      ) : allGroups.length > 0 ? (
                        allGroups.map((group) => (
                          <motion.div
                            key={group.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-3 flex justify-between items-center hover:bg-blue-50 cursor-pointer ${formData.group_ids.includes(group.id) ? 'bg-blue-100' : ''}`}
                            onClick={() => handleGroupToggle(group.id)}
                          >
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-sm text-gray-500">{group.group_code || 'N/A'}</p>
                            </div>
                            {formData.group_ids.includes(group.id) ? (
                              <FaTrash className="text-red-500" />
                            ) : (
                              <FaPlus
                                className={`text-blue-500 ${formData.group_ids.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-gray-500">Không tìm thấy nhóm.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {errors.group_ids && <p className="text-red-600 text-sm mt-1">{errors.group_ids}</p>}
              </div>
              {selectedGroups.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Nhóm đã chọn ({selectedGroups.length}/3):
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {selectedGroups.map((group) => (
                        <motion.div
                          key={group.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm flex items-center"
                        >
                          {group.group_code} - {group.name}
                          <button
                            type="button"
                            onClick={() => handleGroupToggle(group.id)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <FaTrash size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
              <div className="relative">
                <label htmlFor="search_lecturers" className="block text-sm font-medium text-gray-700">
                  Tìm kiếm Giảng viên <span className="text-red-500">*</span>
                </label>
                <input
                  id="search_lecturers"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm theo tên hoặc mã giảng viên"
                  ref={searchInputRef}
                  aria-required="true"
                />
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto"
                      ref={dropdownRef}
                    >
                      {lecturersLoading || lecturerDefensesLoading ? (
                        <p className="p-4 text-sm text-gray-500">Đang tải giảng viên...</p>
                      ) : allLecturers.length > 0 ? (
                        allLecturers.map((lecturer) => (
                          <motion.div
                            key={lecturer.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-3 flex justify-between items-center hover:bg-blue-50 cursor-pointer ${formData.lecturer_ids.includes(lecturer.id) ? 'bg-blue-100' : ''}`}
                            onClick={() => handleLecturerToggle(lecturer.id)}
                          >
                            <div>
                              <p className="font-medium">{lecturer.name}</p>
                              <p className="text-sm text-gray-500">{lecturer.lecturer_code || 'N/A'}</p>
                              {lecturerDefenses.find((ld) => ld.lecturer_id === lecturer.id)?.group && (
                                <p className="text-sm text-gray-500">
                                  Nhóm: {lecturerDefenses.find((ld) => ld.lecturer_id === lecturer.id).group.group_code} - {lecturerDefenses.find((ld) => ld.lecturer_id === lecturer.id).group.name}
                                </p>
                              )}
                            </div>
                            {formData.lecturer_ids.includes(lecturer.id) ? (
                              <FaTrash className="text-red-500" />
                            ) : (
                              <FaPlus
                                className={`text-blue-500 ${formData.lecturer_ids.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-gray-500">Không tìm thấy giảng viên.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {errors.lecturer_ids && <p className="text-red-600 text-sm mt-1">{errors.lecturer_ids}</p>}
              </div>
              {selectedLecturers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Giảng viên đã chọn ({selectedLecturers.length}/3):
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {selectedLecturers.map((lecturer) => (
                        <motion.div
                          key={lecturer.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm flex items-center"
                        >
                          {lecturer.name} {lecturer.lecturer_code && `(${lecturer.lecturer_code})`}
                          <button
                            type="button"
                            onClick={() => handleLecturerToggle(lecturer.id)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <FaTrash size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
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
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(errors.general || lecturerDefensesError || timeCheckError) && (
              <p className="text-red-600 text-sm mt-2">{errors.general || lecturerDefensesError || timeCheckError}</p>
            )}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={timeCheckLoading || availabilityLoading || !formData.date || !formData.start_time || !formData.end_time || !formData.lecturer_ids.length || !formData.group_ids.length}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                aria-label={isEditMode ? 'Cập nhật' : 'Thêm'}
              >
                {isEditMode ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEditDefenseModal;