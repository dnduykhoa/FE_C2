import dayjs from 'dayjs';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPaymentDetailApi } from '../../services/payments.api';

export default function PaymentDetailPage() {
  const { id } = useParams();

  const paymentQuery = useQuery({
    queryKey: ['payments', id],
    queryFn: () => getPaymentDetailApi(id),
    enabled: Boolean(id)
  });

  if (paymentQuery.isLoading) {
    return <p>Đang tải chi tiết thanh toán...</p>;
  }

  const payment = paymentQuery.data?.data;
  if (!payment) {
    return (
      <section className="paper-block stack-gap">
        <h1>Không tìm thấy thanh toán</h1>
        <Link className="btn secondary" to="/user/payments">Quay lại danh sách</Link>
      </section>
    );
  }

  return (
    <section className="paper-block stack-gap">
      <h1>Chi tiết thanh toán</h1>
      <div className="profile-grid">
        <div>
          <label>Mã thanh toán</label>
          <p>{payment.id}</p>
        </div>
        <div>
          <label>Phương thức</label>
          <p>{payment.paymentMethod}</p>
        </div>
        <div>
          <label>Trạng thái</label>
          <p>{payment.paymentStatus}</p>
        </div>
        <div>
          <label>Số tiền</label>
          <p>{Number(payment.amount || 0).toLocaleString('vi-VN')} VND</p>
        </div>
        <div>
          <label>Ngày tạo</label>
          <p>{dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm')}</p>
        </div>
        <div>
          <label>Paid At</label>
          <p>{payment.paidAt ? dayjs(payment.paidAt).format('DD/MM/YYYY HH:mm') : 'Chưa thanh toán'}</p>
        </div>
      </div>
      <p>Ghi chú: {payment.note || 'Không có'}</p>
      <p>Mã đơn liên quan: {payment.order || 'Không có'}</p>
      <Link className="btn secondary" to="/user/payments">Quay lại</Link>
    </section>
  );
}
