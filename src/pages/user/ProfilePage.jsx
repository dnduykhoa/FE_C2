import { useAuthStore } from '../../store/authStore';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="paper-block">
      <h1>Ho so tai khoan</h1>
      <div className="profile-grid">
        <div>
          <label>Ten dang nhap</label>
          <p>{user?.username || '-'}</p>
        </div>
        <div>
          <label>Email</label>
          <p>{user?.email || '-'}</p>
        </div>
        <div>
          <label>Ho ten</label>
          <p>{user?.fullName || '-'}</p>
        </div>
      </div>
    </section>
  );
}
