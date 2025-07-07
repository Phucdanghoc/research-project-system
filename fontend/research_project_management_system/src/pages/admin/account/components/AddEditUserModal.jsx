const AddEditUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  isEdit = false,
  fields,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-3xl shadow-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">
          {isEdit ? 'Sửa sinh viên' : 'Thêm sinh viên'}
        </h2>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={onInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="col-span-2 flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Lưu' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditUserModal;