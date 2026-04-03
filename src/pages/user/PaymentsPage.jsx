import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPaymentsApi } from '../../services/payments.api';

export default function PaymentsPage() {
  const paymentsQuery = useQuery({
    queryKey: ['payments', 'my'],
    queryFn: () => getMyPaymentsApi({ page: 1, limit: 20 })
  });

  const payments = paymentsQuery.data?.data || [];

  if (paymentsQuery.isLoading) {
    return <p>Đang tải danh sách thanh toán...</p>;
  }

  return (
    <section className="paper-block stack-gap">
      <h1>Thanh toán của tôi</h1>
      {payments.length === 0 ? (
        <div className="empty-block">
          <p>Bạn chưa có bản ghi thanh toán nào.</p>
          <Link className="btn secondary" to="/user/orders">Xem đơn hàng</Link>
        </div>
      ) : (
        <div className="orders-list">
          {payments.map((payment) => (
            <article className="order-card" key={payment.id}>
              <div>
                <h3>Thanh toán #{String(payment.id).slice(-6).toUpperCase()}</h3>
                <p className="muted-text">Ngày tạo: {dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                <p>Phương thức: <strong>{payment.paymentMethod}</strong></p>
                <p>Trạng thái: <strong>{payment.paymentStatus}</strong></p>
                <p>Số tiền: <strong>{Number(payment.amount || 0).toLocaleString('vi-VN')} VND</strong></p>
              </div>
              <div className="hero-actions">
                <Link className="btn secondary" to={`/user/payments/${payment.id}`}>Chi tiết</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
