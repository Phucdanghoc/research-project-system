import { FaUserCircle } from "react-icons/fa";
import { FacultyMajors } from "../../types/enum";
import { TimeService } from "../../utils/time";

export const StudentCard = ({ student }) => (
  <div
    key={student.id}
    className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 w-full sm:w-[320px] h-auto flex flex-col items-center text-sm hover:shadow-md transition"
  >
    <FaUserCircle className="text-blue-400 mb-2" size={40} />

    <div className="text-center mb-2">
      <div className="font-semibold text-gray-800">{student.name}</div>
      <div className="text-gray-500 text-xs">
        Mã SV: <span className="text-blue-600 font-medium">{student.student_code}</span>
      </div>
    </div>

    <div className="flex flex-wrap justify-center gap-1 mb-2">
      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
        {student.class_name || 'Không có'}
      </span>
      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
        {FacultyMajors[student.faculty]?.name || 'Không có'}
      </span>
    </div>

    <div className="grid grid-cols-1 gap-1 w-full">
      <Info label="Email" value={student.email} />
      <Info
        label="Giới tính"
        value={student.gender === 'Male' ? 'Nam' : student.gender === 'Female' ? 'Nữ' : 'Không có'}
      />
      <Info label="SĐT" value={student.phone} />
      <Info
        label="Ngành"
        value={
          FacultyMajors[student.faculty]?.majors.find((m) => m.code === student.major)?.name
        }
      />
      <Info
        label="Ngày sinh"
        value={student.birth ? TimeService.convertDateStringToDDMMYYYY(student.birth) : null}
      />
    </div>
  </div>
);

// Reusable row display
const Info = ({ label, value }) => (
  <p className="text-gray-600">
    <span className="font-medium">{label}:</span>{" "}
    <span className="text-gray-800">{value || 'Không có'}</span>
  </p>
);
