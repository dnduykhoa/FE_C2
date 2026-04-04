import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMeApi, logoutApi } from '../../services/auth.api';
import { getRoleName, useAuthStore } from '../../store/authStore';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const roleName = getRoleName(user);
  const canAccessAdmin = ['ADMIN', 'MODERATOR'].includes(roleName);
  const isEndUser = roleName === 'USER';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const displayName = user?.fullName || user?.username || 'Tài khoản';

  useEffect(() => {
    const roleFromStore = getRoleName(user);
    const hasKnownRole = ['ADMIN', 'MODERATOR', 'USER'].includes(roleFromStore);
    if (!token || hasKnownRole) {
      return;
    }

    let isMounted = true;
    (async function syncProfile() {
      const result = await getMeApi();
      if (!isMounted || !result.ok || !result.data) {
        return;
      }

      setAuth({ token, user: result.data });
    })();

    return () => {
      isMounted = false;
    };
  }, [token, user, setAuth]);

  async function handleLogout() {
    await logoutApi();
    clearAuth();
    toast.success('Đã đăng xuất');
    setIsProfileMenuOpen(false);
    navigate('/');
  }

  return (
    <div className="app-shell">
      {isAdminRoute ? null : (
        <header className="site-header">
          <div className="container nav-row">
            <Link className="brand" to="/">Gốm Xưa.</Link>
            <nav className="main-nav" aria-label="Điều hướng chính">
              <ul className="nav-list">
                <li><NavLink to="/">Trang chủ</NavLink></li>
                <li><NavLink to="/products">Sản phẩm</NavLink></li>
                {token && isEndUser ? (
                  <li>
                    <NavLink to="/user/cart" className="cart-icon-link" aria-label="Giỏ hàng">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="9" cy="20" r="1.4" />
                        <circle cx="18" cy="20" r="1.4" />
                        <path d="M3 4h2l2.3 10h10.8l1.8-7H7" />
                      </svg>
                    </NavLink>
                  </li>
                ) : null}
              </ul>
            </nav>
            <div className="header-actions">
              {!token ? (
                <NavLink to="/auth/login" className="login-inline-btn">
                  Đăng nhập
                </NavLink>
              ) : (
                <div className="profile-menu">
                  <span className="header-username">{displayName}</span>
                  <button
                    type="button"
                    className="profile-trigger"
                    aria-label="Mở menu tài khoản"
                    aria-expanded={isProfileMenuOpen}
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="8" r="4" />
                    </svg>
                  </button>

                  {isProfileMenuOpen ? (
                    <div className="profile-dropdown">
                      {canAccessAdmin ? <NavLink to="/admin" onClick={() => setIsProfileMenuOpen(false)}>Bảng quản trị</NavLink> : null}
                      {isEndUser ? <NavLink to="/user/orders" onClick={() => setIsProfileMenuOpen(false)}>Đơn hàng</NavLink> : null}
                      {isEndUser ? <NavLink to="/user/payments" onClick={() => setIsProfileMenuOpen(false)}>Thanh toán</NavLink> : null}
                      {isEndUser ? <NavLink to="/user/reservations" onClick={() => setIsProfileMenuOpen(false)}>Giữ chỗ</NavLink> : null}
                      {isEndUser ? <NavLink to="/user/support" onClick={() => setIsProfileMenuOpen(false)}>Hỗ trợ</NavLink> : null}
                      {isEndUser ? <NavLink to="/user/reviews" onClick={() => setIsProfileMenuOpen(false)}>Đánh giá của tôi</NavLink> : null}
                      <NavLink to="/user/profile" onClick={() => setIsProfileMenuOpen(false)}>Tài khoản</NavLink>
                      <button className="dropdown-logout" type="button" onClick={handleLogout}>Đăng xuất</button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={isAdminRoute ? 'admin-page-content' : 'container page-content'}>
        <Outlet />
      </main>

      {isAdminRoute ? null : (
        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <h4>Gốm Xưa.</h4>
              <p>Lưu giữ nét đẹp mộc mạc của gốm Việt thủ công.</p>
            </div>
            <div>
              <h4>Danh mục</h4>
              <p>Bình hoa đất nung</p>
              <p>Bộ ấm trà đạo</p>
            </div>
            <div>
              <h4>Hỗ trợ</h4>
              <p>Vận chuyển</p>
              <p>Đổi trả & bảo hành</p>
            </div>
            <div>
              <h4>Nhận tin mới</h4>
              <p>Đăng ký để nhận thông tin về các mẻ gốm mới ra lò.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
