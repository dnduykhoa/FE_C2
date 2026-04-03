import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { resetPasswordApi } from '../../services/auth.api';
import '../../styles/AuthPage.css';

const schema = z.object({
  token: z.string().min(1, 'Token không được để trống'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ in hoa')
    .regex(/[a-z]/, 'Cần ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Cần ít nhất 1 số')
    .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt')
});

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const tokenFromQuery = params.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { token: tokenFromQuery, newPassword: '' }
  });

  async function onSubmit(values) {
    const result = await resetPasswordApi(values);
    if (!result.ok) {
      toast.error(result.message || 'Đặt lại mật khẩu thất bại');
      return;
    }

    toast.success(result.message || 'Đặt lại mật khẩu thành công');
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-header-icon" style={{background: 'linear-gradient(135deg, var(--success) 0%, #7a9d5d 100%)'}}>
              <CheckCircle2 size={32} />
            </div>
            <h1>Đặt Lại Mật Khẩu</h1>
            <p className="login-subtitle">Nhập mật khẩu mới của bạn</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Token Field - Hidden */}
            <input
              id="token"
              type="hidden"
              {...register('token')}
            />

            {/* Password Field */}
            <div className="login-form-group">
              <label htmlFor="newPassword" className="login-label required">Mật khẩu mới</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  className={`login-input ${errors.newPassword ? 'login-input-error' : ''}`}
                  {...register('newPassword')}
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
              {errors.newPassword && (
                <div className="login-error">
                  <AlertCircle size={14} />
                  <span>{errors.newPassword.message}</span>
                </div>
              )}
              <p className="auth-hint">Mật khẩu phải chứa: chữ hoa, chữ thường, số, ký tự đặc biệt.</p>
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
                'Cập Nhật Mật Khẩu'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="auth-bottom-links">
            <Link to="/auth/login" className="login-link">
              ← Quay lại Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
