// ErrorPopup.jsx
import React from 'react';

const ErrorPopup = ({ errors, onClose }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white max-w-4xl w-full rounded-lg shadow-lg p-6 overflow-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">Lỗi khi nhập dữ liệu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Tên</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">MSSV</th>
                <th className="border px-4 py-2">Lớp</th>
                <th className="border px-4 py-2">Lỗi</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((err, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{err.row.name}</td>
                  <td className="border px-4 py-2">{err.row.email}</td>
                  <td className="border px-4 py-2">{err.row.student_code}</td>
                  <td className="border px-4 py-2">{err.row.class_name}</td>
                  <td className="border px-4 py-2 text-red-600">{err.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
