// ========================================
// F&B MASTER - MENU HIERARCHY
// 4-Level F&B Standard Structure
// ========================================

const MenuHierarchy = {
    // ========================================
    // LEVEL 1: MENU GROUPS
    // ========================================
    groups: [
        { id: 'beverages', name: 'Đồ Uống', icon: '🥤', order: 1 },
        { id: 'food', name: 'Thức Ăn', icon: '🍜', order: 2 },
        { id: 'dessert', name: 'Tráng Miệng', icon: '🍰', order: 3 },
        { id: 'combo', name: 'Combo', icon: '🎁', order: 4 }
    ],

    // ========================================
    // LEVEL 2: CATEGORIES (per Group)
    // ========================================
    categories: {
        beverages: [
            { id: 'coffee', name: 'Cà Phê', icon: '☕', order: 1 },
            { id: 'milk-tea', name: 'Trà Sữa', icon: '🧋', order: 2 },
            { id: 'fruit-tea', name: 'Trà Trái Cây', icon: '🍑', order: 3 },
            { id: 'smoothie', name: 'Sinh Tố', icon: '🥤', order: 4 },
            { id: 'refresh', name: 'Giải Khát', icon: '🧊', order: 5 }
        ],
        food: [
            { id: 'noodle', name: 'Phở & Bún', icon: '🍜', order: 1 },
            { id: 'rice', name: 'Cơm', icon: '🍚', order: 2 },
            { id: 'bread', name: 'Bánh Mì', icon: '🥖', order: 3 },
            { id: 'snack', name: 'Ăn Vặt', icon: '🍟', order: 4 },
            { id: 'homemade', name: 'Món Nhà', icon: '🥘', order: 5 }
        ],
        dessert: [
            { id: 'che', name: 'Chè', icon: '🍧', order: 1 },
            { id: 'sweet', name: 'Kem & Bánh', icon: '🍮', order: 2 }
        ],
        combo: [
            { id: 'combo-lunch', name: 'Combo Trưa', icon: '🍱', order: 1 },
            { id: 'combo-drink', name: 'Combo Uống', icon: '🥤', order: 2 },
            { id: 'combo-family', name: 'Combo Gia Đình', icon: '👨‍👩‍👧‍👦', order: 3 }
        ]
    },

    // ========================================
    // LEVEL 3: SUBCATEGORIES (per Category)
    // ========================================
    subcategories: {
        // Beverages subcategories
        coffee: [
            { id: 'coffee-black', name: 'Đen', icon: '☕' },
            { id: 'coffee-milk', name: 'Sữa', icon: '🥛' },
            { id: 'coffee-special', name: 'Đặc biệt', icon: '✨' }
        ],
        'milk-tea': [
            { id: 'tea-classic', name: 'Truyền thống', icon: '🧋' },
            { id: 'tea-thai', name: 'Thái', icon: '🇹🇭' },
            { id: 'tea-premium', name: 'Premium', icon: '⭐' }
        ],
        'fruit-tea': [
            { id: 'tea-peach', name: 'Đào', icon: '🍑' },
            { id: 'tea-lychee', name: 'Vải', icon: '🌸' },
            { id: 'tea-lemon', name: 'Chanh', icon: '🍋' }
        ],
        smoothie: [
            { id: 'smoothie-avocado', name: 'Bơ', icon: '🥑' },
            { id: 'smoothie-fruit', name: 'Trái cây', icon: '🍓' },
            { id: 'smoothie-blend', name: 'Đá xay', icon: '🧊' }
        ],
        refresh: [
            { id: 'refresh-juice', name: 'Nước ép', icon: '🍊' },
            { id: 'refresh-soda', name: 'Soda', icon: '🥤' },
            { id: 'refresh-traditional', name: 'Truyền thống', icon: '🌿' }
        ],
        // Food subcategories
        noodle: [
            { id: 'pho', name: 'Phở', icon: '🍲' },
            { id: 'bun', name: 'Bún', icon: '🍜' },
            { id: 'hu-tieu', name: 'Hủ Tiếu', icon: '🥣' },
            { id: 'mi', name: 'Mì', icon: '🍝' }
        ],
        rice: [
            { id: 'rice-grilled', name: 'Nướng', icon: '🔥' },
            { id: 'rice-fried', name: 'Chiên', icon: '🍳' },
            { id: 'rice-broken', name: 'Tấm', icon: '🍚' }
        ],
        bread: [
            { id: 'bread-meat', name: 'Thịt', icon: '🥖' },
            { id: 'bread-egg', name: 'Trứng', icon: '🍳' },
            { id: 'bread-special', name: 'Đặc biệt', icon: '🥘' }
        ],
        snack: [
            { id: 'snack-fried', name: 'Chiên', icon: '🍟' },
            { id: 'snack-grilled', name: 'Nướng', icon: '🔥' },
            { id: 'snack-mixed', name: 'Trộn', icon: '🥗' }
        ],
        homemade: [
            { id: 'home-meat', name: 'Thịt', icon: '🥩' },
            { id: 'home-fish', name: 'Cá', icon: '🐟' },
            { id: 'home-soup', name: 'Canh', icon: '🥣' }
        ],
        // Dessert subcategories
        che: [
            { id: 'che-traditional', name: 'Truyền thống', icon: '🍧' },
            { id: 'che-modern', name: 'Hiện đại', icon: '🥤' }
        ],
        sweet: [
            { id: 'sweet-ice', name: 'Kem', icon: '🍨' },
            { id: 'sweet-cake', name: 'Bánh', icon: '🍰' },
            { id: 'sweet-fruit', name: 'Trái cây', icon: '🍉' }
        ]
    },

    // ========================================
    // LEVEL 4: SIZE & OPTIONS
    // ========================================
    sizes: {
        beverages: [
            { id: 'S', name: 'Nhỏ (S)', priceModifier: 0 },
            { id: 'M', name: 'Vừa (M)', priceModifier: 5000 },
            { id: 'L', name: 'Lớn (L)', priceModifier: 10000 }
        ],
        food: [
            { id: 'regular', name: 'Thường', priceModifier: 0 },
            { id: 'large', name: 'Đặc biệt', priceModifier: 15000 }
        ]
    },

    options: {
        beverages: [
            { id: 'ice', name: 'Đá', values: ['Bình thường', 'Ít đá', 'Không đá'], default: 'Bình thường' },
            { id: 'sugar', name: 'Đường', values: ['100%', '70%', '50%', '30%', '0%'], default: '100%' },
            { id: 'temp', name: 'Nhiệt độ', values: ['Đá', 'Nóng'], default: 'Đá' },
            { id: 'topping', name: 'Topping', values: ['Không', 'Trân châu', 'Thạch', 'Pudding'], default: 'Không', priceModifier: 5000 }
        ],
        food: [
            { id: 'spicy', name: 'Cay', values: ['Không cay', 'Ít cay', 'Cay vừa', 'Cay nhiều'], default: 'Không cay' },
            { id: 'extra', name: 'Thêm', values: ['Không', 'Thêm thịt (+15k)', 'Thêm trứng (+5k)', 'Thêm rau (+3k)'], default: 'Không' }
        ],
        dessert: [
            { id: 'topping', name: 'Topping', values: ['Không', 'Thêm đá', 'Thêm sữa'], default: 'Không' }
        ]
    },

    // ========================================
    // COMBO DEFINITIONS
    // ========================================
    combos: [
        {
            id: 'combo-1',
            name: 'Combo Sáng Vui Vẻ',
            description: 'Phở + Cà Phê Sữa',
            items: [51, 2],
            originalPrice: 75000,
            comboPrice: 65000,
            savings: 10000,
            category: 'combo-lunch',
            icon: '🌅',
            popular: true
        },
        {
            id: 'combo-2',
            name: 'Combo Trưa Năng Lượng',
            description: 'Cơm sườn + Trà đào',
            items: [66, 22],
            originalPrice: 80000,
            comboPrice: 70000,
            savings: 10000,
            category: 'combo-lunch',
            icon: '☀️',
            popular: true
        },
        {
            id: 'combo-3',
            name: 'Combo Đôi Bạn',
            description: '2 Trà sữa + 1 Khoai chiên',
            items: [16, 16, 81],
            originalPrice: 90000,
            comboPrice: 75000,
            savings: 15000,
            category: 'combo-drink',
            icon: '👫'
        },
        {
            id: 'combo-4',
            name: 'Combo Gia Đình',
            description: '3 Phở + 3 Nước',
            items: [51, 52, 53, 2, 22, 36],
            originalPrice: 230000,
            comboPrice: 199000,
            savings: 31000,
            category: 'combo-family',
            icon: '👨‍👩‍👧‍👦',
            popular: true
        },
        {
            id: 'combo-5',
            name: 'Combo Cà Phê Sáng',
            description: 'Bánh mì + Cà phê sữa',
            items: [73, 2],
            originalPrice: 50000,
            comboPrice: 42000,
            savings: 8000,
            category: 'combo-lunch',
            icon: '☕'
        },
        {
            id: 'combo-6',
            name: 'Combo Sinh Tố Khỏe',
            description: '2 Sinh tố bơ',
            items: [36, 36],
            originalPrice: 80000,
            comboPrice: 70000,
            savings: 10000,
            category: 'combo-drink',
            icon: '🥑'
        },
        {
            id: 'combo-7',
            name: 'Combo Bún Bò Party',
            description: '4 Bún bò + 4 Nước',
            items: [55, 55, 55, 55, 9, 9, 9, 9],
            originalPrice: 300000,
            comboPrice: 250000,
            savings: 50000,
            category: 'combo-family',
            icon: '🎉'
        },
        {
            id: 'combo-8',
            name: 'Combo Tráng Miệng',
            description: 'Chè Thái + Bánh Flan',
            items: [90, 95],
            originalPrice: 40000,
            comboPrice: 35000,
            savings: 5000,
            category: 'combo-drink',
            icon: '🍮'
        }
    ],

    // ========================================
    // HELPER METHODS
    // ========================================

    // Get all groups
    getGroups() {
        return this.groups.sort((a, b) => a.order - b.order);
    },

    // Get categories for a group
    getCategories(groupId) {
        return this.categories[groupId] || [];
    },

    // Get subcategories for a category
    getSubcategories(categoryId) {
        return this.subcategories[categoryId] || [];
    },

    // Get sizes for a group
    getSizes(groupId) {
        return this.sizes[groupId] || [];
    },

    // Get options for a group
    getOptions(groupId) {
        return this.options[groupId] || [];
    },

    // Map legacy category to new group
    mapCategoryToGroup(category) {
        const mapping = {
            'drinks': 'beverages',
            'food': 'food',
            'dessert': 'dessert'
        };
        return mapping[category] || category;
    },

    // Get items filtered by hierarchy
    getFilteredItems(items, { group, category, subcategory } = {}) {
        let filtered = [...items];

        if (group && group !== 'all') {
            // Map group to legacy category
            const legacyCategory = group === 'beverages' ? 'drinks' : group;
            filtered = filtered.filter(item => item.category === legacyCategory);
        }

        if (category && category !== 'all') {
            filtered = filtered.filter(item => item.subcategory === category);
        }

        if (subcategory && subcategory !== 'all') {
            // For future subcategory filtering
            filtered = filtered.filter(item =>
                item.subcategory === subcategory ||
                (item.tags && item.tags.includes(subcategory))
            );
        }

        return filtered;
    },

    // Get combos by category
    getCombosByCategory(categoryId) {
        if (!categoryId || categoryId === 'all') {
            return this.combos;
        }
        return this.combos.filter(c => c.category === categoryId);
    },

    // Calculate combo price with items
    getComboDetails(comboId, menuItems) {
        const combo = this.combos.find(c => c.id === comboId);
        if (!combo) return null;

        const items = combo.items.map(itemId =>
            menuItems.find(m => m.id === itemId)
        ).filter(Boolean);

        return {
            ...combo,
            itemDetails: items
        };
    }
};

// Export
window.MenuHierarchy = MenuHierarchy;
