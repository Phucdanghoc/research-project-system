import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404 - Trang Không Tìm Thấy</h1>
        <p className="text-gray-600 mb-6">Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
        >
          Quay Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;