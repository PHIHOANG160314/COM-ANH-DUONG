export default function CustomerOrderingPage() {
  return (
    <div className="customer-ordering-page">
      <header className="customer-header">
        <h1>Thực Đơn</h1>
        <div className="cart-icon">🛒</div>
      </header>

      <main className="customer-content">
        <section className="menu-section">
          <h2>Danh Mục Món Ăn</h2>
          <div className="menu-grid">
            <div className="menu-item">
              <img src="/placeholder-dish.jpg" alt="Món ăn" />
              <h3>Cơm tấm sườn</h3>
              <p className="price">35,000đ</p>
              <button className="btn-add-to-cart">Thêm vào giỏ</button>
            </div>
          </div>
        </section>

        <section className="cart-summary">
          <h3>Giỏ hàng</h3>
          <p>Trống</p>
        </section>
      </main>
    </div>
  );
}
