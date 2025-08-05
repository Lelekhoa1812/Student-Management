# Hệ Thống Quản Lý Học Viên - Hướng Dẫn Sử Dụng

## Tổng Quan Hệ Thống

Hệ thống Quản lý Học viên là một ứng dụng web được thiết kế để quản lý toàn bộ quy trình đào tạo và theo dõi học viên tại trung tâm. Hệ thống hỗ trợ ba vai trò chính:

- **Manager (Quản lý)**: Quản lý tổng thể, xem báo cáo KPI, quản lý nhân viên
- **Staff (Nhân viên)**: Quản lý học viên, lớp học, thanh toán, nhắc nhở
- **Student (Học viên)**: Xem thông tin cá nhân, lịch học, kết quả thi

## Các Trang Chính và Mục Đích

### 1. Trang Đăng Nhập (`/dang-nhap`)
**Mục đích**: Cổng vào hệ thống cho tất cả người dùng
**Hướng dẫn sử dụng**:
- Nhập email và mật khẩu đã được cấp
- Hệ thống sẽ tự động chuyển hướng đến trang phù hợp với vai trò
- Nếu quên mật khẩu, liên hệ quản lý để reset

### 2. Trang Chủ (`/`)
**Mục đích**: Dashboard chính hiển thị các chức năng theo vai trò
**Đối với Manager**:
- Xem tổng quan KPI của toàn bộ trung tâm
- Truy cập quản lý nhân viên
- Xem báo cáo thanh toán và nhắc nhở

**Đối với Staff**:
- Quản lý học viên
- Quản lý lớp học
- Hẹn lịch nhắc nhở
- Theo dõi thanh toán

### 3. Quản Lý Học Viên (`/quan-ly-hoc-vien`)
**Mục đích**: Quản lý toàn bộ thông tin học viên
**Chức năng chính**:
- **Xem danh sách**: Hiển thị tất cả học viên với thông tin cơ bản
- **Tìm kiếm và lọc**: Lọc theo trạng thái thi, level, ngày đăng ký
- **Chỉnh sửa thông tin**: Cập nhật thông tin học viên, điểm thi, lớp học
- **Xóa học viên**: Xóa học viên với khả năng hoàn tác
- **Phân trang**: Hiển thị tối đa 10 học viên mỗi trang

**Hướng dẫn sử dụng**:
1. Sử dụng bộ lọc để tìm học viên cụ thể
2. Click vào biểu tượng "Edit" để chỉnh sửa thông tin
3. Sau khi chỉnh sửa, click "Save" để lưu hoặc "X" để hủy
4. Sử dụng nút "Trước/Sau" để di chuyển giữa các trang

### 4. Quản Lý Lớp Học (`/quan-ly-lop-hoc`)
**Mục đích**: Quản lý các lớp học và phân công giáo viên
**Chức năng chính**:
- Tạo lớp học mới với thông tin chi tiết
- Chỉnh sửa thông tin lớp học
- Phân công giáo viên cho từng lớp
- Theo dõi số lượng học viên trong lớp
- Kích hoạt/vô hiệu hóa lớp học

### 5. Quản Lý Ghi Danh (`/quan-ly-ghi-danh`)
**Mục đích**: Quản lý quá trình đăng ký học của học viên
**Chức năng chính**:
- Ghi danh học viên vào lớp học
- Theo dõi trạng thái đăng ký
- Quản lý danh sách học viên trong từng lớp

### 6. Hẹn Lịch Nhắc (`/hen-lich-nhac`)
**Mục đích**: Hệ thống nhắc nhở cho nhân viên
**Chức năng chính**:
- **Tìm kiếm học viên**: Nhập tên, email hoặc số điện thoại để tìm học viên
- **Xem trạng thái**: Kiểm tra trạng thái thi và thanh toán của học viên
- **Tạo nhắc nhở**: Tạo nhắc nhở cho học viên chưa hoàn thành
- **Quản lý nhắc nhở**: Xem, chỉnh sửa, xóa các nhắc nhở đã tạo

**Hướng dẫn sử dụng**:
1. Nhập thông tin học viên vào ô tìm kiếm
2. Xem trạng thái thi và thanh toán
3. Nếu có trạng thái chưa hoàn thành, click "Tạo nhắc nhở"
4. Chọn loại nhắc nhở (thanh toán/thi), phương thức (gọi/email/SMS)
5. Nhập nội dung nhắc nhở và lưu

### 7. KPI Dashboard (`/kpi-dashboard`)
**Mục đích**: Bảng điều khiển KPI cho quản lý
**Chức năng chính**:
- **Biểu đồ thanh toán**: Hiển thị KPI thanh toán theo từng nhân viên
- **Biểu đồ nhắc nhở**: Hiển thị KPI nhắc nhở theo từng nhân viên
- **Bộ lọc thời gian**: Lọc theo ngày, tuần, tháng
- **Tổng quan**: Hiển thị tổng số thanh toán và nhắc nhở

**Hướng dẫn sử dụng**:
1. Chọn khoảng thời gian muốn xem (ngày/tuần/tháng)
2. Xem biểu đồ thanh toán (màu xanh) và nhắc nhở (màu cam)
3. Chỉ hiển thị nhân viên có hoạt động để tối ưu không gian
4. Xem tổng quan ở các thẻ phía trên

### 8. Thi Xếp Lớp (`/thi-xep-lop`)
**Mục đích**: Quản lý kỳ thi xếp lớp cho học viên
**Chức năng chính**:
- Đăng ký thi cho học viên
- Nhập điểm thi và xếp level tự động
- Theo dõi kết quả thi của học viên

### 9. Thông Tin Học Viên (`/thong-tin-hoc-vien`)
**Mục đích**: Trang dành cho học viên xem thông tin cá nhân
**Chức năng chính**:
- Xem thông tin cá nhân
- Xem lịch học và lớp đang theo học
- Xem kết quả thi và level hiện tại

### 10. Tạo Tài Khoản
**Mục đích**: Tạo tài khoản cho các vai trò khác nhau
- `/tao-tai-khoan`: Tạo tài khoản học viên
- `/tao-tai-khoan-staff`: Tạo tài khoản nhân viên
- `/tao-tai-khoan-manager`: Tạo tài khoản quản lý

## Hướng Dẫn Kỹ Thuật

### Yêu Cầu Hệ Thống
- **Trình duyệt**: Chrome, Firefox, Safari, Edge (phiên bản mới nhất)
- **Kết nối internet**: Ổn định để truy cập hệ thống
- **Độ phân giải**: Tối thiểu 1024x768 để hiển thị tốt

### Bảo Mật
- **Đăng xuất**: Luôn đăng xuất khi không sử dụng
- **Mật khẩu**: Không chia sẻ mật khẩu với người khác
- **Phiên làm việc**: Hệ thống tự động đăng xuất sau 30 phút không hoạt động

### Khuyến Nghị Sử Dụng
1. **Sao lưu dữ liệu**: Thường xuyên kiểm tra và sao lưu dữ liệu quan trọng
2. **Cập nhật thông tin**: Luôn cập nhật thông tin học viên khi có thay đổi
3. **Theo dõi nhắc nhở**: Kiểm tra và xử lý nhắc nhở hàng ngày
4. **Báo cáo định kỳ**: Xem báo cáo KPI hàng tuần để theo dõi hiệu suất

### Xử Lý Sự Cố Thường Gặp

#### Không thể đăng nhập
- Kiểm tra email và mật khẩu
- Đảm bảo Caps Lock không bật
- Thử xóa cache trình duyệt
- Liên hệ quản lý nếu vẫn không được

#### Trang tải chậm
- Kiểm tra kết nối internet
- Thử refresh trang
- Đóng các tab không cần thiết
- Liên hệ quản lý nếu vấn đề kéo dài

#### Dữ liệu không hiển thị
- Kiểm tra bộ lọc có đang bật không
- Thử tải lại trang
- Xóa cache trình duyệt
- Liên hệ quản lý nếu cần thiết

## Liên Hệ Hỗ Trợ

Khi gặp vấn đề hoặc cần hỗ trợ:
1. **Nhân viên kỹ thuật**: Liên hệ trực tiếp với nhân viên IT
2. **Quản lý**: Báo cáo vấn đề cho quản lý để được hỗ trợ
3. **Tài liệu**: Tham khảo hướng dẫn này trước khi liên hệ hỗ trợ

## Cập Nhật Hệ Thống

Hệ thống sẽ được cập nhật định kỳ để cải thiện chức năng và bảo mật. Khi có cập nhật:
- Thông báo sẽ được gửi qua email
- Hướng dẫn sử dụng sẽ được cập nhật
- Đào tạo sẽ được tổ chức nếu cần thiết

---

**Phiên bản**: 1.0.2
**Cập nhật lần cuối**: 05/08/2025
**Đối tượng sử dụng**: Nhân viên trung tâm đào tạo
