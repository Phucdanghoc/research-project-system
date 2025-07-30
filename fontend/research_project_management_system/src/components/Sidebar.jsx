import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaHome, FaClipboardList, FaBook, FaUsers, FaBars, FaTimes, FaLayerGroup, FaObjectGroup, FaUserAlt } from 'react-icons/fa';
import { IoMdLogOut } from 'react-icons/io';
import { TokenService } from '../services/token';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useSelector((state) => state.auth);

    const navLinks = {
        admin: [
            { link: '/admin', name: 'Dashboard', icon: FaHome },
            { link: '/admin/manage-students', name: 'Danh sách sinh viên', icon: FaUsers },
            { link: '/admin/manage-lecturers', name: 'Danh sách giảng viên', icon: FaUsers },
            { link: '/admin/manage-groups', name: 'Danh sách nhóm', icon: FaLayerGroup },
            { link: '/admin/manage-topics', name: 'Danh sách đề tài', icon: FaBook },
            { link: '/admin/manage-defenses', name: 'Danh sách hội đồng', icon: FaUsers },
            // { link : '/admin/manage-plans', name: 'Danh sách buổi bảo về', icon: FaObjectGroup },
        ],
  
        lecturer: [
            { link: '/lecturer/manage-topics', name: 'Danh sách đề tài', icon: FaClipboardList },
            // { link: '/lecturer/register-defense', name: 'Đăng ký bảo vệ', icon: FaBook },
            { link: '/lecturer/manage-groups', name: 'Danh sách nhóm', icon: FaLayerGroup },
            { link: '/lecturer/manage-students', name: 'Xem sinh viên', icon: FaUsers },
            { link: '/lecturer/manage-defenses', name: 'Danh sách buổi bảo vệ', icon: FaObjectGroup },
            { link: '/lecturer/profile', name: 'Tài khoản', icon: FaUserAlt },
        ],
        student: [
            { link: '/student', name: 'Trang chủ', icon: FaHome },
            { link: '/student/student-topics', name: 'Đề tài', icon: FaBook },
            { link: '/student/student-groups', name: 'Nhóm của tôi', icon: FaBook },
            { link: '/student/profile', name: 'Thông tin cá nhân', icon: FaBook },
        ],
        default: [
            { link: '/', name: 'Trang chủ', icon: FaHome },
            { link: '/login', name: 'Đăng nhập', icon: FaUsers },
        ],
    };

    const getNavLinks = (role) => {
        const links = navLinks[role] || navLinks.default;
        return links.map(({ link, name, icon: Icon }, index) => (
            <li key={index} className='list-none!'>
                <Link
                    to={link}
                    className="flex items-center p-2 hover:bg-gray-400/50 rounded transition-colors duration-200 hover:scale-105"
                >
                    <Icon className={isOpen ? 'mr-3' : ''} />
                    {isOpen && <span>{name}</span>}
                </Link>
            </li>
        ));
    };

    return (
        <div className={`h-screen fixed text-white flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} bg-gradient-to-b to-blue-400 from-indigo-500`}>
            <div className="p-4 flex items-center justify-between">
                {isOpen && (
                    <Link to={user?.role === 'admin' ? '/admin' : '/'} className="text-xl font-bold">
                        Quản lý đề tài
                    </Link>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-gray-700 rounded"
                >
                    {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            </div>
            <nav className="flex-1">
                <ul className="space-y-2 p-4 ">
                    {getNavLinks(user?.role)}
                    <li key={getNavLinks(user?.role).length + 1} className='list-none!'>
                        <Link
                            onClick={() => {
                                TokenService.removeToken();
                                window.location.replace('/login');
                            }}
                            className="flex items-center p-2 hover:bg-red-400/50 rounded transition-colors duration-200 hover:scale-105 " 
                        >
                            <IoMdLogOut className={isOpen ? 'mr-3' : ''} />
                            {isOpen && <span>{`Đăng xuất`}</span>}
                        </Link>
                    </li>
                </ul>
            </nav>

        </div>
    );
};

export default Sidebar;