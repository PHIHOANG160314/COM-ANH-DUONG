export default function ShipperDeliveryPage() {
  return (
    <div className="shipper-delivery-page">
      <header className="shipper-header">
        <h1>🚴 Shipper - Giao Hàng</h1>
        <div className="shipper-status">
          <span className="status-badge available">SẴN SÀNG</span>
        </div>
      </header>

      <main className="shipper-content">
        <section className="delivery-list">
          <h2>Đơn Hàng Cần Giao</h2>
          <div className="delivery-cards">
            <p className="empty-state">Chưa có đơn hàng cần giao</p>
          </div>
        </section>

        <section className="delivery-map">
          <h3>Bản Đồ Giao Hàng</h3>
          <div className="map-placeholder">
            <p>🗺️ Bản đồ sẽ hiển thị tại đây</p>
          </div>
        </section>
      </main>
    </div>
  );
}
