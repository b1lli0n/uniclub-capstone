# UniClub Backend Architecture

Backend của UniClub được tổ chức theo mô hình phân lớp để dễ quản lý, dễ bảo trì và dễ mở rộng.

## 1. Request Flow

Luồng xử lý một request trong backend:

Client → App → Routes → Controller → Service → Model → Database

### Giải thích luồng

1. Client gọi API từ frontend bằng Axios.
2. `app.js` cấu hình middleware chung như CORS, JSON parser và khai báo routes.
3. `routes/` định nghĩa các API endpoint.
4. `controllers/` nhận request từ route, lấy dữ liệu từ `req.body`, `req.params`, `req.query`, sau đó gọi service.
5. `services/` xử lý business logic của hệ thống.
6. `models/` định nghĩa schema và thao tác với MongoDB thông qua Mongoose.
7. Kết quả được trả ngược lại từ service → controller → client.

## 2. Folder Structure

```text
backend/
├── src/
│   ├── config/          # Cấu hình database, env
│   ├── controllers/     # Nhận request và trả response
│   ├── services/        # Xử lý nghiệp vụ chính
│   ├── models/          # Mongoose schema/model
│   ├── routes/          # Định nghĩa API endpoint
│   ├── middlewares/     # Auth, validate, error handler
│   ├── app.js           # Cấu hình Express app
│   └── server.js        # Start server