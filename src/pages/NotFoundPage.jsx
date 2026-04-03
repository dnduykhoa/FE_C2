import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="paper-block">
      <h1>Khong tim thay trang</h1>
      <p>Duong dan ban truy cap khong ton tai.</p>
      <Link className="btn primary" to="/">Quay ve trang chu</Link>
    </section>
  );
}
