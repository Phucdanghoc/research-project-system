import React, { useEffect, useMemo, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onConfirm: (dateOrNull: Date | null) => void
 * - onClear?: () => void        // only used in edit mode when allowClear
 * - selectedCount?: number      // for title when mode === 'new'
 * - min?: Date                  // default = now
 * - mode?: 'new' | 'edit'       // default = 'new'
 * - initialDate?: Date | null   // used in edit mode
 * - allowClear?: boolean        // default = true (shows "Bỏ khóa" in edit)
 */
const LockModal = ({
  isOpen,
  onClose,
  onConfirm,
  onClear,
  selectedCount = 0,
  min = new Date(),
  mode = 'new',
  initialDate = null,
  allowClear = true,
}) => {
  const [lockDate, setLockDate] = useState(new Date());

  // Initialize date based on mode when open
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit') {
      setLockDate(initialDate instanceof Date ? initialDate : new Date());
    } else {
      setLockDate(new Date());
    }
  }, [isOpen, mode, initialDate]);

  // Disable confirm if chosen time < min
  const isInvalid = useMemo(() => {
    if (!lockDate) return true;
    return lockDate.getTime() < (min?.getTime?.() ?? 0);
  }, [lockDate, min]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  if (!isOpen) return null;

  const title =
    mode === 'edit'
      ? 'Cập nhật thời điểm khóa nhóm'
      : `Khóa ${selectedCount} nhóm đã chọn`;

  const confirmLabel = mode === 'edit' ? 'Lưu' : 'Xác nhận';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn thời gian khóa:
          </label>

          <DatePicker
            selected={lockDate}
            onChange={(date) => setLockDate(date)}
            showTimeSelect
            timeIntervals={5}
            dateFormat="Pp"
            className="w-full border rounded-md p-2"
            minDate={min}
          />
        
        </div>

        <div className="flex justify-between items-center">
          {mode === 'edit' && allowClear && (
            <button
              onClick={() => (onClear ? onClear() : onConfirm(null))}
              className="px-3 py-2 text-rose-700 bg-rose-100 rounded-md hover:bg-rose-200"
              title="Bỏ khóa (xóa lock_at)"
            >
              Bỏ khóa
            </button>
          )}

          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={() => onConfirm(lockDate)}
              disabled={isInvalid}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockModal;
