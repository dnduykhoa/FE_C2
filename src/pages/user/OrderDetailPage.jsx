import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelOrderApi, getOrderDetailApi } from '../../services/orders.api';

function canCancel(order) {
  return String(order?.status || '').toUpperCase() === 'PENDING';
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrderDetailApi(id),
    enabled: Boolean(id)
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrderApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể hủy đơn hàng');
        return;
      }

      toast.success('Đã hủy đơn hàng');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  if (orderQuery.isLoading) {
    return <p>Đang tải chi tiết đơn hàng...</p>;
  }

  const order = orderQuery.data?.data;
  if (!order) {
    return (
      <section className="paper-block stack-gap">
        <h1>Không tìm thấy đơn hàng</h1>
        <Link className="btn secondary" to="/user/orders">Quay lại danh sách đơn</Link>
      </section>
    );
  }

  return (
    <section className="paper-block stack-gap">
      <div className="section-heading">
        <div>
          <h1>Chi tiết đơn hàng</h1>
          <p className="muted-text">Mã đơn: #{String(order.id).slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="profile-grid">
        <div>
          <label>Trạng thái đơn</label>
          <p>{order.status}</p>
        </div>
        <div>
          <label>Thanh toán</label>
          <p>{order.paymentStatus} ({order.paymentMethod})</p>
        </div>
        <div>
          <label>Ngày tạo</label>
          <p>{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</p>
        </div>
      </div>

      <div className="order-item-list">
        {order.items?.map((item) => (
          <article key={`${item.product}-${item.productName}`} className="order-item-row">
            <div>
              <strong>{item.productName}</strong>
              <p className="muted-text">Số lượng: {item.quantity}</p>
            </div>
            <div>
              <p>{Number(item.total || 0).toLocaleString('vi-VN')} VND</p>
            </div>
          </article>
        ))}
      </div>

      <p>Tổng tiền: <strong>{Number(order.totalPrice || 0).toLocaleString('vi-VN')} VND</strong></p>
      <p>Địa chỉ giao: {order.shippingAddress || 'Chưa cập nhật'}</p>
      <p>Ghi chú: {order.note || 'Không có'}</p>

      <div className="hero-actions">
        <button className="btn secondary" type="button" onClick={() => navigate('/user/orders')}>Quay lại</button>
        {canCancel(order) ? (
          <button
            className="btn secondary"
            type="button"
            onClick={() => cancelMutation.mutate(id)}
            disabled={cancelMutation.isPending}
          >
            Hủy đơn hàng
          </button>
        ) : null}
      </div>
    </section>
  );
}
