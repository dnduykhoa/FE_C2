import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Mail, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { forgotPasswordApi } from '../../services/auth.api';
import '../../styles/AuthPage.css';

const schema = z.object({
  email: z.string().email('Email không hợp lệ')
});

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
  });

  async function onSubmit(values) {
    const result = await forgotPasswordApi(values);
    if (!result.ok) {
      toast.error(result.message || 'Không thể gửi yêu cầu');
      return;
    }

    toast.success(result.message || 'Đã gửi hướng dẫn đặt lại mật khẩu');
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-header-icon" style={{background: 'linear-gradient(135deg, var(--warning) 0%, #cfb656 100%)'}}>
              <KeyRound size={32} />
            </div>
            <h1>Quên Mật Khẩu</h1>
            <p className="login-subtitle">Chúng tôi sẽ giúp bạn lấy lại mật khẩu</p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
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
              <p className="auth-hint">Chúng tôi sẽ gửi một email với hướng dẫn để đặt lại mật khẩu của bạn.</p>
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
                'Gửi Yêu Cầu'
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
