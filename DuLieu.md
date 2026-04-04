# Du Lieu Mau Cho Admin Nhap DB

Tai lieu nay de admin nhap du lieu thu cong (qua UI, MongoDB Compass, Postman...).
Khong phai script seed.

## 1) Roles

- ADMIN
- MODERATOR
- USER

## 2) Categories

- Binh hoa gom
- Bo am tra
- Ly gom
- Chen dia
- Lo huong
- Tuong gom trang tri
- Do gom mini
- Do gom qua tang
- Do gom ban an
- Do gom decor hien dai

## 3) Products

Mau du lieu de nhap (co the thay doi gia va mo ta):

| name | sku | category | price | description | status |
|---|---|---|---:|---|---|
| Binh Hoa Men Ran Co Dien | BH-001 | Binh hoa gom | 420000 | Binh hoa men ran, phong cach co dien, hop decor phong khach | true |
| Binh Hoa Gom Nau Dat Nung | BH-002 | Binh hoa gom | 350000 | Binh dat nung, tong nau am, phu hop cam hoa kho | true |
| Bo Am Tra Bat Trang 01 | AT-001 | Bo am tra | 680000 | Bo am tra 6 mon, men trang, hoa van ve tay | true |
| Bo Am Tra Men Lam | AT-002 | Bo am tra | 820000 | Men lam truyen thong, dung tich vua cho gia dinh | true |
| Ly Gom Suc Uong Nong 350ml | LY-001 | Ly gom | 145000 | Ly gom men mo, giu nhiet tot, tay cam chac chan | true |
| Ly Gom Men Cat Tinh Gian | LY-002 | Ly gom | 165000 | Tong mau trung tinh, phu hop phong cach toi gian | true |
| Chen Com Gom Men Trang | CH-001 | Chen dia | 69000 | Chen an co ban, men trang ben dep | true |
| Dia Tron Gom Ve Hoa Van | CH-002 | Chen dia | 119000 | Dia tron trang tri hoa van xanh co dien | true |
| Lo Huong Gom Thu Cong | LH-001 | Lo huong | 210000 | Lo huong nho gon, dung cho khong gian tho cung | true |
| Tuong Gom Chu Tieu Mini | TG-001 | Tuong gom trang tri | 189000 | Tuong gom mini trang tri ban lam viec | true |

## 4) Inventories

Mau ton kho ban dau (gan theo SKU):

| sku | quantity | reservedQuantity | soldQuantity |
|---|---:|---:|---:|
| BH-001 | 120 | 0 | 0 |
| BH-002 | 80 | 0 | 0 |
| AT-001 | 60 | 0 | 0 |
| AT-002 | 40 | 0 | 0 |
| LY-001 | 200 | 0 | 0 |
| LY-002 | 150 | 0 | 0 |
| CH-001 | 300 | 0 | 0 |
| CH-002 | 180 | 0 | 0 |
| LH-001 | 90 | 0 | 0 |
| TG-001 | 110 | 0 | 0 |

## 5) Users (du lieu test)

Luu y: password phai hash theo he thong khi tao qua API. Duoi day chi la du lieu logic.

| username | email | fullName | role | status |
|---|---|---|---|---|
| admin01 | admin01@gomxua.vn | Quan tri vien 01 | ADMIN | true |
| mod01 | mod01@gomxua.vn | Dieu phoi vien 01 | MODERATOR | true |
| user01 | user01@gmail.com | Nguyen Minh An | USER | true |
| user02 | user02@gmail.com | Tran Bao Chau | USER | true |

## 6) Mau du lieu Reservation

- status: PENDING, CONFIRMED, CANCELLED, EXPIRED
- note mau:
  - Giu den toi mai
  - Dat truoc de tang sinh nhat
  - Se thanh toan khi den cua hang

## 7) Mau du lieu Review

- rating: 1 -> 5
- status: APPROVED, PENDING, REJECTED
- comment mau:
  - San pham dep, dung mo ta, dong goi ky
  - Men gom dep, cam tay chac, rat hai long
  - Mau sac hoi dam hon anh mot chut nhung van dep

## 8) Mau du lieu Support Chat

### Subject goi y
- Can ho tro doi tra san pham
- Don hang giao cham
- Muon dat so luong lon cho su kien
- San pham bi nut vo khi giao

### Priority
- low
- normal
- high
- urgent

### Noi dung mo dau mau
- Toi muon hoi ve chinh sach doi tra trong 7 ngay.
- Don hang cua toi da qua ngay du kien nhung chua nhan duoc.
- Toi can dat 50 bo ly gom cho su kien cong ty.

## 9) Gia tri trang thai de admin quan ly

### Order status
- PENDING
- PAID
- SHIPPED
- COMPLETED
- CANCELLED

### Payment status
- PENDING
- PAID
- FAILED
- REFUNDED
- CANCELLED

## 10) Ghi chu khi nhap du lieu

- Uu tien nhap theo thu tu: Roles -> Categories -> Products -> Inventories -> Users.
- Product nen co SKU duy nhat.
- Gia tri tien nen de kieu so nguyen (VND).
- Cac truong status de true khi muon hien thi ra frontend.
- Khong can nhap qua script, co the nhap tay bang cong cu quan tri DB.