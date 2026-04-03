import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="paper-block">
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
      <Link className="btn primary" to="/">Quay về trang chủ</Link>
    </section>
  );
}
