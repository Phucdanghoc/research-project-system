import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../store';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { TimeService } from '../../../utils/time';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDefensesAsync } from '../../../store/slices/defensesSlice';

const CalendarViewDefense = ({ dispatch }) => {
    const { defenses, loading, error } = useSelector((state) => state.defenses);
    const [viewDate, setViewDate] = useState(new Date());
    const [hoveredDefense, setHoveredDefense] = useState(null);
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
        const today = new Date();
        return (
            inputDate.getFullYear() === today.getFullYear() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getDate() === today.getDate()
        );
    };

    const getWeekDates = (date) => {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay() || 7;
        startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1));
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });
    };

    const weekDates = getWeekDates(viewDate);
    const startDate = weekDates[0].toISOString().split('T')[0];
    const endDate = weekDates[6].toISOString().split('T')[0];
    const weekKey = `${startDate}_${endDate}`;

    const currentWeekDefenses = defenses && Array.isArray(defenses)
        ? defenses.filter((defense) => {
            if (!defense.date) return false;
            const defenseDate = new Date(defense.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return defenseDate >= start && defenseDate <= end;
        })
        : [];

    useEffect(() => {
        if (lastFetchedWeek.current !== weekKey) {
            lastFetchedWeek.current = weekKey;
            const params = {
                start_time: `${startDate}T00:00:00`,
                end_time: `${endDate}T23:59:59`,
                per_page: 100
            };
            dispatch(fetchDefensesAsync(params));
        }
    }, [dispatch, startDate, endDate, weekKey]);

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
        return -1;
    };

    const getDefensesForDate = (date) => {
        const defensesForDate = currentWeekDefenses.filter((defense) => {
            const defenseDate = new Date(defense.date);
            return defenseDate.toDateString() === date.toDateString();
        });
        return timeBlocks.map((_, index) =>
            defensesForDate.filter((defense) => getTimeBlockIndex(defense.start_time) === index)
        );
    };

    const handlePreviousWeek = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() - 7);
        setViewDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() + 7);
        setViewDate(newDate);
    };

    if (loading) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Đang tải buổi bảo vệ...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-600 text-center">
                        <p className="mb-2">Lỗi khi tải buổi bảo vệ: {error}</p>
                        <button
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
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
                    className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                    aria-label="Tuần trước"
                    disabled={loading}
                >
                    <FaChevronLeft />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                    {TimeService.convertDateStringToDDMMYYYY(startDate)} - {TimeService.convertDateStringToDDMMYYYY(endDate)}
                </h2>
                <button
                    onClick={handleNextWeek}
                    className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                    aria-label="Tuần sau"
                    disabled={loading}
                >
                    <FaChevronRight />
                </button>
            </div>

            <div
                className="grid gap-2"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '100px repeat(7, 1fr)',
                    gridTemplateRows: '4rem repeat(4, 1fr)',
                }}
            >
                <div className="bg-white font-bold flex items-center justify-center border rounded">
                    Giờ
                </div>

                {weekDates.map((date, index) => (
                    <div
                        key={`day-header-${index}`}
                        className={`font-bold flex flex-col items-center justify-center border rounded transition-colors ${isToday(date.toISOString().split('T')[0]) ? 'bg-blue-50 text-blue-800' : 'bg-white'}`}
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
                            const defensesForDate = getDefensesForDate(date)[blockIndex];
                            const dateStr = date.toISOString().split('T')[0];

                            return (
                                <div
                                    key={`cell-${blockIndex}-${dayIndex}`}
                                    className={`border rounded relative p-1 min-h-[60px] transition-colors ${isToday(dateStr) ? 'bg-blue-50' : 'bg-white'}`}
                                >
                                    {defensesForDate && defensesForDate.length > 0 ? (
                                        defensesForDate.map((defense) => (
                                            <div
                                                key={defense.id}
                                                className="relative"
                                                onMouseEnter={() => setHoveredDefense(`${defense.id}-${dateStr}`)}
                                                onMouseLeave={() => setHoveredDefense(null)}
                                            >
                                                <div
                                                    className="bg-blue-200 text-blue-800 text-xs rounded px-2 py-1 mb-1 cursor-pointer truncate hover:bg-blue-300 transition-colors"
                                                >
                                                    {defense.name || defense.defense_code || 'Buổi bảo vệ'}
                                                </div>

                                                <AnimatePresence>
                                                    {hoveredDefense === `${defense.id}-${dateStr}` && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute z-20 bg-white border border-gray-300 shadow-lg rounded p-3 w-64 top-0 text-left text-sm"
                                                            style={{
                                                                left: dayIndex > 4 ? 'auto' : '100%',
                                                                right: dayIndex > 4 ? '100%' : 'auto',
                                                                marginLeft: dayIndex > 4 ? 0 : '0.5rem',
                                                                marginRight: dayIndex > 4 ? '0.5rem' : 0,
                                                            }}
                                                        >
                                                            <p className="font-semibold text-gray-700 mb-1">
                                                                Mã: {defense.defense_code || '-'}
                                                            </p>
                                                            <p className="text-gray-600 mb-1">
                                                                <span className="font-medium">Tên:</span> {defense.name || '-'}
                                                            </p>
                                                            <p className="text-gray-600 mb-1">
                                                                <span className="font-medium">Thời gian:</span>{' '}
                                                                {formatTime(defense.start_time)} - {formatTime(defense.end_time)}
                                                            </p>
                                                            <p className="text-gray-600 mb-1">
                                                                <span className="font-medium">Nhóm:</span>{' '}
                                                                {defense.groups?.length > 0
                                                                    ? defense.groups.map((g) => g.name).join(', ')
                                                                    : '-'}
                                                            </p>


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

export default CalendarViewDefense;