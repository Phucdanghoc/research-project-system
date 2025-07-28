import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/index';
import { getLecturerDefenseByIdAsync } from '../store/slices/lecturerDefenseSlice';
import { checkDefenseTimeAsync, addDefenseAsync, updateDefenseAsync } from '../store/slices/defensesSlice';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'react-toastify';
import { fetchLecturersAsync } from '../store/slices/lecturerSlice';

const timeBlocks = [
  { start: '07:00', end: '09:00' },
  { start: '09:30', end: '11:30' },
  { start: '13:00', end: '15:00' },
  { start: '15:30', end: '17:30' },
];

const toUTCISOPlus7 = (localDateTime) => {
  if (!localDateTime) return '';
  const date = new Date(localDateTime);
  const offset = 7 * 60; // +7 hours in minutes
  const utcDate = new Date(date.getTime() + offset * 60 * 1000);
  return utcDate.toISOString();
};

export const useDefenseModal = (isOpen, defense, onClose, onSubmit) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading: lecturersLoading } = useSelector((state) => state.lecturers);
  const { lecturerDefenses, loading: lecturerDefensesLoading, error: lecturerDefensesError } = useSelector(
    (state) => state.lecturerDefenses
  );
  const { loading: timeCheckLoading, error: timeCheckError } = useSelector((state) => state.defenses);
  
  const isEditMode = !!defense?.id;

  const [formData, setFormData] = useState({
    name: defense?.name || '',
    date: defense?.date || '',
    start_time: defense?.start_time || '',
    end_time: defense?.end_time || '',
    lecturer_ids: defense?.lecturer_ids || [],
    status: defense?.status || 'waiting',
  });

  const [errors, setErrors] = useState({
    name: '',
    date: '',
    time_block: '',
    lecturer_ids: '',
    general: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [preExistingLecturers, setPreExistingLecturers] = useState([]);
  const [blockAvailability, setBlockAvailability] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    if (isOpen && defense?.id) {
      dispatch(getLecturerDefenseByIdAsync(defense.id))
        .unwrap()
        .then((data) => {
          const lecturerIds = data.map((item) => item.lecturer_id);
          const lecturersData = data.map((item) => ({
            id: item.lecturer_id,
            name: item.lecturer.name,
            lecturer_code: item.lecturer.email,
          }));
          setFormData((prev) => ({ ...prev, lecturer_ids: lecturerIds }));
          setPreExistingLecturers(lecturersData);
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            general: error.message || 'Không thể tải danh sách giảng viên hiện tại',
          }));
        });
    }
  }, [isOpen, defense?.id, dispatch]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.date || formData.lecturer_ids.length === 0) {
        setBlockAvailability({});
        return;
      }

      setAvailabilityLoading(true);
      const availability = {};

      for (const block of timeBlocks) {
        try {
          const result = await dispatch(
            checkDefenseTimeAsync({
              lecturer_id: formData.lecturer_ids,
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
  }, [formData.date, formData.lecturer_ids, dispatch]);

  const debouncedSearch = useDebouncedCallback((query) => {
    dispatch(
      fetchLecturersAsync({
        page: 1,
        per_page: 10,
        keyword: query,
        def_id: defense?.id,
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
      general: '',
    };
    if (formData.lecturer_ids.length > 3) {
      newErrors.lecturer_ids = 'Chỉ được chọn tối đa 3 giảng viên';
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
        start_time: toUTCISOPlus7(`${formData.date}T${formData.start_time}`),
        end_time: toUTCISOPlus7(`${formData.date}T${formData.end_time}`),
        lecturer_ids: formData.lecturer_ids,
        status: formData.status,
      };

      const action = isEditMode
        ? updateDefenseAsync({ id: defense.id, ...defenseData })
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
            status: 'waiting',
          });
          setSearchQuery('');
          setIsDropdownOpen(false);
          setPreExistingLecturers([]);
          setBlockAvailability({});
          onClose();
          onSubmit?.();
        })
        .catch((error) => {
          setErrors((prev) => ({
            ...prev,
            general: error.message || (isEditMode ? 'Cập nhật hội đồng bảo vệ thất bại' : 'Tạo hội đồng bảo vệ thất bại'),
          }));
          toast.error(error.message || (isEditMode ? 'Cập nhật hội đồng bảo vệ thất bại' : 'Tạo hội đồng bảo vệ thất bại'));
        });
    },
    [dispatch, formData, onClose, onSubmit, defense?.id, isEditMode, validateForm]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

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

  const selectedLecturers = useMemo(
    () => allLecturers.filter((lecturer) => formData.lecturer_ids.includes(lecturer.id)),
    [allLecturers, formData.lecturer_ids]
  );

  return {
    formData,
    errors,
    searchQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    blockAvailability,
    availabilityLoading,
    allLecturers,
    selectedLecturers,
    isEditMode,
    lecturersLoading,
    lecturerDefensesLoading,
    lecturerDefensesError,
    timeCheckLoading,
    timeCheckError,
    handleChange,
    handleLecturerToggle,
    handleSelectBlock,
    handleSubmit,
    handleSearchChange,
  };
};