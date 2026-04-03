import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getCartApi } from '../../services/carts.api';
import { createOrderApi } from '../../services/orders.api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCartApi
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload) => createOrderApi(payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(`${result.message || 'Tạo đơn hàng thất bại'} (${result.errorCode || 'UNKNOWN_ERROR'})`);
        return;
      }

      toast.success('Đặt hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      const orderId = result.data?.order?.id;
      if (orderId) {
        navigate(`/user/orders/${orderId}`);
      } else {
        navigate('/user/orders');
      }
    }
  });

  const items = cartQuery.data?.data?.items || [];
  const total = items.reduce((sum, item) => {
    const price = Number(item?.product?.price || 0);
    return sum + price * Number(item.quantity || 0);
  }, 0);

  if (cartQuery.isLoading) {
    return <p>Đang tải thông tin checkout...</p>;
  }

  if (items.length === 0) {
    return (
      <section className="paper-block stack-gap">
        <h1>Checkout COD</h1>
        <p>Giỏ hàng đang trống, chưa thể tạo đơn.</p>
        <Link className="btn secondary" to="/products">Quay lại mua sắm</Link>
      </section>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    const orderItems = items
      .map((item) => ({
        productId: item?.product?._id || item?.product?.id || item?.product,
        quantity: Number(item?.quantity || 0)
      }))
      .filter((item) => item.productId && item.quantity > 0);

    if (orderItems.length === 0) {
      toast.error('Giỏ hàng không hợp lệ, vui lòng thêm lại sản phẩm.');
      return;
    }

    createOrderMutation.mutate({
      items: orderItems,
      shippingAddress: shippingAddress.trim(),
      note: note.trim()
    });
  }

  return (
    <section className="checkout-grid">
      <form className="paper-block stack-gap" onSubmit={handleSubmit}>
        <h1>Thông tin giao hàng</h1>

        <div className="form-grid">
          <label htmlFor="shippingAddress">Địa chỉ giao hàng</label>
          <textarea
            id="shippingAddress"
            rows={4}
            value={shippingAddress}
            onChange={(event) => setShippingAddress(event.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          />
        </div>

        <div className="form-grid">
          <label htmlFor="note">Ghi chú đơn hàng</label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: giao giờ hành chính"
          />
        </div>

        <div className="hero-actions">
          <Link className="btn secondary" to="/user/cart">Quay lại giỏ hàng</Link>
          <button className="btn primary" type="submit" disabled={createOrderMutation.isPending}>
            Xác nhận đặt COD
          </button>
        </div>
      </form>

      <aside className="paper-block stack-gap">
        <h2>Tóm tắt đơn hàng</h2>
        <div className="order-item-list">
          {items.map((item) => (
            <div className="order-item-row" key={String(item?.product?._id || item?.product?.id || item?.product)}>
              <span>{item?.product?.name || 'Sản phẩm'} x {item.quantity}</span>
              <strong>{(Number(item?.product?.price || 0) * Number(item.quantity || 0)).toLocaleString('vi-VN')} VND</strong>
            </div>
          ))}
        </div>
        <p>Tạm tính: <strong>{total.toLocaleString('vi-VN')} VND</strong></p>
        <p className="muted-text">Phương thức thanh toán: COD (thanh toán khi nhận hàng)</p>
      </aside>
    </section>
  );
}
