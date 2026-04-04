import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyPaymentsApi } from '../../services/payments.api';
import { getMyReviewsApi } from '../../services/reviews.api';

export default function PaymentsPage() {
  const paymentsQuery = useQuery({
    queryKey: ['payments', 'my'],
    queryFn: () => getMyPaymentsApi({ page: 1, limit: 20 })
  });

  const reviewsQuery = useQuery({
    queryKey: ['reviews', 'my', 'payment-actions'],
    queryFn: getMyReviewsApi
  });

  const payments = paymentsQuery.data?.data || [];
  const reviewedProductIds = new Set(
    (reviewsQuery.data?.data || [])
      .map((review) => String(review?.product?._id || review?.product?.id || review?.product || ''))
      .filter(Boolean)
  );

  if (paymentsQuery.isLoading || reviewsQuery.isLoading) {
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
          {payments.map((payment) => {
            const isPaid = String(payment.paymentStatus || '').toUpperCase() === 'PAID';
            const orderItems = Array.isArray(payment?.order?.items) ? payment.order.items : [];

            return (
              <article className="order-card" key={payment.id}>
                <div>
                  <h3>Thanh toán #{String(payment.id).slice(-6).toUpperCase()}</h3>
                  <p className="muted-text">Ngày tạo: {dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                  <p>Phương thức: <strong>{payment.paymentMethod}</strong></p>
                  <p>Trạng thái: <strong>{payment.paymentStatus}</strong></p>
                  <p>Số tiền: <strong>{Number(payment.amount || 0).toLocaleString('vi-VN')} VND</strong></p>
                </div>
                <div className="hero-actions" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                  {isPaid ? (
                    orderItems.map((item, index) => {
                      const rawProduct = item?.product;
                      const productId = typeof rawProduct === 'string'
                        ? rawProduct
                        : rawProduct?._id || rawProduct?.id || '';
                      const productName = item?.productName || rawProduct?.name || 'Sản phẩm';

                      if (!productId) {
                        return null;
                      }

                      return (
                        <Link
                          key={`${payment.id}-${productId}-${index}`}
                          className="btn secondary"
                          to={`/user/reviews?productId=${productId}`}
                          style={{ justifyContent: 'flex-start' }}
                        >
                          {reviewedProductIds.has(String(productId)) ? 'Đã đánh giá' : 'Đánh giá'}
                        </Link>
                      );
                    })
                  ) : null}
                  <Link className="btn secondary" to={`/user/payments/${payment.id}`}>Chi tiết</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
