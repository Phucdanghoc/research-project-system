import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';

const SelectedLecturers = ({ selectedLecturers, onLecturerToggle }) => {
  if (selectedLecturers.length === 0) return null;

  return (
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
                onClick={() => onLecturerToggle(lecturer.id)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                <FaTrash size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SelectedLecturers;