import { useState, useEffect } from 'react';
import { FaProjectDiagram, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStudents: 0,
    pendingReviews: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalProjects: 45,
        totalStudents: 120,
        pendingReviews: 8,
        completedProjects: 30,
      });
    }, 1000);
  }, []);

  const recentActivities = [
    { id: 1, description: 'Dự án "Nhà thông minh" được nộp bởi Nhóm A', time: '2 giờ trước' },
    { id: 2, description: 'Dự án "Chatbot AI" đã được phê duyệt', time: '4 giờ trước' },
    { id: 3, description: 'Bình luận mới trên dự án "Cảm biến IoT"', time: 'Hôm qua' },
  ];

  return (
    <div className="space-y-6">
      {/* Tiêu đề chào mừng */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Bảng Điều Khiển Quản Trị</h1>
        <p className="text-gray-600 mt-1">Chào mừng đến với Hệ thống Quản lý Dự án Học sinh</p>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaProjectDiagram className="text-3xl text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tổng số Dự án</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaUsers className="text-3xl text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tổng số Học sinh</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaClock className="text-3xl text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Dự án Chờ Xét duyệt</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaCheckCircle className="text-3xl text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Dự án Hoàn thành</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
          </div>
        </div>
      </div>

      {/* Hoạt động gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hoạt động Gần đây</h2>
        <ul className="space-y-4">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between">
              <span className="text-gray-700">{activity.description}</span>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManagerDashboard;