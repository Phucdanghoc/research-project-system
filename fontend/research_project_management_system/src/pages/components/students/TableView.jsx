import { FaEye } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { FacultyMajors } from '../../../types/enum';

const TableView = ({ students, onViewStudent }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg text-center">
                <thead>
                    <tr className="bg-blue-400 text-white">
                        <th className="py-2 px-4">Mã sinh viên</th>
                        <th className="py-2 px-4">Tên sinh viên</th>
                        <th className="py-2 px-4">Email</th>
                        <th className="py-2 px-4">Khoa</th>
                        <th className="py-2 px-4">Chuyên ngành</th>
                        {/* <th className="py-2 px-4">Giảng viên hướng dẫn</th> */}
                        <th className="py-2 px-4">Ngày tạo</th>
                        <th className="py-2 px-4">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student.id} className="hover:bg-blue-100">
                                <td className="py-2 px-4 border-b">{student.student_code}</td>
                                <td className="py-2 px-4 border-b font-bold">{student.name}</td>
                                <td className="py-2 px-4 border-b">{student.email}</td>
                                <td className="py-2 px-4 border-b">
                                    {FacultyMajors[student.faculty]?.name || '-'}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {
                                        FacultyMajors[student.faculty]?.majors.find(
                                            (m) => m.code === student.major
                                        )?.name || '-'
                                    }
                                </td>

                                {/* <td className="py-2 px-4 border-b">{student.lecturer_name || '-'}</td> */}
                                <td className="py-2 px-4 border-b">{TimeService.convertDateStringToDDMMYYYY(student.created_at)}</td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => onViewStudent(student)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Xem chi tiết"
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="py-4 text-center text-gray-600">
                                Không tìm thấy sinh viên nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableView;