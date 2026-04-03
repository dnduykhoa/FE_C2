import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { addToCartApi } from '../../services/carts.api';
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

  const addToCartMutation = useMutation({
    mutationFn: (payload) => addToCartApi(payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể thêm vào giỏ');
        return;
      }
      toast.success('Đã thêm vào giỏ hàng');
    }
  });

  const product = productQuery.data?.data;
  const reviews = reviewQuery.data?.data || [];

  if (productQuery.isLoading) {
    return <p>Đang tải chi tiết sản phẩm...</p>;
  }

  if (!product) {
    return (
      <section className="paper-block">
        <h1>Không tìm thấy sản phẩm</h1>
        <Link className="btn secondary" to="/products">Quay lại danh sách</Link>
      </section>
    );
  }

  return (
    <section className="detail-grid">
      <article className="paper-block">
        <div className="detail-thumb" />
        <h1>{product.name}</h1>
        <p className="muted-text">{product.category?.name || 'Không rõ danh mục'}</p>
        <p className="price-text">{Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
        <p>{product.description || 'Sản phẩm gốm mang hơi hướng làng nghề truyền thống.'}</p>
        <div className="hero-actions">
          <button
            className="btn primary"
            type="button"
            onClick={() => addToCartMutation.mutate({ productId: product.id || product._id, quantity: 1 })}
            disabled={addToCartMutation.isPending}
          >
            Thêm vào giỏ
          </button>
          <Link className="btn secondary" to="/products">Quay lại</Link>
        </div>
      </article>

      <article className="paper-block">
        <h2>Đánh giá sản phẩm</h2>
        {reviewQuery.isLoading ? <p>Đang tải đánh giá...</p> : null}
        {!reviewQuery.isLoading && reviews.length === 0 ? <p>Chưa có đánh giá nào.</p> : null}
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <p className="muted-text">
                {review.user?.fullName || review.user?.username || 'Khách hàng'} - {dayjs(review.createdAt).format('DD/MM/YYYY')}
              </p>
              <p>Điểm: {review.rating}/5</p>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
