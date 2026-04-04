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
import MyReviewsPage from '../pages/user/MyReviewsPage';
import OrderDetailPage from '../pages/user/OrderDetailPage';
import OrdersPage from '../pages/user/OrdersPage';
import PaymentDetailPage from '../pages/user/PaymentDetailPage';
import PaymentsPage from '../pages/user/PaymentsPage';
import ProfilePage from '../pages/user/ProfilePage';
import ReservationsPage from '../pages/user/ReservationsPage';
import SupportChatPage from '../pages/user/SupportChatPage';

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
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'auth/reset-password', element: <ResetPasswordPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'user/profile', element: <ProfilePage /> },
          {
            element: <RequireRole roles={['USER']} />,
            children: [
              { path: 'user/cart', element: <CartPage /> },
              { path: 'user/checkout', element: <CheckoutPage /> },
              { path: 'user/orders', element: <OrdersPage /> },
              { path: 'user/orders/:id', element: <OrderDetailPage /> },
              { path: 'user/payments', element: <PaymentsPage /> },
              { path: 'user/payments/:id', element: <PaymentDetailPage /> },
              { path: 'user/reservations', element: <ReservationsPage /> },
              { path: 'user/reviews', element: <MyReviewsPage /> },
              { path: 'user/support', element: <SupportChatPage /> }
            ]
          },
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
