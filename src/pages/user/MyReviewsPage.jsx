import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductsApi } from '../../services/products.api';
import {
  createReviewApi,
  deleteReviewApi,
  getMyReviewsApi,
  updateReviewApi
} from '../../services/reviews.api';

const defaultForm = {
  productId: '',
  rating: 5,
  comment: ''
};

export default function MyReviewsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState('');

  const productsQuery = useQuery({
    queryKey: ['products', 'review-select'],
    queryFn: () => getProductsApi({ page: 1, limit: 100 })
  });

  const myReviewsQuery = useQuery({
    queryKey: ['reviews', 'my'],
    queryFn: getMyReviewsApi
  });

  const createMutation = useMutation({
    mutationFn: createReviewApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo review');
        return;
      }
      toast.success('Đã tạo review');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateReviewApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật review');
        return;
      }
      toast.success('Đã cập nhật review');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReviewApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa review');
        return;
      }
      toast.success('Đã xóa review');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  const products = productsQuery.data?.data || [];
  const reviews = myReviewsQuery.data?.data || [];

  function resetForm() {
    setForm(defaultForm);
    setEditingId('');
  }

  function fillForEdit(review) {
    setEditingId(review._id || review.id);
    setForm({
      productId: review?.product?._id || review?.product?.id || review?.product || '',
      rating: Number(review.rating || 5),
      comment: review.comment || ''
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.productId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (Number(form.rating) < 1 || Number(form.rating) > 5) {
      toast.error('Điểm đánh giá phải từ 1 đến 5');
      return;
    }

    const payload = {
      productId: form.productId,
      rating: Number(form.rating),
      comment: form.comment.trim()
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: { rating: payload.rating, comment: payload.comment } });
      return;
    }

    createMutation.mutate(payload);
  }

  return (
    <section className="stack-gap">
      <form className="paper-block stack-gap" onSubmit={handleSubmit}>
        <h1>Đánh giá của tôi</h1>

        <div className="form-grid">
          <label htmlFor="reviewProduct">Sản phẩm</label>
          <select
            id="reviewProduct"
            value={form.productId}
            onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
            disabled={Boolean(editingId)}
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>

        <div className="form-grid">
          <label htmlFor="reviewRating">Điểm (1-5)</label>
          <input
            id="reviewRating"
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
          />
        </div>

        <div className="form-grid">
          <label htmlFor="reviewComment">Nội dung</label>
          <textarea
            id="reviewComment"
            rows={4}
            value={form.comment}
            onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
          />
        </div>

        <div className="hero-actions">
          <button className="btn primary" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {editingId ? 'Cập nhật review' : 'Tạo review'}
          </button>
          {editingId ? (
            <button className="btn secondary" type="button" onClick={resetForm}>Hủy chỉnh sửa</button>
          ) : null}
        </div>
      </form>

      <section className="paper-block stack-gap">
        <h2>Danh sách review của tôi</h2>
        {myReviewsQuery.isLoading ? <p>Đang tải review...</p> : null}
        {!myReviewsQuery.isLoading && reviews.length === 0 ? <p>Bạn chưa có review nào.</p> : null}
        <div className="orders-list">
          {reviews.map((review) => {
            const reviewId = review._id || review.id;
            return (
              <article className="order-card" key={reviewId}>
                <div>
                  <h3>{review?.product?.name || 'Sản phẩm'}</h3>
                  <p>Điểm: <strong>{review.rating}/5</strong></p>
                  <p>{review.comment || 'Không có nội dung'}</p>
                  <p className="muted-text">Cập nhật: {dayjs(review.updatedAt || review.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                </div>
                <div className="hero-actions">
                  <button className="btn secondary" type="button" onClick={() => fillForEdit(review)}>Sửa</button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => deleteMutation.mutate(reviewId)}
                    disabled={deleteMutation.isPending}
                  >
                    Xóa
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
