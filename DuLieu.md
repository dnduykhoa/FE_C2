# Dữ Liệu Mẫu Cho Admin Nhập DB

Tài liệu này dùng để admin nhập dữ liệu thủ công qua UI, MongoDB Compass hoặc Postman.
Không phải script seed.

## 1) Roles

- ADMIN
- MODERATOR
- USER

## 2) Categories

| name | description |
|---|---|
| Bình hoa gốm | Nhóm sản phẩm chuyên dùng để cắm hoa, trang trí bàn, phòng khách và không gian tiếp khách. |
| Bộ ấm trà | Bộ đồ uống trà gốm nổi bật, phù hợp dùng làm quà tặng hoặc sử dụng trong không gian ấm trà truyền thống. |
| Ly gốm | Các loại ly dùng uống cà phê, trà, sữa, nước uống nóng lạnh với chất liệu gốm bền đẹp. |
| Chén đĩa | Nhóm chén, đĩa ăn cơ bản dùng trong bộ bàn ăn hằng ngày hoặc phục vụ ăn uống gia đình. |
| Lọ hương | Sản phẩm phục vụ thờ cúng, thắp hương, trang trí bàn thờ và không gian tâm linh. |
| Tượng gốm trang trí | Các mẫu tượng, decor gốm có hình dáng đẹp, dùng để trang trí nội thất và làm quà tặng. |
| Đồ gốm mini | Sản phẩm gốm kích thước nhỏ, phù hợp trang trí kệ sách, bàn làm việc hoặc làm quà nhỏ. |
| Đồ gốm quà tặng | Nhóm sản phẩm được chọn làm quà tặng, thường có bao bì đẹp và tính sang trọng. |
| Đồ gốm bàn ăn | Các món đồ dùng cho mâm cơm gia đình, bao gồm chén, đĩa, tô, bát dùng hằng ngày. |
| Đồ gốm decor hiện đại | Sản phẩm gốm có thiết kế tối giản, màu trung tính, phù hợp phong cách nội thất hiện đại. |

## 3) Products

Dữ liệu mẫu để nhập, có thể thay đổi giá và mô tả theo thực tế:

| name | sku | category | price | description | status |
|---|---|---|---:|---|---|
| Bình Hoa Men Rạn Cổ Điển | BH-001 | Bình hoa gốm | 420000 | Bình hoa men rạn, phong cách cổ điển, hợp decor phòng khách. | true |
| Bình Hoa Gốm Nâu Đất Nung | BH-002 | Bình hoa gốm | 350000 | Bình đất nung, tông nâu ấm, phù hợp cắm hoa khô. | true |
| Bộ Ấm Trà Bát Tràng 01 | AT-001 | Bộ ấm trà | 680000 | Bộ ấm trà 6 món, men trắng, hoa văn vẽ tay. | true |
| Bộ Ấm Trà Men Lam | AT-002 | Bộ ấm trà | 820000 | Men lam truyền thống, dung tích vừa cho gia đình. | true |
| Ly Gốm Sử Dụng Nóng 350ml | LY-001 | Ly gốm | 145000 | Ly gốm men mờ, giữ nhiệt tốt, tay cầm chắc chắn. | true |
| Ly Gốm Men Cát Tinh Gọn | LY-002 | Ly gốm | 165000 | Tông màu trung tính, phù hợp phong cách tối giản. | true |
| Chén Cơm Gốm Men Trắng | CH-001 | Chén đĩa | 69000 | Chén ăn cơ bản, men trắng bền đẹp. | true |
| Đĩa Tròn Gốm Vẽ Hoa Văn | CH-002 | Chén đĩa | 119000 | Đĩa tròn trang trí hoa văn xanh cổ điển. | true |
| Lọ Hương Gốm Thủ Công | LH-001 | Lọ hương | 210000 | Lọ hương nhỏ gọn, dùng cho không gian thờ cúng. | true |
| Tượng Gốm Chú Tiểu Mini | TG-001 | Tượng gốm trang trí | 189000 | Tượng gốm mini trang trí bàn làm việc. | true |

## 4) Inventories

Dữ liệu tồn kho ban đầu, gắn theo SKU (đúng với model hiện tại của hệ thống):

| sku | stock | reservedStock | minStockThreshold |
|---|---:|---:|---:|
| BH-001 | 120 | 0 | 20 |
| BH-002 | 80 | 0 | 15 |
| AT-001 | 60 | 0 | 10 |
| AT-002 | 40 | 0 | 8 |
| LY-001 | 200 | 0 | 30 |
| LY-002 | 150 | 0 | 25 |
| CH-001 | 300 | 0 | 40 |
| CH-002 | 180 | 0 | 25 |
| LH-001 | 90 | 0 | 12 |
| TG-001 | 110 | 0 | 15 |

Quy đổi từ tên cột cũ sang hệ thống hiện tại:
- `quantity` = `stock`
- `reservedQuantity` = `reservedStock`
- `soldQuantity`: hiện chưa lưu riêng trong bảng tồn kho, thường được suy ra từ dữ liệu đơn hàng/thanh toán.

Vì sao form "Quản lý tồn kho" chỉ thấy 3 ô nhập?
- Cột `sku` được thay bằng ô chọn sản phẩm (theo `productId`) trên form.
- `reservedStock` không nhập tay khi tạo mới, hệ thống tự tăng/giảm theo luồng đặt hàng.
- Do đó form tạo tồn kho chỉ nhập: sản phẩm + `stock` + `minStockThreshold`.

## 5) Users (dữ liệu test)

Lưu ý: password phải được hash theo hệ thống khi tạo qua API. Dưới đây chỉ là dữ liệu logic.

| username | email | fullName | role | status |
|---|---|---|---|---|
| admin01 | admin01@gomxua.vn | Quản trị viên 01 | ADMIN | true |
| mod01 | mod01@gomxua.vn | Điều phối viên 01 | MODERATOR | true |
| user01 | user01@gmail.com | Nguyễn Minh An | USER | true |
| user02 | user02@gmail.com | Trần Bảo Châu | USER | true |

## 6) Mẫu dữ liệu Reservation

- status: PENDING, CONFIRMED, CANCELLED, EXPIRED
- note mẫu:
  - Giữ đến tối mai
  - Đặt trước để tặng sinh nhật
  - Sẽ thanh toán khi đến cửa hàng

## 7) Mẫu dữ liệu Review

- rating: 1 -> 5
- status: APPROVED, PENDING, REJECTED
- comment mẫu:
  - Sản phẩm đẹp, đúng mô tả, đóng gói kỹ.
  - Men gốm đẹp, cầm tay chắc, rất hài lòng.
  - Màu sắc hơi đậm hơn ảnh một chút nhưng vẫn đẹp.

## 8) Mẫu dữ liệu Support Chat

### Chủ đề gợi ý
- Cần hỗ trợ đổi trả sản phẩm
- Đơn hàng giao chậm
- Muốn đặt số lượng lớn cho sự kiện
- Sản phẩm bị nứt vỡ khi giao

### Mức ưu tiên
- low
- normal
- high
- urgent

### Nội dung mở đầu mẫu
- Tôi muốn hỏi về chính sách đổi trả trong 7 ngày.
- Đơn hàng của tôi đã quá ngày dự kiến nhưng chưa nhận được.
- Tôi cần đặt 50 bộ ly gốm cho sự kiện công ty.

## 9) Giá trị trạng thái để admin quản lý

### Trạng thái đơn hàng
- PENDING
- PAID
- SHIPPED
- COMPLETED
- CANCELLED

### Trạng thái thanh toán
- PENDING
- PAID
- FAILED
- REFUNDED
- CANCELLED

## 10) Ghi chú khi nhập dữ liệu

- Ưu tiên nhập theo thứ tự: Roles -> Categories -> Products -> Inventories -> Users.
- Sản phẩm nên có SKU duy nhất.
- Giá trị tiền nên để kiểu số nguyên (VND).
- Các trường status để `true` khi muốn hiển thị ra frontend.
- Không cần nhập qua script, có thể nhập tay bằng công cụ quản trị DB.