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
    toast.success('Da dang xuat');
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-row">
          <Link className="brand" to="/">Gom Co</Link>
          <nav className="main-nav">
            <NavLink to="/">Trang chu</NavLink>
            <NavLink to="/products">San pham</NavLink>
            <NavLink to="/auth/login">Dang nhap</NavLink>
            <NavLink to="/auth/register">Dang ky</NavLink>
            <NavLink to="/user/profile">Tai khoan</NavLink>
            <NavLink to="/admin">Quan tri</NavLink>
          </nav>
          {user ? (
            <button className="btn secondary" type="button" onClick={handleLogout}>Dang xuat</button>
          ) : null}
        </div>
      </header>

      <main className="container page-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h4>Gom Co Truyen</h4>
            <p>Cham chut huong xua trong moi san pham gom.</p>
          </div>
          <div>
            <h4>Lien he</h4>
            <p>Email: hello@gomco.vn</p>
            <p>Hotline: 0900 000 000</p>
          </div>
          <div>
            <h4>Chinh sach</h4>
            <p>Van chuyen</p>
            <p>Doi tra</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
