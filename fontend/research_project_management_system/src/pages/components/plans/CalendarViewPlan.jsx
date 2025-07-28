import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlansAsync, fetchPlansByMeAsync } from '../../../store/slices/planSlice'; // Adjust path as needed
import { useAppDispatch } from '../../../store';

const CalendarViewPlan = ({ onEditPlan, onDeletePlan, onViewPlan, isAdmin = false }) => {
    const dispatch = useAppDispatch();

    const [calendarPlans, setCalendarPlans] = useState([]);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendarError, setCalendarError] = useState(null);

    const [viewDate, setViewDate] = useState(new Date(Date.now()));
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [currentWeekRange, setCurrentWeekRange] = useState(null);

    const blockRefs = useRef({});
    const lastFetchedWeek = useRef(null);

    const timeBlocks = [
        { start: '07:00', end: '09:00' },
        { start: '09:30', end: '11:30' },
        { start: '13:00', end: '15:00' },
        { start: '15:30', end: '17:50' },
    ];

    const formatTime = (isoTime) => {
        if (!isoTime) return '-';
        const date = new Date(isoTime);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const isToday = (dateStr) => {
        const inputDate = new Date(dateStr);
        const today = new Date(Date.now());
        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    };

    const getWeekDates = useCallback((date) => {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay() || 7;
        startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1)); // Set to Monday
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });
    }, []);

    const getWeekRange = useCallback((date) => {
        const weekDates = getWeekDates(date);
        const startDate = weekDates[0];
        const endDate = weekDates[6];

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        return {
            start: startStr,
            end: endStr,
            display: `${TimeService.convertDateStringToDDMMYYYY(startStr)} - ${TimeService.convertDateStringToDDMMYYYY(endStr)}`,
            key: `${startStr}_${endStr}`
        };
    }, [getWeekDates]);

    const fetchPlansForWeek = useCallback(async (weekRange) => {
        if (lastFetchedWeek.current === weekRange.key) {
            return;
        }

        setCalendarLoading(true);
        setCalendarError(null);

        try {
            const params = {
                start_time: `${weekRange.start}T00:00:00`, // Start of first day
                end_time: `${weekRange.end}T23:59:59`,   // End of last day
                per_page: 100 // Large number to get all plans for the week
            };

            const result = await dispatch(
                isAdmin ? fetchPlansAsync(params) : fetchPlansByMeAsync(params)
            ).unwrap();
            console.log(`result`, result);

            setCalendarPlans(result.plans || result || []);
            lastFetchedWeek.current = weekRange.key;
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            setCalendarError(error.message || 'Lỗi khi tải dữ liệu');
            setCalendarPlans([]);
        } finally {
            setCalendarLoading(false);
        }
    }, [dispatch]);

    // Effect to fetch plans when view date changes
    useEffect(() => {
        const weekRange = getWeekRange(viewDate);
        setCurrentWeekRange(weekRange);
        fetchPlansForWeek(weekRange);
    }, [viewDate, getWeekRange, fetchPlansForWeek]);

    const getTimeBlockIndex = (startTime) => {
        if (!startTime) return -1;
        const time = new Date(startTime);
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        for (let i = 0; i < timeBlocks.length; i++) {
            const [startHours, startMinutes] = timeBlocks[i].start.split(':').map(Number);
            const [endHours, endMinutes] = timeBlocks[i].end.split(':').map(Number);
            const startTotal = startHours * 60 + startMinutes;
            const endTotal = endHours * 60 + endMinutes;
            if (totalMinutes >= startTotal && totalMinutes <= endTotal) {
                return i;
            }
        }
        return -1; // Plan outside time blocks
    };

    const getPlansForDate = useCallback((date) => {
        if (!calendarPlans || !Array.isArray(calendarPlans)) return timeBlocks.map(() => []);

        const plansForDate = calendarPlans.filter((plan) => {
            const planDate = new Date(plan.date);
            return planDate.toDateString() === date.toDateString();
        });

        return timeBlocks.map((_, index) =>
            plansForDate.filter((plan) => getTimeBlockIndex(plan.start_time) === index)
        );
    }, [calendarPlans, timeBlocks]);

    const handlePreviousWeek = useCallback(() => {
        setViewDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() - 7);
            return newDate;
        });
    }, []);

    const handleNextWeek = useCallback(() => {
        setViewDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + 7);
            return newDate;
        });
    }, []);

    const handleMouseEnter = useCallback((planId, dateStr) => {
        setHoveredPlan(`${planId}-${dateStr}`);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredPlan(null);
    }, []);

    const weekDates = getWeekDates(viewDate);

    if (calendarLoading) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Đang tải kế hoạch...</span>
                </div>
            </div>
        );
    }

    if (calendarError) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-600">
                        Lỗi khi tải kế hoạch: {calendarError}
                        <button
                            onClick={() => fetchPlansForWeek(currentWeekRange)}
                            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePreviousWeek}
                    className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Tuần trước"
                    disabled={calendarLoading}
                >
                    <FaChevronLeft />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                    {currentWeekRange?.display || 'Loading...'}
                </h2>
                <button
                    onClick={handleNextWeek}
                    className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Tuần sau"
                    disabled={calendarLoading}
                >
                    <FaChevronRight />
                </button>
            </div>

            <div
                className="grid gap-2"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '100px repeat(7, 1fr)', // 1 column for time + 7 columns for days
                    gridTemplateRows: '4rem repeat(4, 1fr)', // 1 row for header + 4 rows for time blocks
                }}
            >
                {/* Top-left corner: empty */}
                <div className="bg-white font-bold flex items-center justify-center border rounded">
                    Giờ
                </div>

                {/* Day headers (first row) */}
                {weekDates.map((date, index) => (
                    <div
                        key={`day-header-${index}`}
                        className={`font-bold flex flex-col items-center justify-center border rounded ${isToday(date.toISOString().split('T')[0])
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-white'
                            }`}
                    >
                        <div>{TimeService.convertDateStringToDDMMYYYY(date.toISOString().split('T')[0])}</div>
                        <div className="text-sm">
                            {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'][index]}
                        </div>
                    </div>
                ))}

                {timeBlocks.map((block, blockIndex) => (
                    <React.Fragment key={`row-${blockIndex}`}>
                        <div className="bg-gray-100 text-sm font-medium flex items-center justify-center border rounded">
                            {block.start} - {block.end}
                        </div>
                        {weekDates.map((date, dayIndex) => {
                            const plansForDate = getPlansForDate(date)[blockIndex];
                            const dateStr = date.toISOString().split('T')[0];

                            return (
                                <div
                                    key={`cell-${blockIndex}-${dayIndex}`}
                                    className={`border rounded relative p-1 min-h-[60px] ${isToday(dateStr) ? 'bg-blue-50' : 'bg-white'
                                        }`}
                                >
                                    {plansForDate && plansForDate.length > 0 ? (
                                        plansForDate.map((plan) => (
                                            <div
                                                key={plan.id}
                                                className="relative"
                                                onMouseEnter={() => handleMouseEnter(plan.id, dateStr)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <div
                                                    className="bg-blue-200 text-blue-800 text-xs rounded px-2 py-1 mb-1 cursor-pointer truncate hover:bg-blue-300 transition-colors"
                                                    onClick={() => onViewPlan && onViewPlan(plan)}
                                                >
                                                    {plan.defense?.name || plan.defense?.defense_code || 'Kế hoạch'}
                                                </div>

                                                <AnimatePresence>
                                                    {hoveredPlan === `${plan.id}-${dateStr}` && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute z-20 bg-white border border-gray-300 shadow-lg rounded p-3 w-64 top-0 left-full ml-2 text-left text-sm"
                                                            style={{
                                                                // Adjust position if tooltip would go off screen
                                                                left: dayIndex > 4 ? 'auto' : '100%',
                                                                right: dayIndex > 4 ? '100%' : 'auto',
                                                                marginLeft: dayIndex > 4 ? 0 : '0.5rem',
                                                                marginRight: dayIndex > 4 ? '0.5rem' : 0,
                                                            }}
                                                        >
                                                            <p className="font-semibold text-gray-700 mb-1">
                                                                ID: {plan.id}
                                                            </p>
                                                            <p className="text-gray-600 mb-1">
                                                                <span className="font-medium">Thời gian:</span> {formatTime(plan.start_time)} - {formatTime(plan.end_time)}
                                                            </p>
                                                            <p className="text-gray-600 mb-1">
                                                                <span className="font-medium">Nhóm:</span> {plan.group?.name || '-'}
                                                            </p>
                                                            <p className="text-gray-600">
                                                                <span className="font-medium">Bảo vệ:</span> {plan.defense?.name || plan.defense?.defense_code || '-'}
                                                            </p>

                                                            {/* Action buttons */}
                                                            {(onEditPlan || onDeletePlan) && (
                                                                <div className="flex gap-2 mt-2 pt-2 border-t">
                                                                    {onEditPlan && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onEditPlan(plan);
                                                                                setHoveredPlan(null);
                                                                            }}
                                                                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                                                        >
                                                                            Sửa
                                                                        </button>
                                                                    )}
                                                                    {onDeletePlan && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onDeletePlan(plan.id);
                                                                                setHoveredPlan(null);
                                                                            }}
                                                                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-400 text-xs italic text-center flex items-center justify-center h-full">
                                            -
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default CalendarViewPlan;