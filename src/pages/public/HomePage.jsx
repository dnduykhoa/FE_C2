import { Link } from 'react-router-dom';

const featuredProducts = [
  {
    id: 1,
    name: 'Bình Hoa Đất Nung Trơn',
    price: '450.000 ₫',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
    tag: 'Bán chạy'
  },
  {
    id: 2,
    name: 'Bộ Ấm Trà Men Rạn Cổ',
    price: '1.250.000 ₫',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850d0fa?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    name: 'Đĩa Họa Tiết Đồng Miên',
    price: '850.000 ₫',
    image: 'https://images.unsplash.com/photo-1603503374820-2d8815144b2a?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    name: 'Lọ Hoa Men Lam Vuốt Tay',
    price: '620.000 ₫',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'
  }
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero paper-block">
        <div className="home-hero-copy">
          <p className="hero-kicker">Nghệ thuật thủ công</p>
          <h1>Lưu giữ nét mộc mạc qua từng thớ đất.</h1>
          <p className="hero-lead">
            Những món đồ gốm mang đậm dấu ấn thời gian, được vuốt tay tỉ mỉ từ các nghệ nhân làng nghề truyền thống.
            Vẻ đẹp không hoàn hảo tạo nên sự độc bản.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/products">Khám phá ngay</Link>
            <Link className="btn secondary" to="/auth/register">Tạo tài khoản</Link>
          </div>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="hero-image-frame">
            <img
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=900"
              alt="Gốm thủ công"
              className="hero-image"
            />
          </div>
          <div className="hero-ornament" />
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <h2>Tác phẩm mới</h2>
            <p>Những món đồ vừa ra lò mang trọn hơi ấm của lửa.</p>
          </div>
          <Link className="section-link" to="/products">Xem tất cả</Link>
        </div>

        <div className="product-grid home-product-grid">
          {featuredProducts.map((product) => (
            <article key={product.id} className="product-card home-product-card">
              <div className="product-image-wrap">
                {product.tag ? <span className="product-tag">{product.tag}</span> : null}
                <img src={product.image} alt={product.name} className="product-image antique-filter" />
              </div>

              <div className="product-card-body">
                <div>
                  <h3>{product.name}</h3>
                  <p className="muted-text">Gốm vuốt tay</p>
                </div>
                <div className="product-card-footer">
                  <span className="price-text">{product.price}</span>
                  <Link className="product-action" to={`/products/${product.id}`}>Chi tiết</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-story paper-block">
        <div className="story-icon" aria-hidden="true">✦</div>
        <h2>Mỗi sản phẩm là một câu chuyện</h2>
        <p>
          Chúng tôi không bán sự hoàn hảo công nghiệp. Chúng tôi trân trọng những vết rạn nhỏ,
          màu men loang tự nhiên và dấu tay người thợ trên từng chiếc bình, chiếc bát.
        </p>
        <Link className="btn secondary" to="/products">Tìm hiểu quy trình chế tác</Link>
      </section>
    </div>
  );
}
