# Huong dan FE trien khai chuc nang chat ho tro

Tai lieu nay huong dan frontend trien khai man hinh chat support dua tren API backend hien tai.

## 1) Tong quan API

- Base URL: `http://localhost:3000`
- Auth: bat buoc JWT
- Header bat buoc:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Backend dang mount route chat o ca 2 prefix:
- `/support-chat/*`
- `/messages/*`

Khuyen nghi FE dung `/support-chat/*` de dung ten nghiep vu.

## 2) Endpoint mapping cho FE

### 2.1 User flow

1. Tao ticket moi
- `POST /support-chat/conversations`
- Body:

```json
{
  "subject": "Can ho tro don hang #DH1001",
  "content": "Minh chua nhan duoc don hang, nho check giup.",
  "priority": "normal"
}
```

2. Lay danh sach ticket cua user
- `GET /support-chat/my-conversations?limit=20&page=1&status=open`

3. Lay message cua 1 conversation
- `GET /support-chat/conversations/:id/messages?limit=30&page=1`

4. Gui them message
- `POST /support-chat/conversations/:id/messages`
- Body:

```json
{
  "content": "Cho minh xin cap nhat moi nhat"
}
```

5. Danh dau da doc
- `POST /support-chat/conversations/:id/read`

### 2.2 Admin flow

1. Lay queue ticket
- `GET /support-chat/admin/conversations?status=open&assigned=false&limit=20&page=1`
- `assigned` ho tro: `true | false | mine`

2. Nhan xu ly ticket
- `POST /support-chat/admin/conversations/:id/assign`

3. Tra loi ticket
- `POST /support-chat/admin/conversations/:id/messages`
- Body:

```json
{
  "content": "Team da tiep nhan, se phan hoi ban som"
}
```

4. Cap nhat status
- `PATCH /support-chat/admin/conversations/:id/status`
- Body:

```json
{
  "status": "resolved"
}
```

5. Danh dau da doc
- `POST /support-chat/conversations/:id/read`

## 3) Kieu du lieu FE nen dung

```ts
export type ChatStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type ChatPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SenderRole = 'customer' | 'admin';

export interface Conversation {
  _id: string;
  customerId: string | { _id: string; username?: string; email?: string; fullName?: string; avatarUrl?: string };
  assignedAdminId: null | string | { _id: string; username?: string; email?: string; fullName?: string; avatarUrl?: string };
  subject: string;
  status: ChatStatus;
  priority: ChatPriority;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountForCustomer: number;
  unreadCountForAdmin: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string | { _id: string; username?: string; email?: string; fullName?: string; avatarUrl?: string };
  senderRole: SenderRole;
  content: string;
  messageType: 'text' | 'system';
  readByCustomerAt: string | null;
  readByAdminAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  message?: string;
  errorCode?: string;
}
```

## 4) Service layer de xuat

Tao mot service rieng, vi du `chatApi.ts`:

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/support-chat'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const chatApi = {
  createConversation: (payload: { subject: string; content: string; priority?: 'low' | 'normal' | 'high' | 'urgent' }) =>
    api.post('/conversations', payload),

  getMyConversations: (params: { limit?: number; page?: number; status?: string }) =>
    api.get('/my-conversations', { params }),

  getConversationMessages: (id: string, params: { limit?: number; page?: number }) =>
    api.get(`/conversations/${id}/messages`, { params }),

  sendCustomerMessage: (id: string, content: string) =>
    api.post(`/conversations/${id}/messages`, { content }),

  markRead: (id: string) =>
    api.post(`/conversations/${id}/read`),

  getAdminConversations: (params: { status?: string; assigned?: 'true' | 'false' | 'mine'; limit?: number; page?: number }) =>
    api.get('/admin/conversations', { params }),

  assignConversation: (id: string) =>
    api.post(`/admin/conversations/${id}/assign`),

  sendAdminMessage: (id: string, content: string) =>
    api.post(`/admin/conversations/${id}/messages`, { content }),

  updateConversationStatus: (id: string, status: 'pending' | 'resolved' | 'closed') =>
    api.patch(`/admin/conversations/${id}/status`, { status })
};
```

## 5) State management de xuat

Co the dung React Query + store nhe (Zustand/Redux).

- Query keys:
  - `['chat', 'user-conversations', filters]`
  - `['chat', 'admin-conversations', filters]`
  - `['chat', 'messages', conversationId, page]`
- Mutation:
  - tao conversation
  - gui message
  - assign
  - update status
  - mark read
- Sau mutation:
  - invalidates danh sach conversation
  - append optimistic message vao UI (tuy chon)

## 6) UI/UX flow chi tiet

### 6.1 User portal

- Screen A: Danh sach ticket
  - Hien subject, lastMessage, lastMessageAt, status, unreadCountForCustomer
  - Filter theo status
  - Nut "Tao ticket"

- Screen B: Chat detail
  - Header: subject + status + priority
  - Message list (phan biet bong bong customer/admin)
  - Input box + send button
  - Khi vao screen thi goi `markRead`

- Modal tao ticket
  - Field: subject, noi dung ban dau, priority
  - Validate client:
    - subject: 1..200
    - content: 1..2000

### 6.2 Admin portal

- Screen A: Queue
  - Tabs: unassigned, assigned mine, all
  - Hien customer, subject, priority, status, unreadCountForAdmin
  - Nut Assign nhanh tren tung dong

- Screen B: Conversation detail
  - Message timeline
  - Khung reply
  - Dropdown status: pending/resolved/closed
  - Khi mo screen goi `markRead`

## 7) Gia lap real-time (V1 chua co socket)

Dung polling theo interval:

- Danh sach conversation: 15s/lai
- Message detail dang mo: 3-5s/lai
- Tam polling khi tab trinh duyet khong active (Page Visibility API)

Neu muon min load hon:
- chi polling message detail cho conversation dang active
- de danh sach poll cham hon

## 8) Xu ly loi va edge cases

Can map error theo `errorCode`:

- `UNAUTHORIZED` (401)
  - clear token, redirect login

- `FORBIDDEN` (403)
  - thong bao khong du quyen

- `NOT_FOUND` (404)
  - ticket da bi xoa/khong ton tai

- `ASSIGN_CONFLICT` (409)
  - admin khac da nhan ticket, refresh queue

- `INVALID_STATE` (400)
  - ticket da `closed`, disable input message

## 9) Checklist test FE

1. User tao ticket thanh cong, thay ticket moi trong list.
2. User gui message thanh cong, UI cap nhat dung thu tu.
3. User mo ticket thi unread phia user ve 0 sau khi refresh.
4. Admin thay queue unassigned, assign thanh cong.
5. Admin reply va user nhin thay sau polling.
6. Admin doi status `resolved/closed`, UI lock input khi `closed`.
7. Khi token het han, FE tu dong ve login.
8. Khi 409 assign conflict, UI thong bao va refetch danh sach.

## 10) Goi y rollback/compatibility

Vi backend dang cho phep ca `/messages` va `/support-chat`, FE co the:

- Dung chinh `/support-chat`
- Neu can fallback tam thoi, tao bien env:

```env
VITE_CHAT_API_PREFIX=/support-chat
```

sau do map vao `baseURL` de doi nhanh khi can.
