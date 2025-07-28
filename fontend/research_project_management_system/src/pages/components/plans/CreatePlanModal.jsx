import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../../store';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useDebouncedCallback } from 'use-debounce';
import {  fetchDefensesAsync } from '../../../store/slices/defensesSlice';
import { getLecturerDefenseByIdAsync } from '../../../store/slices/lecturerDefenseSlice';
import {  checkPlanTimeAsync, createPlanAsync } from '../../../store/slices/planSlice';
import { patchGroupAsync } from '../../../store/slices/groupSlice';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const statusMap = {
    waiting: { label: 'Chờ diễn ra', color: 'text-yellow-600' },
    approved: { label: 'Đã duyệt', color: 'text-green-600' },
    finished: { label: 'Đã kết thúc', color: 'text-gray-500' },
};

const timeBlocks = [
    { start: '07:00', end: '09:00' },
    { start: '09:30', end: '11:30' },
    { start: '13:00', end: '15:00' },
    { start: '15:30', end: '17:30' },
];

const CreatePlanModal = ({ isOpen, onClose, onSubmit, groupId }) => {
    const dispatch = useAppDispatch();
    const { lectuters , loading: lectutersLoading, error: lectutersError } = useSelector((state) => state.lecturers || { lectuters: [], loading: false, error: null });
    const { defenses, loading: defensesLoading, error: defensesError } = useSelector((state) => state.defenses || { defenses: [], loading: false, error: null });
    const { lecturerDefenses, loading: lecturerDefensesLoading, error: lecturerDefensesError } = useSelector((state) => state.lecturerDefenses || { lecturerDefenses: [], loading: false, error: null });
    const { loading: planLoading, error: planError , check_time } = useSelector((state) => state.plans || { loading: false, error: null });
    const { loading: groupLoading, error: groupError } = useSelector((state) => state.groups || { loading: false, error: null });
    const [formData, setFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        defense_id: '',
        group_id: groupId,
    });
    const [errors, setErrors] = useState({
        date: '',
        defense_id: '',
        time_block: '',
        general: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [lecturerIds, setLecturerIds] = useState([]);
    const [blockAvailability, setBlockAvailability] = useState({});
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const modalRef = useRef(null);

    // Fetch lecturer IDs for the selected defense
    useEffect(() => {
        if (formData.defense_id) {
            dispatch(getLecturerDefenseByIdAsync(formData.defense_id))
                .unwrap()
                .then((data) => {
                    const ids = data.map((item) => item.lecturer_id);
                    setLecturerIds(ids);
                    // Reset date and time when defense changes
                    setFormData((prev) => ({
                        ...prev,
                        date: '',
                        start_time: '',
                        end_time: '',
                    }));
                    setErrors((prev) => ({ ...prev, date: '', time_block: '' }));
                })
                .catch((error) => {
                    setErrors((prev) => ({
                        ...prev,
                        general: error.message || 'Không thể tải danh sách giảng viên',
                    }));
                    setLecturerIds([]);
                });
        } else {
            setLecturerIds([]);
            setFormData((prev) => ({
                ...prev,
                date: '',
                start_time: '',
                end_time: '',
            }));
            setErrors((prev) => ({ ...prev, date: '', time_block: '' }));
        }
    }, [formData.defense_id, dispatch]);

    // Check availability for each time block
    useEffect(() => {
        const checkAvailability = async () => {
            if (!formData.defense_id || !formData.date || lecturerIds.length === 0) {
                setBlockAvailability({});
                return;
            }
            
            setAvailabilityLoading(true);
            const availability = {};

            for (const block of timeBlocks) {
                const startTime = `${formData.date}T${block.start}:00Z`;
                const endTime = `${formData.date}T${block.end}:00Z`;
        
                
                dispatch(checkPlanTimeAsync({
                    lecturerIds: lecturerIds,
                    startTime,
                    endTime,
                    date: formData.date,
                }))

                availability[`${block.start}-${block.end}`] = check_time;
            }

            setBlockAvailability(availability);
            setAvailabilityLoading(false);
        };

        checkAvailability();
    }, [formData.date, formData.defense_id, lecturerIds]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isDropdownOpen &&
                searchInputRef.current &&
                dropdownRef.current &&
                !searchInputRef.current.contains(event.target) &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    // Focus modal on open
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    const debouncedSearch = useDebouncedCallback((term) => {
        if (term.length >= 2) {
            dispatch(fetchDefensesAsync({ search: term }));
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }
    }, 300);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
        setErrors((prev) => ({ ...prev, defense_id: '' }));
    };

    const handleSelectDefense = (defense) => {
        setFormData((prev) => ({
            ...prev,
            defense_id: defense.id.toString(),
        }));
        setSearchTerm(`${defense.name} (${defense.defense_code})`);
        setIsDropdownOpen(false);
        setErrors((prev) => ({ ...prev, defense_id: '' }));
    };

    const handleSelectBlock = (block) => {
        if (blockAvailability[`${block.start}-${block.end}`]) {
            setFormData((prev) => ({
                ...prev,
                start_time: block.start,
                end_time: block.end,
            }));
            setErrors((prev) => ({ ...prev, time_block: '' }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {
            defense_id: formData.defense_id ? '' : 'Vui lòng chọn hội đồng bảo vệ trước',
            date: formData.defense_id && !formData.date ? 'Ngày là bắt buộc' : '',
            time_block: formData.defense_id && formData.date && !(formData.start_time && formData.end_time) ? 'Vui lòng chọn một khối thời gian' : '',
            general: '',
        };
        setErrors(newErrors);
        return Object.values(newErrors).every((error) => !error);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.info('Vui lòng điền đầy đủ và đúng các trường bắt buộc.');
            return;
        }

        const plan = {
            date: formData.date,
            start_time: `${formData.date}T${formData.start_time}:00Z`,
            end_time: `${formData.date}T${formData.end_time}:00Z`,
            defense_id: formData.defense_id,
            group_id: parseInt(groupId),
        };

        dispatch(createPlanAsync(plan))
            .unwrap()
            .then(() => {
                if (!planLoading && !planError) {
                    toast.success('Tạo kế hoạch thành công.');
                    dispatch(patchGroupAsync({ id: groupId, def_status: 'approved' }))
                        .unwrap()
                        .then(() => {
                            if (!groupLoading && !groupError) {
                                onSubmit?.(plan);
                                onClose();
                            }
                        })
                        .catch((error) => {
                            toast.error(error.message || 'Cập nhật trạng thái nhóm thất bại.');
                        });
                }
            })
            .catch((error) => {
                toast.error(error.message || 'Tạo kế hoạch thất bại.');
            });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    role="dialog"
                    aria-labelledby="create-plan-modal-title"
                    aria-modal="true"
                    tabIndex={-1}
                    ref={modalRef}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 id="create-plan-modal-title" className="text-xl font-bold text-blue-600">
                                Tạo kế hoạch
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                aria-label="Đóng modal"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="relative">
                                    <label htmlFor="search_defense" className="block text-sm font-medium text-gray-700">
                                        Hội đồng bảo vệ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="search_defense"
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="Nhập tên hoặc mã hội đồng bảo vệ"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        ref={searchInputRef}
                                        aria-required="true"
                                    />
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto"
                                                ref={dropdownRef}
                                            >
                                                {defensesLoading ? (
                                                    <p className="p-4 text-sm text-gray-500">Đang tải...</p>
                                                ) : defensesError ? (
                                                    <p className="p-4 text-sm text-red-500">Lỗi: {defensesError}</p>
                                                ) : defenses.length > 0 ? (
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-100 text-gray-700">
                                                                <th className="py-2 px-4 text-left font-medium">Tên</th>
                                                                <th className="py-2 px-4 text-left font-medium">Mã</th>
                                                                <th className="py-2 px-4 text-left font-medium">Trạng thái</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {defenses.map((defense) => (
                                                                <motion.tr
                                                                    key={defense.id}
                                                                    onClick={() => handleSelectDefense(defense)}
                                                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ duration: 0.1 }}
                                                                >
                                                                    <td className="py-2 px-4 border-t">{defense.name}</td>
                                                                    <td className="py-2 px-4 border-t">{defense.defense_code}</td>
                                                                    <td className={`py-2 px-4 border-t ${statusMap[defense.status]?.color || 'text-gray-500'}`}>
                                                                        {statusMap[defense.status]?.label || defense.status}
                                                                    </td>
                                                                </motion.tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p className="p-4 text-sm text-gray-500">Không tìm thấy hội đồng bảo vệ.</p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {errors.defense_id && <p className="text-red-600 text-sm mt-1">{errors.defense_id}</p>}
                                </div>
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                        Ngày <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        disabled={!formData.defense_id}
                                        className={`mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 ${!formData.defense_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        required
                                        aria-required="true"
                                        aria-disabled={!formData.defense_id}
                                    />
                                    {!formData.defense_id && (
                                        <p className="text-gray-500 text-sm mt-1">Vui lòng chọn hội đồng bảo vệ trước</p>
                                    )}
                                    {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Khối thời gian <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        {timeBlocks.map((block) => {
                                            const key = `${block.start}-${block.end}`;
                                            const isAvailable = blockAvailability[key];
                                            const isSelected = formData.start_time === block.start && formData.end_time === block.end;
                                            return (
                                                <motion.button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => handleSelectBlock(block)}
                                                    disabled={!formData.defense_id || !formData.date || !isAvailable || availabilityLoading}
                                                    className={`p-3 border rounded text-sm font-medium text-center
                            ${isSelected ? 'bg-blue-600 text-white border-blue-600' : isAvailable ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' : 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'}
                            ${availabilityLoading || !formData.defense_id || !formData.date ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    whileHover={{ scale: isAvailable && !availabilityLoading && formData.defense_id && formData.date ? 1.05 : 1 }}
                                                    whileTap={{ scale: isAvailable && !availabilityLoading && formData.defense_id && formData.date ? 0.95 : 1 }}
                                                    aria-label={`Chọn khối thời gian ${block.start} - ${block.end}`}
                                                    aria-disabled={!formData.defense_id || !formData.date || !isAvailable || availabilityLoading}
                                                >
                                                    {block.start} - {block.end}
                                                    {isAvailable === false && <span className="block text-xs">Không khả dụng</span>}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    {!formData.defense_id && <p className="text-gray-500 text-sm mt-1">Vui lòng chọn hội đồng bảo vệ trước</p>}
                                    {!formData.date && formData.defense_id && <p className="text-gray-500 text-sm mt-1">Vui lòng chọn ngày trước</p>}
                                    {errors.time_block && <p className="text-red-600 text-sm mt-1">{errors.time_block}</p>}
                                    {availabilityLoading && <p className="text-gray-500 text-sm mt-1">Đang kiểm tra thời gian...</p>}
                                </div>
                            </div>
                            {(errors.general || planError || groupError || lecturerDefensesError) && (
                                <p className="text-red-600 text-sm mt-2">{errors.general || planError || groupError || lecturerDefensesError}</p>
                            )}
                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    aria-label="Hủy tạo kế hoạch"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.defense_id || !formData.date || !formData.start_time || !formData.end_time || defensesLoading || planLoading || groupLoading || availabilityLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                    aria-label="Tạo kế hoạch"
                                >
                                    Tạo kế hoạch
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreatePlanModal;