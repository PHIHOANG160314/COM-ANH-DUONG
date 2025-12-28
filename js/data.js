// ========================================
// F&B MASTER - DATA
// ========================================

// Subcategories Definition
const menuSubcategories = {
    drinks: [
        { id: 'coffee', name: 'Cà Phê', icon: '☕' },
        { id: 'milk-tea', name: 'Trà Sữa', icon: '🧋' },
        { id: 'fruit-tea', name: 'Trà Trái Cây', icon: '🍑' },
        { id: 'smoothie', name: 'Sinh Tố', icon: '🥑' },
        { id: 'refresh', name: 'Giải Khát', icon: '🥤' }
    ],
    food: [
        { id: 'noodle', name: 'Phở & Bún', icon: '🍲' },
        { id: 'rice', name: 'Cơm', icon: '🍚' },
        { id: 'bread', name: 'Bánh Mì', icon: '🥖' },
        { id: 'snack', name: 'Ăn Vặt', icon: '🍟' },
        { id: 'homemade', name: 'Món Nhà', icon: '🥘' }
    ],
    dessert: [
        { id: 'che', name: 'Chè', icon: '🍧' },
        { id: 'sweet', name: 'Kem & Bánh', icon: '🍮' }
    ]
};

// Featured items (top sellers)
const featuredItems = [1, 2, 16, 51, 66]; // IDs of top-selling items

// Menu Items - with subcategory
const menuItems = [
    // ☕ CÀ PHÊ & TRUYỀN THỐNG (1-15)
    { id: 1, name: "Cà Phê Đen Đá", price: 20000, category: "drinks", subcategory: "coffee", icon: "☕", cost: 4000 },
    { id: 2, name: "Cà Phê Sữa Đá", price: 25000, category: "drinks", subcategory: "coffee", icon: "☕", cost: 6000 },
    { id: 3, name: "Bạc Xỉu", price: 28000, category: "drinks", subcategory: "coffee", icon: "🥛", cost: 7000 },
    { id: 4, name: "Cà Phê Muối", price: 35000, category: "drinks", subcategory: "coffee", icon: "🧂", cost: 8000 },
    { id: 5, name: "Cà Phê Trứng", price: 40000, category: "drinks", subcategory: "coffee", icon: "🥚", cost: 10000 },
    { id: 6, name: "Cacao Đá Xay", price: 35000, category: "drinks", subcategory: "coffee", icon: "🍫", cost: 9000 },
    { id: 7, name: "Sữa Chua Đánh Đá", price: 25000, category: "drinks", subcategory: "refresh", icon: "🧊", cost: 6000 },
    { id: 8, name: "Lipton Chanh Đá", price: 25000, category: "drinks", subcategory: "refresh", icon: "🍋", cost: 5000 },
    { id: 9, name: "Nước Chanh Tươi", price: 20000, category: "drinks", subcategory: "refresh", icon: "🍋", cost: 4000 },
    { id: 10, name: "Nước Chanh Dây", price: 25000, category: "drinks", subcategory: "refresh", icon: "🥤", cost: 6000 },
    { id: 11, name: "Nước Cam Vắt", price: 35000, category: "drinks", subcategory: "refresh", icon: "🍊", cost: 10000 },
    { id: 12, name: "Dừa Tươi", price: 25000, category: "drinks", subcategory: "refresh", icon: "🥥", cost: 12000 },
    { id: 13, name: "Rau Má Đậu Xanh", price: 25000, category: "drinks", subcategory: "refresh", icon: "🌿", cost: 6000 },
    { id: 14, name: "Nước Sâm", price: 15000, category: "drinks", subcategory: "refresh", icon: "🥤", cost: 3000 },
    { id: 15, name: "Nước Mía", price: 12000, category: "drinks", subcategory: "refresh", icon: "🥤", cost: 3000 },

    // 🧋 TRÀ SỮA & TRÀ TRÁI CÂY (16-35)
    { id: 16, name: "Trà Sữa Truyền Thống", price: 30000, category: "drinks", subcategory: "milk-tea", icon: "🧋", cost: 8000 },
    { id: 17, name: "Trà Sữa Thái Xanh", price: 30000, category: "drinks", subcategory: "milk-tea", icon: "🧋", cost: 8000 },
    { id: 18, name: "Trà Sữa Thái Đỏ", price: 30000, category: "drinks", subcategory: "milk-tea", icon: "🧋", cost: 8000 },
    { id: 19, name: "Trà Sữa Matcha", price: 35000, category: "drinks", subcategory: "milk-tea", icon: "🍵", cost: 10000 },
    { id: 20, name: "Trà Sữa Khoai Môn", price: 35000, category: "drinks", subcategory: "milk-tea", icon: "🍠", cost: 9000 },
    { id: 21, name: "Sữa Tươi Trân Châu Đường Đen", price: 40000, category: "drinks", subcategory: "milk-tea", icon: "🥛", cost: 12000 },
    { id: 22, name: "Trà Đào Cam Sả", price: 35000, category: "drinks", subcategory: "fruit-tea", icon: "🍑", cost: 9000 },
    { id: 23, name: "Trà Vải Hoa Hồng", price: 35000, category: "drinks", subcategory: "fruit-tea", icon: "🌸", cost: 9000 },
    { id: 24, name: "Trà Ổi Hồng", price: 35000, category: "drinks", subcategory: "fruit-tea", icon: "🍐", cost: 9000 },
    { id: 25, name: "Trà Dâu Tằm", price: 35000, category: "drinks", subcategory: "fruit-tea", icon: "🍓", cost: 9000 },
    { id: 26, name: "Trà Chanh Giã Tay", price: 30000, category: "drinks", subcategory: "fruit-tea", icon: "🍋", cost: 7000 },
    { id: 27, name: "Trà Tắc Xí Muội", price: 25000, category: "drinks", subcategory: "fruit-tea", icon: "🍊", cost: 6000 },
    { id: 28, name: "Trà Bí Đao Hạt Chia", price: 20000, category: "drinks", subcategory: "fruit-tea", icon: "🥒", cost: 5000 },
    { id: 29, name: "Soda Blue Ocean", price: 35000, category: "drinks", subcategory: "refresh", icon: "🌊", cost: 8000 },
    { id: 30, name: "Soda Chanh Dây", price: 35000, category: "drinks", subcategory: "refresh", icon: "🥤", cost: 8000 },

    // 🥑 SINH TỐ & ĐÁ XAY (36-50)
    { id: 36, name: "Sinh Tố Bơ", price: 40000, category: "drinks", subcategory: "smoothie", icon: "🥑", cost: 15000 },
    { id: 37, name: "Sinh Tố Xoài", price: 35000, category: "drinks", subcategory: "smoothie", icon: "🥭", cost: 10000 },
    { id: 38, name: "Sinh Tố Dâu", price: 40000, category: "drinks", subcategory: "smoothie", icon: "🍓", cost: 12000 },
    { id: 39, name: "Sinh Tố Mãng Cầu", price: 40000, category: "drinks", subcategory: "smoothie", icon: "🍈", cost: 12000 },
    { id: 40, name: "Sinh Tố Sapoche", price: 35000, category: "drinks", subcategory: "smoothie", icon: "🥔", cost: 10000 },
    { id: 41, name: "Sinh Tố Cà Chua", price: 30000, category: "drinks", subcategory: "smoothie", icon: "🍅", cost: 8000 },
    { id: 42, name: "Matcha Đá Xay", price: 45000, category: "drinks", subcategory: "smoothie", icon: "🍵", cost: 15000 },
    { id: 43, name: "Cookie Đá Xay", price: 45000, category: "drinks", subcategory: "smoothie", icon: "🍪", cost: 14000 },
    { id: 44, name: "Sữa Chua Trái Cây", price: 35000, category: "drinks", subcategory: "smoothie", icon: "🥣", cost: 10000 },
    { id: 45, name: "Kem Dừa Thái", price: 35000, category: "dessert", subcategory: "sweet", icon: "🥥", cost: 12000 },

    // 🍜 MÓN NƯỚC (51-65)
    { id: 51, name: "Phở Bò Tái", price: 50000, category: "food", subcategory: "noodle", icon: "🍲", cost: 18000 },
    { id: 52, name: "Phở Bò Nạm", price: 50000, category: "food", subcategory: "noodle", icon: "🍲", cost: 18000 },
    { id: 53, name: "Phở Bò Đặc Biệt", price: 65000, category: "food", subcategory: "noodle", icon: "🍲", cost: 25000 },
    { id: 54, name: "Phở Gà", price: 45000, category: "food", subcategory: "noodle", icon: "🐔", cost: 16000 },
    { id: 55, name: "Bún Bò Huế", price: 55000, category: "food", subcategory: "noodle", icon: "🍜", cost: 20000 },
    { id: 56, name: "Bún Bò Giò Heo", price: 60000, category: "food", subcategory: "noodle", icon: "🍜", cost: 22000 },
    { id: 57, name: "Bún Riêu Cua", price: 45000, category: "food", subcategory: "noodle", icon: "🦀", cost: 15000 },
    { id: 58, name: "Bún Mọc", price: 45000, category: "food", subcategory: "noodle", icon: "🥣", cost: 15000 },
    { id: 59, name: "Bún Thịt Nướng", price: 45000, category: "food", subcategory: "noodle", icon: "🥗", cost: 16000 },
    { id: 60, name: "Hủ Tiếu Nam Vang", price: 50000, category: "food", subcategory: "noodle", icon: "🥣", cost: 18000 },
    { id: 61, name: "Hủ Tiếu Gõ", price: 30000, category: "food", subcategory: "noodle", icon: "🥢", cost: 10000 },
    { id: 62, name: "Hủ Tiếu Bò Kho", price: 55000, category: "food", subcategory: "noodle", icon: "🥘", cost: 20000 },
    { id: 63, name: "Mì Quảng", price: 50000, category: "food", subcategory: "noodle", icon: "🍜", cost: 18000 },
    { id: 64, name: "Bánh Canh Cua", price: 60000, category: "food", subcategory: "noodle", icon: "🦀", cost: 22000 },
    { id: 65, name: "Miến Gà", price: 45000, category: "food", subcategory: "noodle", icon: "🐔", cost: 15000 },

    // 🍚 CƠM & BÁNH MÌ (66-80)
    { id: 66, name: "Cơm Sườn Nướng", price: 45000, category: "food", subcategory: "rice", icon: "🍚", cost: 16000 },
    { id: 67, name: "Cơm Tấm Bì Chả", price: 45000, category: "food", subcategory: "rice", icon: "🍛", cost: 15000 },
    { id: 68, name: "Cơm Tấm Sườn Bì Chả", price: 60000, category: "food", subcategory: "rice", icon: "🍛", cost: 22000 },
    { id: 69, name: "Cơm Gà Xối Mỡ", price: 50000, category: "food", subcategory: "rice", icon: "🍗", cost: 18000 },
    { id: 70, name: "Cơm Chiên Dương Châu", price: 50000, category: "food", subcategory: "rice", icon: "🍚", cost: 15000 },
    { id: 71, name: "Cơm Chiên Hải Sản", price: 60000, category: "food", subcategory: "rice", icon: "🍤", cost: 20000 },
    { id: 72, name: "Cơm Bò Lúc Lắc", price: 65000, category: "food", subcategory: "rice", icon: "🥩", cost: 25000 },
    { id: 73, name: "Bánh Mì Thịt", price: 25000, category: "food", subcategory: "bread", icon: "🥖", cost: 10000 },
    { id: 74, name: "Bánh Mì Ốp La", price: 20000, category: "food", subcategory: "bread", icon: "🍳", cost: 8000 },
    { id: 75, name: "Bánh Mì Chảo", price: 45000, category: "food", subcategory: "bread", icon: "🥘", cost: 16000 },
    { id: 76, name: "Bò Né + Ốp La", price: 60000, category: "food", subcategory: "bread", icon: "🥩", cost: 25000 },
    { id: 77, name: "Mì Xào Bò", price: 50000, category: "food", subcategory: "noodle", icon: "🍝", cost: 18000 },
    { id: 78, name: "Nui Xào Bò", price: 50000, category: "food", subcategory: "noodle", icon: "🍝", cost: 18000 },
    { id: 79, name: "Cháo Lòng", price: 35000, category: "food", subcategory: "noodle", icon: "🥣", cost: 12000 },
    { id: 80, name: "Súp Cua", price: 30000, category: "food", subcategory: "noodle", icon: "🥣", cost: 10000 },

    // 🍟 ĂN VẶT & TRÁNG MIỆNG (81-100)
    { id: 81, name: "Khoai Tây Chiên", price: 30000, category: "food", subcategory: "snack", icon: "🍟", cost: 8000 },
    { id: 82, name: "Cá Viên Chiên", price: 25000, category: "food", subcategory: "snack", icon: "🍡", cost: 10000 },
    { id: 83, name: "Xúc Xích Nướng", price: 20000, category: "food", subcategory: "snack", icon: "🌭", cost: 8000 },
    { id: 84, name: "Gà Rán (1 miếng)", price: 35000, category: "food", subcategory: "snack", icon: "🍗", cost: 15000 },
    { id: 85, name: "Phô Mai Que", price: 35000, category: "food", subcategory: "snack", icon: "🧀", cost: 12000 },
    { id: 86, name: "Nem Chua Rán", price: 40000, category: "food", subcategory: "snack", icon: "🥓", cost: 14000 },
    { id: 87, name: "Bắp Xào Tép", price: 25000, category: "food", subcategory: "snack", icon: "🌽", cost: 8000 },
    { id: 88, name: "Hột Vịt Lộn xao me", price: 20000, category: "food", subcategory: "snack", icon: "🥚", cost: 6000 },
    { id: 89, name: "Bánh Tráng Trộn", price: 25000, category: "food", subcategory: "snack", icon: "🥡", cost: 8000 },
    { id: 90, name: "Chè Thái", price: 30000, category: "dessert", subcategory: "che", icon: "🍧", cost: 10000 },
    { id: 91, name: "Chè Khúc Bạch", price: 35000, category: "dessert", subcategory: "che", icon: "🍮", cost: 12000 },
    { id: 92, name: "Tàu Hũ Đá", price: 15000, category: "dessert", subcategory: "che", icon: "🥣", cost: 4000 },
    { id: 93, name: "Sữa Chua Nếp Cẩm", price: 25000, category: "dessert", subcategory: "che", icon: "🥛", cost: 8000 },
    { id: 94, name: "Kem Xôi Dừa", price: 35000, category: "dessert", subcategory: "sweet", icon: "🥥", cost: 12000 },
    { id: 95, name: "Bánh Flan", price: 10000, category: "dessert", subcategory: "sweet", icon: "🍮", cost: 3000 },
    { id: 96, name: "Rau Câu Dừa", price: 15000, category: "dessert", subcategory: "sweet", icon: "🥥", cost: 5000 },
    { id: 97, name: "Trái Cây Tô", price: 40000, category: "dessert", subcategory: "sweet", icon: "🍉", cost: 20000 },
    { id: 98, name: "Yaourt Đá", price: 20000, category: "dessert", subcategory: "sweet", icon: "🥤", cost: 6000 },
    { id: 99, name: "Hạt Hướng Dương", price: 15000, category: "food", subcategory: "snack", icon: "🌻", cost: 5000 },
    { id: 100, name: "Khô Gà Lá Chanh", price: 45000, category: "food", subcategory: "snack", icon: "🐔", cost: 20000 },

    // 🍲 MÓN ĂN - CƠM PHẦN (Menu Excel) (101-135)
    { id: 101, name: "Bò xào khổ qua", price: 35000, category: "food", subcategory: "homemade", icon: "🥩", cost: 12000 },
    { id: 102, name: "Lươn xào sả ớt", price: 35000, category: "food", subcategory: "homemade", icon: "🐍", cost: 12000 },
    { id: 103, name: "Sườn non ram mặn", price: 35000, category: "food", subcategory: "homemade", icon: "🍖", cost: 12000 },
    { id: 104, name: "Ba rọi chiên nước mắm", price: 35000, category: "food", subcategory: "homemade", icon: "🥓", cost: 12000 },
    { id: 105, name: "Sườn cốt lết chiên", price: 30000, category: "food", subcategory: "homemade", icon: "🥩", cost: 10000 },
    { id: 106, name: "Thịt kho tiêu", price: 30000, category: "food", subcategory: "homemade", icon: "🥘", cost: 10000 },
    { id: 107, name: "Thịt kho trứng", price: 30000, category: "food", subcategory: "homemade", icon: "🥚", cost: 10000 },
    { id: 108, name: "Tép gạo ram mặn ngọt", price: 30000, category: "food", subcategory: "homemade", icon: "🦐", cost: 10000 },
    { id: 109, name: "Đùi gà chiên nước mắm", price: 30000, category: "food", subcategory: "homemade", icon: "🍗", cost: 10000 },
    { id: 110, name: "Ếch chiên nước mắm", price: 30000, category: "food", subcategory: "homemade", icon: "🐸", cost: 10000 },
    { id: 111, name: "Vịt xào gừng", price: 30000, category: "food", subcategory: "homemade", icon: "🦆", cost: 10000 },
    { id: 112, name: "Gà xào sả ớt", price: 30000, category: "food", subcategory: "homemade", icon: "🐔", cost: 10000 },
    { id: 113, name: "Cá he kho lạt", price: 35000, category: "food", subcategory: "homemade", icon: "🐟", cost: 12000 },
    { id: 114, name: "Cá sát kho tiêu", price: 30000, category: "food", subcategory: "homemade", icon: "🐟", cost: 10000 },
    { id: 115, name: "Cá ngừ kho thơm", price: 30000, category: "food", subcategory: "homemade", icon: "🐟", cost: 10000 },
    { id: 116, name: "Cá điêu hồng chiên", price: 30000, category: "food", subcategory: "homemade", icon: "🐟", cost: 10000 },
    { id: 117, name: "Bụng cá basa chiên", price: 30000, category: "food", subcategory: "homemade", icon: "🐟", cost: 10000 },
    { id: 118, name: "Canh chua cá tra", price: 30000, category: "food", subcategory: "homemade", icon: "🥣", cost: 10000 },
    { id: 119, name: "Canh khổ qua dồn thịt", price: 30000, category: "food", subcategory: "homemade", icon: "🥣", cost: 10000 },
    { id: 120, name: "Đậu hũ chiên sả (chay)", price: 20000, category: "food", subcategory: "homemade", icon: "🍛", cost: 6000 }
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

// ========================================
// 100 SAMPLE CUSTOMERS FOR PROMOTIONS
// ========================================
const sampleCustomers = [
    // VIP DIAMOND (10 customers)
    { id: "C001", name: "Nguyễn Văn An", phone: "0901234001", email: "an.nguyen@email.com", tier: "Diamond", points: 5200, totalSpent: 12500000, visits: 85, qrCode: "MEMBER-0901234001", createdAt: "2024-01-15" },
    { id: "C002", name: "Trần Thị Bích", phone: "0901234002", email: "bich.tran@email.com", tier: "Diamond", points: 4800, totalSpent: 11200000, visits: 78, qrCode: "MEMBER-0901234002", createdAt: "2024-01-20" },
    { id: "C003", name: "Lê Hoàng Cường", phone: "0901234003", email: "cuong.le@email.com", tier: "Diamond", points: 4500, totalSpent: 10800000, visits: 72, qrCode: "MEMBER-0901234003", createdAt: "2024-02-01" },
    { id: "C004", name: "Phạm Thị Dung", phone: "0901234004", email: "dung.pham@email.com", tier: "Diamond", points: 4200, totalSpent: 9500000, visits: 68, qrCode: "MEMBER-0901234004", createdAt: "2024-02-10" },
    { id: "C005", name: "Hoàng Văn Em", phone: "0901234005", email: "em.hoang@email.com", tier: "Diamond", points: 3900, totalSpent: 8700000, visits: 65, qrCode: "MEMBER-0901234005", createdAt: "2024-02-15" },
    { id: "C006", name: "Võ Thị Phượng", phone: "0901234006", email: "phuong.vo@email.com", tier: "Diamond", points: 3800, totalSpent: 8200000, visits: 62, qrCode: "MEMBER-0901234006", createdAt: "2024-02-20" },
    { id: "C007", name: "Đặng Văn Giang", phone: "0901234007", email: "giang.dang@email.com", tier: "Diamond", points: 3600, totalSpent: 7800000, visits: 58, qrCode: "MEMBER-0901234007", createdAt: "2024-03-01" },
    { id: "C008", name: "Bùi Thị Hạnh", phone: "0901234008", email: "hanh.bui@email.com", tier: "Diamond", points: 3500, totalSpent: 7500000, visits: 55, qrCode: "MEMBER-0901234008", createdAt: "2024-03-05" },
    { id: "C009", name: "Ngô Văn Hùng", phone: "0901234009", email: "hung.ngo@email.com", tier: "Diamond", points: 3400, totalSpent: 7200000, visits: 52, qrCode: "MEMBER-0901234009", createdAt: "2024-03-10" },
    { id: "C010", name: "Lý Thị Kiều", phone: "0901234010", email: "kieu.ly@email.com", tier: "Diamond", points: 3200, totalSpent: 6800000, visits: 50, qrCode: "MEMBER-0901234010", createdAt: "2024-03-15" },

    // VIP GOLD (20 customers)
    { id: "C011", name: "Trương Văn Long", phone: "0912345011", email: "long.truong@email.com", tier: "Gold", points: 1800, totalSpent: 3200000, visits: 35, qrCode: "MEMBER-0912345011", createdAt: "2024-03-20" },
    { id: "C012", name: "Mai Thị Ngọc", phone: "0912345012", email: "ngoc.mai@email.com", tier: "Gold", points: 1650, totalSpent: 2900000, visits: 32, qrCode: "MEMBER-0912345012", createdAt: "2024-03-25" },
    { id: "C013", name: "Phan Văn Phú", phone: "0912345013", email: "phu.phan@email.com", tier: "Gold", points: 1500, totalSpent: 2600000, visits: 30, qrCode: "MEMBER-0912345013", createdAt: "2024-04-01" },
    { id: "C014", name: "Huỳnh Thị Quỳnh", phone: "0912345014", email: "quynh.huynh@email.com", tier: "Gold", points: 1420, totalSpent: 2450000, visits: 28, qrCode: "MEMBER-0912345014", createdAt: "2024-04-05" },
    { id: "C015", name: "Vũ Văn Sang", phone: "0912345015", email: "sang.vu@email.com", tier: "Gold", points: 1350, totalSpent: 2300000, visits: 26, qrCode: "MEMBER-0912345015", createdAt: "2024-04-10" },
    { id: "C016", name: "Đỗ Thị Tâm", phone: "0912345016", email: "tam.do@email.com", tier: "Gold", points: 1280, totalSpent: 2150000, visits: 25, qrCode: "MEMBER-0912345016", createdAt: "2024-04-15" },
    { id: "C017", name: "Lương Văn Uy", phone: "0912345017", email: "uy.luong@email.com", tier: "Gold", points: 1200, totalSpent: 2000000, visits: 24, qrCode: "MEMBER-0912345017", createdAt: "2024-04-20" },
    { id: "C018", name: "Đinh Thị Vân", phone: "0912345018", email: "van.dinh@email.com", tier: "Gold", points: 1150, totalSpent: 1900000, visits: 23, qrCode: "MEMBER-0912345018", createdAt: "2024-04-25" },
    { id: "C019", name: "Cao Văn Xuân", phone: "0912345019", email: "xuan.cao@email.com", tier: "Gold", points: 1100, totalSpent: 1800000, visits: 22, qrCode: "MEMBER-0912345019", createdAt: "2024-05-01" },
    { id: "C020", name: "Tô Thị Yến", phone: "0912345020", email: "yen.to@email.com", tier: "Gold", points: 1050, totalSpent: 1700000, visits: 21, qrCode: "MEMBER-0912345020", createdAt: "2024-05-05" },
    { id: "C021", name: "Châu Văn Bảo", phone: "0912345021", email: "bao.chau@email.com", tier: "Gold", points: 1020, totalSpent: 1650000, visits: 20, qrCode: "MEMBER-0912345021", createdAt: "2024-05-10" },
    { id: "C022", name: "Hồ Thị Chi", phone: "0912345022", email: "chi.ho@email.com", tier: "Gold", points: 980, totalSpent: 1580000, visits: 19, qrCode: "MEMBER-0912345022", createdAt: "2024-05-15" },
    { id: "C023", name: "Kiều Văn Đạt", phone: "0912345023", email: "dat.kieu@email.com", tier: "Gold", points: 950, totalSpent: 1520000, visits: 18, qrCode: "MEMBER-0912345023", createdAt: "2024-05-20" },
    { id: "C024", name: "Nguyễn Thị Gấm", phone: "0912345024", email: "gam.nguyen@email.com", tier: "Gold", points: 920, totalSpent: 1480000, visits: 17, qrCode: "MEMBER-0912345024", createdAt: "2024-05-25" },
    { id: "C025", name: "Trần Văn Hiếu", phone: "0912345025", email: "hieu.tran@email.com", tier: "Gold", points: 890, totalSpent: 1420000, visits: 16, qrCode: "MEMBER-0912345025", createdAt: "2024-06-01" },
    { id: "C026", name: "Lê Thị Khoa", phone: "0912345026", email: "khoa.le@email.com", tier: "Gold", points: 860, totalSpent: 1380000, visits: 16, qrCode: "MEMBER-0912345026", createdAt: "2024-06-05" },
    { id: "C027", name: "Phạm Văn Lộc", phone: "0912345027", email: "loc.pham@email.com", tier: "Gold", points: 830, totalSpent: 1340000, visits: 15, qrCode: "MEMBER-0912345027", createdAt: "2024-06-10" },
    { id: "C028", name: "Hoàng Thị Minh", phone: "0912345028", email: "minh.hoang@email.com", tier: "Gold", points: 810, totalSpent: 1300000, visits: 15, qrCode: "MEMBER-0912345028", createdAt: "2024-06-15" },
    { id: "C029", name: "Võ Văn Nam", phone: "0912345029", email: "nam.vo@email.com", tier: "Gold", points: 780, totalSpent: 1250000, visits: 14, qrCode: "MEMBER-0912345029", createdAt: "2024-06-20" },
    { id: "C030", name: "Đặng Thị Oanh", phone: "0912345030", email: "oanh.dang@email.com", tier: "Gold", points: 750, totalSpent: 1200000, visits: 14, qrCode: "MEMBER-0912345030", createdAt: "2024-06-25" },

    // SILVER (30 customers)
    { id: "C031", name: "Bùi Văn Phong", phone: "0923456031", email: "phong.bui@email.com", tier: "Silver", points: 420, totalSpent: 680000, visits: 10, qrCode: "MEMBER-0923456031", createdAt: "2024-07-01" },
    { id: "C032", name: "Ngô Thị Quế", phone: "0923456032", email: "que.ngo@email.com", tier: "Silver", points: 400, totalSpent: 650000, visits: 9, qrCode: "MEMBER-0923456032", createdAt: "2024-07-05" },
    { id: "C033", name: "Lý Văn Rạng", phone: "0923456033", email: "rang.ly@email.com", tier: "Silver", points: 380, totalSpent: 620000, visits: 9, qrCode: "MEMBER-0923456033", createdAt: "2024-07-10" },
    { id: "C034", name: "Trương Thị Sen", phone: "0923456034", email: "sen.truong@email.com", tier: "Silver", points: 360, totalSpent: 590000, visits: 8, qrCode: "MEMBER-0923456034", createdAt: "2024-07-15" },
    { id: "C035", name: "Mai Văn Tài", phone: "0923456035", email: "tai.mai@email.com", tier: "Silver", points: 340, totalSpent: 560000, visits: 8, qrCode: "MEMBER-0923456035", createdAt: "2024-07-20" },
    { id: "C036", name: "Phan Thị Uyên", phone: "0923456036", email: "uyen.phan@email.com", tier: "Silver", points: 320, totalSpent: 530000, visits: 7, qrCode: "MEMBER-0923456036", createdAt: "2024-07-25" },
    { id: "C037", name: "Huỳnh Văn Vinh", phone: "0923456037", email: "vinh.huynh@email.com", tier: "Silver", points: 300, totalSpent: 500000, visits: 7, qrCode: "MEMBER-0923456037", createdAt: "2024-08-01" },
    { id: "C038", name: "Vũ Thị Xuyến", phone: "0923456038", email: "xuyen.vu@email.com", tier: "Silver", points: 280, totalSpent: 470000, visits: 6, qrCode: "MEMBER-0923456038", createdAt: "2024-08-05" },
    { id: "C039", name: "Đỗ Văn Yên", phone: "0923456039", email: "yen.do@email.com", tier: "Silver", points: 265, totalSpent: 445000, visits: 6, qrCode: "MEMBER-0923456039", createdAt: "2024-08-10" },
    { id: "C040", name: "Lương Thị An", phone: "0923456040", email: "an.luong@email.com", tier: "Silver", points: 250, totalSpent: 420000, visits: 6, qrCode: "MEMBER-0923456040", createdAt: "2024-08-15" },
    { id: "C041", name: "Đinh Văn Bình", phone: "0923456041", email: "binh.dinh@email.com", tier: "Silver", points: 240, totalSpent: 400000, visits: 5, qrCode: "MEMBER-0923456041", createdAt: "2024-08-20" },
    { id: "C042", name: "Cao Thị Châu", phone: "0923456042", email: "chau.cao@email.com", tier: "Silver", points: 230, totalSpent: 385000, visits: 5, qrCode: "MEMBER-0923456042", createdAt: "2024-08-25" },
    { id: "C043", name: "Tô Văn Dũng", phone: "0923456043", email: "dung.to@email.com", tier: "Silver", points: 220, totalSpent: 370000, visits: 5, qrCode: "MEMBER-0923456043", createdAt: "2024-09-01" },
    { id: "C044", name: "Châu Thị Em", phone: "0923456044", email: "em.chau@email.com", tier: "Silver", points: 210, totalSpent: 355000, visits: 5, qrCode: "MEMBER-0923456044", createdAt: "2024-09-05" },
    { id: "C045", name: "Hồ Văn Phúc", phone: "0923456045", email: "phuc.ho@email.com", tier: "Silver", points: 200, totalSpent: 340000, visits: 4, qrCode: "MEMBER-0923456045", createdAt: "2024-09-10" },
    { id: "C046", name: "Kiều Thị Giang", phone: "0923456046", email: "giang.kieu@email.com", tier: "Silver", points: 190, totalSpent: 325000, visits: 4, qrCode: "MEMBER-0923456046", createdAt: "2024-09-15" },
    { id: "C047", name: "Nguyễn Văn Hải", phone: "0923456047", email: "hai.nguyen@email.com", tier: "Silver", points: 180, totalSpent: 310000, visits: 4, qrCode: "MEMBER-0923456047", createdAt: "2024-09-20" },
    { id: "C048", name: "Trần Thị Ivy", phone: "0923456048", email: "ivy.tran@email.com", tier: "Silver", points: 170, totalSpent: 295000, visits: 4, qrCode: "MEMBER-0923456048", createdAt: "2024-09-25" },
    { id: "C049", name: "Lê Văn Khang", phone: "0923456049", email: "khang.le@email.com", tier: "Silver", points: 165, totalSpent: 280000, visits: 4, qrCode: "MEMBER-0923456049", createdAt: "2024-10-01" },
    { id: "C050", name: "Phạm Thị Lan", phone: "0923456050", email: "lan.pham@email.com", tier: "Silver", points: 155, totalSpent: 265000, visits: 3, qrCode: "MEMBER-0923456050", createdAt: "2024-10-05" },
    { id: "C051", name: "Hoàng Văn Mạnh", phone: "0923456051", email: "manh.hoang@email.com", tier: "Silver", points: 150, totalSpent: 255000, visits: 3, qrCode: "MEMBER-0923456051", createdAt: "2024-10-10" },
    { id: "C052", name: "Võ Thị Như", phone: "0923456052", email: "nhu.vo@email.com", tier: "Silver", points: 145, totalSpent: 245000, visits: 3, qrCode: "MEMBER-0923456052", createdAt: "2024-10-15" },
    { id: "C053", name: "Đặng Văn Phát", phone: "0923456053", email: "phat.dang@email.com", tier: "Silver", points: 140, totalSpent: 235000, visits: 3, qrCode: "MEMBER-0923456053", createdAt: "2024-10-20" },
    { id: "C054", name: "Bùi Thị Quyên", phone: "0923456054", email: "quyen.bui@email.com", tier: "Silver", points: 135, totalSpent: 225000, visits: 3, qrCode: "MEMBER-0923456054", createdAt: "2024-10-25" },
    { id: "C055", name: "Ngô Văn Sơn", phone: "0923456055", email: "son.ngo@email.com", tier: "Silver", points: 130, totalSpent: 220000, visits: 3, qrCode: "MEMBER-0923456055", createdAt: "2024-11-01" },
    { id: "C056", name: "Lý Thị Thảo", phone: "0923456056", email: "thao.ly@email.com", tier: "Silver", points: 125, totalSpent: 210000, visits: 3, qrCode: "MEMBER-0923456056", createdAt: "2024-11-05" },
    { id: "C057", name: "Trương Văn Út", phone: "0923456057", email: "ut.truong@email.com", tier: "Silver", points: 120, totalSpent: 200000, visits: 3, qrCode: "MEMBER-0923456057", createdAt: "2024-11-10" },
    { id: "C058", name: "Mai Thị Vĩnh", phone: "0923456058", email: "vinh.mai@email.com", tier: "Silver", points: 115, totalSpent: 195000, visits: 2, qrCode: "MEMBER-0923456058", createdAt: "2024-11-15" },
    { id: "C059", name: "Phan Văn Xanh", phone: "0923456059", email: "xanh.phan@email.com", tier: "Silver", points: 110, totalSpent: 185000, visits: 2, qrCode: "MEMBER-0923456059", createdAt: "2024-11-20" },
    { id: "C060", name: "Huỳnh Thị Yến", phone: "0923456060", email: "yen.huynh@email.com", tier: "Silver", points: 105, totalSpent: 175000, visits: 2, qrCode: "MEMBER-0923456060", createdAt: "2024-11-25" },

    // BRONZE (40 customers - new members)
    { id: "C061", name: "Vũ Văn Anh", phone: "0934567061", email: "anh.vu@email.com", tier: "Bronze", points: 95, totalSpent: 160000, visits: 2, qrCode: "MEMBER-0934567061", createdAt: "2024-12-01" },
    { id: "C062", name: "Đỗ Thị Bé", phone: "0934567062", email: "be.do@email.com", tier: "Bronze", points: 88, totalSpent: 148000, visits: 2, qrCode: "MEMBER-0934567062", createdAt: "2024-12-02" },
    { id: "C063", name: "Lương Văn Cảnh", phone: "0934567063", email: "canh.luong@email.com", tier: "Bronze", points: 82, totalSpent: 138000, visits: 2, qrCode: "MEMBER-0934567063", createdAt: "2024-12-03" },
    { id: "C064", name: "Đinh Thị Diệu", phone: "0934567064", email: "dieu.dinh@email.com", tier: "Bronze", points: 75, totalSpent: 126000, visits: 2, qrCode: "MEMBER-0934567064", createdAt: "2024-12-04" },
    { id: "C065", name: "Cao Văn Được", phone: "0934567065", email: "duoc.cao@email.com", tier: "Bronze", points: 70, totalSpent: 118000, visits: 1, qrCode: "MEMBER-0934567065", createdAt: "2024-12-05" },
    { id: "C066", name: "Tô Thị Hà", phone: "0934567066", email: "ha.to@email.com", tier: "Bronze", points: 65, totalSpent: 110000, visits: 1, qrCode: "MEMBER-0934567066", createdAt: "2024-12-06" },
    { id: "C067", name: "Châu Văn Hòa", phone: "0934567067", email: "hoa.chau@email.com", tier: "Bronze", points: 60, totalSpent: 100000, visits: 1, qrCode: "MEMBER-0934567067", createdAt: "2024-12-07" },
    { id: "C068", name: "Hồ Thị Hương", phone: "0934567068", email: "huong.ho@email.com", tier: "Bronze", points: 55, totalSpent: 92000, visits: 1, qrCode: "MEMBER-0934567068", createdAt: "2024-12-08" },
    { id: "C069", name: "Kiều Văn Khánh", phone: "0934567069", email: "khanh.kieu@email.com", tier: "Bronze", points: 50, totalSpent: 85000, visits: 1, qrCode: "MEMBER-0934567069", createdAt: "2024-12-09" },
    { id: "C070", name: "Nguyễn Thị Liên", phone: "0934567070", email: "lien.nguyen@email.com", tier: "Bronze", points: 48, totalSpent: 80000, visits: 1, qrCode: "MEMBER-0934567070", createdAt: "2024-12-10" },
    { id: "C071", name: "Trần Văn Minh", phone: "0934567071", email: "minh.tran@email.com", tier: "Bronze", points: 45, totalSpent: 75000, visits: 1, qrCode: "MEMBER-0934567071", createdAt: "2024-12-11" },
    { id: "C072", name: "Lê Thị Na", phone: "0934567072", email: "na.le@email.com", tier: "Bronze", points: 42, totalSpent: 70000, visits: 1, qrCode: "MEMBER-0934567072", createdAt: "2024-12-12" },
    { id: "C073", name: "Phạm Văn Ơn", phone: "0934567073", email: "on.pham@email.com", tier: "Bronze", points: 40, totalSpent: 67000, visits: 1, qrCode: "MEMBER-0934567073", createdAt: "2024-12-13" },
    { id: "C074", name: "Hoàng Thị Phương", phone: "0934567074", email: "phuong.hoang@email.com", tier: "Bronze", points: 38, totalSpent: 64000, visits: 1, qrCode: "MEMBER-0934567074", createdAt: "2024-12-14" },
    { id: "C075", name: "Võ Văn Quang", phone: "0934567075", email: "quang.vo@email.com", tier: "Bronze", points: 35, totalSpent: 59000, visits: 1, qrCode: "MEMBER-0934567075", createdAt: "2024-12-15" },
    { id: "C076", name: "Đặng Thị Rồng", phone: "0934567076", email: "rong.dang@email.com", tier: "Bronze", points: 32, totalSpent: 54000, visits: 1, qrCode: "MEMBER-0934567076", createdAt: "2024-12-16" },
    { id: "C077", name: "Bùi Văn Sáng", phone: "0934567077", email: "sang.bui@email.com", tier: "Bronze", points: 30, totalSpent: 50000, visits: 1, qrCode: "MEMBER-0934567077", createdAt: "2024-12-17" },
    { id: "C078", name: "Ngô Thị Tú", phone: "0934567078", email: "tu.ngo@email.com", tier: "Bronze", points: 28, totalSpent: 47000, visits: 1, qrCode: "MEMBER-0934567078", createdAt: "2024-12-18" },
    { id: "C079", name: "Lý Văn Uy", phone: "0934567079", email: "uy2.ly@email.com", tier: "Bronze", points: 25, totalSpent: 42000, visits: 1, qrCode: "MEMBER-0934567079", createdAt: "2024-12-19" },
    { id: "C080", name: "Trương Thị Vui", phone: "0934567080", email: "vui.truong@email.com", tier: "Bronze", points: 22, totalSpent: 37000, visits: 1, qrCode: "MEMBER-0934567080", createdAt: "2024-12-20" },
    { id: "C081", name: "Mai Văn Xuân", phone: "0934567081", email: "xuan.mai@email.com", tier: "Bronze", points: 20, totalSpent: 34000, visits: 1, qrCode: "MEMBER-0934567081", createdAt: "2024-12-21" },
    { id: "C082", name: "Phan Thị Ý", phone: "0934567082", email: "y.phan@email.com", tier: "Bronze", points: 18, totalSpent: 30000, visits: 1, qrCode: "MEMBER-0934567082", createdAt: "2024-12-22" },
    { id: "C083", name: "Huỳnh Văn Bằng", phone: "0934567083", email: "bang.huynh@email.com", tier: "Bronze", points: 15, totalSpent: 25000, visits: 1, qrCode: "MEMBER-0934567083", createdAt: "2024-12-23" },
    { id: "C084", name: "Vũ Thị Cẩm", phone: "0934567084", email: "cam.vu@email.com", tier: "Bronze", points: 12, totalSpent: 20000, visits: 1, qrCode: "MEMBER-0934567084", createdAt: "2024-12-24" },
    { id: "C085", name: "Đỗ Văn Đức", phone: "0934567085", email: "duc.do@email.com", tier: "Bronze", points: 10, totalSpent: 17000, visits: 1, qrCode: "MEMBER-0934567085", createdAt: "2024-12-25" },
    { id: "C086", name: "Lương Thị Én", phone: "0934567086", email: "en.luong@email.com", tier: "Bronze", points: 8, totalSpent: 13000, visits: 1, qrCode: "MEMBER-0934567086", createdAt: "2024-12-25" },
    { id: "C087", name: "Đinh Văn Gấu", phone: "0934567087", email: "gau.dinh@email.com", tier: "Bronze", points: 5, totalSpent: 8500, visits: 1, qrCode: "MEMBER-0934567087", createdAt: "2024-12-26" },
    { id: "C088", name: "Cao Thị Hiền", phone: "0934567088", email: "hien.cao@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567088", createdAt: "2024-12-26" },
    { id: "C089", name: "Tô Văn Khải", phone: "0934567089", email: "khai.to@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567089", createdAt: "2024-12-26" },
    { id: "C090", name: "Châu Thị Lài", phone: "0934567090", email: "lai.chau@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567090", createdAt: "2024-12-26" },
    { id: "C091", name: "Hồ Văn Mây", phone: "0934567091", email: "may.ho@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567091", createdAt: "2024-12-26" },
    { id: "C092", name: "Kiều Thị Nở", phone: "0934567092", email: "no.kieu@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567092", createdAt: "2024-12-26" },
    { id: "C093", name: "Nguyễn Văn Phúc", phone: "0934567093", email: "phuc.nguyen@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567093", createdAt: "2024-12-26" },
    { id: "C094", name: "Trần Thị Qua", phone: "0934567094", email: "qua.tran@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567094", createdAt: "2024-12-26" },
    { id: "C095", name: "Lê Văn Rất", phone: "0934567095", email: "rat.le@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567095", createdAt: "2024-12-26" },
    { id: "C096", name: "Phạm Thị Sương", phone: "0934567096", email: "suong.pham@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567096", createdAt: "2024-12-26" },
    { id: "C097", name: "Hoàng Văn Tiến", phone: "0934567097", email: "tien.hoang@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567097", createdAt: "2024-12-26" },
    { id: "C098", name: "Võ Thị Út", phone: "0934567098", email: "ut.vo@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567098", createdAt: "2024-12-26" },
    { id: "C099", name: "Đặng Văn Vĩ", phone: "0934567099", email: "vi.dang@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567099", createdAt: "2024-12-26" },
    { id: "C100", name: "Bùi Thị Xuân", phone: "0934567100", email: "xuan.bui@email.com", tier: "Bronze", points: 0, totalSpent: 0, visits: 0, qrCode: "MEMBER-0934567100", createdAt: "2024-12-26" }
];

// Load sample customers to localStorage if not exists
if (!localStorage.getItem('fb_customers') || JSON.parse(localStorage.getItem('fb_customers')).length < 100) {
    localStorage.setItem('fb_customers', JSON.stringify(sampleCustomers));
    console.log('✅ Loaded 100 sample customers for promotions!');
}

// Ensure global access
window.menuItems = menuItems;
window.inventoryData = inventoryData;
window.recipesData = recipesData;
window.sopsData = sopsData;
window.sampleCustomers = sampleCustomers;

