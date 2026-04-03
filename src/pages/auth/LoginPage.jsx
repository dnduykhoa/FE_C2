import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { loginApi } from '../../services/auth.api';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  username: z.string().min(1, 'Vui long nhap ten dang nhap'),
  password: z.string().min(1, 'Vui long nhap mat khau')
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' }
  });

  async function onSubmit(values) {
    const result = await loginApi(values);
    if (!result.ok) {
      toast.error(result.message || 'Dang nhap that bai');
      return;
    }

    const data = result.data || {};
    setAuth({ token: data.token, user: data.user });
    toast.success('Dang nhap thanh cong');
    navigate(location.state?.from || '/');
  }

  return (
    <section className="paper-block auth-block">
      <h1>Dang nhap</h1>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">Ten dang nhap</label>
        <input id="username" type="text" {...register('username')} />
        {errors.username ? <small className="error-text">{errors.username.message}</small> : null}

        <label htmlFor="password">Mat khau</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password ? <small className="error-text">{errors.password.message}</small> : null}

        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Dang xu ly...' : 'Dang nhap'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/auth/forgot-password">Quen mat khau?</Link>
        <Link to="/auth/register">Chua co tai khoan?</Link>
      </div>
    </section>
  );
}
