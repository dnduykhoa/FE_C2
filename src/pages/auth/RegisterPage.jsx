import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Cake, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { registerApi } from '../../services/auth.api';
import '../../styles/AuthPage.css';

const schema = z.object({
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ in hoa')
    .regex(/[a-z]/, 'Cần ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Cần ít nhất 1 số')
    .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string(),
  fullName: z.string().optional(),
  birthday: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '', fullName: '', birthday: '' }
  });

  async function onSubmit(values) {
    const result = await registerApi(values);
    if (!result.ok) {
      toast.error(result.message || 'Đăng ký thất bại');
      return;
    }

    toast.success('Đăng ký thành công, vui lòng đăng nhập');
    navigate('/auth/login');
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-header-icon" style={{background: 'linear-gradient(135deg, var(--brand-secondary) 0%, #8a9d73 100%)'}}>
              <UserPlus size={32} />
            </div>
            <h1>Đăng Ký</h1>
            <p className="login-subtitle">Tạo tài khoản mới để bắt đầu</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <div className="login-form-group">
              <label htmlFor="username" className="login-label required">Tên đăng nhập</label>
              <div className="login-input-wrapper">
                <User size={18} className="login-input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Chọn tên đăng nhập"
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

            {/* Email Field */}
            <div className="login-form-group">
              <label htmlFor="email" className="login-label required">Email</label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className={`login-input ${errors.email ? 'login-input-error' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <div className="login-error">
                  <AlertCircle size={14} />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <label htmlFor="password" className="login-label required">Mật khẩu</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
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

            {/* Confirm Password Field */}
            <div className="login-form-group">
              <label htmlFor="confirmPassword" className="login-label required">Nhập lại mật khẩu</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  className={`login-input ${errors.confirmPassword ? 'login-input-error' : ''}`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="login-error">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}
            </div>

            {/* Full Name Field */}
            <div className="login-form-group">
              <label htmlFor="fullName" className="login-label">Họ tên (tùy chọn)</label>
              <div className="login-input-wrapper">
                <User size={18} className="login-input-icon" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ tên"
                  className="login-input"
                  {...register('fullName')}
                />
              </div>
            </div>

            {/* Birthday Field */}
            <div className="login-form-group">
              <label htmlFor="birthday" className="login-label">Ngày sinh (tùy chọn)</label>
              <div className="login-input-wrapper">
                <Cake size={18} className="login-input-icon" />
                <input
                  id="birthday"
                  type="date"
                  className="login-input"
                  {...register('birthday')}
                />
              </div>
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
                'Tạo Tài Khoản'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>Hoặc</span>
          </div>

          {/* Login Link */}
          <div className="login-register-section">
            <p className="login-register-text">
              Đã có tài khoản?{' '}
              <Link to="/auth/login" className="login-link-register">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
