import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { forgotPasswordApi } from '../../services/auth.api';

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
    <section className="paper-block auth-block">
      <h1>Quên mật khẩu</h1>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email ? <small className="error-text">{errors.email.message}</small> : null}

        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
        </button>
      </form>
    </section>
  );
}
