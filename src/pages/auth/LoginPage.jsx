import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { loginApi } from '../../services/auth.api';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
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
      toast.error(result.message || 'Đăng nhập thất bại');
      return;
    }

    const data = result.data || {};
    setAuth({ token: data.token, user: data.user });
    toast.success('Đăng nhập thành công');
    navigate(location.state?.from || '/');
  }

  return (
    <section className="paper-block auth-block">
      <h1>Đăng nhập</h1>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">Tên đăng nhập</label>
        <input id="username" type="text" {...register('username')} />
        {errors.username ? <small className="error-text">{errors.username.message}</small> : null}

        <label htmlFor="password">Mật khẩu</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password ? <small className="error-text">{errors.password.message}</small> : null}

        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/auth/forgot-password">Quên mật khẩu?</Link>
        <Link to="/auth/register">Chưa có tài khoản?</Link>
      </div>
    </section>
  );
}
