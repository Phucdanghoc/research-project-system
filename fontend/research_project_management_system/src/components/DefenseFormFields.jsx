import React from 'react';

const statusOptions = [
  { value: 'waiting', label: 'Chờ bảo vệ' },
  { value: 'done', label: 'Đã bảo vệ xong' },
];

const DefenseFormFields = ({ formData, errors, onChange }) => {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Tên Hội đồng bảo vệ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
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
          onChange={onChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          aria-required="true"
        />
        {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Trạng Thái
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={onChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default DefenseFormFields;