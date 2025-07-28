import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash } from 'react-icons/fa';

const LecturerSearch = ({
  searchQuery,
  onSearchChange,
  isDropdownOpen,
  setIsDropdownOpen,
  allLecturers,
  formData,
  onLecturerToggle,
  lecturersLoading,
  lecturerDefensesLoading,
  error
}) => {
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsDropdownOpen]);
  return (
    <div className="relative">
      <label htmlFor="search_lecturers" className="block text-sm font-medium text-gray-700">
        Tìm kiếm Giảng viên <span className="text-red-500">*</span>
      </label>
      <input
        id="search_lecturers"
        type="text"
        value={searchQuery}
        onChange={onSearchChange}
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
                  className={`p-3 flex justify-between items-center hover:bg-blue-50 cursor-pointer ${formData.lecturer_ids.includes(lecturer.id) ? 'bg-blue-100' : ''
                    }`}
                  onClick={() => onLecturerToggle(lecturer.id)}
                >
                  <div>
                    <p className="font-medium">{lecturer.name}</p>
                    <p className="text-sm text-gray-500">{lecturer.lecturer_code || 'N/A'}</p>
                  </div>
                  {formData.lecturer_ids.includes(lecturer.id) ? (
                    <FaTrash className="text-red-500" />
                  ) : (
                    <FaPlus
                      className={`text-blue-500 ${formData.lecturer_ids.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
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

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default LecturerSearch;