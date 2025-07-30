import { useState } from 'react';
import { toast } from 'react-toastify';

const EditPointCommentModal = ({ isOpen, onClose, lecturerDefense, defense, onSubmit }) => {
  const [formData, setFormData] = useState({
    point: lecturerDefense.point ?? '',
    comment: lecturerDefense.comment ?? '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'point' ? (value === '' ? null : Number(value)) : value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.point !== null && (formData.point < 0 || formData.point > 10)) {
      toast.error('Điểm phải nằm trong khoảng từ 0 đến 10');
      return;
    }
    onSubmit(lecturerDefense.id, formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Cập nhật điểm và nhận xét</h2>
        <div className="mb-4">
          <p className="text-gray-700">
            <strong>Buổi bảo vệ:</strong> {defense.name} ({defense.defense_code})
          </p>
          <p className="text-gray-700">
            <strong>Nhóm:</strong> {lecturerDefense.group.name} ({lecturerDefense.group.group_code})
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Điểm (0-10)</label>
            <input
              type="number"
              name="point"
              value={formData.point ?? ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="10"
              step={0.1}
              placeholder="Nhập điểm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nhận xét</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Nhập nhận xét"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPointCommentModal;