import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { getMyDefensesAsync } from '../../../store/slices/defensesSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

// Predefined color palette for random student name backgrounds
const colorPalette = [
  'bg-blue-200 text-blue-800',
  'bg-green-200 text-green-800',
  'bg-purple-200 text-purple-800',
  'bg-pink-200 text-pink-800',
  'bg-yellow-200 text-yellow-800',
];

const getRandomColor = () => {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
};

const StudentDefenseView = () => {
  const dispatch = useAppDispatch();
  const { defenses, loading, error } = useSelector((state) => state.defenses || {
    defenses: [], loading: false, error: null
  });

  const [defenseData, setDefenseData] = useState(null);

  useEffect(() => {
    dispatch(getMyDefensesAsync({ page: 1, per_page: 1 }));
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
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <div className="flex flex-wrap gap-2 mt-1">
                    {students?.map((student) => (
                      <span
                        key={student.id}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRandomColor()}`}
                      >
                        {student.name}
                      </span>
                    ))}
                  </div>
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-600">
                <span className="font-medium">Mô tả:</span>{' '}
                <span dangerouslySetInnerHTML={{ __html: description }} />
              </p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">
              Điểm và nhận xét từ giảng viên
            </h3>

            {lecturer_defenses && lecturer_defenses.length > 0 ? (
              <ul className=" space-y-4">
                {lecturer_defenses.map((lecDefense) => (
                  <li
                    key={lecDefense.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-sm transition !list-none"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {lecDefense.lecturer.name}
                          <span className="text-sm text-gray-500"> ({lecDefense.lecturer.email})</span>
                        </p>
                        {lecDefense.comment && (
                          <p className="mt-2 text-gray-700 italic">“{lecDefense.comment}”</p>
                        )}
                      </div>

                      <div className="text-right md:text-center">
                        <span className={`inline-block text-lg font-bold ${lecDefense.point ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                          {lecDefense.point ? `${lecDefense.point}/10` : 'Chưa chấm'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Chưa có điểm hoặc nhận xét từ giảng viên.</p>
            )}
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentDefenseView;