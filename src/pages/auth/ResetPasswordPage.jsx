import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { resetPasswordApi } from '../../services/auth.api';

const schema = z.object({
  token: z.string().min(1, 'Token khong duoc de trong'),
  newPassword: z
    .string()
    .min(8, 'Mat khau moi toi thieu 8 ky tu')
    .regex(/[A-Z]/, 'Can it nhat 1 chu in hoa')
    .regex(/[a-z]/, 'Can it nhat 1 chu thuong')
    .regex(/[0-9]/, 'Can it nhat 1 so')
    .regex(/[^A-Za-z0-9]/, 'Can it nhat 1 ky tu dac biet')
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
      toast.error(result.message || 'Dat lai mat khau that bai');
      return;
    }

    toast.success(result.message || 'Dat lai mat khau thanh cong');
  }

  return (
    <section className="paper-block auth-block">
      <h1>Dat lai mat khau</h1>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="token">Token</label>
        <input id="token" type="text" {...register('token')} />
        {errors.token ? <small className="error-text">{errors.token.message}</small> : null}

        <label htmlFor="newPassword">Mat khau moi</label>
        <input id="newPassword" type="password" {...register('newPassword')} />
        {errors.newPassword ? <small className="error-text">{errors.newPassword.message}</small> : null}

        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Dang xu ly...' : 'Cap nhat mat khau'}
        </button>
      </form>
    </section>
  );
}
