import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { verifyTokenAsync } from '../store/auth/authSlice';
import { TokenService } from '../services/token';
import Loading from '../components/Loading';

// Hàm ánh xạ vai trò với đường dẫn
const roleBasedRedirect = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/';
    case 'student':
      return '/student';
    case 'teacher':
      return '/teacher';
    default:
      return '/unauthorized';
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const token = TokenService.getToken();
    if (token && !isAuthenticated && !loading) {
      dispatch(verifyTokenAsync()).unwrap().catch(() => {
        TokenService.removeToken();
      });
    }
  }, [dispatch, isAuthenticated, loading]);

  if (loading) {
    return <Loading message="Đang xác minh đăng nhập..." />;
  }

  if (!isAuthenticated || !user || error) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  console.log(location);
  
  if (location.pathname === '/') {
    console.log(`User role: ${user.role}`);
    
    return <Navigate to={roleBasedRedirect(user.role)} replace />;
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  console.log(`Outlet: ${user.role}`);
  
  return <Outlet />;
};

export default ProtectedRoute;