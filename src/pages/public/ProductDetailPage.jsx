import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getProductDetailApi } from '../../services/products.api';
import { getReviewsByProductApi } from '../../services/reviews.api';

export default function ProductDetailPage() {
  const { id } = useParams();

  const productQuery = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => getProductDetailApi(id),
    enabled: Boolean(id)
  });

  const reviewQuery = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviewsByProductApi(id),
    enabled: Boolean(id)
  });

  const product = productQuery.data?.data;
  const reviews = reviewQuery.data?.data || [];

  if (productQuery.isLoading) {
    return <p>Dang tai chi tiet san pham...</p>;
  }

  if (!product) {
    return (
      <section className="paper-block">
        <h1>Khong tim thay san pham</h1>
        <Link className="btn secondary" to="/products">Quay lai danh sach</Link>
      </section>
    );
  }

  return (
    <section className="detail-grid">
      <article className="paper-block">
        <div className="detail-thumb" />
        <h1>{product.name}</h1>
        <p className="muted-text">{product.category?.name || 'Khong ro danh muc'}</p>
        <p className="price-text">{Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
        <p>{product.description || 'San pham gom mang hoi huong lang nghe truyen thong.'}</p>
        <div className="hero-actions">
          <button className="btn primary" type="button">Them vao gio (sap mo)</button>
          <Link className="btn secondary" to="/products">Quay lai</Link>
        </div>
      </article>

      <article className="paper-block">
        <h2>Danh gia san pham</h2>
        {reviewQuery.isLoading ? <p>Dang tai danh gia...</p> : null}
        {!reviewQuery.isLoading && reviews.length === 0 ? <p>Chua co danh gia nao.</p> : null}
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <p className="muted-text">
                {review.user?.fullName || review.user?.username || 'Khach hang'} - {dayjs(review.createdAt).format('DD/MM/YYYY')}
              </p>
              <p>Diem: {review.rating}/5</p>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
