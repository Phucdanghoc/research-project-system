import { FaEye, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { useRef, useState } from 'react';

const TableViewPlan = ({ plans, onViewPlan, onEditPlan, onDeletePlan, isAdmin = false }) => {
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRefs = useRef({});

    const formatTime = (isoTime) => {
        if (!isoTime) return '-';
        const date = new Date(isoTime);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    function isToday(dateStr) {
        const inputDate = new Date(dateStr);
        const today = new Date();
        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    }

    return (
        <div>
            <table className="w-full bg-white shadow-md rounded-lg text-center">
                <thead>
                    <tr className="bg-blue-400 text-white">
                        <th className="py-2 px-4">Mã kế hoạch</th>
                        <th className="py-2 px-4">Ngày</th>
                        <th className="py-2 px-4">Thời gian bắt đầu</th>
                        <th className="py-2 px-4">Thời gian kết thúc</th>
                        <th className="py-2 px-4">Nhóm</th>
                        <th className="py-2 px-4">Bảo vệ</th>
                        <th className="py-2 px-4">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {plans.length > 0 ? (
                        plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-blue-100">
                                <td className="py-2 px-4 border-b">{plan.id}</td>
                                <td className={`py-2 px-4 border-b ${isToday(plan.date) ? 'bg-yellow-100 font-semibold text-red-600' : ''}`}>
                                    {TimeService.convertDateStringToDDMMYYYY(plan.date)}
                                </td>
                                <td className="py-2 px-4 border-b text-center text-blue-600 font-semibold tracking-wide">
                                    {formatTime(plan.start_time)}
                                </td>
                                <td className="py-2 px-4 border-b  text-center text-blue-600 font-semibold tracking-wide">
                                    {formatTime(plan.end_time)}
                                </td>


                                <td className="py-2 px-4 border-b">{plan.group?.name || '-'}</td>
                                <td className="py-2 px-4 border-b">{plan.defense?.name || plan.defense?.defense_code || '-'}</td>
                                <td className="py-2 px-4 border-b space-x-2 justify-center">
                                    <button
                                        onClick={() => onViewPlan(plan)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Xem chi tiết"
                                    >
                                        <FaEye />
                                    </button>
                                    {isAdmin && (
                                        <>
                                            <button
                                                onClick={() => onEditPlan(plan)}
                                                className="text-yellow-600 hover:text-yellow-800"
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => onDeletePlan(plan.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Xóa"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-600">
                                Không tìm thấy kế hoạch nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableViewPlan;