import { useAuthStore } from '../../store/authStore';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="paper-block">
      <h1>Hồ sơ tài khoản</h1>
      <div className="profile-grid">
        <div>
          <label>Tên đăng nhập</label>
          <p>{user?.username || '-'}</p>
        </div>
        <div>
          <label>Email</label>
          <p>{user?.email || '-'}</p>
        </div>
        <div>
          <label>Họ tên</label>
          <p>{user?.fullName || '-'}</p>
        </div>
      </div>
    </section>
  );
}
