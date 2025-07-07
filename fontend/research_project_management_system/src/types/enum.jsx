export const FacultyMajors = {
  CNTT: {
    name: 'Khoa Công nghệ Thông tin',
    majors: [
      { code: 'KTPM', name: 'Kỹ thuật Phần mềm' },
      { code: 'ATTT', name: 'An toàn Thông tin' },
      { code: 'TTNT', name: 'Trí tuệ Nhân tạo' },
      { code: 'KHDL', name: 'Khoa học Dữ liệu' },
      { code: 'IOT', name: 'Internet vạn vật' },
    ],
  },
  KTCN: {
    name: 'Khoa Kỹ thuật Máy tính',
    majors: [
      { code: 'KTDT', name: 'Kỹ thuật Điện tử' },
      { code: 'CNPM', name: 'Công nghệ Phần mềm' },
      { code: 'HTTT', name: 'Hệ thống Thông tin' },
      { code: 'KTMT', name: 'Kỹ thuật Máy tính' },
    ],
  },
  QTKD: {
    name: 'Khoa Quản trị Kinh doanh',
    majors: [
      { code: 'QTKD', name: 'Quản trị Kinh doanh' },
      { code: 'MKT', name: 'Marketing Kỹ thuật số' },
      { code: 'KDQT', name: 'Kinh doanh Quốc tế' },
      { code: 'TCKT', name: 'Tài chính Kế toán' },
    ],
  },
  NN: {
    name: 'Khoa Ngôn ngữ',
    majors: [
      { code: 'NNAN', name: 'Ngôn ngữ Anh' },
      { code: 'NNJP', name: 'Ngôn ngữ Nhật' },
      { code: 'NNHN', name: 'Ngôn ngữ Hàn' },
    ],
  },
  TK: {
    name: 'Khoa Thiết kế',
    majors: [
      { code: 'TKDH', name: 'Thiết kế Đồ họa' },
      { code: 'TKCN', name: 'Thiết kế Công nghiệp' },
      { code: 'TKNT', name: 'Thiết kế Nội thất' },
    ],
  },
  DL: {
    name: 'Khoa Du lịch',
    majors: [
      { code: 'QTDL', name: 'Quản trị Du lịch và Lữ hành' },
      { code: 'QLKS', name: 'Quản lý Khách sạn' },
      //   { code: 'DLDT', name: 'Du lịch Điện tử' },
    ],
  },
};
export const StatusConfig = {
  open: { 
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-700 border border-green-300' 
  },
  closed: { 
    label: 'Không hoạt động',
    className: 'bg-gray-200 text-gray-500 border border-gray-300'
  },
  pending: { 
    label: 'Chờ duyệt',
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
  },
  // Thêm các trạng thái khác nếu cần
};


export const TopicCategory = {
  RESEARCH: 'Nghiên cứu',
  PROJECT: 'Dự án',
  OTHER: 'Khác',
  GRADUATION: 'Tốt nghiệp',
  INTERNSHIP: 'Thực tập',
  INNOVATION: 'Sáng tạo',
  ENTREPRENEURSHIP: 'Khởi nghiệp',
};

