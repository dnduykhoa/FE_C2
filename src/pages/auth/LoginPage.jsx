import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { loginApi } from '../../services/auth.api';
import { getRoleName, useAuthStore } from '../../store/authStore';
import '../../styles/AuthPage.css';

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
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

    const roleName = getRoleName(data.user);
    if (roleName === 'ADMIN' || roleName === 'MODERATOR') {
      navigate('/admin');
      return;
    }

    navigate(location.state?.from || '/');
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-header-icon">
              <Lock size={32} />
            </div>
            <h1>Đăng Nhập</h1>
            <p className="login-subtitle">Chào mừng bạn quay lại!</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <div className="login-form-group">
              <label htmlFor="username" className="login-label required">
                Tên đăng nhập
              </label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập của bạn"
                  className={`login-input ${errors.username ? 'login-input-error' : ''}`}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <div className="login-error">
                  <AlertCircle size={14} />
                  <span>{errors.username.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <label htmlFor="password" className="login-label required">
                Mật khẩu
              </label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu của bạn"
                  className={`login-input ${errors.password ? 'login-input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="login-error">
                  <AlertCircle size={14} />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              className="btn primary login-submit-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="login-loader" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="login-links">
            <Link to="/auth/forgot-password" className="login-link login-link-primary">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span>Hoặc</span>
          </div>

          {/* Register Link */}
          <div className="login-register-section">
            <p className="login-register-text">
              Bạn chưa có tài khoản?{' '}
              <Link to="/auth/register" className="login-link-register">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
