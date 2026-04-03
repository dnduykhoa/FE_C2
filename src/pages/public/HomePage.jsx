import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      <section className="hero paper-block">
        <div>
          <p className="hero-kicker">Di san lang nghe</p>
          <h1>Gom co xu Viet, giu tron hon xua</h1>
          <p>
            Bo suu tap gom co lay cam hung tu lang nghe truyen thong,
            phoi chat lieu moc mac va tinh than toi gian hien dai.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/products">Kham pha san pham</Link>
            <Link className="btn secondary" to="/auth/register">Tao tai khoan</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="pot-shape" />
        </div>
      </section>

      <section className="paper-block">
        <h2>Cam hung xua cu</h2>
        <p>
          Tong mau dat nung, giay cu va reu kho duoc ap dung xuyen suot de tao trai nghiem manh nhung diu.
        </p>
      </section>
    </>
  );
}
