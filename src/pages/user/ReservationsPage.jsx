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

export default function ReservationsPage() {
  const queryClient = useQueryClient();
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
        toast.error(result.message || 'Không thể tạo reservation');
        return;
      }
      toast.success('Tạo reservation thành công');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateReservationApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật reservation');
        return;
      }
      toast.success('Đã cập nhật reservation');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: cancelReservationApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể hủy reservation');
        return;
      }
      toast.success('Đã hủy reservation');
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
      <form className="paper-block stack-gap" onSubmit={handleSubmit}>
        <h1>Reservation của tôi</h1>
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
            {editingId ? 'Cập nhật reservation' : 'Tạo reservation'}
          </button>
          {editingId ? (
            <button className="btn secondary" type="button" onClick={resetForm}>Hủy chỉnh sửa</button>
          ) : null}
        </div>
      </form>

      <section className="paper-block stack-gap">
        <h2>Danh sách reservation</h2>
        {reservationsQuery.isLoading ? <p>Đang tải reservation...</p> : null}
        {!reservationsQuery.isLoading && reservations.length === 0 ? <p>Bạn chưa có reservation nào.</p> : null}
        <div className="orders-list">
          {reservations.map((reservation) => (
            <article className="order-card" key={reservation.id}>
              <div>
                <h3>{reservation?.product?.name || 'Sản phẩm'}</h3>
                <p>Số lượng: <strong>{reservation.quantity}</strong></p>
                <p>Trạng thái: <strong>{reservation.status}</strong></p>
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
