import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import TimeBlockSelector from '../../../components/TimeBlockSelector';
import LecturerSearch from '../../../components/LecturerSearch';
import SelectedLecturers from '../../../components/SelectedLecturers';
import DefenseFormFields from '../../../components/DefenseFormFields';
import { useDefenseModal } from '../../../hooks/useDefenseModal';

const AddDefenseModal = ({ isOpen, onClose, onSubmit, defense }) => {
  const modalRef = useRef(null);
  
  const {
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
  } = useDefenseModal(isOpen, defense, onClose, onSubmit);

  // Focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

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
              <DefenseFormFields
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />

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
                allLecturers={allLecturers}
                formData={formData}
                onLecturerToggle={handleLecturerToggle}
                lecturersLoading={lecturersLoading}
                lecturerDefensesLoading={lecturerDefensesLoading}
                error={errors.lecturer_ids}
              />

              <SelectedLecturers
                selectedLecturers={selectedLecturers}
                onLecturerToggle={handleLecturerToggle}
              />
            </div>

            {(errors.general || lecturerDefensesError || timeCheckError) && (
              <p className="text-red-600 text-sm mt-2">
                {errors.general || lecturerDefensesError || timeCheckError}
              </p>
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

export default AddDefenseModal;