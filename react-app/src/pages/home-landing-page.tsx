import { MaterialButton } from '../components/ui';

export default function HomePage() {
  return (
    <div className="home-landing-page">
      <header className="landing-header">
        <div className="logo-section">
          <img src="/logo-landing.png" alt="Cơm Ánh Dương" className="logo" />
          <h1>Cơm Ánh Dương</h1>
          <p>Hương Vị Quê Nhà</p>
        </div>
      </header>

      <main className="landing-content">
        <section className="hero-section">
          <h2>Nhà Hàng Cơm Gia Đình Tại Sa Đéc</h2>
          <p>Món ăn ngon, không gian thoáng mát, phục vụ tận tâm</p>
          <div className="cta-buttons">
            <MaterialButton
              onClick={() => window.location.href = '/customer'}
              variant="filled"
            >
              🍜 Đặt món ngay
            </MaterialButton>
          </div>
        </section>

        <section className="features-section">
          <div className="feature">
            <h3>📱 Đặt món online</h3>
            <p>Giao hàng tận nơi, nhanh chóng</p>
          </div>
          <div className="feature">
            <h3>🍚 Thực đơn đa dạng</h3>
            <p>Hơn 50 món ăn mỗi ngày</p>
          </div>
          <div className="feature">
            <h3>⭐ Chất lượng đảm bảo</h3>
            <p>Nguyên liệu tươi ngon, sạch sẽ</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>Cơm Ánh Dương - 91 Hùng Vương, Sa Đéc, Đồng Tháp</p>
        <p>Hotline: 0917 076 061</p>
      </footer>
    </div>
  );
}
