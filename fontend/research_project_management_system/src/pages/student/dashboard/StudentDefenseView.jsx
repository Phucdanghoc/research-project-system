import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { fetchDefensesAsync } from '../../../store/slices/defensesSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const StudentDefenseView = () => {
  const dispatch = useAppDispatch();
  const { defenses, loading, error } = useSelector((state) => state.defenses || { 
    defenses: [], loading: false, error: null 
  });

  const [defenseData, setDefenseData] = useState(null);

  useEffect(() => {
    dispatch(fetchDefensesAsync({ page: 1, per_page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (defenses && defenses.length > 0) {
      setDefenseData(defenses[0]);
    }
  }, [defenses]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (!defenseData) {
    return <div className="text-center text-gray-600">Không có thông tin buổi bảo vệ.</div>;
  }

  const { name, defense_code, start_time, end_time, date, groups, lecturer_defenses, status } = defenseData;
  const group = groups[0] || {};
  const { lecturer, students, description } = group;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thông tin buổi bảo vệ</h1>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Row 1: Defense Overview Card */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{name} ({defense_code})</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {status === 'waiting' ? 'Đang chờ' : status === 'approved' ? 'Đã duyệt' : 'Đã hủy'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Ngày:</span> {moment(date).format('DD/MM/YYYY')}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Thời gian:</span>{' '}
                  <span className="text-blue-600 font-semibold">
                    {moment(start_time).format('HH:mm')} - {moment(end_time).format('HH:mm')}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Nhóm:</span> {group.name} ({group.group_code})
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Giảng viên hướng dẫn:</span> {lecturer?.name} ({lecturer?.lecturer_code})
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Sinh viên:</span>{' '}
                  {students?.map((student) => student.name).join(', ')}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Mô tả:</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: description }} />
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Lecturer Defenses List */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Điểm và nhận xét từ giảng viên</h3>
            {lecturer_defenses && lecturer_defenses.length > 0 ? (
              <div className="space-y-4">
                {lecturer_defenses.map((lecDefense) => (
                  <div
                    key={lecDefense.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-800 font-medium">
                          {lecDefense.lecturer.name} ({lecDefense.lecturer.email})
                        </p>
                        <p className="text-gray-600 text-sm">{lecDefense.comment}</p>
                      </div>
                      <span className="text-blue-600 font-semibold text-lg">
                        {lecDefense.point ? `${lecDefense.point}/10` : 'Chưa chấm'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Chưa có điểm hoặc nhận xét từ giảng viên.</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentDefenseView;