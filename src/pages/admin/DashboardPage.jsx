import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  Menu,
  MoreVertical,
  Package,
  Search,
  Settings,
  ShoppingCart,
  ShieldCheck,
  TrendingUp,
  Users,
  Warehouse,
  Wallet,
  X
} from 'lucide-react';
import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi
} from '../../services/categories.api';
import {
  createProductApi,
  deleteProductApi,
  getProductsApi,
  updateProductApi
} from '../../services/products.api';
import {
  adjustStockApi,
  createInventoryApi,
  decreaseStockApi,
  deleteInventoryByProductApi,
  getInventoriesApi,
  increaseStockApi
} from '../../services/inventories.api';
import { getAllPaymentsAdminApi, updatePaymentStatusApi } from '../../services/payments.api';
import { updateOrderStatusApi } from '../../services/orders.api';
import { createRoleApi, deleteRoleApi, getRolesApi, updateRoleApi } from '../../services/roles.api';
import { getUsersApi, updateUserRoleApi } from '../../services/users.api';
import { logoutApi } from '../../services/auth.api';
import { getRoleName, useAuthStore } from '../../store/authStore';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { id: 'categories', icon: Settings, label: 'Danh mục' },
  { id: 'products', icon: Package, label: 'Sản phẩm' },
  { id: 'inventories', icon: Warehouse, label: 'Tồn kho' },
  { id: 'orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { id: 'payments', icon: Wallet, label: 'Thanh toán' },
  { id: 'access', icon: ShieldCheck, label: 'Phân quyền' }
];

function emptyCategoryForm() {
  return { id: '', name: '', description: '', imageUrl: '', status: true };
}

function emptyProductForm() {
  return {
    id: '',
    name: '',
    price: '',
    categoryId: '',
    sku: '',
    description: '',
    images: '',
    weightInGram: '',
    status: true
  };
}

function emptyInventoryForm() {
  return { productId: '', stock: '', minStockThreshold: '' };
}

function emptyRoleForm() {
  return { id: '', name: '', description: '' };
}

function normalizePaymentStatus(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'PAID') {
    return { className: 'status-success', label: 'Đã thanh toán' };
  }

  if (value === 'CANCELLED' || value === 'FAILED' || value === 'REFUNDED') {
    return { className: 'status-error', label: value };
  }

  return { className: 'status-pending', label: 'Chờ xử lý' };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm());
  const [productForm, setProductForm] = useState(emptyProductForm());
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm());
  const [roleForm, setRoleForm] = useState(emptyRoleForm());
  const [orderStatusForm, setOrderStatusForm] = useState({ orderId: '', status: 'PENDING' });

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategoriesApi });
  const productsQuery = useQuery({ queryKey: ['products', 'admin-core'], queryFn: () => getProductsApi({ page: 1, limit: 50 }) });
  const inventoriesQuery = useQuery({ queryKey: ['inventories', 'admin-core'], queryFn: () => getInventoriesApi({ page: 1, limit: 50 }) });
  const paymentsQuery = useQuery({ queryKey: ['payments', 'admin-all'], queryFn: () => getAllPaymentsAdminApi({ page: 1, limit: 50 }) });
  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: getRolesApi });
  const usersQuery = useQuery({ queryKey: ['users', 'admin-management'], queryFn: getUsersApi });

  const categories = categoriesQuery.data?.data || [];
  const products = productsQuery.data?.data || [];
  const inventories = inventoriesQuery.data?.data || [];
  const payments = paymentsQuery.data?.data || [];
  const roles = rolesQuery.data?.data || [];
  const users = usersQuery.data?.data || [];
  const adminName = user?.fullName || user?.username || 'Người dùng';
  const roleName = getRoleName(user);
  const isAdmin = ['ADMIN', 'MODERATOR'].includes(roleName);
  const adminDisplayName = user?.fullName || user?.username || 'Admin User';

  function getOrderIdFromPayment(payment) {
    const rawOrder = payment?.order;
    if (!rawOrder) {
      return '';
    }
    if (typeof rawOrder === 'string') {
      return rawOrder;
    }
    return rawOrder._id || rawOrder.id || '';
  }

  const orderIdsFromPayments = useMemo(() => {
    const ids = payments.map((payment) => getOrderIdFromPayment(payment)).filter(Boolean);
    return [...new Set(ids.map(String))];
  }, [payments]);

  const stats = useMemo(() => {
    const totalRevenue = payments
      .filter((item) => String(item.paymentStatus || '').toUpperCase() === 'PAID')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const recentOrderCount = payments.filter((item) => {
      if (!item.createdAt) {
        return false;
      }
      const createdAt = new Date(item.createdAt).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return createdAt >= sevenDaysAgo;
    }).length;

    const uniqueCustomers = new Set(
      payments
        .map((item) => {
          const user = item.user;
          if (!user) {
            return '';
          }
          if (typeof user === 'string') {
            return user;
          }
          return user._id || user.id || '';
        })
        .filter(Boolean)
    ).size;

    const lowStockCount = inventories.filter((item) => item.isLowStock).length;

    return [
      { title: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString('vi-VN')} ₫`, note: `${payments.length} giao dịch` },
      { title: 'Đơn mới 7 ngày', value: String(recentOrderCount), note: 'Từ bản ghi thanh toán' },
      { title: 'Khách hàng', value: String(uniqueCustomers), note: 'Khách có phát sinh giao dịch' },
      { title: 'Sản phẩm sắp hết', value: String(lowStockCount), note: 'Theo ngưỡng tồn kho' }
    ];
  }, [inventories, payments]);

  const filteredPayments = useMemo(() => {
    const normalizedKeyword = searchTerm.trim().toLowerCase();
    if (!normalizedKeyword) {
      return payments;
    }

    return payments.filter((payment) => {
      const orderId = getOrderIdFromPayment(payment).toLowerCase();
      const customerName = String(payment?.user?.fullName || payment?.user?.username || '').toLowerCase();
      return orderId.includes(normalizedKeyword) || customerName.includes(normalizedKeyword);
    });
  }, [payments, searchTerm]);

  const createCategoryMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo danh mục');
        return;
      }
      toast.success('Đã tạo danh mục');
      setCategoryForm(emptyCategoryForm());
      setShowCategoryForm(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategoryApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật danh mục');
        return;
      }
      toast.success('Đã cập nhật danh mục');
      setCategoryForm(emptyCategoryForm());
      setShowCategoryForm(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa danh mục');
        return;
      }
      toast.success('Đã xóa danh mục');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const createProductMutation = useMutation({
    mutationFn: createProductApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo sản phẩm');
        return;
      }
      toast.success('Đã tạo sản phẩm');
      setProductForm(emptyProductForm());
      setShowProductForm(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProductApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật sản phẩm');
        return;
      }
      toast.success('Đã cập nhật sản phẩm');
      setProductForm(emptyProductForm());
      setShowProductForm(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa sản phẩm');
        return;
      }
      toast.success('Đã xóa sản phẩm');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const createInventoryMutation = useMutation({
    mutationFn: createInventoryApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo tồn kho');
        return;
      }
      toast.success('Đã tạo tồn kho');
      setInventoryForm(emptyInventoryForm());
      setShowInventoryForm(false);
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    }
  });

  const increaseStockMutation = useMutation({
    mutationFn: increaseStockApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tăng tồn kho');
        return;
      }
      toast.success('Đã tăng tồn kho');
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    }
  });

  const decreaseStockMutation = useMutation({
    mutationFn: decreaseStockApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể giảm tồn kho');
        return;
      }
      toast.success('Đã giảm tồn kho');
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: adjustStockApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể điều chỉnh tồn kho');
        return;
      }
      toast.success('Đã điều chỉnh tồn kho');
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    }
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: deleteInventoryByProductApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa bản ghi tồn kho');
        return;
      }
      toast.success('Đã xóa bản ghi tồn kho');
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => updateOrderStatusApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật trạng thái đơn');
        return;
      }
      toast.success('Đã cập nhật trạng thái đơn hàng');
      setShowOrderForm(false);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePaymentStatusApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật trạng thái thanh toán');
        return;
      }
      toast.success('Đã cập nhật trạng thái thanh toán');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    }
  });

  const createRoleMutation = useMutation({
    mutationFn: createRoleApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo role');
        return;
      }
      toast.success('Đã tạo role');
      setRoleForm(emptyRoleForm());
      setShowRoleForm(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRoleApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật role');
        return;
      }
      toast.success('Đã cập nhật role');
      setRoleForm(emptyRoleForm());
      setShowRoleForm(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRoleApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa role');
        return;
      }
      toast.success('Đã xóa role');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUserRoleApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể phân quyền cho user');
        return;
      }
      toast.success('Đã cập nhật role cho user');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  function submitCategory(event) {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Tên danh mục là bắt buộc');
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      imageUrl: categoryForm.imageUrl.trim(),
      status: Boolean(categoryForm.status)
    };

    if (categoryForm.id) {
      updateCategoryMutation.mutate({ id: categoryForm.id, payload });
      return;
    }
    createCategoryMutation.mutate(payload);
  }

  function submitProduct(event) {
    event.preventDefault();
    if (!productForm.name.trim() || !productForm.categoryId || !Number(productForm.price)) {
      toast.error('Tên, danh mục và giá sản phẩm là bắt buộc');
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      categoryId: productForm.categoryId,
      sku: productForm.sku.trim(),
      description: productForm.description.trim(),
      images: productForm.images ? productForm.images.split(',').map((item) => item.trim()).filter(Boolean) : [],
      weightInGram: productForm.weightInGram ? Number(productForm.weightInGram) : undefined,
      status: Boolean(productForm.status)
    };

    if (productForm.id) {
      updateProductMutation.mutate({ id: productForm.id, payload });
      return;
    }
    createProductMutation.mutate(payload);
  }

  function submitCreateInventory(event) {
    event.preventDefault();
    if (!inventoryForm.productId || inventoryForm.stock === '') {
      toast.error('Chọn sản phẩm và nhập số lượng tồn kho');
      return;
    }

    createInventoryMutation.mutate({
      productId: inventoryForm.productId,
      stock: Number(inventoryForm.stock),
      minStockThreshold: inventoryForm.minStockThreshold === '' ? 0 : Number(inventoryForm.minStockThreshold)
    });
  }

  function submitOrderStatus(event) {
    event.preventDefault();
    if (!orderStatusForm.orderId.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng');
      return;
    }

    updateOrderStatusMutation.mutate({
      id: orderStatusForm.orderId.trim(),
      payload: { status: orderStatusForm.status }
    });
  }

  function submitRole(event) {
    event.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error('Tên role là bắt buộc');
      return;
    }

    const payload = {
      name: roleForm.name.trim(),
      description: roleForm.description.trim()
    };

    if (roleForm.id) {
      updateRoleMutation.mutate({ id: roleForm.id, payload });
      return;
    }

    createRoleMutation.mutate(payload);
  }

  function resolveRoleName(role) {
    if (!role) {
      return '';
    }
    if (typeof role === 'string') {
      return role;
    }
    return role.name || '';
  }

  function resolveUserRoleId(user) {
    if (!user?.role) {
      return '';
    }
    if (typeof user.role === 'string') {
      return user.role;
    }
    return user.role.id || user.role._id || '';
  }

  async function handleSidebarLogout() {
    await logoutApi();
    clearAuth();
    toast.success('Đã đăng xuất');
    navigate('/');
  }

  function renderDashboardOverview() {
    return (
      <>
        <div className="admin-stats-grid">
          {stats.map((stat) => (
            <article key={stat.title} className="admin-stat-card">
              <h3>{stat.value}</h3>
              <small>{stat.note}</small>
            </article>
          ))}
        </div>

        <section className="admin-table-wrap">
          <div className="admin-table-head">
            <h2>Đơn hàng gần đây (từ thanh toán)</h2>
            <span>{filteredPayments.length} kết quả</span>
          </div>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày tạo</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const status = normalizePaymentStatus(payment.paymentStatus);
                  const customerName = payment?.user?.fullName || payment?.user?.username || 'Khách hàng';
                  return (
                    <tr key={payment.id}>
                      <td>{getOrderIdFromPayment(payment) || '-'}</td>
                      <td>{customerName}</td>
                      <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>{Number(payment.amount || 0).toLocaleString('vi-VN')} ₫</td>
                      <td>
                        <span className={`status-badge ${status.className}`}>{status.label}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini-icon-btn" aria-label="Xem thêm">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderCategoryContent() {
    return (
      <section className="paper-block stack-gap">
        <div className="section-head-row">
          <h2>Quản lý danh mục</h2>
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              if (showCategoryForm) {
                setCategoryForm(emptyCategoryForm());
              }
              setShowCategoryForm((prev) => !prev);
            }}
          >
            {showCategoryForm ? 'Đóng form' : 'Thêm danh mục'}
          </button>
        </div>

        {showCategoryForm ? (
          <form className="stack-gap" onSubmit={submitCategory}>
            <input type="text" placeholder="Tên danh mục" value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} />
            <textarea rows={3} placeholder="Mô tả" value={categoryForm.description} onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))} />
            <input type="text" placeholder="Image URL" value={categoryForm.imageUrl} onChange={(event) => setCategoryForm((prev) => ({ ...prev, imageUrl: event.target.value }))} />
            <label>
              <input type="checkbox" checked={Boolean(categoryForm.status)} onChange={(event) => setCategoryForm((prev) => ({ ...prev, status: event.target.checked }))} />
              {' '}Đang hoạt động
            </label>
            <div className="hero-actions">
              <button className="btn primary" type="submit">{categoryForm.id ? 'Cập nhật danh mục' : 'Tạo danh mục'}</button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setCategoryForm(emptyCategoryForm());
                  setShowCategoryForm(false);
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : null}

        <div className="orders-list">
          {categories.map((category) => (
            <article className="order-card" key={category.id}>
              <div>
                <h3>{category.name}</h3>
                <p className="muted-text">{category.description || 'Không có mô tả'}</p>
              </div>
              <div className="hero-actions">
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => {
                    setCategoryForm({
                      id: category.id,
                      name: category.name || '',
                      description: category.description || '',
                      imageUrl: category.imageUrl || '',
                      status: category.status !== false
                    });
                    setShowCategoryForm(true);
                  }}
                >
                  Sửa
                </button>
                <button className="btn secondary" type="button" onClick={() => deleteCategoryMutation.mutate(category.id)}>Xóa</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderProductContent() {
    return (
      <section className="paper-block stack-gap">
        <div className="section-head-row">
          <h2>Quản lý sản phẩm</h2>
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              if (showProductForm) {
                setProductForm(emptyProductForm());
              }
              setShowProductForm((prev) => !prev);
            }}
          >
            {showProductForm ? 'Đóng form' : 'Thêm sản phẩm'}
          </button>
        </div>

        {showProductForm ? (
          <form className="stack-gap" onSubmit={submitProduct}>
            <input type="text" placeholder="Tên sản phẩm" value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} />
            <input type="number" placeholder="Giá" value={productForm.price} onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))} />
            <select value={productForm.categoryId} onChange={(event) => setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))}>
              <option value="">Chọn danh mục</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input type="text" placeholder="SKU" value={productForm.sku} onChange={(event) => setProductForm((prev) => ({ ...prev, sku: event.target.value }))} />
            <textarea rows={3} placeholder="Mô tả" value={productForm.description} onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))} />
            <input type="text" placeholder="Image URLs (phân tách bằng dấu phẩy)" value={productForm.images} onChange={(event) => setProductForm((prev) => ({ ...prev, images: event.target.value }))} />
            <input type="number" placeholder="Khối lượng (gram)" value={productForm.weightInGram} onChange={(event) => setProductForm((prev) => ({ ...prev, weightInGram: event.target.value }))} />
            <label>
              <input type="checkbox" checked={Boolean(productForm.status)} onChange={(event) => setProductForm((prev) => ({ ...prev, status: event.target.checked }))} />
              {' '}Đang hoạt động
            </label>
            <div className="hero-actions">
              <button className="btn primary" type="submit">{productForm.id ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}</button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setProductForm(emptyProductForm());
                  setShowProductForm(false);
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : null}

        <div className="orders-list">
          {products.map((product) => (
            <article className="order-card" key={product.id}>
              <div>
                <h3>{product.name}</h3>
                <p className="muted-text">SKU: {product.sku || 'Không có'} | Giá: {Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="hero-actions">
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => {
                    setProductForm({
                      id: product.id,
                      name: product.name || '',
                      price: Number(product.price || 0),
                      categoryId: product?.category?.id || product?.category?._id || product?.category || '',
                      sku: product.sku || '',
                      description: product.description || '',
                      images: Array.isArray(product.images) ? product.images.join(', ') : '',
                      weightInGram: product.weightInGram || '',
                      status: product.status !== false
                    });
                    setShowProductForm(true);
                  }}
                >
                  Sửa
                </button>
                <button className="btn secondary" type="button" onClick={() => deleteProductMutation.mutate(product.id)}>Xóa</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderInventoryContent() {
    return (
      <section className="paper-block stack-gap">
        <div className="section-head-row">
          <h2>Quản lý tồn kho</h2>
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              if (showInventoryForm) {
                setInventoryForm(emptyInventoryForm());
              }
              setShowInventoryForm((prev) => !prev);
            }}
          >
            {showInventoryForm ? 'Đóng form' : 'Thêm tồn kho'}
          </button>
        </div>

        {showInventoryForm ? (
          <form className="stack-gap" onSubmit={submitCreateInventory}>
            <select value={inventoryForm.productId} onChange={(event) => setInventoryForm((prev) => ({ ...prev, productId: event.target.value }))}>
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input type="number" placeholder="Stock" value={inventoryForm.stock} onChange={(event) => setInventoryForm((prev) => ({ ...prev, stock: event.target.value }))} />
            <input type="number" placeholder="Min stock threshold" value={inventoryForm.minStockThreshold} onChange={(event) => setInventoryForm((prev) => ({ ...prev, minStockThreshold: event.target.value }))} />
            <div className="hero-actions">
              <button className="btn primary" type="submit">Tạo bản ghi tồn kho</button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setInventoryForm(emptyInventoryForm());
                  setShowInventoryForm(false);
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : null}

        <div className="orders-list">
          {inventories.map((inventory) => {
            const productId = inventory?.product?._id || inventory?.product?.id || inventory?.product;
            return (
              <article className="order-card" key={inventory.id}>
                <div>
                  <h3>{inventory?.product?.name || 'Sản phẩm'}</h3>
                  <p>Stock: <strong>{inventory.stock}</strong> | Reserved: <strong>{inventory.reservedStock}</strong></p>
                  <p className="muted-text">Available: {inventory.availableStock} | Min: {inventory.minStockThreshold}</p>
                </div>
                <div className="hero-actions">
                  <button className="btn secondary" type="button" onClick={() => increaseStockMutation.mutate({ productId, quantity: 1 })}>+1</button>
                  <button className="btn secondary" type="button" onClick={() => decreaseStockMutation.mutate({ productId, quantity: 1 })}>-1</button>
                  <button className="btn secondary" type="button" onClick={() => adjustStockMutation.mutate({ productId, newStock: inventory.stock, minStockThreshold: inventory.minStockThreshold })}>Adjust</button>
                  <button className="btn secondary" type="button" onClick={() => deleteInventoryMutation.mutate(productId)}>Xóa</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  function renderOrdersContent() {
    return (
      <section className="paper-block stack-gap">
        <div className="section-head-row">
          <h2>Cập nhật trạng thái đơn hàng</h2>
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              if (showOrderForm) {
                setOrderStatusForm({ orderId: '', status: 'PENDING' });
              }
              setShowOrderForm((prev) => !prev);
            }}
          >
            {showOrderForm ? 'Đóng form' : 'Cập nhật đơn hàng'}
          </button>
        </div>
        <p className="muted-text">Backend chưa có endpoint list-all orders cho admin. Bạn có thể chọn orderId từ payment hoặc nhập trực tiếp.</p>
        {showOrderForm ? (
          <form className="stack-gap" onSubmit={submitOrderStatus}>
            <select value={orderStatusForm.orderId} onChange={(event) => setOrderStatusForm((prev) => ({ ...prev, orderId: event.target.value }))}>
              <option value="">Chọn order từ payment</option>
              {orderIdsFromPayments.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
            <input type="text" placeholder="Hoặc nhập Order ID" value={orderStatusForm.orderId} onChange={(event) => setOrderStatusForm((prev) => ({ ...prev, orderId: event.target.value }))} />
            <select value={orderStatusForm.status} onChange={(event) => setOrderStatusForm((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <div className="hero-actions">
              <button className="btn primary" type="submit">Cập nhật trạng thái đơn</button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setOrderStatusForm({ orderId: '', status: 'PENDING' });
                  setShowOrderForm(false);
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : null}
      </section>
    );
  }

  function renderPaymentsContent() {
    return (
      <section className="paper-block stack-gap">
        <h2>Quản lý thanh toán</h2>
        <div className="orders-list">
          {payments.map((payment) => (
            <article className="order-card" key={payment.id}>
              <div>
                <h3>Payment #{String(payment.id).slice(-6).toUpperCase()}</h3>
                <p className="muted-text">Order: {getOrderIdFromPayment(payment) || 'Không có'}</p>
                <p>Amount: <strong>{Number(payment.amount || 0).toLocaleString('vi-VN')} VND</strong></p>
                <p>Status: <strong>{payment.paymentStatus}</strong></p>
              </div>
              <div className="hero-actions">
                {['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="btn secondary"
                    onClick={() => updatePaymentStatusMutation.mutate({ id: payment.id, payload: { paymentStatus: status } })}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderAccessContent() {
    return (
      <section className="stack-gap">
        <div className="paper-block stack-gap">
          <div className="section-head-row">
            <h2>Quản lý role</h2>
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                if (showRoleForm) {
                  setRoleForm(emptyRoleForm());
                }
                setShowRoleForm((prev) => !prev);
              }}
            >
              {showRoleForm ? 'Đóng form' : 'Thêm role'}
            </button>
          </div>

          {showRoleForm ? (
            <form className="stack-gap" onSubmit={submitRole}>
              <input type="text" placeholder="Tên role" value={roleForm.name} onChange={(event) => setRoleForm((prev) => ({ ...prev, name: event.target.value }))} />
              <textarea rows={3} placeholder="Mô tả role" value={roleForm.description} onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))} />
              <div className="hero-actions">
                <button className="btn primary" type="submit">{roleForm.id ? 'Cập nhật role' : 'Tạo role'}</button>
                <button className="btn secondary" type="button" onClick={() => { setRoleForm(emptyRoleForm()); setShowRoleForm(false); }}>Hủy</button>
              </div>
            </form>
          ) : null}

          <div className="orders-list">
            {roles.map((role) => (
              <article className="order-card" key={role.id}>
                <div>
                  <h3>{role.name}</h3>
                  <p className="muted-text">{role.description || 'Không có mô tả'}</p>
                </div>
                <div className="hero-actions">
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => {
                      setRoleForm({
                        id: role.id,
                        name: role.name || '',
                        description: role.description || ''
                      });
                      setShowRoleForm(true);
                    }}
                  >
                    Sửa
                  </button>
                  <button className="btn secondary" type="button" onClick={() => deleteRoleMutation.mutate(role.id)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="paper-block stack-gap">
          <div className="section-head-row">
            <h2>Gán role cho user</h2>
            <span className="muted-text">Chỉ admin mới đổi role được</span>
          </div>

          <div className="admin-access-grid">
            {users.map((user) => (
              <article className="admin-user-card" key={user.id}>
                <div>
                  <h3>{user.fullName || user.username}</h3>
                  <p className="muted-text">{user.email}</p>
                  <p>Role hiện tại: <strong>{resolveRoleName(user.role) || 'Chưa có'}</strong></p>
                </div>
                <div className="stack-gap">
                  <select value={resolveUserRoleId(user)} onChange={(event) => updateUserRoleMutation.mutate({ id: user.id, payload: { roleId: event.target.value } })}>
                    <option value="">Chọn role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <small className="muted-text">Thay đổi sẽ cập nhật trực tiếp.</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  }

  function renderActiveContent() {
    if (activeTab === 'dashboard') return renderDashboardOverview();
    if (activeTab === 'categories') return renderCategoryContent();
    if (activeTab === 'products') return renderProductContent();
    if (activeTab === 'inventories') return renderInventoryContent();
    if (activeTab === 'orders') return renderOrdersContent();
    if (activeTab === 'payments') return renderPaymentsContent();
    if (activeTab === 'access') return renderAccessContent();
    return null;
  }

  return (
    <div className="admin-shell">
      {isMobileMenuOpen ? (
        <button type="button" className="admin-overlay" onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu" />
      ) : null}

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <Link to="/" className="admin-brand-link">Gốm Xưa.</Link>
          <button type="button" className="mini-icon-btn mobile-only" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          <p>Quản lý</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          {isAdmin && token ? <p className="admin-sidebar-user">{adminName}</p> : null}
          <button className="admin-logout-btn" type="button" onClick={handleSidebarLogout}>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button type="button" className="mini-icon-btn mobile-only" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <span className="admin-user-chip">{adminDisplayName}</span>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Tìm theo mã đơn hoặc tên khách"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <button type="button" className="mini-icon-btn" aria-label="Thông báo">
              <Bell size={18} />
            </button>
            <div className="admin-avatar">
              <Users size={16} />
            </div>
          </div>
        </header>

        <main className="admin-content">
          {renderActiveContent()}
        </main>
      </div>
    </div>
  );
}
