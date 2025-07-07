import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const statusConfig = {
  open: { icon: <FaCheckCircle className="text-green-600" />, label: 'Mở', border: 'border-green-600' },
  closed: { icon: <FaTimesCircle className="text-red-600" />, label: 'Đóng', border: 'border-red-600' },
  pending: { icon: <FaClock className="text-yellow-600" />, label: 'Chờ duyệt', border: 'border-yellow-600' },
};

function StatusButton({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <button
      className={`
        flex items-center gap-2 
        rounded-full px-4 py-2 
        border font-semibold 
        cursor-not-allowed opacity-70
        ${config.border} 
        bg-white select-none
      `}
      disabled
      tabIndex={-1}
      type="button"
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
}

export default StatusButton;
