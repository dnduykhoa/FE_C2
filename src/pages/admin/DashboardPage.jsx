import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  Menu,
  MessageCircle,
  MoreVertical,
  Package,
  Search,
  Settings,
  ShoppingCart,
  ShieldCheck,
  Star,
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
import { getAllOrdersAdminApi, updateOrderStatusApi } from '../../services/orders.api';
import { createRoleApi, deleteRoleApi, getRolesApi, updateRoleApi } from '../../services/roles.api';
import { getUsersApi, updateUserRoleApi } from '../../services/users.api';
import {
  assignConversationApi,
  getAdminConversationsApi,
  getConversationMessagesApi,
  markConversationReadApi,
  sendAdminMessageApi,
  updateConversationStatusApi
} from '../../services/messages.api';
import { deleteReviewAdminApi, getAllReviewsAdminApi } from '../../services/reviews.api';
import { logoutApi } from '../../services/auth.api';
import { getRoleName, useAuthStore } from '../../store/authStore';
import DataStatePanel from '../../components/common/DataStatePanel';
import { resolveMediaUrl } from '../../services/mediaUrl';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { id: 'categories', icon: Settings, label: 'Danh mục' },
  { id: 'products', icon: Package, label: 'Sản phẩm' },
  { id: 'inventories', icon: Warehouse, label: 'Tồn kho' },
  { id: 'orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { id: 'payments', icon: Wallet, label: 'Thanh toán' },
  { id: 'support', icon: MessageCircle, label: 'Hỗ trợ chat' },
  { id: 'reviews', icon: Star, label: 'Kiểm duyệt đánh giá' },
  { id: 'access', icon: ShieldCheck, label: 'Phân quyền' }
];

const ADMIN_ACTIVE_TAB_STORAGE_KEY = 'admin-dashboard-active-tab';

function getInitialAdminTab() {
  if (typeof window === 'undefined') {
    return 'dashboard';
  }

  const savedTab = window.localStorage.getItem(ADMIN_ACTIVE_TAB_STORAGE_KEY);
  if (savedTab && navItems.some((item) => item.id === savedTab)) {
    return savedTab;
  }

  return 'dashboard';
}

function getPaymentStatusLabel(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'PAID') return 'Đã thanh toán';
  if (value === 'PENDING') return 'Chờ xử lý';
  if (value === 'FAILED') return 'Thất bại';
  if (value === 'REFUNDED') return 'Đã hoàn tiền';
  if (value === 'CANCELLED') return 'Đã hủy';
  return value || 'Không xác định';
}

function getOrderStatusLabel(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'PENDING') return 'Chờ xử lý';
  if (value === 'PAID') return 'Đã thanh toán';
  if (value === 'SHIPPED') return 'Đang giao';
  if (value === 'COMPLETED') return 'Hoàn thành';
  if (value === 'CANCELLED') return 'Đã hủy';
  if (value === 'FAILED') return 'Thất bại';
  return value || 'Không xác định';
}

function getSupportStatusLabel(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'open') return 'Mới mở';
  if (value === 'pending') return 'Đang xử lý';
  if (value === 'resolved') return 'Đã xử lý';
  if (value === 'closed') return 'Đã đóng';
  return status || 'Không xác định';
}

function getPriorityLabel(priority) {
  const value = String(priority || '').toLowerCase();
  if (value === 'low') return 'Thấp';
  if (value === 'normal') return 'Bình thường';
  if (value === 'high') return 'Cao';
  if (value === 'urgent') return 'Khẩn cấp';
  return priority || 'Không xác định';
}

function isDocumentVisible() {
  if (typeof document === 'undefined') {
    return true;
  }
  return document.visibilityState === 'visible';
}

function emptyCategoryForm() {
  return { id: '', name: '', description: '', status: true };
}

function emptyProductForm() {
  return {
    id: '',
    name: '',
    price: '',
    categoryId: '',
    sku: '',
    description: '',
    images: [],
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
    return { className: 'status-success', label: getPaymentStatusLabel(value) };
  }

  if (value === 'CANCELLED' || value === 'FAILED' || value === 'REFUNDED') {
    return { className: 'status-error', label: getPaymentStatusLabel(value) };
  }

  return { className: 'status-pending', label: getPaymentStatusLabel(value) };
}

function normalizeOrderStatus(status) {
  const value = String(status || '').toUpperCase();

  if (value === 'COMPLETED' || value === 'PAID') {
    return { className: 'status-success', label: getOrderStatusLabel(value) };
  }

  if (value === 'CANCELLED' || value === 'FAILED') {
    return { className: 'status-error', label: getOrderStatusLabel(value) };
  }

  if (value === 'SHIPPED') {
    return { className: 'status-pending', label: getOrderStatusLabel(value) };
  }

  return { className: 'status-pending', label: getOrderStatusLabel(value) };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(getInitialAdminTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [supportFilter, setSupportFilter] = useState({ status: '', assigned: 'mine' });
  const [selectedSupportConversationId, setSelectedSupportConversationId] = useState('');
  const [supportReplyContent, setSupportReplyContent] = useState('');
  const [supportStatus, setSupportStatus] = useState('pending');
  const [openPaymentMenuId, setOpenPaymentMenuId] = useState('');
  const [openOrderMenuId, setOpenOrderMenuId] = useState('');
  const [editingInventoryId, setEditingInventoryId] = useState('');
  const [expandedSupportMessages, setExpandedSupportMessages] = useState({});
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm());
  const [productForm, setProductForm] = useState(emptyProductForm());
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm());
  const [adjustInventoryForm, setAdjustInventoryForm] = useState({ productId: '', newStock: '', minStockThreshold: '' });
  const [roleForm, setRoleForm] = useState(emptyRoleForm());

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategoriesApi });
  const productsQuery = useQuery({ queryKey: ['products', 'admin-core'], queryFn: () => getProductsApi({ page: 1, limit: 50 }) });
  const inventoriesQuery = useQuery({ queryKey: ['inventories', 'admin-core'], queryFn: () => getInventoriesApi({ page: 1, limit: 50 }) });
  const paymentsQuery = useQuery({ queryKey: ['payments', 'admin-all'], queryFn: () => getAllPaymentsAdminApi({ page: 1, limit: 50 }) });
  const ordersQuery = useQuery({ queryKey: ['orders', 'admin-all'], queryFn: () => getAllOrdersAdminApi({ page: 1, limit: 100 }) });
  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: getRolesApi });
  const usersQuery = useQuery({ queryKey: ['users', 'admin-management'], queryFn: getUsersApi });
  const supportConversationsQuery = useQuery({
    queryKey: ['support', 'admin-conversations', supportFilter],
    queryFn: () => getAdminConversationsApi({ page: 1, limit: 50, status: supportFilter.status || undefined, assigned: supportFilter.assigned || undefined }),
    refetchInterval: () => (isDocumentVisible() ? 15000 : false)
  });
  const adminReviewsQuery = useQuery({ queryKey: ['reviews', 'admin-all'], queryFn: getAllReviewsAdminApi });

  const categories = categoriesQuery.data?.data || [];
  const products = productsQuery.data?.data || [];
  const inventories = inventoriesQuery.data?.data || [];
  const payments = paymentsQuery.data?.data || [];
  const adminOrders = ordersQuery.data?.data || [];
  const roles = rolesQuery.data?.data || [];
  const users = usersQuery.data?.data || [];
  const supportConversationsResult = supportConversationsQuery.data;
  const supportConversations = supportConversationsResult?.ok ? (supportConversationsResult?.data?.items || []) : [];
  const adminReviewsResult = adminReviewsQuery.data;
  const adminReviews = adminReviewsResult?.ok ? (adminReviewsResult?.data || []) : [];
  const adminName = user?.fullName || user?.username || 'Người dùng';
  const roleName = getRoleName(user);
  const isAdmin = ['ADMIN', 'MODERATOR'].includes(roleName);
  const adminDisplayName = user?.fullName || user?.username || 'Quản trị viên';

  const activeSupportConversationId = selectedSupportConversationId || supportConversations[0]?._id || supportConversations[0]?.id || '';
  const supportMessagesQuery = useQuery({
    queryKey: ['support', 'admin-messages', activeSupportConversationId],
    queryFn: () => getConversationMessagesApi(activeSupportConversationId, { page: 1, limit: 100 }),
    enabled: Boolean(activeSupportConversationId),
    refetchInterval: () => (activeSupportConversationId && isDocumentVisible() ? 5000 : false)
  });
  const supportMessagesResult = supportMessagesQuery.data;

  const productImagePreviews = useMemo(() => {
    return productImageFiles.map((file) => URL.createObjectURL(file));
  }, [productImageFiles]);

  useEffect(() => {
    return () => {
      productImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [productImagePreviews]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ADMIN_ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!openPaymentMenuId && !openOrderMenuId) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (!event.target.closest('.payment-status-menu-wrap, .order-status-menu-wrap')) {
        setOpenPaymentMenuId('');
        setOpenOrderMenuId('');
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openPaymentMenuId, openOrderMenuId]);

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
      resetCategoryForm();
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
      resetCategoryForm();
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
      resetProductForm();
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
      resetProductForm();
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
      setEditingInventoryId('');
      setAdjustInventoryForm({ productId: '', newStock: '', minStockThreshold: '' });
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
      setOpenOrderMenuId('');
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin-all'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'admin-all'] });
      queryClient.invalidateQueries({ queryKey: ['inventories', 'admin-core'] });
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
      setOpenPaymentMenuId('');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
    }
  });

  const createRoleMutation = useMutation({
    mutationFn: createRoleApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể tạo vai trò');
        return;
      }
      toast.success('Đã tạo vai trò');
      setRoleForm(emptyRoleForm());
      setShowRoleForm(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRoleApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật vai trò');
        return;
      }
      toast.success('Đã cập nhật vai trò');
      setRoleForm(emptyRoleForm());
      setShowRoleForm(false);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRoleApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa vai trò');
        return;
      }
      toast.success('Đã xóa vai trò');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUserRoleApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể phân quyền cho người dùng');
        return;
      }
      toast.success('Đã cập nhật vai trò cho người dùng');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const assignSupportMutation = useMutation({
    mutationFn: assignConversationApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể nhận yêu cầu');
        return;
      }
      toast.success('Đã nhận yêu cầu hỗ trợ');
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-messages'] });
    }
  });

  const sendSupportReplyMutation = useMutation({
    mutationFn: ({ id, payload }) => sendAdminMessageApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể gửi phản hồi');
        return;
      }
      toast.success('Đã gửi phản hồi');
      setSupportReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-messages', activeSupportConversationId] });
    }
  });

  const updateSupportStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => updateConversationStatusApi(id, payload),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể cập nhật trạng thái yêu cầu');
        return;
      }
      toast.success('Đã cập nhật trạng thái yêu cầu');
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-messages', activeSupportConversationId] });
    }
  });

  const markSupportReadMutation = useMutation({
    mutationFn: markConversationReadApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể đánh dấu đã đọc');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'admin-messages', activeSupportConversationId] });
    }
  });

  useEffect(() => {
    if (!activeSupportConversationId) {
      return;
    }

    const activeConversation = supportConversations.find((conversation) => {
      const conversationId = conversation._id || conversation.id;
      return conversationId === activeSupportConversationId;
    });

    if (activeConversation?.status) {
      setSupportStatus(activeConversation.status);
    }

    markSupportReadMutation.mutate(activeSupportConversationId);
  }, [activeSupportConversationId, supportConversations]);

  const deleteReviewModerationMutation = useMutation({
    mutationFn: deleteReviewAdminApi,
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message || 'Không thể xóa review');
        return;
      }
      toast.success('Đã xóa review');
      queryClient.invalidateQueries({ queryKey: ['reviews', 'admin-all'] });
    }
  });

  function resetCategoryForm() {
    setCategoryForm(emptyCategoryForm());
    setShowCategoryForm(false);
  }

  function resetProductForm() {
    setProductForm(emptyProductForm());
    setProductImageFiles([]);
    setShowProductForm(false);
  }

  function isLongSupportMessage(content) {
    return String(content || '').length > 1200;
  }

  function toggleExpandedSupportMessage(messageId) {
    setExpandedSupportMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  }

  function submitCategory(event) {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Tên danh mục là bắt buộc');
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      status: Boolean(categoryForm.status)
    };

    if (categoryForm.id) {
      updateCategoryMutation.mutate({ id: categoryForm.id, payload });
      return;
    }
    createCategoryMutation.mutate(payload);
  }

  async function submitProduct(event) {
    event.preventDefault();
    if (!productForm.name.trim() || !productForm.categoryId || !Number(productForm.price)) {
      toast.error('Tên, danh mục và giá sản phẩm là bắt buộc');
      return;
    }

    if (!productImageFiles.length && (!Array.isArray(productForm.images) || productForm.images.length === 0) && !productForm.id) {
      toast.error('Vui lòng chọn ít nhất một ảnh sản phẩm');
      return;
    }

    const payload = new FormData();
    payload.append('name', productForm.name.trim());
    payload.append('price', String(Number(productForm.price)));
    payload.append('categoryId', productForm.categoryId);
    payload.append('sku', productForm.sku.trim());
    payload.append('description', productForm.description.trim());
    payload.append('status', String(Boolean(productForm.status)));

    if (productForm.weightInGram !== '') {
      payload.append('weightInGram', String(Number(productForm.weightInGram)));
    }

    if (productImageFiles.length > 0) {
      productImageFiles.forEach((file) => payload.append('images', file));
    } else {
      payload.append('images', JSON.stringify(productForm.images || []));
    }

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

  function submitRole(event) {
    event.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error('Tên vai trò là bắt buộc');
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

  function startAdjustInventory(inventory) {
    const productId = inventory?.product?._id || inventory?.product?.id || inventory?.product || '';
    setEditingInventoryId(inventory.id);
    setAdjustInventoryForm({
      productId: String(productId),
      newStock: String(Number(inventory.stock || 0)),
      minStockThreshold: String(Number(inventory.minStockThreshold || 0))
    });
  }

  function cancelAdjustInventory() {
    setEditingInventoryId('');
    setAdjustInventoryForm({ productId: '', newStock: '', minStockThreshold: '' });
  }

  function submitAdjustInventory(event) {
    event.preventDefault();

    const newStock = Number(adjustInventoryForm.newStock);
    const minStockThreshold = adjustInventoryForm.minStockThreshold === ''
      ? 0
      : Number(adjustInventoryForm.minStockThreshold);

    if (!adjustInventoryForm.productId) {
      toast.error('Không xác định được sản phẩm để điều chỉnh');
      return;
    }

    if (!Number.isFinite(newStock) || newStock < 0) {
      toast.error('Tồn kho mới phải là số lớn hơn hoặc bằng 0');
      return;
    }

    if (!Number.isFinite(minStockThreshold) || minStockThreshold < 0) {
      toast.error('Ngưỡng tối thiểu phải là số lớn hơn hoặc bằng 0');
      return;
    }

    adjustStockMutation.mutate({
      productId: adjustInventoryForm.productId,
      newStock,
      minStockThreshold
    });
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
                resetCategoryForm();
                return;
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
                  resetCategoryForm();
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
                resetProductForm();
                return;
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
            <div className="form-grid">
              <label htmlFor="productImages">Ảnh sản phẩm</label>
              <input
                id="productImages"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setProductImageFiles(Array.from(event.target.files || []))}
              />
            </div>
            {productImagePreviews.length > 0 ? (
              <div className="image-preview-grid">
                {productImagePreviews.map((preview) => (
                  <img key={preview} className="admin-image-preview" src={preview} alt={productForm.name || 'Sản phẩm'} />
                ))}
              </div>
            ) : Array.isArray(productForm.images) && productForm.images.length > 0 ? (
              <div className="image-preview-grid">
                {productForm.images.map((imageUrl) => (
                  <img key={imageUrl} className="admin-image-preview" src={resolveMediaUrl(imageUrl)} alt={productForm.name || 'Sản phẩm'} />
                ))}
              </div>
            ) : null}
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
                  resetProductForm();
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
              <div className="admin-product-main">
                <div className="admin-product-thumb-wrap">
                  {Array.isArray(product.images) && product.images[0] ? (
                    <img className="admin-product-thumb" src={resolveMediaUrl(product.images[0])} alt={product.name || 'Sản phẩm'} />
                  ) : (
                    <div className="admin-product-thumb admin-product-thumb-placeholder">Không ảnh</div>
                  )}
                </div>
                <div>
                  <h3>{product.name}</h3>
                  <p className="muted-text">SKU: {product.sku || 'Không có'} | Giá: {Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
                </div>
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
                      images: Array.isArray(product.images) ? product.images : [],
                      weightInGram: product.weightInGram || '',
                      status: product.status !== false
                    });
                    setProductImageFiles([]);
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
            <input type="number" placeholder="Tồn kho" value={inventoryForm.stock} onChange={(event) => setInventoryForm((prev) => ({ ...prev, stock: event.target.value }))} />
            <input type="number" placeholder="Ngưỡng tồn tối thiểu" value={inventoryForm.minStockThreshold} onChange={(event) => setInventoryForm((prev) => ({ ...prev, minStockThreshold: event.target.value }))} />
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
            const isLowStock = Number(inventory.availableStock || 0) <= Number(inventory.minStockThreshold || 0);
            const isEditing = editingInventoryId === inventory.id;
            return (
              <article className="order-card" key={inventory.id}>
                <div>
                  <h3>{inventory?.product?.name || 'Sản phẩm'}</h3>
                  <p>Tồn kho: <strong>{inventory.stock}</strong> | Đã giữ: <strong>{inventory.reservedStock}</strong></p>
                  <p className="muted-text">Khả dụng: {inventory.availableStock} | Tối thiểu: {inventory.minStockThreshold}</p>
                  {isLowStock ? (
                    <p>
                      <span className="status-badge status-error">Sắp hết hàng</span>
                    </p>
                  ) : null}
                  {isEditing ? (
                    <form className="stack-gap" style={{ marginTop: '10px' }} onSubmit={submitAdjustInventory}>
                      <input
                        type="number"
                        min={0}
                        placeholder="Tồn kho mới"
                        value={adjustInventoryForm.newStock}
                        onChange={(event) => setAdjustInventoryForm((prev) => ({ ...prev, newStock: event.target.value }))}
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Ngưỡng tồn tối thiểu mới"
                        value={adjustInventoryForm.minStockThreshold}
                        onChange={(event) => setAdjustInventoryForm((prev) => ({ ...prev, minStockThreshold: event.target.value }))}
                      />
                      <div className="hero-actions">
                        <button className="btn primary" type="submit" disabled={adjustStockMutation.isPending}>Lưu điều chỉnh</button>
                        <button className="btn secondary" type="button" onClick={cancelAdjustInventory}>Hủy</button>
                      </div>
                    </form>
                  ) : null}
                </div>
                <div className="hero-actions">
                  <button className="btn secondary" type="button" onClick={() => increaseStockMutation.mutate({ productId, quantity: 1 })}>+1</button>
                  <button className="btn secondary" type="button" onClick={() => decreaseStockMutation.mutate({ productId, quantity: 1 })}>-1</button>
                  <button className="btn secondary" type="button" onClick={() => startAdjustInventory(inventory)}>Điều chỉnh</button>
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
        <h2>Quản lý đơn hàng</h2>

        <div className="orders-list">
          {adminOrders.map((order) => {
            const orderStatus = normalizeOrderStatus(order.status);
            const paymentStatus = normalizePaymentStatus(order.paymentStatus);
            const customerName = order?.user?.fullName || order?.user?.username || 'Khách hàng';

            return (
              <article className="order-card" key={order.id}>
                <div>
                  <h3>Đơn #{String(order.id).slice(-6).toUpperCase()}</h3>
                  <p className="muted-text">Khách hàng: {customerName}</p>
                  <p>Tổng tiền: <strong>{Number(order.totalPrice || 0).toLocaleString('vi-VN')} VND</strong></p>
                  <p>
                    Trạng thái đơn: <span className={`status-badge ${orderStatus.className}`}>{orderStatus.label}</span>
                  </p>
                  <p>
                    Trạng thái thanh toán: <span className={`status-badge ${paymentStatus.className}`}>{paymentStatus.label}</span>
                  </p>
                </div>
                <div className="payment-status-menu-wrap">
                  <button
                    type="button"
                    className="mini-icon-btn"
                    aria-label="Cập nhật trạng thái đơn hàng"
                    onClick={() => setOpenOrderMenuId((current) => (current === order.id ? '' : order.id))}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openOrderMenuId === order.id ? (
                    <div className="payment-status-popup">
                      {['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className="btn secondary payment-status-btn"
                          onClick={() => updateOrderStatusMutation.mutate({ id: order.id, payload: { status } })}
                        >
                          {getOrderStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
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
                <h3>Thanh toán #{String(payment.id).slice(-6).toUpperCase()}</h3>
                <p className="muted-text">Đơn hàng: {getOrderIdFromPayment(payment) || 'Không có'}</p>
                <p>Số tiền: <strong>{Number(payment.amount || 0).toLocaleString('vi-VN')} VND</strong></p>
                <p>Trạng thái: <strong>{getPaymentStatusLabel(payment.paymentStatus)}</strong></p>
              </div>
              <div className="payment-status-menu-wrap">
                <button
                  type="button"
                  className="mini-icon-btn"
                  aria-label="Cập nhật trạng thái thanh toán"
                  onClick={() => setOpenPaymentMenuId((current) => (current === payment.id ? '' : payment.id))}
                >
                  <MoreVertical size={16} />
                </button>
                {openPaymentMenuId === payment.id ? (
                  <div className="payment-status-popup">
                    {['PENDING', 'PAID', 'CANCELLED'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className="btn secondary payment-status-btn"
                        onClick={() => updatePaymentStatusMutation.mutate({ id: payment.id, payload: { paymentStatus: status } })}
                      >
                        {getPaymentStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                ) : null}
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
            <h2>Quản lý vai trò</h2>
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
              {showRoleForm ? 'Đóng form' : 'Thêm vai trò'}
            </button>
          </div>

          {showRoleForm ? (
            <form className="stack-gap" onSubmit={submitRole}>
              <input type="text" placeholder="Tên vai trò" value={roleForm.name} onChange={(event) => setRoleForm((prev) => ({ ...prev, name: event.target.value }))} />
              <textarea rows={3} placeholder="Mô tả vai trò" value={roleForm.description} onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))} />
              <div className="hero-actions">
                <button className="btn primary" type="submit">{roleForm.id ? 'Cập nhật vai trò' : 'Tạo vai trò'}</button>
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
            <h2>Gán vai trò cho người dùng</h2>
            <span className="muted-text">Chỉ quản trị viên mới đổi vai trò được</span>
          </div>

          <div className="admin-access-grid">
            {users.map((user) => (
              <article className="admin-user-card" key={user.id}>
                <div>
                  <h3>{user.fullName || user.username}</h3>
                  <p className="muted-text">{user.email}</p>
                  <p>Vai trò hiện tại: <strong>{resolveRoleName(user.role) || 'Chưa có'}</strong></p>
                </div>
                <div className="stack-gap">
                  <select value={resolveUserRoleId(user)} onChange={(event) => updateUserRoleMutation.mutate({ id: user.id, payload: { roleId: event.target.value } })}>
                    <option value="">Chọn vai trò</option>
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

  function renderSupportContent() {
    const supportMessages = supportMessagesResult?.ok ? (supportMessagesResult?.data?.items || []) : [];
    const sortedSupportMessages = [...supportMessages].sort(
      (a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime()
    );
    const selectedConversation = supportConversations.find((conversation) => {
      const conversationId = conversation._id || conversation.id;
      return conversationId === activeSupportConversationId;
    }) || null;
    const isSelectedConversationClosed = selectedConversation?.status === 'closed';
    const currentAdminId = user?._id || user?.id || '';
    const rawAssignedAdmin = selectedConversation?.assignedAdminId;
    const assignedAdminId = typeof rawAssignedAdmin === 'string'
      ? rawAssignedAdmin
      : (rawAssignedAdmin?._id || rawAssignedAdmin?.id || '');
    const assignedAdminName = typeof rawAssignedAdmin === 'object'
      ? (rawAssignedAdmin?.fullName || rawAssignedAdmin?.username || '')
      : '';
    const isAssignedToMe = Boolean(assignedAdminId && currentAdminId && assignedAdminId === currentAdminId);
    const isAssignedToOther = Boolean(assignedAdminId && !isAssignedToMe);
    const isUnassignedConversation = !assignedAdminId;

    return (
      <section className="stack-gap">
        <section className="paper-block stack-gap support-chat-shell">
          <div className="section-head-row">
            <h2>Hàng chờ hỗ trợ khách hàng</h2>
            <div className="hero-actions" style={{ marginTop: 0 }}>
              <select value={supportFilter.assigned} onChange={(event) => setSupportFilter((prev) => ({ ...prev, assigned: event.target.value }))}>
                <option value="mine">Yêu cầu của tôi</option>
                <option value="false">Chưa được nhận</option>
                <option value="true">Đã được nhận</option>
              </select>
              <select value={supportFilter.status} onChange={(event) => setSupportFilter((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="">Tất cả trạng thái</option>
                <option value="open">Mới mở</option>
                <option value="pending">Đang xử lý</option>
                <option value="resolved">Đã xử lý</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
          </div>

          <div className="admin-access-grid support-chat-layout">
            <div className="orders-list support-conversation-list">
              {supportConversationsQuery.isLoading ? (
                <DataStatePanel type="loading" title="Đang tải hàng chờ" message="Hệ thống đang lấy danh sách yêu cầu hỗ trợ." />
              ) : null}
              {!supportConversationsQuery.isLoading && supportConversationsResult && !supportConversationsResult.ok ? (
                <DataStatePanel
                  type="error"
                  title="Không tải được hàng chờ hỗ trợ"
                  message={supportConversationsResult.message}
                  onRetry={() => supportConversationsQuery.refetch()}
                />
              ) : null}
              {!supportConversationsQuery.isLoading && supportConversationsResult?.ok && supportConversations.length === 0 ? (
                <DataStatePanel
                  type="empty"
                  title="Không có yêu cầu phù hợp"
                  message="Thử đổi bộ lọc trạng thái hoặc phạm vi phụ trách để tìm yêu cầu khác."
                  onRetry={() => supportConversationsQuery.refetch()}
                />
              ) : null}
              {supportConversations.map((conversation) => {
                const conversationId = conversation._id || conversation.id;
                const isSelected = activeSupportConversationId === conversationId;
                const customerName = conversation?.customerId?.fullName || conversation?.customerId?.username || 'Khách hàng';

                return (
                  <button
                    key={conversationId}
                    type="button"
                    className={`support-conversation-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedSupportConversationId(conversationId)}
                  >
                    <strong>{conversation.subject}</strong>
                    <span>{customerName} · {getSupportStatusLabel(conversation.status)} · {getPriorityLabel(conversation.priority)}</span>
                    <strong className="support-conversation-title">{conversation.subject}</strong>
                    <span>{customerName} · {conversation.status} · {conversation.priority}</span>
                    <small>{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString('vi-VN') : '-'}</small>
                    {conversation.unreadCountForAdmin ? <em className="support-unread-badge">{conversation.unreadCountForAdmin} tin chưa đọc</em> : null}
                  </button>
                );
              })}
            </div>

            <div className="paper-block stack-gap support-chat-panel" style={{ marginBottom: 0 }}>
              <div className="support-chat-header">
                <h3>Xử lý hội thoại</h3>
                {selectedConversation ? (
                  <div className="support-chat-meta-row">
                    <span className="status-badge status-pending">{selectedConversation.status}</span>
                    <span className="status-badge status-success">{selectedConversation.priority}</span>
                  </div>
                ) : null}
              </div>
              {!activeSupportConversationId ? <p>Hãy chọn một hội thoại để xử lý.</p> : null}
              {activeSupportConversationId ? (
                <>
                  <div className="hero-actions" style={{ marginTop: 0 }}>
                    <button className="btn secondary" type="button" onClick={() => assignSupportMutation.mutate(activeSupportConversationId)}>Nhận yêu cầu</button>
                    <button className="btn secondary" type="button" onClick={() => markSupportReadMutation.mutate(activeSupportConversationId)}>Đánh dấu đã đọc</button>
                    <select value={supportStatus} onChange={(event) => setSupportStatus(event.target.value)}>
                      <option value="pending">Đang xử lý</option>
                      <option value="resolved">Đã xử lý</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => updateSupportStatusMutation.mutate({ id: activeSupportConversationId, payload: { status: supportStatus } })}
                    >
                      Cập nhật trạng thái
                    </button>
                  </div>
                  <div className={`support-assignee-hint ${isAssignedToOther ? 'warn' : 'ok'}`}>
                    {isUnassignedConversation ? 'Ticket này chưa có người nhận xử lý.' : null}
                    {isAssignedToMe ? 'Ticket đang do bạn phụ trách xử lý.' : null}
                    {isAssignedToOther ? `Ticket đang do admin khác xử lý${assignedAdminName ? ` (${assignedAdminName})` : ''}.` : null}
                  </div>

                  <div className="support-action-grid">
                    <article className="support-action-card">
                      <p className="support-action-title">Nhận ticket</p>
                      <small className="muted-text">Dùng khi ticket chưa có người phụ trách.</small>
                      <button
                        className="btn secondary"
                        type="button"
                        disabled={assignSupportMutation.isPending || isAssignedToOther}
                        onClick={() => assignSupportMutation.mutate(activeSupportConversationId)}
                      >
                        {isAssignedToMe ? 'Bạn đã nhận ticket' : isAssignedToOther ? 'Đã có admin nhận' : 'Nhận ticket này'}
                      </button>
                    </article>

                    <article className="support-action-card">
                      <p className="support-action-title">Đánh dấu đã đọc</p>
                      <small className="muted-text">Xóa badge chưa đọc sau khi đã xem nội dung hội thoại.</small>
                      <button className="btn secondary" type="button" onClick={() => markSupportReadMutation.mutate(activeSupportConversationId)}>
                        Đánh dấu đã đọc
                      </button>
                    </article>

                    <article className="support-action-card">
                      <p className="support-action-title">Cập nhật trạng thái</p>
                      <small className="muted-text">Chuyển ticket sang pending, resolved hoặc closed.</small>
                      <div className="support-action-inline">
                        <select value={supportStatus} onChange={(event) => setSupportStatus(event.target.value)}>
                          <option value="pending">pending</option>
                          <option value="resolved">resolved</option>
                          <option value="closed">closed</option>
                        </select>
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => updateSupportStatusMutation.mutate({ id: activeSupportConversationId, payload: { status: supportStatus } })}
                        >
                          Lưu trạng thái
                        </button>
                      </div>
                    </article>
                  </div>

                  <div className="support-message-list">
                    {supportMessagesQuery.isLoading ? (
                      <DataStatePanel type="loading" title="Đang tải tin nhắn" message="Lịch sử trao đổi đang được đồng bộ." />
                    ) : null}
                    {!supportMessagesQuery.isLoading && supportMessagesResult && !supportMessagesResult.ok ? (
                      <DataStatePanel
                        type="error"
                        title="Không tải được tin nhắn"
                        message={supportMessagesResult.message}
                        onRetry={() => supportMessagesQuery.refetch()}
                      />
                    ) : null}
                    {!supportMessagesQuery.isLoading && supportMessagesResult?.ok && supportMessages.length === 0 ? (
                      <DataStatePanel
                        type="empty"
                        title="Chưa có tin nhắn"
                        message="Hội thoại này chưa có nội dung trao đổi."
                        onRetry={() => supportMessagesQuery.refetch()}
                      />
                    ) : null}
                    {sortedSupportMessages.map((message) => {
                      const messageId = message._id || message.id;
                      const isAdminSender = message.senderRole === 'admin';
                      const shouldCollapse = isLongSupportMessage(message.content);
                      const isExpanded = Boolean(expandedSupportMessages[messageId]);
                      return (
                        <article key={messageId} className={`support-message-item ${isAdminSender ? 'mine' : 'admin'}`}>
                          <span className="support-message-role">{isAdminSender ? 'Bạn' : 'Khách hàng'}</span>
                          <p className={shouldCollapse && !isExpanded ? 'support-message-clamped' : ''}>{message.content}</p>
                          {shouldCollapse ? (
                            <button
                              type="button"
                              className="support-toggle-btn"
                              onClick={() => toggleExpandedSupportMessage(messageId)}
                            >
                              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                            </button>
                          ) : null}
                          <small>{message.createdAt ? new Date(message.createdAt).toLocaleString('vi-VN') : '-'}</small>
                        </article>
                      );
                    })}
                  </div>

                  <form
                    className="stack-gap"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!supportReplyContent.trim()) {
                        toast.error('Nội dung phản hồi không được bỏ trống');
                        return;
                      }

                      sendSupportReplyMutation.mutate({
                        id: activeSupportConversationId,
                        payload: { content: supportReplyContent.trim() }
                      });
                    }}
                  >
                    <textarea
                      rows={3}
                      placeholder="Nhập phản hồi cho khách hàng"
                      value={supportReplyContent}
                      onChange={(event) => setSupportReplyContent(event.target.value)}
                      disabled={isSelectedConversationClosed}
                    />
                    <div className="hero-actions" style={{ marginTop: 0 }}>
                      <button className="btn primary" type="submit" disabled={isSelectedConversationClosed}>Gửi phản hồi</button>
                    </div>
                    {isSelectedConversationClosed ? <small className="muted-text">Ticket đã đóng, cần đổi trạng thái trước khi phản hồi.</small> : null}
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    );
  }

  function renderReviewsModerationContent() {
    return (
      <section className="paper-block stack-gap">
        <div className="section-head-row">
          <h2>Kiểm duyệt đánh giá</h2>
          <span className="muted-text">Xem và xóa các đánh giá không phù hợp</span>
        </div>

        {adminReviewsQuery.isLoading ? (
          <DataStatePanel type="loading" title="Đang tải đánh giá" message="Danh sách đánh giá đang được cập nhật." />
        ) : null}
        {!adminReviewsQuery.isLoading && adminReviewsResult && !adminReviewsResult.ok ? (
          <DataStatePanel
            type="error"
            title="Không tải được đánh giá"
            message={adminReviewsResult.message}
            onRetry={() => adminReviewsQuery.refetch()}
          />
        ) : null}
        {!adminReviewsQuery.isLoading && adminReviewsResult?.ok && adminReviews.length === 0 ? (
          <DataStatePanel
            type="empty"
            title="Chưa có đánh giá nào"
            message="Hiện chưa có đánh giá cần kiểm duyệt."
            onRetry={() => adminReviewsQuery.refetch()}
          />
        ) : null}

        <div className="orders-list">
          {adminReviews.map((review) => {
            const reviewId = review._id || review.id;
            const productName = review?.product?.name || 'Sản phẩm';
            const reviewer = review?.user?.username || review?.user?.email || 'Khách hàng';
            return (
              <article className="order-card" key={reviewId}>
                <div>
                  <h3>{productName}</h3>
                  <p><strong>{reviewer}</strong> · {review.rating}/5</p>
                  <p>{review.comment || 'Không có nội dung'}</p>
                </div>
                <div className="hero-actions">
                  <button className="btn secondary" type="button" onClick={() => deleteReviewModerationMutation.mutate(reviewId)}>Xóa đánh giá</button>
                </div>
              </article>
            );
          })}
        </div>
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
    if (activeTab === 'support') return renderSupportContent();
    if (activeTab === 'reviews') return renderReviewsModerationContent();
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
