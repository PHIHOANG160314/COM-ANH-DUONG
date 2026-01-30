export default function StaffMobilePosPage() {
  return (
    <div className="staff-mobile-pos-page">
      <header className="staff-header">
        <h1>👨‍💼 Nhân Viên POS</h1>
        <div className="staff-info">
          <span>Chưa check-in</span>
        </div>
      </header>

      <main className="staff-content">
        <section className="pos-actions">
          <button className="btn-action checkin">
            ✅ Check-in
          </button>
          <button className="btn-action create-order">
            📝 Tạo đơn
          </button>
          <button className="btn-action view-tables">
            🪑 Quản lý bàn
          </button>
        </section>

        <section className="staff-dashboard">
          <h2>Thống Kê Hôm Nay</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Đơn Hàng</h3>
              <p className="stat-value">0</p>
            </div>
            <div className="stat-card">
              <h3>Doanh Thu</h3>
              <p className="stat-value">0đ</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
