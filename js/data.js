// ========================================
// F&B MASTER - DATA
// ========================================

// Menu Items
// Menu Items - Comprehensive List
const menuItems = [
    // ☕ CÀ PHÊ & TRUYỀN THỐNG (1-15)
    { id: 1, name: "Cà Phê Đen Đá", price: 20000, category: "drinks", icon: "☕", cost: 4000 },
    { id: 2, name: "Cà Phê Sữa Đá", price: 25000, category: "drinks", icon: "☕", cost: 6000 },
    { id: 3, name: "Bạc Xỉu", price: 28000, category: "drinks", icon: "🥛", cost: 7000 },
    { id: 4, name: "Cà Phê Muối", price: 35000, category: "drinks", icon: "🧂", cost: 8000 },
    { id: 5, name: "Cà Phê Trứng", price: 40000, category: "drinks", icon: "🥚", cost: 10000 },
    { id: 6, name: "Cacao Đá Xay", price: 35000, category: "drinks", icon: "🍫", cost: 9000 },
    { id: 7, name: "Sữa Chua Đánh Đá", price: 25000, category: "drinks", icon: "🧊", cost: 6000 },
    { id: 8, name: "Lipton Chanh Đá", price: 25000, category: "drinks", icon: "🍋", cost: 5000 },
    { id: 9, name: "Nước Chanh Tươi", price: 20000, category: "drinks", icon: "🍋", cost: 4000 },
    { id: 10, name: "Nước Chanh Dây", price: 25000, category: "drinks", icon: "🥤", cost: 6000 },
    { id: 11, name: "Nước Cam Vắt", price: 35000, category: "drinks", icon: "🍊", cost: 10000 },
    { id: 12, name: "Dừa Tươi", price: 25000, category: "drinks", icon: "🥥", cost: 12000 },
    { id: 13, name: "Rau Má Đậu Xanh", price: 25000, category: "drinks", icon: "🌿", cost: 6000 },
    { id: 14, name: "Nước Sâm", price: 15000, category: "drinks", icon: "🥤", cost: 3000 },
    { id: 15, name: "Nước Mía", price: 12000, category: "drinks", icon: "🥤", cost: 3000 },

    // 🧋 TRÀ SỮA & TRÀ TRÁI CÂY (16-35)
    { id: 16, name: "Trà Sữa Truyền Thống", price: 30000, category: "drinks", icon: "🧋", cost: 8000 },
    { id: 17, name: "Trà Sữa Thái Xanh", price: 30000, category: "drinks", icon: "🧋", cost: 8000 },
    { id: 18, name: "Trà Sữa Thái Đỏ", price: 30000, category: "drinks", icon: "🧋", cost: 8000 },
    { id: 19, name: "Trà Sữa Matcha", price: 35000, category: "drinks", icon: "🍵", cost: 10000 },
    { id: 20, name: "Trà Sữa Khoai Môn", price: 35000, category: "drinks", icon: "🍠", cost: 9000 },
    { id: 21, name: "Sữa Tươi Trân Châu Đường Đen", price: 40000, category: "drinks", icon: "🥛", cost: 12000 },
    { id: 22, name: "Trà Đào Cam Sả", price: 35000, category: "drinks", icon: "🍑", cost: 9000 },
    { id: 23, name: "Trà Vải Hoa Hồng", price: 35000, category: "drinks", icon: "🌸", cost: 9000 },
    { id: 24, name: "Trà Ổi Hồng", price: 35000, category: "drinks", icon: "🍐", cost: 9000 },
    { id: 25, name: "Trà Dâu Tằm", price: 35000, category: "drinks", icon: "🍓", cost: 9000 },
    { id: 26, name: "Trà Chanh Giã Tay", price: 30000, category: "drinks", icon: "🍋", cost: 7000 },
    { id: 27, name: "Trà Tắc Xí Muội", price: 25000, category: "drinks", icon: "🍊", cost: 6000 },
    { id: 28, name: "Trà Bí Đao Hạt Chia", price: 20000, category: "drinks", icon: "🥒", cost: 5000 },
    { id: 29, name: "Soda Blue Ocean", price: 35000, category: "drinks", icon: "🌊", cost: 8000 },
    { id: 30, name: "Soda Chanh Dây", price: 35000, category: "drinks", icon: "🥤", cost: 8000 },

    // 🥑 SINH TỐ & ĐÁ XAY (36-50)
    { id: 36, name: "Sinh Tố Bơ", price: 40000, category: "drinks", icon: "🥑", cost: 15000 },
    { id: 37, name: "Sinh Tố Xoài", price: 35000, category: "drinks", icon: "🥭", cost: 10000 },
    { id: 38, name: "Sinh Tố Dâu", price: 40000, category: "drinks", icon: "🍓", cost: 12000 },
    { id: 39, name: "Sinh Tố Mãng Cầu", price: 40000, category: "drinks", icon: "🍈", cost: 12000 },
    { id: 40, name: "Sinh Tố Sapoche", price: 35000, category: "drinks", icon: "🥔", cost: 10000 },
    { id: 41, name: "Sinh Tố Cà Chua", price: 30000, category: "drinks", icon: "🍅", cost: 8000 },
    { id: 42, name: "Matcha Đá Xay", price: 45000, category: "drinks", icon: "🍵", cost: 15000 },
    { id: 43, name: "Cookie Đá Xay", price: 45000, category: "drinks", icon: "🍪", cost: 14000 },
    { id: 44, name: "Sữa Chua Trái Cây", price: 35000, category: "drinks", icon: "🥣", cost: 10000 },
    { id: 45, name: "Kem Dừa Thái", price: 35000, category: "dessert", icon: "🥥", cost: 12000 },

    // 🍜 MÓN NƯỚC (51-65)
    { id: 51, name: "Phở Bò Tái", price: 50000, category: "food", icon: "🍲", cost: 18000 },
    { id: 52, name: "Phở Bò Nạm", price: 50000, category: "food", icon: "🍲", cost: 18000 },
    { id: 53, name: "Phở Bò Đặc Biệt", price: 65000, category: "food", icon: "🍲", cost: 25000 },
    { id: 54, name: "Phở Gà", price: 45000, category: "food", icon: "🐔", cost: 16000 },
    { id: 55, name: "Bún Bò Huế", price: 55000, category: "food", icon: "🍜", cost: 20000 },
    { id: 56, name: "Bún Bò Giò Heo", price: 60000, category: "food", icon: "🍜", cost: 22000 },
    { id: 57, name: "Bún Riêu Cua", price: 45000, category: "food", icon: "🦀", cost: 15000 },
    { id: 58, name: "Bún Mọc", price: 45000, category: "food", icon: "🥣", cost: 15000 },
    { id: 59, name: "Bún Thịt Nướng", price: 45000, category: "food", icon: "🥗", cost: 16000 },
    { id: 60, name: "Hủ Tiếu Nam Vang", price: 50000, category: "food", icon: "🥣", cost: 18000 },
    { id: 61, name: "Hủ Tiếu Gõ", price: 30000, category: "food", icon: "🥢", cost: 10000 },
    { id: 62, name: "Hủ Tiếu Bò Kho", price: 55000, category: "food", icon: "🥘", cost: 20000 },
    { id: 63, name: "Mì Quảng", price: 50000, category: "food", icon: "🍜", cost: 18000 },
    { id: 64, name: "Bánh Canh Cua", price: 60000, category: "food", icon: "🦀", cost: 22000 },
    { id: 65, name: "Miến Gà", price: 45000, category: "food", icon: "🐔", cost: 15000 },

    // 🍚 CƠM & BÁNH MÌ (66-80)
    { id: 66, name: "Cơm Sườn Nướng", price: 45000, category: "food", icon: "🍚", cost: 16000 },
    { id: 67, name: "Cơm Tấm Bì Chả", price: 45000, category: "food", icon: "🍛", cost: 15000 },
    { id: 68, name: "Cơm Tấm Sườn Bì Chả", price: 60000, category: "food", icon: "🍛", cost: 22000 },
    { id: 69, name: "Cơm Gà Xối Mỡ", price: 50000, category: "food", icon: "🍗", cost: 18000 },
    { id: 70, name: "Cơm Chiên Dương Châu", price: 50000, category: "food", icon: "🍚", cost: 15000 },
    { id: 71, name: "Cơm Chiên Hải Sản", price: 60000, category: "food", icon: "🍤", cost: 20000 },
    { id: 72, name: "Cơm Bò Lúc Lắc", price: 65000, category: "food", icon: "🥩", cost: 25000 },
    { id: 73, name: "Bánh Mì Thịt", price: 25000, category: "food", icon: "🥖", cost: 10000 },
    { id: 74, name: "Bánh Mì Ốp La", price: 20000, category: "food", icon: "🍳", cost: 8000 },
    { id: 75, name: "Bánh Mì Chảo", price: 45000, category: "food", icon: "🥘", cost: 16000 },
    { id: 76, name: "Bò Né + Ốp La", price: 60000, category: "food", icon: "🥩", cost: 25000 },
    { id: 77, name: "Mì Xào Bò", price: 50000, category: "food", icon: "🍝", cost: 18000 },
    { id: 78, name: "Nui Xào Bò", price: 50000, category: "food", icon: "🍝", cost: 18000 },
    { id: 79, name: "Cháo Lòng", price: 35000, category: "food", icon: "🥣", cost: 12000 },
    { id: 80, name: "Súp Cua", price: 30000, category: "food", icon: "🥣", cost: 10000 },

    // 🍟 ĂN VẶT & TRÁNG MIỆNG (81-100)
    { id: 81, name: "Khoai Tây Chiên", price: 30000, category: "food", icon: "🍟", cost: 8000 },
    { id: 82, name: "Cá Viên Chiên", price: 25000, category: "food", icon: "🍡", cost: 10000 },
    { id: 83, name: "Xúc Xích Nướng", price: 20000, category: "food", icon: "🌭", cost: 8000 },
    { id: 84, name: "Gà Rán (1 miếng)", price: 35000, category: "food", icon: "🍗", cost: 15000 },
    { id: 85, name: "Phô Mai Que", price: 35000, category: "food", icon: "🧀", cost: 12000 },
    { id: 86, name: "Nem Chua Rán", price: 40000, category: "food", icon: "🥓", cost: 14000 },
    { id: 87, name: "Bắp Xào Tép", price: 25000, category: "food", icon: "🌽", cost: 8000 },
    { id: 88, name: "Hột Vịt Lộn xao me", price: 20000, category: "food", icon: "🥚", cost: 6000 },
    { id: 89, name: "Bánh Tráng Trộn", price: 25000, category: "food", icon: "🥡", cost: 8000 },
    { id: 90, name: "Chè Thái", price: 30000, category: "dessert", icon: "🍧", cost: 10000 },
    { id: 91, name: "Chè Khúc Bạch", price: 35000, category: "dessert", icon: "🍮", cost: 12000 },
    { id: 92, name: "Tàu Hũ Đá", price: 15000, category: "dessert", icon: "🥣", cost: 4000 },
    { id: 93, name: "Sữa Chua Nếp Cẩm", price: 25000, category: "dessert", icon: "🥛", cost: 8000 },
    { id: 94, name: "Kem Xôi Dừa", price: 35000, category: "dessert", icon: "🥥", cost: 12000 },
    { id: 95, name: "Bánh Flan", price: 10000, category: "dessert", icon: "🍮", cost: 3000 },
    { id: 96, name: "Rau Câu Dừa", price: 15000, category: "dessert", icon: "🥥", cost: 5000 },
    { id: 97, name: "Trái Cây Tô", price: 40000, category: "dessert", icon: "🍉", cost: 20000 },
    { id: 98, name: "Yaourt Đá", price: 20000, category: "dessert", icon: "🥤", cost: 6000 },
    { id: 99, name: "Hạt Hướng Dương", price: 15000, category: "food", icon: "🌻", cost: 5000 },
    { id: 100, name: "Khô Gà Lá Chanh", price: 45000, category: "food", icon: "🐔", cost: 20000 },

    // 🍲 MÓN ĂN - CƠM PHẦN (Menu Excel) (101-135)
    { id: 101, name: "Bò xào khổ qua", price: 35000, category: "food", icon: "🥩", cost: 12000 },
    { id: 102, name: "Lươn xào sả ớt", price: 35000, category: "food", icon: "🐍", cost: 12000 },
    { id: 103, name: "Sườn non ram mặn", price: 35000, category: "food", icon: "🍖", cost: 12000 },
    { id: 104, name: "Ba rọi chiên nước mắm", price: 35000, category: "food", icon: "🥓", cost: 12000 },
    { id: 105, name: "Sườn cốt lết chiên", price: 30000, category: "food", icon: "🥩", cost: 10000 },
    { id: 106, name: "Thịt kho tiêu", price: 30000, category: "food", icon: "🥘", cost: 10000 },
    { id: 107, name: "Thịt kho trứng", price: 30000, category: "food", icon: "🥚", cost: 10000 },
    { id: 108, name: "Tép gạo ram mặn ngọt", price: 30000, category: "food", icon: "🦐", cost: 10000 },
    { id: 109, name: "Đùi gà chiên nước mắm", price: 30000, category: "food", icon: "🍗", cost: 10000 },
    { id: 110, name: "Ếch chiên nước mắm", price: 30000, category: "food", icon: "🐸", cost: 10000 },
    { id: 111, name: "Vịt xào gừng", price: 30000, category: "food", icon: "🦆", cost: 10000 },
    { id: 112, name: "Gà xào sả ớt", price: 30000, category: "food", icon: "🐔", cost: 10000 },
    { id: 113, name: "Cá he kho lạt (xoài băm)", price: 35000, category: "food", icon: "🐟", cost: 12000 },
    { id: 114, name: "Cá sát kho tiêu", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 115, name: "Cá ngừ kho thơm", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 116, name: "Cá điêu hồng chiên (mắm xoài)", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 117, name: "Bụng cá basa muối chiên", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 118, name: "Canh chua cá tra", price: 30000, category: "food", icon: "🥣", cost: 10000 },
    { id: 119, name: "Canh khổ qua dồn thịt - Cá chả", price: 30000, category: "food", icon: "🥣", cost: 10000 },
    { id: 120, name: "Đậu hũ chiên sả (cơm chay)", price: 20000, category: "food", icon: "🍛", cost: 6000 },
    { id: 121, name: "Cá tra kho", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 122, name: "Cá rô kho", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 123, name: "Cá trê chiên", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 124, name: "Cá lóc chiên", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 125, name: "Cá lóc kho", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 126, name: "Cá lóc muối sả chiên", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 127, name: "Cá điêu hồng chiên (mắm xoài)", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 128, name: "Cá điêu hồng chưng tương", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 129, name: "Cá tra kho", price: 30000, category: "food", icon: "🐟", cost: 10000 },
    { id: 130, name: "Tép gạo ram mặn ngọt", price: 30000, category: "food", icon: "🦐", cost: 10000 },
    { id: 131, name: "Gà xào sả ớt", price: 30000, category: "food", icon: "🐔", cost: 10000 },
    { id: 132, name: "Vịt xào gừng", price: 30000, category: "food", icon: "🦆", cost: 10000 },
    { id: 133, name: "Ba rọi chiên nước mắm", price: 30000, category: "food", icon: "🥓", cost: 10000 },
    { id: 134, name: "Canh khổ qua dồn thịt - Cá chả", price: 30000, category: "food", icon: "🥣", cost: 10000 },
    { id: 135, name: "Canh chua cá tra", price: 30000, category: "food", icon: "🥣", cost: 10000 }
];

// Inventory Data
const inventoryData = [
    { id: "NL001", name: "Thịt bò", category: "meat", stock: 15, unit: "Kg", minStock: 10, price: 280000 },
    { id: "NL002", name: "Thịt heo", category: "meat", stock: 20, unit: "Kg", minStock: 15, price: 120000 },
    { id: "NL003", name: "Sườn heo", category: "meat", stock: 8, unit: "Kg", minStock: 10, price: 150000 },
    { id: "NL004", name: "Gà ta", category: "meat", stock: 12, unit: "Kg", minStock: 8, price: 140000 },
    { id: "NL005", name: "Tôm sú", category: "seafood", stock: 5, unit: "Kg", minStock: 8, price: 350000 },
    { id: "NL006", name: "Cá basa", category: "seafood", stock: 10, unit: "Kg", minStock: 5, price: 95000 },
    { id: "NL007", name: "Rau muống", category: "vegetables", stock: 25, unit: "Kg", minStock: 10, price: 15000 },
    { id: "NL008", name: "Cà chua", category: "vegetables", stock: 15, unit: "Kg", minStock: 10, price: 25000 },
    { id: "NL009", name: "Hành tím", category: "vegetables", stock: 8, unit: "Kg", minStock: 5, price: 35000 },
    { id: "NL010", name: "Tỏi", category: "spices", stock: 5, unit: "Kg", minStock: 3, price: 80000 },
    { id: "NL011", name: "Ớt tươi", category: "spices", stock: 3, unit: "Kg", minStock: 2, price: 60000 },
    { id: "NL012", name: "Nước mắm", category: "spices", stock: 20, unit: "Lít", minStock: 10, price: 45000 },
    { id: "NL013", name: "Đường", category: "spices", stock: 25, unit: "Kg", minStock: 10, price: 22000 },
    { id: "NL014", name: "Cà phê", category: "drinks", stock: 10, unit: "Kg", minStock: 5, price: 180000 },
    { id: "NL015", name: "Sữa đặc", category: "drinks", stock: 30, unit: "Hộp", minStock: 20, price: 18000 }
];

// Recipes Data
const recipesData = [
    {
        id: 1,
        name: "Bún Bò Huế",
        icon: "🍜",
        servings: 1,
        prepTime: "30 phút",
        ingredients: [
            { name: "Bún tươi", amount: 200, unit: "g", cost: 4000 },
            { name: "Thịt bò", amount: 100, unit: "g", cost: 28000 },
            { name: "Chả lụa", amount: 30, unit: "g", cost: 4500 },
            { name: "Nước dùng", amount: 400, unit: "ml", cost: 6000 },
            { name: "Rau sống", amount: 50, unit: "g", cost: 1500 },
            { name: "Gia vị", amount: 1, unit: "set", cost: 2000 }
        ],
        totalCost: 46000,
        sellingPrice: 55000
    },
    {
        id: 2,
        name: "Phở Bò Tái",
        icon: "🍲",
        servings: 1,
        prepTime: "25 phút",
        ingredients: [
            { name: "Bánh phở", amount: 200, unit: "g", cost: 5000 },
            { name: "Thịt bò tái", amount: 80, unit: "g", cost: 22400 },
            { name: "Nước dùng xương", amount: 450, unit: "ml", cost: 7000 },
            { name: "Hành lá, ngò", amount: 20, unit: "g", cost: 1000 },
            { name: "Rau ăn kèm", amount: 50, unit: "g", cost: 1500 }
        ],
        totalCost: 36900,
        sellingPrice: 50000
    },
    {
        id: 3,
        name: "Cà Phê Sữa Đá",
        icon: "☕",
        servings: 1,
        prepTime: "5 phút",
        ingredients: [
            { name: "Cà phê phin", amount: 25, unit: "g", cost: 4500 },
            { name: "Sữa đặc", amount: 30, unit: "ml", cost: 2000 },
            { name: "Đá", amount: 100, unit: "g", cost: 500 }
        ],
        totalCost: 7000,
        sellingPrice: 25000
    }
];

// SOPs Data
const sopsData = {
    opening: {
        title: "Opening Checklist",
        items: [
            { id: 1, text: "Mở cửa, bật đèn toàn bộ", time: "06:00" },
            { id: 2, text: "Kiểm tra hệ thống điện, nước, gas", time: "06:05" },
            { id: 3, text: "Nhận hàng từ nhà cung cấp", time: "06:15" },
            { id: 4, text: "Kiểm tra chất lượng nguyên liệu", time: "06:30" },
            { id: 5, text: "Cất nguyên liệu vào kho đúng nơi", time: "06:45" },
            { id: 6, text: "Mise en place - Chuẩn bị nguyên liệu", time: "07:00" },
            { id: 7, text: "Vệ sinh khu vực phục vụ", time: "07:30" },
            { id: 8, text: "Sắp xếp bàn ghế, bát đĩa", time: "08:00" },
            { id: 9, text: "Họp briefing với nhân viên", time: "08:15" },
            { id: 10, text: "Bật máy POS, kiểm tra in hóa đơn", time: "08:30" },
            { id: 11, text: "Kiểm tra thực đơn, giá cả", time: "08:40" },
            { id: 12, text: "Sẵn sàng đón khách", time: "09:00" }
        ]
    },
    closing: {
        title: "Closing Checklist",
        items: [
            { id: 1, text: "Thông báo last order", time: "21:00" },
            { id: 2, text: "Đóng quầy pha chế", time: "21:30" },
            { id: 3, text: "Thu dọn khu vực bếp", time: "21:45" },
            { id: 4, text: "Kiểm kê nguyên liệu cuối ngày", time: "22:00" },
            { id: 5, text: "Vệ sinh thiết bị bếp", time: "22:15" },
            { id: 6, text: "Vệ sinh khu vực phục vụ", time: "22:30" },
            { id: 7, text: "Đổ rác, vệ sinh thùng rác", time: "22:45" },
            { id: 8, text: "Đóng máy POS, in báo cáo doanh thu", time: "23:00" },
            { id: 9, text: "Kiểm tra tắt gas, bếp, điện", time: "23:10" },
            { id: 10, text: "Khóa cửa kho, cửa sau", time: "23:15" },
            { id: 11, text: "Bật camera an ninh", time: "23:20" },
            { id: 12, text: "Khóa cửa chính, giao chìa khóa", time: "23:30" }
        ]
    },
    service: {
        title: "Service Standards",
        items: [
            { id: 1, text: "Chào khách với nụ cười", time: "" },
            { id: 2, text: "Hướng dẫn khách vào bàn", time: "" },
            { id: 3, text: "Đưa thực đơn trong 1 phút", time: "" },
            { id: 4, text: "Gợi ý món đặc biệt", time: "" },
            { id: 5, text: "Ghi order chính xác, đọc lại", time: "" },
            { id: 6, text: "Đồ uống phục vụ trong 3 phút", time: "" },
            { id: 7, text: "Món ăn phục vụ trong 15 phút", time: "" },
            { id: 8, text: "Kiểm tra khách cần gì thêm", time: "" },
            { id: 9, text: "Thu dọn bàn kịp thời", time: "" },
            { id: 10, text: "Thanh toán nhanh chóng, chính xác", time: "" },
            { id: 11, text: "Cảm ơn và tiễn khách", time: "" }
        ]
    },
    kitchen: {
        title: "Kitchen Standards",
        items: [
            { id: 1, text: "Đội mũ bảo hộ, mang tạp dề", time: "" },
            { id: 2, text: "Rửa tay trước khi chế biến", time: "" },
            { id: 3, text: "Kiểm tra nhiệt độ tủ lạnh", time: "" },
            { id: 4, text: "Tuân thủ FIFO - Nhập trước xuất trước", time: "" },
            { id: 5, text: "Chế biến đúng công thức chuẩn", time: "" },
            { id: 6, text: "Kiểm tra nhiệt độ nấu chín", time: "" },
            { id: 7, text: "Bày trí món ăn đẹp mắt", time: "" },
            { id: 8, text: "Gọi tên món khi ra đĩa", time: "" },
            { id: 9, text: "Vệ sinh dụng cụ sau mỗi món", time: "" },
            { id: 10, text: "Không để thực phẩm sống chung chín", time: "" }
        ]
    },
    cleaning: {
        title: "Cleaning Schedule",
        items: [
            { id: 1, text: "Lau bàn sau mỗi lượt khách", time: "Liên tục" },
            { id: 2, text: "Quét dọn khu vực phục vụ", time: "Mỗi 2 giờ" },
            { id: 3, text: "Vệ sinh toilet", time: "Mỗi 2 giờ" },
            { id: 4, text: "Rửa dụng cụ bếp", time: "Liên tục" },
            { id: 5, text: "Lau chùi thiết bị", time: "Cuối ca" },
            { id: 6, text: "Đổ rác", time: "Khi đầy" },
            { id: 7, text: "Vệ sinh sàn nhà", time: "Cuối ngày" },
            { id: 8, text: "Vệ sinh tủ lạnh", time: "Hàng tuần" },
            { id: 9, text: "Vệ sinh quạt/điều hòa", time: "Hàng tháng" },
            { id: 10, text: "Tổng vệ sinh sâu", time: "Hàng quý" }
        ]
    },
    safety: {
        title: "Food Safety - HACCP",
        items: [
            { id: 1, text: "Kiểm tra nhiệt độ tủ mát (0-4°C)", time: "" },
            { id: 2, text: "Kiểm tra nhiệt độ tủ đông (-18°C)", time: "" },
            { id: 3, text: "Ghi chép nhật ký nhiệt độ", time: "" },
            { id: 4, text: "Kiểm tra hạn sử dụng nguyên liệu", time: "" },
            { id: 5, text: "Dán nhãn ngày mở/hết hạn", time: "" },
            { id: 6, text: "Bảo quản thực phẩm đúng cách", time: "" },
            { id: 7, text: "Không để vùng nguy hiểm > 2 giờ", time: "" },
            { id: 8, text: "Nấu chín tối thiểu 75°C", time: "" },
            { id: 9, text: "Giữ nóng tối thiểu 60°C", time: "" },
            { id: 10, text: "Rửa tay đúng cách 20 giây", time: "" },
            { id: 11, text: "Phân biệt thớt sống - chín", time: "" },
            { id: 12, text: "Báo cáo sự cố an toàn thực phẩm", time: "" }
        ]
    }
};

// Sample Orders
const sampleOrders = [
    { id: "ORD001", table: "Bàn 3", items: "Bún Bò, Cà Phê", total: 80000, status: "completed", time: "09:15" },
    { id: "ORD002", table: "Bàn 1", items: "Phở Bò x2", total: 100000, status: "completed", time: "09:30" },
    { id: "ORD003", table: "Mang đi", items: "Cơm Sườn, Trà Đào", total: 80000, status: "pending", time: "09:45" },
    { id: "ORD004", table: "Bàn 5", items: "Bún Chả, Sinh Tố", total: 85000, status: "pending", time: "10:00" },
    { id: "ORD005", table: "Bàn 2", items: "Hủ Tiếu, Nước Mía", total: 60000, status: "completed", time: "10:15" }
];

// Dashboard Data
const dashboardData = {
    revenue: {
        today: 3250000,
        week: [2800000, 3100000, 2950000, 3400000, 3200000, 4100000, 3250000]
    },
    orders: {
        today: 52,
        pending: 5
    },
    foodCostPercent: 31.5,
    topItems: [
        { name: "Bún Bò Huế", count: 45, revenue: 2475000 },
        { name: "Cà Phê Sữa Đá", count: 38, revenue: 950000 },
        { name: "Phở Bò Tái", count: 32, revenue: 1600000 },
        { name: "Cơm Sườn Nướng", count: 28, revenue: 1260000 },
        { name: "Trà Đào Cam Sả", count: 25, revenue: 875000 }
    ]
};

// Contact Info
const contactInfo = {
    phone: "0917 076 061",
    address: "91 Hùng Vương, Phường Sa Đéc, Đồng Tháp"
};

// Ensure global access
window.menuItems = menuItems;
window.inventoryData = inventoryData;
window.recipesData = recipesData;
window.sopsData = sopsData;
