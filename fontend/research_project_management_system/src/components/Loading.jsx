import { FaSpinner } from 'react-icons/fa';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <FaSpinner className="text-4xl text-blue-500 animate-spin" />
        <p className="text-gray-600 text-lg">Đang tải...</p>
      </div>
    </div>
  );
};

export default Loading;