# Layout Design - Website Bán Gốm Cổ

## 1) Định hướng thiết kế tổng thể

Mục tiêu giao diện:
- Có không khí xưa cũ, làng quê, truyền thống Việt.
- Tối giản, dễ nhìn, dễ dùng, không lòe loẹt.
- Cảm giác "chất liệu": đất nung, giấy dó, gỗ cũ, vải mộc.

Từ khóa thị giác:
- Cổ điển, mộc mạc, ấm, trầm, mịn.
- Ít màu nhấn, ưu tiên màu đất và trung tính nóng.
- Bố cục thoáng, nhiều khoảng trắng, typography dễ đọc.

---

## 2) Bảng màu chủ đạo (palette chính)

## 2.1 Palette A - Gốm Đất Nung (đề xuất dùng chính)
- Nền chính: #F4EFE6 (giấy cũ)
- Nền phụ: #E9DFCF (vải mộc)
- Màu chữ chính: #2F241D (nâu đậm)
- Màu chữ phụ: #5C4A3F (nâu trung)
- Màu nhấn thương hiệu: #9E5B3A (đất nung)
- Màu nhấn phụ: #7A8B63 (rêu khô)
- Mau vien/line: #CDBFAA
- Màu hover nhẹ: #E2D5C3
- Màu card background: #FBF8F3

Ý nghĩa:
- Đây là tổ hợp an toàn, có nét xưa, rất hợp gốm cổ và đồ thủ công.

## 2.2 Palette B - Chiều Quê Cổ (phương án thay thế)
- Nền chính: #F7F1E7
- Nền phụ: #EDE2D0
- Màu chữ chính: #2D2A26
- Màu chữ phụ: #665A4D
- Màu nhấn: #A06A4B
- Màu nhấn lạnh nhẹ: #6D7B75
- Màu line: #D3C6B3

## 2.3 Màu trạng thái
- Success: #5E7D4B
- Warning: #B9863B
- Error: #A1463A
- Info: #5B6F83

Lưu ý:
- Màu trạng thái phải mụt, không dùng xanh đỏ tươi gắt.

---

## 3) Tỷ lệ màu để phối (rất quan trọng)

Áp dụng quy tắc 70 - 20 - 10:
- 70%: nen trung tinh nong (F4EFE6, FBF8F3)
- 20%: nau text/line (2F241D, CDBFAA)
- 10%: mau nhan dat nung (9E5B3A) hoac reu kho (7A8B63)

Không dùng quá 2 màu nhấn trong 1 màn hình.

---

## 4) Typography (phong vị cổ điển nhưng vẫn dễ đọc)

## 4.1 Font đề xuất
- Heading (cổ hơn): "Cormorant Garamond", "Playfair Display", serif
- Body (dễ đọc): "Be Vietnam Pro", "Noto Sans", sans-serif

## 4.2 Hệ thống chữ
- H1: 44-52, weight 600, line-height 1.15
- H2: 32-40, weight 600
- H3: 24-28, weight 600
- Body L: 18
- Body M: 16
- Body S: 14
- Caption: 12

## 4.3 Nguyên tắc
- Heading dùng serif để tạo chất "cổ".
- Nội dung dài dùng sans để dễ đọc.
- Không dùng quá 2 font family.

---

## 5) Bố cục (layout structure)

## 5.1 Khung trang
- Max width content: 1200px
- Desktop padding ngang: 48px
- Tablet: 24px
- Mobile: 16px

## 5.2 Header
- Cao 72-80px
- Nền sáng, viền dưới 1px màu #CDBFAA
- Logo bên trái, menu giữa, icon tài khoản/giỏ hàng bên phải
- Sticky nhẹ khi cuộn

## 5.3 Hero section
- Nền có texture rất nhẹ (giấy/vải), không dùng gradient lòe
- 1 heading lớn + 1 subtitle ngắn + 1 CTA chính
- Ảnh gốm lớn bên cạnh, bo góc nhẹ 12-16

## 5.4 Product listing
- Grid:
  - Desktop: 4 cot
  - Tablet: 3 cot
  - Mobile: 2 cot
- Khoảng cách card: 20-24
- Filter panel đơn giản, nên đặt ở trên hoặc cột trái desktop

## 5.5 Footer
- Nền đậm hơn nền trắng một cấp (E9DFCF)
- Chia 3-4 cột: giới thiệu, liên hệ, chính sách, social
- Typography nhỏ gọn, không quá đậm

---

## 6) Nguyên tắc component

## 6.1 Button
- Primary:
  - Nền: #9E5B3A
  - Chữ: #FDF9F2
  - Hover: #8B4F32
- Secondary:
  - Nền: transparent
  - Viền: 1px #9E5B3A
  - Chữ: #9E5B3A
  - Hover: #F0E5D7
- Border radius: 10-12
- Chiều cao: 42-46

-## 6.2 Card sản phẩm
- Nền: #FBF8F3
- Viền: 1px #E2D5C3
- Radius: 14
- Shadow rất nhẹ: 0 6px 18px rgba(47, 36, 29, 0.08)
- Hover: dịch lên 2px + shadow tăng rất nhẹ

## 6.3 Input/Form
- Nền input: #FDF9F2
- Viền: 1px #CDBFAA
- Focus: viền #9E5B3A + bóng mờ 0 0 0 3px rgba(158, 91, 58, 0.15)
- Placeholder: #9C8E81

## 6.4 Badge status
- Pending: nen #EFE2CF, chu #7A583F
- Paid/Success: nen #E2ECD8, chu #4B6840
- Cancelled/Error: nen #F0D8D4, chu #8A3E34

---

## 7) Phong cách hình ảnh và icon

## 7.1 Hình ảnh
- Ưu tiên ảnh có tông màu ấm, nhiệt độ màu hơi vàng.
- Tránh saturation cao.
- Có thể phủ lớp texture rất nhẹ (2-4% opacity).

## 7.2 Icon
- Dùng icon nét gọn, stroke vừa phải.
- Màu icon: #5C4A3F, hover #9E5B3A.

---

## 8) Motion và hiệu ứng

Chỉ dùng chuyển động nhẹ, chậm:
- Transition cơ bản: 180ms - 240ms, ease-out
- Card hover: translateY(-2px)
- Button hover: đổi nền nhẹ + shadow mịn
- Không dùng animation quay, nhảy, neon

---

## 9) Theme token để đưa vào CSS

```css
:root {
  --bg-main: #F4EFE6;
  --bg-soft: #FBF8F3;
  --bg-muted: #E9DFCF;

  --text-main: #2F241D;
  --text-sub: #5C4A3F;

  --brand-primary: #9E5B3A;
  --brand-secondary: #7A8B63;

  --line: #CDBFAA;
  --hover-soft: #E2D5C3;

  --success: #5E7D4B;
  --warning: #B9863B;
  --error: #A1463A;
  --info: #5B6F83;

  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;

  --shadow-soft: 0 6px 18px rgba(47, 36, 29, 0.08);
}
```

---

## 10) Hướng dẫn phối cho từng trang

## 10.1 Trang chủ
- Nền tổng: --bg-main
- Hero card: --bg-soft
- CTA chính: --brand-primary
- Section divider: line mỏng --line

## 10.2 Trang danh sách sản phẩm
- Nền tổng sáng, để card nổi bật
- Filter bar dùng --bg-muted
- Giá sale có thể nhấn bằng --brand-primary, giá gốc --text-sub

## 10.3 Trang chi tiết sản phẩm
- Khu ảnh: nền trung tính
- Nút mua ngay: primary
- Nút thêm giỏ: secondary
- Block review: nền --bg-soft, viền --line

## 10.4 Cart/Checkout
- Layout 2 cột desktop:
  - Trái: danh sách item
  - Phải: tổng kết đơn + CTA
- Ô tổng kết đơn dùng nền --bg-soft và viền --line

-## 10.5 Admin dashboard
- Vẫn giữ tone cổ điển nhưng gọn hơn user page
- Table:
  - header nền --bg-muted
  - row hover --hover-soft
- Status badge dùng bộ màu trạng thái ở mục 2.3

---

## 11) Những điều nên tránh

- Không dùng màu tím/neon.
- Không dùng gradient quá mạnh.
- Không dùng quá nhiều box-shadow đậm.
- Không để 1 màn hình quá 3 cấp font-size chính.
- Không trộn quá nhiều màu nhấn (sẽ mất chất tối giản).

---

## 12) 3 phương án phối nhanh để chọn

## Option 1 - Truyền thống an toàn (đề xuất)
- Dùng Palette A 100%.
- Header sáng, footer muted.
- Nhiều viền line mỏng.

## Option 2 - Trầm ấm hơn
- Nền chính #EFE7DB
- Text chính #2B211B
- Brand #8D4F33
- Hợp cho concept "gốm cổ cao cấp".

## Option 3 - Làng quê mộc mạc
- Thêm màu rêu (#7A8B63) cho badge và chip filter.
- Background texture vải rất nhẹ ở hero và footer.

Khuyến nghị chốt Option 1 để dễ triển khai, dễ mở rộng, ít rủi ro lệch tone.
