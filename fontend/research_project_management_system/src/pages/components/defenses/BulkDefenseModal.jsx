import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { addDefenseAsync, checkDefenseTimeAsync } from '../../../store/slices/defensesSlice';
import { searchLecturersAsync } from '../../../store/slices/lecturerSlice';
import { toast } from 'react-toastify';
import { useDebouncedCallback } from 'use-debounce';
import TimeBlockSelector from '../../../components/TimeBlockSelector';
import LecturerSearch from '../../../components/LecturerSearch';
import SelectedLecturers from '../../../components/SelectedLecturers';

// Predefined time blocks
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

const BulkDefenseModal = ({ isOpen, onClose, selectedGroupIds, groups }) => {
  const dispatch = useAppDispatch();
  const { lecturers, loading: lecturersLoading } = useSelector((state) => state.lecturers);
  const { loading: timeCheckLoading, error: timeCheckError } = useSelector((state) => state.defenses);

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    lecturer_ids: [],
  });
  const [errors, setErrors] = useState({
    date: '',
    time_block: '',
    lecturer_ids: '',
    general: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [blockAvailability, setBlockAvailability] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  const selectedGroups = groups.filter(group => selectedGroupIds.includes(group.id));
  console.log(`Selected groups: ${JSON.stringify(selectedGroups)}`);
  
  const currentFaculty = selectedGroups.length > 0 && selectedGroups[0].lecturer ? selectedGroups[0].lecturer.faculty : null;
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
              lecturer_id: formData.lecturer_ids[0],
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

  // Handle clicks outside to close dropdown
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const debouncedSearch = useDebouncedCallback((query) => {
    console.log(`Factulty: ${currentFaculty}, Query: ${query}`);
    
    dispatch(
      searchLecturersAsync({
        page: 1,
        per_page: 10,
        keyword: query,
        faculty: currentFaculty,
      })
    );
  }, 300);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSelectBlock = useCallback((block) => {
    const key = `${block.start}-${block.end}`;
    if (blockAvailability[key]) {
      setFormData((prev) => ({
        ...prev,
        start_time: block.start,
        end_time: block.end,
      }));
      setErrors((prev) => ({ ...prev, time_block: '' }));
    }
  }, [blockAvailability]);

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

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const validateForm = useCallback(() => {
    const newErrors = {
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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.info('Vui lòng điền đầy đủ và đúng các trường bắt buộc.');
      return;
    }

    try {
      const defenseData = {
        name: formData.name,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        lecturer_ids: formData.lecturer_ids,
        status: 'waiting',
        group_ids: selectedGroups.map((g) => g.id), 
      };

      dispatch(addDefenseAsync(defenseData))
        .unwrap()
        .then((res) => console.log('Success:', res))
        .catch((err) => console.error('Error:', err));



      toast.success(`Tạo thành công ${selectedGroups.length} hội đồng bảo vệ`);

      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        lecturer_ids: [],
      });
      setSearchQuery('');
      setIsDropdownOpen(false);
      setBlockAvailability({});
      onClose();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || 'Tạo hội đồng bảo vệ thất bại',
      }));
      toast.error(error.message || 'Tạo hội đồng bảo vệ thất bại');
    }
  }, [dispatch, formData, selectedGroups, onClose, validateForm]);

  const selectedLecturers = lecturers.filter((lecturer) => formData.lecturer_ids.includes(lecturer.id));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-labelledby="bulk-defense-modal-title"
        aria-modal="true"
        tabIndex={-1}
        ref={modalRef}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id="bulk-defense-modal-title" className="text-xl font-bold text-blue-600">
              Tạo hội đồng bảo vệ cho {selectedGroups.length} nhóm
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Đóng modal"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Nhóm được chọn ({selectedGroups.length}):
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {selectedGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-100 text-blue-800 px-3 py-1 w-fit rounded text-sm"
                >
                  {group.group_code} - {group.name}
                </motion.div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Ngày bảo vệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  min={new Date().toISOString().split('T')[0]} 
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                />
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
              </div>

              <TimeBlockSelector
                formData={formData}
                blockAvailability={blockAvailability}
                availabilityLoading={availabilityLoading}
                onSelectBlock={handleSelectBlock}
                error={errors.time_block}
              />

              <LecturerSearch
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                allLecturers={lecturers}
                formData={formData}
                onLecturerToggle={handleLecturerToggle}
                lecturersLoading={lecturersLoading}
                lecturerDefensesLoading={false}
                error={errors.lecturer_ids}
                searchInputRef={searchInputRef}
                dropdownRef={dropdownRef}
              />

              <SelectedLecturers
                selectedLecturers={selectedLecturers}
                onLecturerToggle={handleLecturerToggle}
              />
            </div>

            {(errors.general || timeCheckError) && (
              <p className="text-red-600 text-sm mt-2">{errors.general || timeCheckError}</p>
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
                disabled={timeCheckLoading || availabilityLoading || !formData.date || !formData.start_time || !formData.end_time || !formData.lecturer_ids.length}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                aria-label={`Tạo ${selectedGroups.length} hội đồng bảo vệ`}
              >
                {timeCheckLoading || availabilityLoading ? 'Đang tạo...' : `Tạo ${selectedGroups.length} hội đồng bảo vệ`}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkDefenseModal;