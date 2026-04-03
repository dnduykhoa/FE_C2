# Layout Design - Website Ban Gom Co

## 1) Dinh huong thiet ke tong the

Muc tieu giao dien:
- Co khong khi xua cu, lang que, truyen thong Viet.
- Toi gian, de nhin, de dung, khong loe loet.
- Cam giac "chat lieu": dat nung, giay do, go cu, vai moc.

Tu khoa thi giac:
- Co dien, moc mac, am, tram, mut.
- It mau nhan, uu tien mau dat va trung tinh nong.
- Bo cuc thoang, nhieu khoang trang, typography de doc.

---

## 2) Bang mau chu dao (palette chinh)

## 2.1 Palette A - Gom Dat Nung (de xuat dung chinh)
- Nen chinh: #F4EFE6 (giay cu)
- Nen phu: #E9DFCF (vai moc)
- Mau chu chinh: #2F241D (nau dam)
- Mau chu phu: #5C4A3F (nau trung)
- Mau nhan thuong hieu: #9E5B3A (dat nung)
- Mau nhan phu: #7A8B63 (reu kho)
- Mau vien/line: #CDBFAA
- Mau hover nhe: #E2D5C3
- Mau card background: #FBF8F3

Y nghia:
- Day la to hop an toan, co net xua, rat hop gom co va do thu cong.

## 2.2 Palette B - Chieu Que Co (phuong an thay the)
- Nen chinh: #F7F1E7
- Nen phu: #EDE2D0
- Mau chu chinh: #2D2A26
- Mau chu phu: #665A4D
- Mau nhan: #A06A4B
- Mau nhan lanh nhe: #6D7B75
- Mau line: #D3C6B3

## 2.3 Mau trang thai
- Success: #5E7D4B
- Warning: #B9863B
- Error: #A1463A
- Info: #5B6F83

Luu y:
- Mau trang thai phai mut, khong dung xanh do tuoi gac.

---

## 3) Ty le mau de phoi (rat quan trong)

Ap dung quy tac 70 - 20 - 10:
- 70%: nen trung tinh nong (F4EFE6, FBF8F3)
- 20%: nau text/line (2F241D, CDBFAA)
- 10%: mau nhan dat nung (9E5B3A) hoac reu kho (7A8B63)

Khong dung qua 2 mau nhan trong 1 man hinh.

---

## 4) Typography (phong vi co dien nhung van de doc)

## 4.1 Font de xuat
- Heading (co hon): "Cormorant Garamond", "Playfair Display", serif
- Body (de doc): "Be Vietnam Pro", "Noto Sans", sans-serif

## 4.2 He thong chu
- H1: 44-52, weight 600, line-height 1.15
- H2: 32-40, weight 600
- H3: 24-28, weight 600
- Body L: 18
- Body M: 16
- Body S: 14
- Caption: 12

## 4.3 Nguyen tac
- Heading dung serif de tao chat "co".
- Noi dung dai dung sans de de doc.
- Khong dung qua 2 font family.

---

## 5) Bo cuc (layout structure)

## 5.1 Khung trang
- Max width content: 1200px
- Desktop padding ngang: 48px
- Tablet: 24px
- Mobile: 16px

## 5.2 Header
- Cao 72-80px
- Nen sang, vien duoi 1px mau #CDBFAA
- Logo ben trai, menu giua, icon tai khoan/gio hang ben phai
- Sticky nhe khi cuon

## 5.3 Hero section
- Nen co texture rat nhe (giay/vai), khong dung gradient loe
- 1 heading lon + 1 subtitle ngan + 1 CTA chinh
- Anh gom lon ben canh, bo goc nhe 12-16

## 5.4 Product listing
- Grid:
  - Desktop: 4 cot
  - Tablet: 3 cot
  - Mobile: 2 cot
- Khoang cach card: 20-24
- Filter panel don gian, nen dat o tren hoac cot trai desktop

## 5.5 Footer
- Nen dam hon nen trang mot cap (E9DFCF)
- Chia 3-4 cot: gioi thieu, lien he, chinh sach, social
- Typography nho gon, khong qua dam

---

## 6) Nguyen tac component

## 6.1 Button
- Primary:
  - Nen: #9E5B3A
  - Chu: #FDF9F2
  - Hover: #8B4F32
- Secondary:
  - Nen: transparent
  - Vien: 1px #9E5B3A
  - Chu: #9E5B3A
  - Hover: #F0E5D7
- Border radius: 10-12
- Chieu cao: 42-46

## 6.2 Card san pham
- Nen: #FBF8F3
- Vien: 1px #E2D5C3
- Radius: 14
- Shadow rat nhe: 0 6px 18px rgba(47, 36, 29, 0.08)
- Hover: dich len 2px + shadow tang rat nhe

## 6.3 Input/Form
- Nen input: #FDF9F2
- Vien: 1px #CDBFAA
- Focus: vien #9E5B3A + bong mo 0 0 0 3px rgba(158, 91, 58, 0.15)
- Placeholder: #9C8E81

## 6.4 Badge status
- Pending: nen #EFE2CF, chu #7A583F
- Paid/Success: nen #E2ECD8, chu #4B6840
- Cancelled/Error: nen #F0D8D4, chu #8A3E34

---

## 7) Phong cach hinh anh va icon

## 7.1 Hinh anh
- Uu tien anh co tong mau am, nhiet do mau hoi vang.
- Tranh saturation cao.
- Co the phu lop texture rat nhe (2-4% opacity).

## 7.2 Icon
- Dung icon net gon, stroke vua phai.
- Mau icon: #5C4A3F, hover #9E5B3A.

---

## 8) Motion va hieu ung

Chi dung chuyen dong nhe, cham:
- Transition co ban: 180ms - 240ms, ease-out
- Card hover: translateY(-2px)
- Button hover: doi nen nhe + shadow min
- Khong dung animation quay, nhay, neon

---

## 9) Theme token de dua vao CSS

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

## 10) Huong dan phoi cho tung trang

## 10.1 Trang chu
- Nen tong: --bg-main
- Hero card: --bg-soft
- CTA chinh: --brand-primary
- Section divider: line mỏng --line

## 10.2 Trang danh sach san pham
- Nen tong sang, de card noi bat
- Filter bar dung --bg-muted
- Gia sale co the nhan bang --brand-primary, gia goc --text-sub

## 10.3 Trang chi tiet san pham
- Khu anh: nen trung tinh
- Nut mua ngay: primary
- Nut them gio: secondary
- Block review: nen --bg-soft, vien --line

## 10.4 Cart/Checkout
- Layout 2 cot desktop:
  - Trai: danh sach item
  - Phai: tong ket don + CTA
- O tong ket don dung nen --bg-soft va vien --line

## 10.5 Admin dashboard
- Van giu tone co dien nhung gon hon user page
- Table:
  - header nen --bg-muted
  - row hover --hover-soft
- Status badge dung bo mau trang thai o muc 2.3

---

## 11) Nhung dieu nen tranh

- Khong dung mau tim/neon.
- Khong dung gradient qua manh.
- Khong dung qua nhieu box-shadow dam.
- Khong de 1 man hinh qua 3 cap font-size chinh.
- Khong tron qua nhieu mau nhan (se mat chat toi gian).

---

## 12) 3 phuong an phoi nhanh de chon

## Option 1 - Truyen thong an toan (de xuat)
- Dung Palette A 100%.
- Header sang, footer muted.
- Nhieu vien line mỏng.

## Option 2 - Tram am hon
- Nen chinh #EFE7DB
- Text chinh #2B211B
- Brand #8D4F33
- Hop cho concept "gom co cao cap".

## Option 3 - Lang que moc mac
- Them mau reu (#7A8B63) cho badge va chip filter.
- Background texture vai rat nhe o hero va footer.

Khuyen nghi chot Option 1 de de trien khai, de mo rong, it rui ro lech tone.
