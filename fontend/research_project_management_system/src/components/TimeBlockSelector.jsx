import React from 'react';
import { motion } from 'framer-motion';

const timeBlocks = [
  { start: '07:00', end: '09:00' },
  { start: '09:30', end: '11:30' },
  { start: '13:00', end: '15:00' },
  { start: '15:30', end: '17:30' },
];

const TimeBlockSelector = ({
  formData,
  blockAvailability,
  availabilityLoading,
  onSelectBlock,
  error
}) => {
  return (
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
              onClick={() => onSelectBlock(block)}
              disabled={!formData.date || !formData.lecturer_ids.length || !isAvailable || availabilityLoading}
              className={`p-3 border rounded text-sm font-medium text-center
                ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 
                  isAvailable ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' : 
                  'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'}
                ${availabilityLoading || !formData.date || !formData.lecturer_ids.length ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: isAvailable && !availabilityLoading && formData.date && formData.lecturer_ids.length ? 1.05 : 1 }}
              whileTap={{ scale: isAvailable && !availabilityLoading && formData.date && formData.lecturer_ids.length ? 0.95 : 1 }}
              aria-label={`Chọn khối thời gian ${block.start} - ${block.end}`}
              aria-disabled={!formData.date || !formData.lecturer_ids.length || !isAvailable || availabilityLoading}
            >
              {block.start} - {block.end}
              {isAvailable === false && <span className="block text-xs">Không khả dụng</span>}
            </motion.button>
          );
        })}
      </div>
      
      {!formData.date && <p className="text-gray-500 text-sm mt-1">Vui lòng chọn ngày trước</p>}
      {!formData.lecturer_ids.length && <p className="text-gray-500 text-sm mt-1">Vui lòng chọn ít nhất một giảng viên trước</p>}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {availabilityLoading && <p className="text-gray-500 text-sm mt-1">Đang kiểm tra thời gian...</p>}
    </div>
  );
};

export default TimeBlockSelector;