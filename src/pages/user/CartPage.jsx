import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clearCartApi, getCartApi, removeCartItemApi, updateCartItemApi } from '../../services/carts.api';

function getProductId(item) {
  return item?.product?._id || item?.product?.id || item?.product;
}

function getProductName(item) {
  return item?.product?.name || 'Sản phẩm không xác định';
}

function getProductPrice(item) {
  return Number(item?.product?.price || 0);
}

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCartApi
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) => updateCartItemApi(productId, { quantity }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật giỏ hàng');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItemApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa sản phẩm');
        return;
      }
      toast.success('Đã xóa sản phẩm khỏi giỏ');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa toàn bộ giỏ');
        return;
      }
      toast.success('Đã làm trống giỏ hàng');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const items = cartQuery.data?.data?.items || [];
  const total = items.reduce((sum, item) => sum + getProductPrice(item) * Number(item.quantity || 0), 0);

  if (cartQuery.isLoading) {
    return <p>Đang tải giỏ hàng...</p>;
  }

  return (
    <section className="paper-block stack-gap">
      <div className="section-heading">
        <div>
          <h1>Giỏ hàng của bạn</h1>
          <p className="muted-text">Kiểm tra số lượng trước khi chuyển sang bước thanh toán COD.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-block">
          <p>Giỏ hàng đang trống.</p>
          <Link className="btn secondary" to="/products">Đi mua sắm ngay</Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => {
              const productId = getProductId(item);
              const quantity = Number(item.quantity || 0);
              const price = getProductPrice(item);

              return (
                <article key={String(productId)} className="cart-item">
                  <div>
                    <h3>{getProductName(item)}</h3>
                    <p className="muted-text">Đơn giá: {price.toLocaleString('vi-VN')} VND</p>
                  </div>

                  <div className="cart-item-actions">
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => updateMutation.mutate({ productId, quantity: quantity - 1 })}
                      disabled={updateMutation.isPending}
                    >
                      -
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => updateMutation.mutate({ productId, quantity: quantity + 1 })}
                      disabled={updateMutation.isPending}
                    >
                      +
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => removeMutation.mutate(productId)}
                      disabled={removeMutation.isPending}
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="checkout-summary">
            <p>Tổng tạm tính: <strong>{total.toLocaleString('vi-VN')} VND</strong></p>
            <div className="hero-actions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
              >
                Xóa toàn bộ
              </button>
              <button className="btn primary" type="button" onClick={() => navigate('/user/checkout')}>
                Tiến hành checkout COD
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
