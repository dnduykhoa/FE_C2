import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { resetPasswordApi } from '../../services/auth.api';

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
    <section className="paper-block auth-block">
      <h1>Đặt lại mật khẩu</h1>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="token">Token</label>
        <input id="token" type="text" {...register('token')} />
        {errors.token ? <small className="error-text">{errors.token.message}</small> : null}

        <label htmlFor="newPassword">Mật khẩu mới</label>
        <input id="newPassword" type="password" {...register('newPassword')} />
        {errors.newPassword ? <small className="error-text">{errors.newPassword.message}</small> : null}

        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </section>
  );
}
