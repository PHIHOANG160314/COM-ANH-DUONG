export default function KitchenDisplaySystemPage() {
  return (
    <div className="kitchen-display-system-page">
      <header className="kitchen-header">
        <h1>🍳 Bếp - Hệ Thống Nhận Đơn</h1>
        <div className="status-indicator">
          <span className="status-badge online">ONLINE</span>
        </div>
      </header>

      <main className="kitchen-content">
        <section className="orders-queue">
          <div className="queue-column pending">
            <h2>Đơn Mới</h2>
            <div className="order-cards">
              {/* Order cards will be dynamically rendered */}
              <p className="empty-state">Chưa có đơn hàng mới</p>
            </div>
          </div>

          <div className="queue-column preparing">
            <h2>Đang Nấu</h2>
            <div className="order-cards">
              <p className="empty-state">Chưa có đơn đang nấu</p>
            </div>
          </div>

          <div className="queue-column ready">
            <h2>Sẵn Sàng</h2>
            <div className="order-cards">
              <p className="empty-state">Chưa có đơn sẵn sàng</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
