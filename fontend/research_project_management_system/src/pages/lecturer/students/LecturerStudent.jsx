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
    const { students, total, page, per_page, loading, error } = useSelector((state) => state.students);
    const [faculty, setFaculty] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        dispatch(getStudentInFacultyAsync({ page: currentPage, per_page }));

    }, [currentPage, per_page, dispatch]);

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
        
        dispatch(getStudentInFacultyAsync({ search: searchTerm, page: 1, per_page }));
    };
    const handleViewStudent = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
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
                    <Pagination
                        total={total}
                        perPage={per_page}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
            <ViewStudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                student={selectedStudent}
            />
        </div>
    );
};

export default LecturerStudent;