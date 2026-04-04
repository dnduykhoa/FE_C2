import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { getMyPaymentsApi } from '../../services/payments.api';
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
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const paymentsQuery = useQuery({
    queryKey: ['payments', 'my', 'review-select'],
    queryFn: () => getMyPaymentsApi({ page: 1, limit: 100 })
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
      setShowCreateForm(false);
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
      setShowCreateForm(false);
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

  const payments = paymentsQuery.data?.data || [];
  const reviews = myReviewsQuery.data?.data || [];
  const preferredProductId = searchParams.get('productId') || '';

  const reviewableProducts = useMemo(() => {
    const map = new Map();

    payments
      .filter((payment) => String(payment.paymentStatus || '').toUpperCase() === 'PAID')
      .forEach((payment) => {
        const orderItems = Array.isArray(payment?.order?.items) ? payment.order.items : [];
        orderItems.forEach((item) => {
          const rawProduct = item?.product;
          const productId = typeof rawProduct === 'string'
            ? rawProduct
            : rawProduct?._id || rawProduct?.id || '';

          if (!productId) {
            return;
          }

          const productName = item?.productName
            || rawProduct?.name
            || 'Sản phẩm';

          map.set(String(productId), {
            id: String(productId),
            name: productName
          });
        });
      });

    return Array.from(map.values());
  }, [payments]);

  const selectedProduct = useMemo(() => {
    if (!preferredProductId) {
      return null;
    }

    return reviewableProducts.find((item) => item.id === preferredProductId) || null;
  }, [preferredProductId, reviewableProducts]);

  const selectedReview = useMemo(() => {
    if (!preferredProductId) {
      return null;
    }

    return reviews.find((review) => String(review?.product?._id || review?.product?.id || review?.product || '') === preferredProductId) || null;
  }, [preferredProductId, reviews]);

  useEffect(() => {
    if (!preferredProductId || editingId) {
      return;
    }

    const isEligible = reviewableProducts.some((item) => item.id === preferredProductId);
    if (!isEligible) {
      return;
    }

    setForm((prev) => ({ ...prev, productId: preferredProductId }));
    setShowCreateForm(!selectedReview);
  }, [editingId, reviewableProducts, searchParams, selectedReview]);

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
      {selectedReview ? (
        <section className="paper-block stack-gap">
          <h1>Chi tiết đánh giá</h1>
          <div className="order-card">
            <div>
              <h3>{selectedReview?.product?.name || 'Sản phẩm'}</h3>
              <p>Điểm: <strong>{selectedReview.rating}/5</strong></p>
              <p>{selectedReview.comment || 'Không có nội dung'}</p>
              <p className="muted-text">Cập nhật: {dayjs(selectedReview.updatedAt || selectedReview.createdAt).format('DD/MM/YYYY HH:mm')}</p>
            </div>
            <div className="hero-actions">
              <button className="btn secondary" type="button" onClick={() => fillForEdit(selectedReview)}>Sửa</button>
            </div>
          </div>
        </section>
      ) : null}

      {showCreateForm && !selectedReview ? (
        <form className="paper-block stack-gap" onSubmit={handleSubmit}>
          <h1>Đánh giá của tôi</h1>
          <p className="muted-text">Chỉ hiển thị sản phẩm thuộc các đơn hàng đã thanh toán.</p>

          <div className="form-grid">
            <label>Sản phẩm</label>
            <div className="stack-gap">
              {selectedProduct ? (
                <button
                  type="button"
                  className="btn secondary active"
                  disabled={Boolean(editingId)}
                  style={{ justifyContent: 'flex-start', cursor: 'default' }}
                >
                  {selectedProduct.name}
                </button>
              ) : null}
            </div>
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
            <button
              className="btn primary"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || reviewableProducts.length === 0}
            >
              {editingId ? 'Cập nhật review' : 'Tạo review'}
            </button>
            {editingId ? (
              <button className="btn secondary" type="button" onClick={resetForm}>Hủy chỉnh sửa</button>
            ) : (
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                }}
              >
                Đóng
              </button>
            )}
          </div>
        </form>
      ) : null}

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
