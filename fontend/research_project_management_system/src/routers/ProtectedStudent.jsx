import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyTokenAsync } from '../store/slices/authSlice';
import { TokenService } from '../services/token';
import Loading from '../components/Loading';

const ProtectedStudent = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = TokenService.getToken();
    console.log('ProtectedStudent - Checking token', { token, isAuthenticated, loading, isVerifying });

    if (token && !isAuthenticated && !loading && !isVerifying) {
      console.log('ProtectedStudent - Dispatching verifyTokenAsync');
      setIsVerifying(true);
      dispatch(verifyTokenAsync())
        .unwrap()
        .then(() => {
          console.log('ProtectedStudent - Token verification successful');
          setIsVerifying(false);
        })
        .catch((error) => {
          console.log('ProtectedStudent - Token verification failed', error);
          setIsVerifying(false);
          TokenService.removeToken();
        });
    }
  }, [dispatch, isAuthenticated, loading, isVerifying]);

  console.log('ProtectedStudent - Current state', {
    isAuthenticated,
    user,
    loading,
    isVerifying,
    location: location.pathname,
  });

  if (loading || isVerifying) {
    return <Loading message="Đang xác minh quyền truy cập..." />;
  }

//   if (!isAuthenticated || !user || user.role !== 'admin') {
//     console.log('ProtectedStudent - Redirecting to /unauthorized', { isAuthenticated, user });
//     return <Navigate to="/unauthorized" state={{ from: location }} replace />;
//   }

  return children;
};

export default ProtectedStudent;