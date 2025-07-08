import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { loginAsync, clearError } from '../../store/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../store/index';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';
import AuthCheck from '../../hooks/useAuth'; 

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // toast.info('Bạn đã đăng nhập!');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginAsync(credentials)).unwrap();
      toast.success('Đăng nhập thành công!');
      dispatch(clearError());
      navigate('/');
    } catch (error) {
      toast.error(error || 'Đăng nhập thất bại!');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <>
      <AuthCheck /> {/* Thêm AuthCheck để kiểm tra token */}
      <div className="min-h-screen flex bg-blue-400">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-50"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80")',
            }}
          ></div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Trường Đại học XYZ</h1>
            <p className="text-xl text-white/80 drop-shadow-md">Chào mừng bạn đến với hệ thống quản lý</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-3xl">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Đăng nhập</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="mb-2 block text-gray-700 font-medium">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <IoMdMail />
                  </span>
                  <input
                    id="email"
                    type="text"
                    placeholder="Nhập Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    disabled={loading}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-gray-700 font-medium">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FaLock />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    disabled={loading}
                    required
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  <span
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;