# Hệ thống Quản lý Học viên MPA

Một hệ thống quản lý học viên hiện đại được xây dựng với Next.js 14, TypeScript, và MongoDB. Hệ thống hỗ trợ quản lý học viên, thi xếp lớp, đăng ký khóa học và quản lý thanh toán.

## 🚀 Tính năng chính

### 🔐 Xác thực
- **Google OAuth** thông qua NextAuth.js
- Phân quyền theo vai trò: `user` (Học viên) và `staff` (Nhân viên)

### 👨‍🎓 Dành cho Học viên
- **Tạo tài khoản mới**: Đăng ký thông tin học viên
- **Thông tin học viên**: Cập nhật thông tin cá nhân
- **Thi xếp lớp**: Làm bài thi và xem kết quả xếp level
- **Đăng ký khóa học**: Đăng ký khóa học và thanh toán học phí

### 👨‍🏫 Dành cho Nhân viên
- **Tạo tài khoản staff**: Quản lý tài khoản nhân viên
- **Quản lý học viên**: Xem và quản lý danh sách học viên
- **Quản lý level và lớp**: Xem kết quả thi và xuất báo cáo
- **Quản lý ghi danh**: Theo dõi thanh toán và thống kê
- **Cài đặt ngưỡng điểm**: Cấu hình ngưỡng điểm cho từng level

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB với Prisma ORM
- **Authentication**: NextAuth.js với Google OAuth
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js 18+ 
- MongoDB (local hoặc cloud)
- Google OAuth credentials

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd student-management
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env.local` và thêm các biến môi trường:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/student-management"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (từ Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Bước 4: Cấu hình Google OAuth
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật Google+ API
4. Tạo OAuth 2.0 credentials
5. Thêm `http://localhost:3000/api/auth/callback/google` vào Authorized redirect URIs
6. Copy Client ID và Client Secret vào file `.env.local`

### Bước 5: Cấu hình database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Hoặc tạo migration (production)
npx prisma migrate dev
```

### Bước 6: Chạy ứng dụng
```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc thư mục

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (student)/         # Student pages
│   ├── (staff)/           # Staff pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── providers/        # Context providers
├── lib/                  # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Database configuration
│   └── utils.ts         # Utility functions
└── prisma/              # Database schema
    └── schema.prisma    # Prisma schema
```

## 🗄️ Database Schema

### Models chính:
- **User**: Thông tin người dùng và xác thực
- **Student**: Thông tin học viên
- **Staff**: Thông tin nhân viên
- **Exam**: Kết quả thi xếp lớp
- **Registration**: Đăng ký khóa học
- **LevelThreshold**: Ngưỡng điểm cho từng level

## 🔧 API Endpoints

### Students
- `GET /api/students` - Lấy danh sách học viên
- `POST /api/students` - Tạo học viên mới

### Exams
- `GET /api/exams` - Lấy danh sách bài thi
- `POST /api/exams` - Tạo bài thi mới

### Registrations
- `GET /api/registrations` - Lấy danh sách đăng ký
- `POST /api/registrations` - Tạo đăng ký mới

### Level Thresholds
- `GET /api/level-thresholds` - Lấy ngưỡng điểm
- `POST /api/level-thresholds` - Tạo ngưỡng điểm mới
- `PUT /api/level-thresholds` - Cập nhật ngưỡng điểm

### Staff
- `GET /api/staff` - Lấy danh sách staff
- `POST /api/staff` - Tạo staff mới

## 🎨 Giao diện

Hệ thống sử dụng thiết kế hiện đại với:
- **Gradient backgrounds** cho trải nghiệm thân thiện
- **Card-based layout** cho dễ sử dụng
- **Responsive design** cho mọi thiết bị
- **Vietnamese language** cho người dùng Việt Nam
- **Color-coded sections** cho dễ phân biệt

## 🚀 Deployment

### Vercel (Recommended)
1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Cấu hình environment variables
4. Deploy

### Docker
```bash
# Build image
docker build -t student-management .

# Run container
docker run -p 3000:3000 student-management
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📝 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Hỗ trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**Lưu ý**: Đây là phiên bản development. Để sử dụng trong production, hãy đảm bảo:
- Cấu hình bảo mật đầy đủ
- Sử dụng HTTPS
- Backup database thường xuyên
- Monitoring và logging
- Rate limiting cho API 