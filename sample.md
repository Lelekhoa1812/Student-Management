# Sample CURL requests

## 1. Creating New Incomplete Payments with Different Staff
```bash
# Create payment for Võ Đức Anh (B1 class) assigned to Liam
curl -X POST "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id":"6890e3835c317ed691eb24bf",
    "payment_amount":3000000,
    "user_id":"6890e3845c317ed691eb24c6",
    "payment_method":"Chưa thanh toán",
    "staff_assigned":"6890e864bfd07b3136b36a29"
  }'

# Create payment for Phạm Thu Hà (B2 class) assigned to Phạm Thị D
curl -X POST "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id":"6890e3835c317ed691eb24c0",
    "payment_amount":3500000,
    "user_id":"6890e3845c317ed691eb24c5",
    "payment_method":"Chưa thanh toán",
    "staff_assigned":"6890e3875c317ed691eb24cf"
  }'

# Create payment for Trần Văn Nam (C1 class) assigned to Liam
curl -X POST "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id":"6890e3835c317ed691eb24c1",
    "payment_amount":4000000,
    "user_id":"6890e3845c317ed691eb24c8",
    "payment_method":"Chưa thanh toán",
    "staff_assigned":"6890e864bfd07b3136b36a29"
  }'

# Create payment for Võ Đức Anh (A1 class) assigned to Phạm Thị D
curl -X POST "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id":"6890e3825c317ed691eb24bd",
    "payment_amount":2000000,
    "user_id":"6890e3845c317ed691eb24c6",
    "payment_method":"Chưa thanh toán",
    "staff_assigned":"6890e3875c317ed691eb24cf"
  }'
```

## 2. Updating Existing Payments to Reassign Staff
```bash
# Reassign Phạm Thị Dung's payment to Liam
curl -X PUT "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"6890e38f321f0a5437f409f5",
    "staff_assigned":"6890e864bfd07b3136b36a29"
  }'

# Reassign Lê Thị Mai's payment to Phạm Thị D
curl -X PUT "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"6890e38f321f0a5437f409f4",
    "staff_assigned":"6890e3875c317ed691eb24cf"
  }'

# Reassign Nguyễn Thị Lan's payment to Phạm Thị D
curl -X PUT "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"6890e38e321f0a5437f409f1",
    "staff_assigned":"6890e3875c317ed691eb24cf"
  }'
```

## 3. Completing Payments
```bash
# Complete Võ Đức Anh's payment with Cash
curl -X PUT "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"6891c3da62c465fe8f5af26e",
    "have_paid":true,
    "payment_method":"Cash"
  }'

# Complete Phạm Thị Dung's payment with Internet banking
curl -X PUT "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"6890e38f321f0a5437f409f5",
    "have_paid":true,
    "payment_method":"Internet banking"
  }'
```

## 4. Creating Test Reminders
```bash
# Create payment reminder for Võ Đức Anh (Liam)
curl -X POST "http://localhost:3000/api/test-reminders-create" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"payment",
    "platform":"call",
    "studentId":"6890e3845c317ed691eb24c6",
    "content":"Nhắc học viên Võ Đức Anh thanh toán học phí lớp B1",
    "staffId":"6890e864bfd07b3136b36a29"
  }'

# Create examination reminder for Phạm Thu Hà (Phạm Thị D)
curl -X POST "http://localhost:3000/api/test-reminders-create" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"examination",
    "platform":"email",
    "studentId":"6890e3845c317ed691eb24c5",
    "content":"Nhắc học viên Phạm Thu Hà đăng ký thi xếp lớp",
    "staffId":"6890e3875c317ed691eb24cf"
  }'

# Create payment reminder for Nguyễn Thị Lan (Lê Văn C)
curl -X POST "http://localhost:3000/api/test-reminders-create" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"payment",
    "platform":"sms",
    "studentId":"6890e3845c317ed691eb24c7",
    "content":"Nhắc học viên Nguyễn Thị Lan thanh toán học phí",
    "staffId":"6890e3875c317ed691eb24ce"
  }'
```

## 5. Verification Commands
```bash
# Check incomplete payments
curl -X GET "http://localhost:3000/api/payments?havePaid=false"

# Check all payments
curl -X GET "http://localhost:3000/api/payments"

# Check KPI data
curl -X GET "http://localhost:3000/api/kpi"

# Check test reminders
curl -X GET "http://localhost:3000/api/test-reminders"
```