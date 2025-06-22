const UnauthorizedPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md mx-auto">
                <h1 className="text-6xl font-bold text-red-500 mb-4">401</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không Có Quyền Truy Cập</h2>
                <p className="text-gray-600 mb-6">
                    Xin lỗi! Có vẻ như bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên trường học nếu bạn cần hỗ trợ.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-300"
                >
                    Quay Về Trang Chủ
                </a>
            </div>
        </div>
    );
};

export default UnauthorizedPage;