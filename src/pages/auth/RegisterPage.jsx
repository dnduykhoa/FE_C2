import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { registerApi } from '../../services/auth.api';

const schema = z.object({
  username: z.string().min(3, 'Ten dang nhap toi thieu 3 ky tu'),
  email: z.string().email('Email khong hop le'),
  password: z
    .string()
    .min(8, 'Mat khau toi thieu 8 ky tu')
    .regex(/[A-Z]/, 'Can it nhat 1 chu in hoa')
    .regex(/[a-z]/, 'Can it nhat 1 chu thuong')
    .regex(/[0-9]/, 'Can it nhat 1 so')
    .regex(/[^A-Za-z0-9]/, 'Can it nhat 1 ky tu dac biet'),
  fullName: z.string().optional(),
  birthday: z.string().optional()
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', fullName: '', birthday: '' }
  });

  async function onSubmit(values) {
    const result = await registerApi(values);
    if (!result.ok) {
      toast.error(result.message || 'Dang ky that bai');
      return;
    }

    toast.success('Dang ky thanh cong, vui long dang nhap');
    navigate('/auth/login');
  }

  return (
    <section className="paper-block auth-block">
      <h1>Dang ky tai khoan</h1>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">Ten dang nhap</label>
        <input id="username" type="text" {...register('username')} />
        {errors.username ? <small className="error-text">{errors.username.message}</small> : null}

        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email ? <small className="error-text">{errors.email.message}</small> : null}

        <label htmlFor="password">Mat khau</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password ? <small className="error-text">{errors.password.message}</small> : null}

        <label htmlFor="fullName">Ho ten</label>
        <input id="fullName" type="text" {...register('fullName')} />

        <label htmlFor="birthday">Ngay sinh</label>
        <input id="birthday" type="date" {...register('birthday')} />

        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Dang xu ly...' : 'Tao tai khoan'}
        </button>
      </form>
    </section>
  );
}
