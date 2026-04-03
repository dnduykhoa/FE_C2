import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelOrderApi, getMyOrdersApi } from '../../services/orders.api';

function canCancel(order) {
  return String(order?.status || '').toUpperCase() === 'PENDING';
}

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => getMyOrdersApi({ page: 1, limit: 20 })
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
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const orders = ordersQuery.data?.data || [];

  if (ordersQuery.isLoading) {
    return <p>Đang tải danh sách đơn hàng...</p>;
  }

  return (
    <section className="paper-block stack-gap">
      <h1>Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className="empty-block">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link className="btn secondary" to="/products">Xem sản phẩm</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <h3>Đơn #{String(order.id).slice(-6).toUpperCase()}</h3>
                <p className="muted-text">Tạo lúc: {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                <p>Trạng thái đơn: <strong>{order.status}</strong></p>
                <p>Trạng thái thanh toán: <strong>{order.paymentStatus}</strong></p>
                <p>Tổng tiền: <strong>{Number(order.totalPrice || 0).toLocaleString('vi-VN')} VND</strong></p>
              </div>

              <div className="hero-actions">
                <Link className="btn secondary" to={`/user/orders/${order.id}`}>Chi tiết</Link>
                {canCancel(order) ? (
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => cancelMutation.mutate(order.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Hủy đơn
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
