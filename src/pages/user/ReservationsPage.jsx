import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelReservationApi,
  createReservationApi,
  getMyReservationsApi,
  updateReservationApi
} from '../../services/reservations.api';
import { getProductsApi } from '../../services/products.api';

function defaultReservedUntil() {
  const target = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return target.toISOString().slice(0, 16);
}

function getReservationStatusLabel(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'PENDING') return 'Chờ xử lý';
  if (value === 'COMPLETED') return 'Hoàn tất';
  if (value === 'CANCELLED') return 'Đã hủy';
  if (value === 'EXPIRED') return 'Hết hạn';
  return value || 'Không xác định';
}

export default function ReservationsPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    quantity: 1,
    reservedUntil: defaultReservedUntil(),
    note: ''
  });
  const [editingId, setEditingId] = useState('');

  const productsQuery = useQuery({
    queryKey: ['products', 'reservation-select'],
    queryFn: () => getProductsApi({ page: 1, limit: 100 })
  });

  const reservationsQuery = useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: () => getMyReservationsApi({ page: 1, limit: 20 })
  });

  const createMutation = useMutation({
    mutationFn: createReservationApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo giữ chỗ');
        return;
      }
      toast.success('Tạo giữ chỗ thành công');
      resetForm();
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateReservationApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật giữ chỗ');
        return;
      }
      toast.success('Đã cập nhật giữ chỗ');
      resetForm();
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: cancelReservationApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể hủy giữ chỗ');
        return;
      }
      toast.success('Đã hủy giữ chỗ');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  });

  const products = productsQuery.data?.data || [];
  const reservations = reservationsQuery.data?.data || [];

  const canSubmit = useMemo(() => Boolean(form.productId && Number(form.quantity) > 0), [form]);

  function resetForm() {
    setForm({
      productId: '',
      quantity: 1,
      reservedUntil: defaultReservedUntil(),
      note: ''
    });
    setEditingId('');
  }

  function fillForEdit(reservation) {
    setEditingId(reservation.id);
    setShowCreateForm(true);
    setForm({
      productId: reservation?.product?._id || reservation?.product?.id || reservation?.product || '',
      quantity: Number(reservation.quantity || 1),
      reservedUntil: reservation.reservedUntil ? new Date(reservation.reservedUntil).toISOString().slice(0, 16) : defaultReservedUntil(),
      note: reservation.note || ''
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      toast.error('Vui lòng chọn sản phẩm và số lượng hợp lệ');
      return;
    }

    const payload = {
      productId: form.productId,
      quantity: Number(form.quantity),
      reservedUntil: new Date(form.reservedUntil).toISOString(),
      note: form.note.trim()
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
      return;
    }

    createMutation.mutate(payload);
  }

  return (
    <section className="stack-gap">
      {showCreateForm ? (
        <form className="paper-block stack-gap" onSubmit={handleSubmit}>
          <h1>Giữ chỗ của tôi</h1>
          <div className="form-grid">
            <label htmlFor="productId">Sản phẩm</label>
            <select
              id="productId"
              value={form.productId}
              onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <label htmlFor="reservationQuantity">Số lượng</label>
            <input
              id="reservationQuantity"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
            />
          </div>

          <div className="form-grid">
            <label htmlFor="reservedUntil">Giữ đến</label>
            <input
              id="reservedUntil"
              type="datetime-local"
              value={form.reservedUntil}
              onChange={(event) => setForm((prev) => ({ ...prev, reservedUntil: event.target.value }))}
            />
          </div>

          <div className="form-grid">
            <label htmlFor="reservationNote">Ghi chú</label>
            <textarea
              id="reservationNote"
              rows={3}
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </div>

          <div className="hero-actions">
            <button className="btn primary" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Cập nhật giữ chỗ' : 'Tạo giữ chỗ'}
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                resetForm();
                setShowCreateForm(false);
              }}
            >
              Đóng form
            </button>
          </div>
        </form>
      ) : null}

      <section className="paper-block stack-gap">
        <div className="section-head-row">
          <h2>Danh sách giữ chỗ</h2>
          {!showCreateForm ? (
            <button
              className="btn primary"
              type="button"
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
            >
              Tạo giữ chỗ
            </button>
          ) : null}
        </div>
        {reservationsQuery.isLoading ? <p>Đang tải danh sách giữ chỗ...</p> : null}
        {!reservationsQuery.isLoading && reservations.length === 0 ? <p>Bạn chưa có giữ chỗ nào.</p> : null}
        <div className="orders-list">
          {reservations.map((reservation) => (
            <article className="order-card" key={reservation.id}>
              <div>
                <h3>{reservation?.product?.name || 'Sản phẩm'}</h3>
                <p>Số lượng: <strong>{reservation.quantity}</strong></p>
                <p>Trạng thái: <strong>{getReservationStatusLabel(reservation.status)}</strong></p>
                <p className="muted-text">Giữ đến: {dayjs(reservation.reservedUntil).format('DD/MM/YYYY HH:mm')}</p>
                <p className="muted-text">Ghi chú: {reservation.note || 'Không có'}</p>
              </div>
              <div className="hero-actions">
                {String(reservation.status).toUpperCase() === 'PENDING' ? (
                  <>
                    <button className="btn secondary" type="button" onClick={() => fillForEdit(reservation)}>
                      Sửa
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => cancelMutation.mutate(reservation.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Hủy
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
