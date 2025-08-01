import React, { useState, useEffect } from 'react';

const defStatusOptions = [
  { value: '', label: 'Tất cả trạng thái bảo vệ' },
  { value: 'not_defended', label: 'Chưa bảo vệ' },
  { value: 'waiting_defense', label: 'Chờ bảo vệ' },
  { value: 'approved', label: 'Đã đạt' },
  { value: 'rejected', label: 'Không đạt' },
];

const FilterStatusDefBar = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [defStatus, setDefStatus] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange({ searchTerm, def_status: defStatus });
    }, 300); 

    return () => clearTimeout(timeout);
  }, [searchTerm, defStatus, onFilterChange]);

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
      <input
        type="text"
        placeholder="Tìm kiếm nhóm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full sm:flex-1"
      />
      <select
        value={defStatus}
        onChange={(e) => setDefStatus(e.target.value)}
        className="border p-2 rounded w-full sm:w-64"
      >
        {defStatusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterStatusDefBar;
