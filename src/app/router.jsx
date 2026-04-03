import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from '../components/common/RequireAuth';
import RequireRole from '../components/common/RequireRole';
import MainLayout from '../components/layout/MainLayout';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/admin/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/public/HomePage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import ProductsPage from '../pages/public/ProductsPage';
import CartPage from '../pages/user/CartPage';
import CheckoutPage from '../pages/user/CheckoutPage';
import OrderDetailPage from '../pages/user/OrderDetailPage';
import OrdersPage from '../pages/user/OrdersPage';
import ProfilePage from '../pages/user/ProfilePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      { path: 'auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: 'auth/reset-password', element: <ResetPasswordPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'user/profile', element: <ProfilePage /> },
          { path: 'user/cart', element: <CartPage /> },
          { path: 'user/checkout', element: <CheckoutPage /> },
          { path: 'user/orders', element: <OrdersPage /> },
          { path: 'user/orders/:id', element: <OrderDetailPage /> },
          {
            element: <RequireRole roles={['ADMIN', 'MODERATOR']} />,
            children: [{ path: 'admin', element: <DashboardPage /> }]
          }
        ]
      },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);

export default router;
