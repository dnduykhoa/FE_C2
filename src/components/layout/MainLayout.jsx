import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logoutApi } from '../../services/auth.api';
import { useAuthStore } from '../../store/authStore';

export default function MainLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  async function handleLogout() {
    await logoutApi();
    clearAuth();
    toast.success('Đã đăng xuất');
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-row">
          <Link className="brand" to="/">Gốm Xưa.</Link>
          <nav className="main-nav">
            <NavLink to="/">Trang chủ</NavLink>
            {/* <NavLink to="/products">Bộ sưu tập</NavLink> */}
            <NavLink to="/products">Sản phẩm</NavLink>
            {/* <NavLink to="/products">Sản phẩm</NavLink> */}
            <NavLink to="/auth/login">Đăng nhập</NavLink>
            <NavLink to="/auth/register">Đăng ký</NavLink>
            <NavLink to="/user/profile">Tài khoản</NavLink>
            <NavLink to="/admin">Quản trị</NavLink>
          </nav>
          {user ? (
            <button className="btn secondary" type="button" onClick={handleLogout}>Đăng xuất</button>
          ) : null}
        </div>
      </header>

      <main className="container page-content">
        <Outlet />
      </main>

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
    </div>
  );
}
