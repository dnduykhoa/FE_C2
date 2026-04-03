# Kế Hoạch Triển Khai Frontend FE_C2

## 1) Mục tiêu dự án FE

Xây dựng frontend cho website bán gốm xưa, kết nối backend hiện có trong thư mục `NODEJS_backend`, đảm bảo:
- Chạy được đầy đủ luồng người dùng: đăng ký/đăng nhập -> xem sản phẩm -> giỏ hàng -> đặt hàng COD -> theo dõi đơn.
- Có khu vực quản trị (admin/moderator) để quản lý sản phẩm, danh mục, tồn kho, đơn hàng, thanh toán, hỗ trợ chat.
- Đồng bộ đúng với API backend hiện tại (endpoint thật trong code), không dựa vào endpoint giả định.
- Sẵn sàng mở rộng các phần còn thiếu sau này (brands, payment online, realtime chat).

---

## 2) Backend hiện tại đang làm gì (đọc từ code + tài liệu .md)

## 2.1 Tổng quan kiến trúc BE
- Stack: Express + MongoDB (Mongoose) + JWT + Passport Google + Session.
- Entry: `NODEJS_backend/app.js`.
- Auth token: đọc từ `Authorization: Bearer <token>` hoặc cookie `token`.
- Phân quyền: `checkRole('ADMIN', 'MODERATOR')` hoặc `checkRole('ADMIN')` tùy route.

## 2.2 Endpoint prefix thực tế
Backend đang mount route trực tiếp, KHÔNG có `/api/v1`:
- `/auth`
- `/users`
- `/roles`
- `/products`
- `/categories`
- `/carts`
- `/orders`
- `/reservations`
- `/inventories`
- `/payments`
- `/reviews`
- `/messages` và alias `/support-chat` (cùng route handler)

=> FE phải dùng đúng các prefix trên.

## 2.3 Logic nghiệp vụ chính đã có

### Auth
- Register/Login/Logout/Forgot Password/Reset Password/Google OAuth callback.
- Login trả token và user; đồng thời set cookie token.
- Password có hash ở schema user.

### Catalog (Category/Product)
- Category: list/detail/create/update/delete mềm.
- Product: list/filter/search/detail/create/update/delete mềm.
- Product schema có nhiều field mở rộng (discount, material, featured, rating...) nhưng controller hiện chỉ xử lý một phần field cơ bản.

### Cart
- Lấy giỏ theo user.
- Thêm item, cập nhật quantity, xóa item, clear giỏ.

### Orders + Payments + Inventories (điểm mạnh hiện tại)
- Tạo order từ `items` truyền lên hoặc lấy từ cart nếu không truyền item.
- Khi tạo order có reserve stock trước.
- Tự tạo payment COD khi tạo order.
- Có đồng bộ trạng thái order <-> payment và tác động kho:
  - reserve
  - commit
  - release
  - restore
- Đây là phần nghiệp vụ quan trọng nhất cho FE checkout.

### Reservations
- Tạo, sửa, hủy, xem danh sách reservation của user.

### Reviews
- User có thể viết/sửa/xóa review của mình.
- Admin có thể xem tất cả và xóa review không phù hợp.

### Messages (support chat)
- User tạo ticket chat, gửi tin nhắn, xem ticket của mình.
- Admin/moderator có queue, assign, phản hồi, đổi trạng thái, mark read.
- Có unread count hai phía.

## 2.4 Nhận xét quan trọng để FE tránh lỗi
- Response format chưa hoàn toàn đồng nhất giữa mọi module (một số route trả raw object, một số trả `{ success, data }`).
- FE cần lớp `api adapter` để normalize response chung.
- Một số tài liệu `.md` nói `/api/v1/...`, nhưng code thực tế là không có `/api/v1`.

---

## 3) Phạm vi frontend cần triển khai

## 3.1 Khu vực Public
- Trang chủ (hero + sản phẩm nổi bật + danh mục).
- Trang danh sách sản phẩm (filter category/price/status + phân trang + search keyword).
- Trang chi tiết sản phẩm.
- Trang danh mục.
- Trang xem review theo sản phẩm.

## 3.2 Khu vực Auth
- Đăng ký.
- Đăng nhập.
- Quên mật khẩu.
- Đặt lại mật khẩu.
- Xử lý callback đăng nhập Google (nếu dùng hướng redirect token).

## 3.3 Khu vực User đã đăng nhập
- Hồ sơ cơ bản.
- Giỏ hàng.
- Checkout COD.
- Lịch sử đơn hàng + chi tiết đơn + hủy đơn khi trạng thái còn cho phép.
- Danh sách payment của tôi + chi tiết payment.
- Reservations của tôi.
- Reviews của tôi.
- Kênh chat hỗ trợ (my conversations + messages + gửi tin + mark read).

## 3.4 Khu vực Admin/Moderator
- Dashboard tổng quan.
- Quản lý danh mục.
- Quản lý sản phẩm.
- Quản lý tồn kho (list, low stock, tăng/giảm/adjust).
- Quản lý đơn hàng (đổi trạng thái).
- Quản lý payment (đổi trạng thái).
- Queue chat hỗ trợ (assign/reply/update status).
- Quản lý review (xem all, xóa).
- Quản lý role (admin only) và user list (admin/moderator).

---

## 4) Kiến trúc frontend đề xuất (React + Vite hiện tại)

## 4.1 Cài thêm thư viện cần thiết
- `@tanstack/react-query` (fetch/cache/retry/invalidate).
- `zustand` hoặc Context API cho auth/cart nhẹ.
- `react-hook-form` + `zod` (form + validation).
- `dayjs` (format thời gian).
- UI framework: có thể dùng Ant Design hoặc MUI để đi nhanh phần admin.
- Nếu cần thông báo: `react-hot-toast`.

## 4.2 Cấu trúc thư mục FE đề xuất

```text
FE_C2/src/
  app/
    router.jsx
    providers.jsx
  pages/
    public/
    auth/
    user/
    admin/
  components/
    common/
    layout/
    product/
    order/
    chat/
  services/
    httpClient.js
    auth.api.js
    products.api.js
    categories.api.js
    carts.api.js
    orders.api.js
    payments.api.js
    inventories.api.js
    reservations.api.js
    reviews.api.js
    messages.api.js
    users.api.js
    roles.api.js
  hooks/
  store/
  utils/
  constants/
  styles/
```

## 4.3 Quy tắc kỹ thuật FE
- Dùng 1 `httpClient` (axios instance):
  - baseURL từ `.env`
  - tự gắn `Authorization` nếu có token
  - interceptor xử lý 401/403
- Chuẩn hóa response trong service layer:
  - luôn trả object cùng format cho UI (`ok`, `data`, `errorCode`, `message`).
- Tách route guard:
  - `RequireAuth`
  - `RequireRole(['ADMIN', 'MODERATOR'])`
- Tạo constants cho enum status:
  - order status, payment status, chat status, priority.

---

## 5) Mapping API BE -> màn hình FE

## 5.1 Auth
- `POST /auth/register` -> Trang đăng ký.
- `POST /auth/login` -> Trang đăng nhập.
- `POST /auth/logout` -> Nút logout.
- `POST /auth/forgot-password` -> Form quên mật khẩu.
- `POST /auth/reset-password` -> Form đặt lại mật khẩu.
- `GET /auth/google`, `GET /auth/google/callback` -> nút đăng nhập Google.

## 5.2 Catalog + Product
- `GET /categories`
- `GET /categories/:id`
- `GET /products`
- `GET /products/search`
- `GET /products/category/:categoryId`
- `GET /products/:id`

Admin:
- `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

## 5.3 Cart + Checkout
- `GET /carts`
- `POST /carts/items`
- `PUT /carts/items/:productId`
- `DELETE /carts/items/:productId`
- `DELETE /carts/clear`

- `POST /orders` (truyền items hoặc để backend lấy từ cart).

## 5.4 Orders + Payments
- User:
  - `GET /orders`
  - `GET /orders/:id`
  - `PUT /orders/:id/cancel`
  - `GET /payments/my-payments`
  - `GET /payments/:id`
- Admin/mod:
  - `PUT /orders/:id/status`
  - `GET /payments`
  - `PATCH /payments/:id/status`

## 5.5 Inventory
- `GET /inventories`
- `GET /inventories/product/:productId`
- Admin/mod:
  - `POST /inventories`
  - `POST /inventories/increase-stock`
  - `POST /inventories/decrease-stock`
  - `PUT /inventories/adjust-stock`
  - `DELETE /inventories/product/:productId`

## 5.6 Reservations
- `GET /reservations`
- `GET /reservations/:id`
- `POST /reservations`
- `PUT /reservations/:id`
- `DELETE /reservations/:id`

## 5.7 Reviews
- Public:
  - `GET /reviews/product/:productId`
- User:
  - `GET /reviews/my-reviews`
  - `POST /reviews`
  - `PUT /reviews/:id`
  - `DELETE /reviews/:id`
- Admin:
  - `GET /reviews/admin/all`
  - `DELETE /reviews/admin/:id`

## 5.8 Support chat
- User:
  - `POST /messages/conversations`
  - `GET /messages/my-conversations`
  - `GET /messages/conversations/:id/messages`
  - `POST /messages/conversations/:id/messages`
  - `POST /messages/conversations/:id/read`
- Admin/mod:
  - `GET /messages/admin/conversations`
  - `POST /messages/admin/conversations/:id/assign`
  - `POST /messages/admin/conversations/:id/messages`
  - `PATCH /messages/admin/conversations/:id/status`

(Lưu ý: có thể dùng `/support-chat` tương đương `/messages`)

---

## 6) Roadmap triển khai FE chi tiết

## Giai đoạn 0 - Khởi tạo nền tảng (0.5 ngày)
Mục tiêu: setup khung FE chuẩn để code nhanh và ổn định.
- Cấu hình router đa layout (public/user/admin).
- Tạo axios instance + interceptor.
- Tạo auth store (token, user, role).
- Tạo route guards.
- Tạo UI shell cơ bản: header, footer, user sidebar, admin sidebar.
- Tạo cấu hình env: `VITE_API_BASE_URL`.

Deliverable:
- Chạy được điều hướng trang và gọi thử endpoint health/basic.

## Giai đoạn 1 - Auth + hồ sơ + quyền truy cập (1 ngày)
- Trang Register/Login/Forgot/Reset.
- Lưu token an toàn (ưu tiên memory + localStorage fallback theo nhu cầu).
- Parse role từ payload user để route guard admin/mod.
- Trang profile tối thiểu.

Deliverable:
- User đăng nhập/đăng xuất ổn định; route private hoạt động.

## Giai đoạn 2 - Public catalog và product detail (1.5 ngày)
- Trang chủ giới thiệu thương hiệu gốm xưa.
- Listing sản phẩm với:
  - phân trang
  - lọc category, min/max price
  - search keyword
- Chi tiết sản phẩm:
  - thông tin chính
  - danh sách review theo sản phẩm
  - nút thêm vào giỏ

Deliverable:
- Luồng xem và tìm sản phẩm mượt, responsive.

## Giai đoạn 3 - Cart + Checkout COD + Orders user (1.5 ngày)
- Cart page: tăng/giảm/xóa/clear.
- Checkout page:
  - nhập địa chỉ giao hàng
  - ghi chú đơn
  - submit tạo order
- Orders page:
  - danh sách đơn
  - chi tiết đơn
  - hủy đơn khi còn trạng thái phù hợp

Deliverable:
- Luồng mua hàng end-to-end bằng COD chạy được.

## Giai đoạn 4 - Payments + Reservations + Reviews user (1 ngày)
- My Payments: list + detail.
- Reservations: create/list/edit/cancel.
- My Reviews: tạo/sửa/xóa review.

Deliverable:
- Toàn bộ khu vực account user hoàn chỉnh mức V1.

## Giai đoạn 5 - Admin core (2 ngày)
- Quản lý category (CRUD).
- Quản lý product (CRUD).
- Quản lý inventory:
  - filter low stock
  - tăng/giảm/adjust stock
- Quản lý orders:
  - cập nhật status
- Quản lý payments:
  - cập nhật payment status

Deliverable:
- Admin có thể vận hành catalog + bán hàng.

## Giai đoạn 6 - Support chat + moderation (1 ngày)
- User ticket list + chat detail.
- Admin queue + assign + reply + update status.
- Mark read, hiển thị unread count.
- Admin review moderation.

Deliverable:
- Kênh CSKH hai chiều hoạt động.

## Giai đoạn 7 - Hoàn thiện chất lượng (1 ngày)
- Error handling thống nhất trên FE.
- Empty/loading/skeleton states.
- Toast + retry UX.
- Kiểm thử thủ công theo checklist Postman.
- Tối ưu mobile + desktop.

Deliverable:
- Bản FE có thể demo chính thức.

---

## 7) Checklist chức năng theo mức ưu tiên

## P0 (bắt buộc để demo)
- Auth local hoàn chỉnh.
- Product listing/detail/search/filter.
- Cart CRUD.
- Checkout tạo order COD.
- User xem/hủy đơn.
- Admin quản lý product/category/order/payment/inventory.

## P1 (nên có)
- Reviews đầy đủ.
- Reservations đầy đủ.
- Chat support user/admin.

## P2 (mở rộng)
- Google OAuth UX tốt hơn.
- Dashboard thống kê nâng cao.
- Tối ưu SEO và performance sâu.

---

## 8) Rủi ro và cách giảm rủi ro

1. BE response không đồng nhất giữa module.
- Cách xử lý: chuẩn hóa ở `services/*` trước khi trả ra UI.

2. Enum/status có thể khác nhau giữa route và nghiệp vụ.
- Cách xử lý: gom enum vào constants FE, map linh hoạt.

3. Quyền admin/moderator phụ thuộc dữ liệu role populate.
- Cách xử lý: kiểm tra null-safe ở FE, fallback an toàn nếu thiếu role.

4. API docs và code có chỗ lệch (ví dụ `/api/v1`).
- Cách xử lý: bám endpoint code thực tế đã xác minh.

5. Chat chưa realtime (polling).
- Cách xử lý: triển khai polling 5-10 giây ở V1, nâng cấp websocket ở V2.

---

## 9) Kế hoạch test FE đề xuất

## 9.1 Smoke test theo user journey
- Register -> Login -> xem sản phẩm -> add cart -> checkout -> xem đơn -> xem payment.

## 9.2 Test phân quyền
- User thường không vào admin route.
- Moderator/admin truy cập được inventory/payments admin endpoints.

## 9.3 Test case lỗi
- Token hết hạn.
- 401/403.
- Sản phẩm không tồn tại.
- Insufficient stock.
- Validation lỗi form.

## 9.4 Test hiển thị
- Mobile first cho user pages.
- Desktop tối ưu cho admin tables.

---

## 10) Đề xuất triển khai ngay trong FE_C2

Thứ tự code để đạt kết quả nhanh nhất:
1. Setup app shell + router + axios + auth store.
2. Làm Auth pages.
3. Làm Product listing/detail + cart.
4. Làm Checkout + Orders + Payments.
5. Làm Admin Product/Category/Inventory/Order/Payment.
6. Làm Reviews + Reservations + Support chat.
7. Hoàn thiện UX + kiểm thử.

Khi bám đúng thứ tự này, dự án sẽ sớm có bản chạy được cho demo và dễ mở rộng về sau.

---

## 11) Theo dõi thực thi (cập nhật code thực tế)

Ngày cập nhật: 03/04/2026

### Trạng thái giai đoạn
- [x] Giai đoạn 0 - Khởi tạo nền tảng
- [x] Giai đoạn 1 - Auth + hồ sơ + quyền truy cập
- [x] Giai đoạn 2 - Public catalog và product detail
- [x] Giai đoạn 3 - Cart + Checkout COD + Orders user
- [x] Giai đoạn 4 - Payments + Reservations + Reviews user
- [x] Giai đoạn 5 - Admin core
- [x] Giai đoạn 6 - Support chat + moderation
- [ ] Giai đoạn 7 - Hoàn thiện chất lượng

### Đã hoàn thành trong giai đoạn 0
- Router đa layout và route guard (`RequireAuth`, `RequireRole`).
- Cấu hình provider cho React Query + toast.
- Cấu hình auth store bằng zustand (persist).
- Tạo `httpClient` axios + interceptor token/401.
- Chuẩn hóa response qua adapter.
- Cấu hình proxy dev ở Vite và tạo `.env.example`.

### Đã hoàn thành trong giai đoạn 1
- Trang `Đăng nhập`.
- Trang `Đăng ký`.
- Trang `Quên mật khẩu`.
- Trang `Đặt lại mật khẩu`.
- Trang `Hồ sơ` cơ bản.
- Luồng đăng xuất và bảo vệ route private.

### Đã hoàn thành trong giai đoạn 2
- Trang chủ theo phong cách cổ điển, tối giản.
- Trang danh sách sản phẩm:
  - filter category
  - filter min/max giá
  - search keyword
  - phân trang
- Trang chi tiết sản phẩm.
- Hiển thị review theo sản phẩm.
- Theme CSS bám đúng palette và nguyên tắc trong `Layout.md`.

### Đã hoàn thành trong giai đoạn 3
- Tạo service gọi API giỏ hàng (`/carts`): lấy giỏ, thêm sản phẩm, cập nhật số lượng, xóa item, clear giỏ.
- Tạo service gọi API đơn hàng (`/orders`): tạo đơn COD, lấy danh sách đơn, lấy chi tiết đơn, hủy đơn.
- Hoàn thiện trang `Giỏ hàng`:
  - tăng/giảm số lượng
  - xóa từng sản phẩm
  - xóa toàn bộ giỏ
  - tính tổng tạm tính
- Hoàn thiện trang `Checkout COD`:
  - nhập địa chỉ giao hàng
  - nhập ghi chú
  - tạo đơn hàng theo flow backend (ưu tiên lấy item từ cart)
- Hoàn thiện trang `Đơn hàng của tôi` và `Chi tiết đơn`:
  - hiển thị trạng thái order/payment
  - hiển thị item và tổng tiền
  - hủy đơn khi trạng thái còn `PENDING`
- Nối route private cho user:
  - `/user/cart`
  - `/user/checkout`
  - `/user/orders`
  - `/user/orders/:id`
- Nối nút thêm vào giỏ từ trang danh sách sản phẩm và chi tiết sản phẩm.

### Đã hoàn thành trong giai đoạn 4
- Tạo service API `payments` cho user:
  - lấy danh sách thanh toán của tôi (`GET /payments/my-payments`)
  - lấy chi tiết thanh toán (`GET /payments/:id`)
- Tạo service API `reservations` cho user:
  - danh sách reservation
  - tạo reservation
  - cập nhật reservation
  - hủy reservation
- Mở rộng service API `reviews` cho user:
  - lấy review của tôi
  - tạo review
  - sửa review
  - xóa review
- Hoàn thiện trang user:
  - `Thanh toán của tôi` + `Chi tiết thanh toán`
  - `Reservation của tôi` (CRUD theo trạng thái)
  - `Review của tôi` (CRUD)
- Cập nhật route private:
  - `/user/payments`
  - `/user/payments/:id`
  - `/user/reservations`
  - `/user/reviews`
- Cập nhật menu điều hướng cho các khu vực stage 4.
- Bổ sung map lỗi backend sang thông báo tiếng Việt cho các mã lỗi stage 4.

### Đã hoàn thành trong giai đoạn 5
- Mở rộng service admin:
  - Category: create/update/delete.
  - Product: create/update/delete.
  - Inventory: list/create/increase/decrease/adjust/delete.
  - Order: update status theo order id.
  - Payment: list all + update payment status.
- Hoàn thiện `Dashboard` admin theo module:
  - Quản lý danh mục (CRUD).
  - Quản lý sản phẩm (CRUD).
  - Quản lý tồn kho (tạo bản ghi, tăng/giảm/adjust, xóa).
  - Quản lý đơn hàng (cập nhật trạng thái theo id).
  - Quản lý thanh toán (list + cập nhật status).
- Bổ sung map lỗi backend sang thông báo tiếng Việt cho mã lỗi admin core.
- Cập nhật header chung FE theo yêu cầu:
  - Chỉ giữ tab `Trang chủ` và `Sản phẩm`.
  - Giỏ hàng chuyển thành icon.
- Bổ sung style cho tab admin và header rút gọn.

Ghi chú theo BE thực tế:
- Backend hiện chưa có endpoint `GET /orders` dạng list-all cho admin; route hiện tại vẫn trả đơn theo `req.userId`.
- Dashboard admin xử lý phần cập nhật đơn hàng theo `orderId` (chọn từ payment hoặc nhập trực tiếp) để bám đúng API hiện có.

### Đã hoàn thành trong giai đoạn 6
- Đọc và bám đúng flow BE support chat trong `routes/messages.js` + `controllers/messages.js`.
- Tạo service API `messages` cho FE:
  - user: tạo conversation, lấy danh sách conversation của tôi, lấy messages, gửi tin nhắn, mark read.
  - admin/moderator: lấy queue conversation, assign, reply, cập nhật status.
- Hoàn thiện trang user `Hỗ trợ`:
  - tạo ticket mới (subject/priority/content)
  - xem danh sách hội thoại của tôi
  - xem lịch sử tin nhắn
  - gửi tin nhắn và mark read
- Nối route private user cho hỗ trợ:
  - `/user/support`
- Cập nhật menu tài khoản để truy cập nhanh màn hình hỗ trợ.
- Mở rộng dashboard admin:
  - tab `Hỗ trợ chat`: queue + lọc trạng thái/assigned, chọn ticket, assign, reply, mark read, update status.
  - tab `Review moderation`: xem toàn bộ review và xóa review không phù hợp (bám endpoint admin review của BE).
- Mở rộng service reviews cho admin moderation:
  - `GET /reviews/admin/all`
  - `DELETE /reviews/admin/:id`
- Bổ sung map lỗi support chat vào `responseAdapter` để thông báo tiếng Việt rõ ràng.

### Kiểm tra build
- `npm install`: thành công.
- `npm run build`: thành công.

### Bước tiếp theo
- Triển khai giai đoạn 7 theo kế hoạch: hoàn thiện chất lượng (loading/empty state, tối ưu UX, rà soát lỗi và test checklist).
