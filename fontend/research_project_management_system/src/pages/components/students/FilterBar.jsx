import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const FilterBar = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ searchTerm: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex flex-row items-center flex-1">
        <span className="text-xl rounded-lg bg-blue-200 p-4 font-medium text-gray-700 mr-3 whitespace-nowrap">
          <FaSearch  color='#3b82f6'/>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Nhập từ khóa tìm kiếm..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-gray-50 text-gray-800"
        />
      </div>
    </div>
  );
};

export default FilterBar;
