import { useState } from 'react';
import { useAppDispatch } from '../store/index';
import { importStudentsFromExcel } from '../store/slices/studentSlice';
import { toast } from 'react-toastify';
import Papa from 'papaparse';

const ImportCsvModal = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
            Papa.parse(selectedFile, {
                header: true,
                preview: 5,
                complete: (result) => {
                    setPreviewData(result.data);
                },
                error: (err) => {
                    setError('Lỗi khi đọc file CSV. Vui lòng kiểm tra định dạng file.');
                },
            });
        } else {
            setError('Vui lòng chọn file CSV hợp lệ.');
            setFile(null);
            setPreviewData([]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Vui lòng chọn file để nhập.');
            return;
        }

        try {
            await dispatch(importStudentsFromExcel(file)).unwrap();
            toast.success('Nhập sinh viên từ CSV thành công!');
            onClose();
            setFile(null);
            setPreviewData([]);
        } catch (error) {
            toast.error('Nhập sinh viên từ CSV thất bại!');
            setError('Có lỗi khi nhập dữ liệu. Vui lòng thử lại.');
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
                <h2 className="text-xl font-bold text-blue-600 mb-4">Nhập dữ liệu từ CSV</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn file CSV
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                </div>

                {previewData.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Xem trước dữ liệu</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr>
                                        {Object.keys(previewData[0]).map((key) => (
                                            <th key={key} className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            {Object.values(row).map((value, i) => (
                                                <td key={i} className="px-4 py-2 border-b text-sm text-gray-700">
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {previewData.length === 5 && (
                            <p className="text-sm text-gray-500 mt-2">Hiển thị 5 hàng đầu tiên. File có thể chứa thêm dữ liệu.</p>
                        )}
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file}
                        className={`px-4 py-2 rounded transition-colors ${file
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Nhập dữ liệu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportCsvModal;