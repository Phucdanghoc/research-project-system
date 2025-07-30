import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchLecturerDefensesAsync,
  updateLecturerDefenseAsync,
} from '../../../store/slices/lecturerDefenseSlice';
import { toast } from 'react-toastify';
import { FaEdit, FaSave } from 'react-icons/fa';

const LecturerPointEditor = () => {
  const dispatch = useAppDispatch();
  const { lecturerDefenses, loading, error } = useAppSelector((state) => state.lecturerDefenses);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ point: null, comment: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const per_page = 10;

  useEffect(() => {
    // Fetch lecturer defenses for the current lecturer
    dispatch(fetchLecturerDefensesAsync({ page: currentPage, per_page }));
  }, [currentPage, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEditClick = (lecturerDefense) => {
    setEditingId(lecturerDefense.id);
    setFormData({
      point: lecturerDefense.point ?? '',
      comment: lecturerDefense.comment ?? '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'point' ? (value === '' ? null : Number(value)) : value,
    }));
  };

  const handleSave = (id) => {
    if (formData.point !== null && (formData.point < 0 || formData.point > 10)) {
      toast.error('Điểm phải nằm trong khoảng từ 0 đến 10');
      return;
    }
    dispatch(updateLecturerDefenseAsync({ id, lecturer_defense: formData }))
      .then(() => {
        toast.success('Cập nhật điểm và nhận xét thành công');
        setEditingId(null);
        setFormData({ point: null, comment: '' });
      })
      .catch(() => {
        toast.error('Có lỗi xảy ra khi cập nhật');
      });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ point: null, comment: '' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cập nhật điểm và nhận xét</h1>
      {loading ? (
        <p className="text-center text-gray-600">Đang tải...</p>
      ) : (
        <div>
          <table className="w-full bg-white shadow-md rounded-lg text-center">
            <thead>
              <tr className="bg-blue-400 text-white">
                <th className="py-2 px-4">Mã buổi bảo vệ</th>
                <th className="py-2 px-4">Tên buổi bảo vệ</th>
                <th className="py-2 px-4">Điểm</th>
                <th className="py-2 px-4">Nhận xét</th>
                <th className="py-2 px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {lecturerDefenses.length > 0 ? (
                lecturerDefenses.map((ld) => (
                  <tr key={ld.id} className="hover:bg-blue-100">
                    <td className="py-2 px-4 border-b">{ld.defense.defense_code || '-'}</td>
                    <td className="py-2 px-4 border-b font-bold">{ld.defense.name}</td>
                    <td className="py-2 px-4 border-b">
                      {editingId === ld.id ? (
                        <input
                          type="number"
                          name="point"
                          value={formData.point ?? ''}
                          onChange={handleInputChange}
                          className="w-20 p-1 border rounded"
                          min="0"
                          max="10"
                          placeholder="0-10"
                        />
                      ) : (
                        ld.point ?? '-'
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === ld.id ? (
                        <textarea
                          name="comment"
                          value={formData.comment}
                          onChange={handleInputChange}
                          className="w-full p-1 border rounded"
                          rows="3"
                        />
                      ) : (
                        ld.comment || '-'
                      )}
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      {editingId === ld.id ? (
                        <>
                          <button
                            onClick={() => handleSave(ld.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Lưu"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-800"
                            title="Hủy"
                          >
                            <FaEdit />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditClick(ld)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-600">
                    Không tìm thấy liên kết giảng viên-buổi bảo vệ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LecturerPointEditor;