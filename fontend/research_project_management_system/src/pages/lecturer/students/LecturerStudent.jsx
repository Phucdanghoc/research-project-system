import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { getStudentInFacultyAsync, clearError } from '../../../store/slices/studentSlice';
import FilterBar from '../../components/students/FilterBar';
import TableView from '../../components/students/TableView';
import ViewStudentModal from '../../components/students/ViewStudentModal';
import Pagination from '../../components/students/Pagination';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const LecturerStudent = () => {
    const dispatch = useAppDispatch();
    const { students,  total_pages, loading, error } = useSelector((state) => state.students);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        dispatch(getStudentInFacultyAsync({ page: currentPage }));

    }, [currentPage, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleFilterChange = ({ searchTerm }) => {
        setSearchTerm(searchTerm);
        setCurrentPage(1);
        console.log(`Search term: ${searchTerm}`);

        dispatch(getStudentInFacultyAsync({ search: searchTerm, page: 1}));
    };
    const handleViewStudent = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Danh sách sinh viên theo khoa</h1>
            <FilterBar onFilterChange={handleFilterChange} />
            {loading ? (
                <p className="text-center text-gray-600">Đang tải...</p>
            ) : (
                <>
                    <TableView students={students} onViewStudent={handleViewStudent} />
                    {total_pages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className={`px-3 py-1 rounded ${currentPage === 1 || loading
                                    ? 'bg-gray-200 text-gray-500'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Trước
                            </button>
                            {[...Array(total_pages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    disabled={loading}
                                    className={`px-3 py-1 rounded ${currentPage === index + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === total_pages || loading}
                                className={`px-3 py-1 rounded ${currentPage === total_pages || loading
                                    ? 'bg-gray-200 text-gray-500'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}
            {isModalOpen && (
                <ViewStudentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                />
            )}
        </div>
    );
};

export default LecturerStudent;