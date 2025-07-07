import { FaUserCircle } from "react-icons/fa";
import { FacultyMajors } from "../../types/enum";

export const StudentCard = ({ student }) => (
    <div key={student.id} className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-3 hover:shadow-lg transition-shadow duration-200">
        <div className="flex-shrink-0">
            <FaUserCircle className="text-blue-400" size={48} />
        </div>
        <div className="ml-4 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-base font-bold text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-500">
                        Mã SV: <span className="font-semibold text-blue-700">{student.student_code}</span>
                    </div>
                </div>
                <div className="mt-2 sm:mt-0">
                    <span className="inline-block bg-green-100 text-green-600 text-xs px-3 py-1 rounded-2xl mr-2 shadow-sm">
                        {student.class_name || 'Không có'}
                    </span>
                    <span className="inline-block bg-green-100 text-green-600 text-xs px-3 py-1 rounded-2xl shadow-sm">
                        {FacultyMajors[student.faculty].name || 'Không có'}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-3 text-sm">
                <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="text-gray-700">{student.email || 'Không có'}</span>
                </p>
                <p>
                    <span className="text-gray-500">Giới tính:</span>{" "}
                    <span className="text-gray-700">{student.gender === 'Male' ? 'Nam' : 'Nữ' || 'Không có'}</span>
                </p>
                <p>
                    <span className="text-gray-500">SĐT:</span>{" "}
                    <span className="text-gray-700">{student.phone || 'Không có'}</span>
                </p>
                <p>
                    <span className="text-gray-500">Nghành:</span>{" "}
                    <span className="text-gray-700">
                        {FacultyMajors[student.faculty]?.majors.find((m) => m.code === student.major)?.name || 'Không có'}

                    </span>
                </p>
                <p>
                    <span className="text-gray-500">Ngày sinh:</span>{" "}
                    <span className="text-gray-700">
                        {student.birth ? TimeService.convertDateStringToDDMMYYYY(student.birth) : 'Không có'}
                    </span>
                </p>
            </div>
        </div>
    </div>
);