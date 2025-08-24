# Hệ thống Quản lý Đề thi - Test Management System

## Tổng quan

Hệ thống quản lý đề thi cho phép giáo viên tạo, quản lý và giao đề thi cho học viên. Hệ thống hỗ trợ nhiều loại câu hỏi khác nhau và cung cấp giao diện thân thiện để quản lý toàn bộ quy trình thi cử.

## Tính năng chính

### 1. Tạo đề thi (Create Test)
- **Trang**: `/teacher/tao-de-thi`
- **Chức năng**: Tạo đề thi mới với các thông tin cơ bản
- **Thông tin đề thi**:
  - Tiêu đề đề thi
  - Mô tả (không bắt buộc)
  - Thời gian làm bài (phút)
  - Điểm đạt (%)

### 2. Các loại câu hỏi được hỗ trợ

#### A. Trắc nghiệm (MCQ - Multiple Choice Questions)
- Hỗ trợ tối đa 6 lựa chọn (A, B, C, D, E, F)
- Chọn một hoặc nhiều đáp án đúng
- Mỗi câu hỏi có điểm số riêng

#### B. Tự luận (Constructed Response)
- Câu hỏi mở, học viên tự viết câu trả lời
- Giáo viên chấm điểm thủ công
- Có thể thêm phản hồi và ghi chú

#### C. Điền vào chỗ trống (Fill in the Blank)
- Đoạn văn với các chỗ trống để học viên điền
- Sử dụng dấu gạch dưới `___` để đánh dấu chỗ trống
- Có thể có nhiều đáp án đúng

#### D. Nối từ (Mapping)
- Hai cột với các mục để học viên nối
- Học viên vẽ đường nối giữa các mục tương ứng
- Có đáp án đúng cụ thể

### 3. Danh sách đề thi (Test List)
- **Trang**: `/teacher/danh-sach-de-thi`
- **Chức năng**: Xem và quản lý tất cả đề thi đã tạo
- **Tính năng**:
  - Xem danh sách đề thi
  - Ẩn/hiện đề thi
  - Xóa đề thi
  - Xem số học viên được giao
  - Chỉnh sửa đề thi

### 4. Giao đề thi (Assign Test)
- **Trang**: `/teacher/gan-de-thi`
- **Chức năng**: Giao đề thi cho học viên cụ thể
- **Tính năng**:
  - Chọn đề thi từ danh sách
  - Chọn học viên (từ các lớp do giáo viên giảng dạy)
  - Đặt hạn nộp (không bắt buộc)
  - Giao hàng loạt cho nhiều học viên

## Cấu trúc cơ sở dữ liệu

### Các model chính

#### Test
```prisma
model Test {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  title           String
  description     String?
  teacherId       String   @db.ObjectId
  teacher         Teacher  @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  duration        Int      // Thời gian làm bài (phút)
  totalQuestions  Int      // Tổng số câu hỏi
  totalScore      Float    // Tổng điểm tối đa
  passingScore    Float    // Điểm đạt (phần trăm)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  questions       Question[]
  assignments     TestAssignment[]
}
```

#### Question
```prisma
model Question {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  testId      String   @db.ObjectId
  test        Test     @relation(fields: [testId], references: [id], onDelete: Cascade)
  questionText String
  questionType String  // "mcq", "constructed_response", "fill_blank", "mapping"
  order       Int      // Thứ tự câu hỏi
  score       Float    // Điểm số câu hỏi
  createdAt   DateTime @default(now())
  
  options     QuestionOption[]           // Cho MCQ
  fillBlankContent String?               // Cho điền vào chỗ trống
  mappingColumns MappingColumn[]         // Cho mapping
  correctAnswers String[]                // Đáp án đúng
  studentAnswers StudentAnswer[]         // Câu trả lời của học viên
}
```

#### TestAssignment
```prisma
model TestAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  testId    String   @db.ObjectId
  test      Test     @relation(fields: [testId], references: [id], onDelete: Cascade)
  studentId String   @db.ObjectId
  student   Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  assignedAt DateTime @default(now())
  dueDate   DateTime?
  completedAt DateTime?
  score     Float?
  answers   StudentAnswer[]
  
  @@unique([testId, studentId])
}
```

## API Endpoints

### Tests
- `GET /api/tests` - Lấy danh sách đề thi của giáo viên
- `POST /api/tests` - Tạo đề thi mới
- `GET /api/tests/[id]` - Lấy thông tin đề thi cụ thể
- `PUT /api/tests/[id]` - Cập nhật đề thi
- `DELETE /api/tests/[id]` - Xóa đề thi

### Test Assignment
- `POST /api/tests/[id]/assign` - Giao đề thi cho học viên
- `GET /api/tests/[id]/assign` - Lấy danh sách học viên được giao đề thi

### Students
- `GET /api/students` - Lấy danh sách học viên (chỉ giáo viên)

## Hướng dẫn sử dụng

### 1. Tạo đề thi mới
1. Truy cập trang "Tạo đề thi"
2. Điền thông tin cơ bản của đề thi
3. Thêm các câu hỏi theo loại mong muốn
4. Cấu hình điểm số cho từng câu hỏi
5. Lưu đề thi

### 2. Quản lý đề thi
1. Truy cập trang "Danh sách đề thi"
2. Xem tất cả đề thi đã tạo
3. Thực hiện các thao tác: xem, sửa, xóa, ẩn/hiện

### 3. Giao đề thi
1. Truy cập trang "Giao đề thi"
2. Chọn đề thi muốn giao
3. Chọn học viên (có thể chọn nhiều)
4. Đặt hạn nộp (nếu cần)
5. Xác nhận giao đề thi

## Tính năng bảo mật

- Chỉ giáo viên mới có thể truy cập các trang quản lý đề thi
- Mỗi giáo viên chỉ có thể quản lý đề thi của mình
- Học viên chỉ có thể xem đề thi được giao
- Xác thực người dùng thông qua NextAuth

## Công nghệ sử dụng

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: MongoDB với Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React Hooks
- **Notifications**: Sonner (Toast notifications)

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
npm install
```

2. Cài đặt Prisma client:
```bash
npx prisma generate
```

3. Chạy development server:
```bash
npm run dev
```

## Lưu ý quan trọng

- Đảm bảo đã cài đặt và cấu hình MongoDB
- Cập nhật file `.env` với thông tin kết nối database
- Chạy `npx prisma generate` sau khi thay đổi schema
- Hệ thống hỗ trợ tiếng Việt đầy đủ

## Phát triển trong tương lai

- [ ] Giao diện làm bài thi cho học viên
- [ ] Hệ thống chấm điểm tự động cho MCQ
- [ ] Báo cáo và thống kê kết quả thi
- [ ] Xuất đề thi ra PDF
- [ ] Hệ thống đảo câu hỏi
- [ ] Giới hạn thời gian làm bài thực tế
- [ ] Thông báo và nhắc nhở tự động
