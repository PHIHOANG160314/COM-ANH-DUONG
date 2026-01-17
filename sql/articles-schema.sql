-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    excerpt TEXT,
    category TEXT,
    icon TEXT DEFAULT '📰',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    link_url TEXT DEFAULT '/customer.html',
    link_text TEXT DEFAULT 'Xem chi tiết →',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active articles
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT USING (is_active = true);

-- Policy: Only staff/admin can modify (simplified for now, using service role or authenticated staff)
CREATE POLICY "Allow staff to modify" ON articles
    FOR ALL USING (auth.role() = 'authenticated'); 
    -- Note: In a real prod env, check specific admin claims

-- Seed Data (replicating current static content)
INSERT INTO articles (title, excerpt, category, icon, published_at, link_url, link_text)
VALUES 
    (
        'Khuyến mãi đầu năm mới - Giảm 20% tất cả món', 
        'Chào mừng năm mới, Cơm Ánh Dương xin gửi tặng quý khách ưu đãi giảm 20% toàn bộ thực đơn từ nay đến hết tháng 1...',
        'Khuyến mãi',
        '📰',
        '2026-01-16 00:00:00+00',
        '/customer',
        'Đặt món ngay →'
    ),
    (
        'Ra mắt hệ thống đặt hàng online',
        'Giờ đây quý khách có thể đặt món trực tuyến một cách tiện lợi ngay trên website...',
        'Sự kiện',
        '🎉',
        '2026-01-10 00:00:00+00',
        '/customer',
        'Thử ngay →'
    ),
    (
        'Bí quyết nấu phở ngon như nhà hàng',
        'Chia sẻ công thức nấu phở bò truyền thống từ đầu bếp Ánh Dương...',
        'Ẩm thực',
        '🍜',
        '2026-01-05 00:00:00+00',
        '/customer',
        'Xem menu →'
    );
