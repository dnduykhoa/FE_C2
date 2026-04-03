import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { registerApi } from '../../services/auth.api';

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
      toast.error(result.message || 'Đăng ký thất bại');
      return;
    }

    toast.success('Đăng ký thành công, vui lòng đăng nhập');
    navigate('/auth/login');
  }

  return (
    <section className="paper-block auth-block">
      <h1>Đăng ký tài khoản</h1>
      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">Tên đăng nhập</label>
        <input id="username" type="text" {...register('username')} />
        {errors.username ? <small className="error-text">{errors.username.message}</small> : null}

        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email ? <small className="error-text">{errors.email.message}</small> : null}

        <label htmlFor="password">Mật khẩu</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password ? <small className="error-text">{errors.password.message}</small> : null}

        <label htmlFor="fullName">Họ tên</label>
        <input id="fullName" type="text" {...register('fullName')} />

        <label htmlFor="birthday">Ngày sinh</label>
        <input id="birthday" type="date" {...register('birthday')} />

        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>
      </form>
    </section>
  );
}
