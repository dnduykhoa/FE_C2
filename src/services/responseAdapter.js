export function normalizeSuccess(raw) {
  if (raw && typeof raw.success === 'boolean') {
    return {
      ok: raw.success,
      data: raw.data,
      message: raw.message || '',
      errorCode: raw.errorCode || '',
      pagination: raw.pagination || null,
      raw: raw
    };
  }

  return {
    ok: true,
    data: raw,
    message: '',
    errorCode: '',
    pagination: null,
    raw: raw
  };
}

const errorCodeMessageMap = {
  CART_EMPTY: 'Giỏ hàng đang trống, chưa thể tạo đơn hàng.',
  PRODUCT_NOT_FOUND: 'Sản phẩm không còn tồn tại hoặc đã ngừng bán.',
  INVENTORY_NOT_FOUND: 'Sản phẩm chưa có dữ liệu tồn kho, vui lòng liên hệ quản trị.',
  INSUFFICIENT_STOCK: 'Số lượng tồn kho không đủ để tạo đơn.',
  INSUFFICIENT_RESERVED_STOCK: 'Tồn kho giữ chỗ không đủ để xử lý đơn hàng.',
  INVALID_PRODUCT_ID: 'Sản phẩm không hợp lệ.',
  INVALID_QUANTITY: 'Số lượng sản phẩm không hợp lệ.',
  ORDER_NOT_CANCELABLE: 'Đơn hàng này không thể hủy ở trạng thái hiện tại.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  PAYMENT_NOT_FOUND: 'Không tìm thấy thông tin thanh toán.',
  INVALID_PAYMENT_STATUS: 'Trạng thái thanh toán không hợp lệ.',
  MISSING_PRODUCT_ID: 'Thiếu sản phẩm cho thao tác này.',
  INVALID_RESERVED_UNTIL: 'Thời gian giữ chỗ không hợp lệ.',
  RESERVATION_NOT_FOUND: 'Không tìm thấy reservation.',
  RESERVATION_NOT_EDITABLE: 'Reservation này không thể chỉnh sửa.',
  DUPLICATE_CATEGORY_NAME: 'Tên danh mục đã tồn tại.',
  DUPLICATE_PRODUCT_NAME_OR_SKU: 'Tên sản phẩm hoặc SKU đã tồn tại.',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
  DUPLICATE_INVENTORY: 'Sản phẩm đã có bản ghi tồn kho.',
  INVALID_STOCK_VALUE: 'Giá trị tồn kho không hợp lệ.',
  DUPLICATE_ROLE_NAME: 'Tên role đã tồn tại.',
  ROLE_NOT_FOUND: 'Không tìm thấy role.',
  USER_NOT_FOUND: 'Không tìm thấy user.',
  MISSING_ROLE_ID: 'Vui lòng chọn role để phân quyền.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  INVALID_STATE: 'Trạng thái hiện tại không cho phép thao tác.',
  ASSIGN_CONFLICT: 'Ticket đã được admin khác nhận xử lý.',
  CURRENT_PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu hiện tại.',
  INVALID_CURRENT_PASSWORD: 'Mật khẩu hiện tại không đúng.',
  REVIEW_NOT_ELIGIBLE: 'Chỉ được đánh giá sản phẩm thuộc đơn đã thanh toán.'
};

export function normalizeError(error) {
  const payload = error?.response?.data || {};
  const errorCode = payload.errorCode || 'UNKNOWN_ERROR';
  const fallbackByCode = errorCodeMessageMap[errorCode] || '';
  const finalMessage = fallbackByCode || payload.message || error.message || 'Có lỗi xảy ra';

  return {
    ok: false,
    data: null,
    message: finalMessage,
    errorCode: errorCode,
    errors: payload.errors || []
  };
}
