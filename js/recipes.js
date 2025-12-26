// ========================================
// F&B MASTER - RECIPES MODULE (Linked with Menu)
// ========================================

const Recipes = {
    recipes: [],

    init() {
        this.loadRecipes();
        this.render();
        this.setupEventListeners();
    },

    loadRecipes() {
        const saved = storage.get('recipes_data');
        if (saved && saved.length > 0) {
            this.recipes = saved;
        } else {
            // Use sample data from data.js
            this.recipes = recipesData || [];
            this.saveRecipes();
        }
    },

    saveRecipes() {
        storage.set('recipes_data', this.recipes);
    },

    setupEventListeners() {
        document.getElementById('recipeSearch').addEventListener('input',
            debounce((e) => this.search(e.target.value), 300)
        );
        document.getElementById('addRecipeBtn').addEventListener('click', () => this.showAddRecipeModal());
    },

    render(data = null) {
        const grid = document.getElementById('recipesGrid');
        grid.innerHTML = '';

        const displayData = data || this.recipes;

        displayData.forEach(recipe => {
            const foodCost = calculateFoodCost(recipe.totalCost, recipe.sellingPrice);

            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <div class="recipe-image">${recipe.icon}</div>
                <div class="recipe-content">
                    <h3 class="recipe-name">${recipe.name}</h3>
                    ${recipe.menuItemId ? '<span class="linked-badge">🔗 Liên kết Menu</span>' : ''}
                    <div class="recipe-meta">
                        <span>🍽️ ${recipe.servings} phần</span>
                        <span>⏱️ ${recipe.prepTime}</span>
                        <span>📊 FC: ${foodCost}%</span>
                    </div>
                    <div class="recipe-cost">
                        <div>
                            <span class="recipe-cost-label">Chi phí NVL</span>
                            <div>${formatCurrency(recipe.totalCost)}</div>
                        </div>
                        <div style="text-align: right;">
                            <span class="recipe-cost-label">Giá bán</span>
                            <div class="recipe-cost-value">${formatCurrency(recipe.sellingPrice)}</div>
                        </div>
                    </div>
                    <div class="recipe-actions">
                        <button class="btn-secondary" onclick="Recipes.view(${recipe.id})">Chi tiết</button>
                        <button class="btn-primary" onclick="Recipes.edit(${recipe.id})">Sửa</button>
                        <button class="btn-danger-sm" onclick="Recipes.delete(${recipe.id})">🗑️</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        if (displayData.length === 0) {
            grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--text-muted);">Không tìm thấy công thức nào</div>';
        }
    },

    search(query) {
        const filtered = this.recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(query.toLowerCase())
        );
        this.render(filtered);
    },

    // Get menu items for dropdown
    getMenuOptions() {
        let menuList = [];

        // Try from MenuManagement first
        if (typeof MenuManagement !== 'undefined' && MenuManagement.masterMenu) {
            menuList = MenuManagement.masterMenu;
        } else if (typeof menuItems !== 'undefined') {
            menuList = menuItems;
        } else if (typeof ORIGINAL_MENU_DATA !== 'undefined') {
            menuList = ORIGINAL_MENU_DATA;
        }

        return menuList.map(item =>
            `<option value="${item.id}" data-name="${item.name}" data-price="${item.price}" data-icon="${item.icon}">${item.icon} ${item.name} - ${formatCurrency(item.price)}</option>`
        ).join('');
    },

    showAddRecipeModal() {
        const menuOptions = this.getMenuOptions();

        modal.open('Thêm công thức mới', `
            <div class="form-group">
                <label>Chọn món từ Menu (hoặc nhập mới)</label>
                <select id="recipeMenuItem" onchange="Recipes.onMenuItemSelect()">
                    <option value="">-- Chọn món từ menu --</option>
                    ${menuOptions}
                    <option value="custom">✏️ Nhập tên món mới...</option>
                </select>
            </div>
            <div class="form-group" id="customNameGroup" style="display:none;">
                <label>Tên món mới</label>
                <input type="text" id="recipeNameCustom" placeholder="VD: Bún bò đặc biệt">
            </div>
            <div class="form-group">
                <label>Icon</label>
                <input type="text" id="recipeIcon" value="🍽️" maxlength="4">
            </div>
            <div class="form-group">
                <label>Số phần</label>
                <input type="number" id="recipeServings" value="1" min="1">
            </div>
            <div class="form-group">
                <label>Thời gian chuẩn bị</label>
                <input type="text" id="recipePrepTime" value="15 phút">
            </div>
            <hr style="border-color: var(--border-color); margin: 1rem 0;">
            <h4 style="margin-bottom: 1rem;">Nguyên liệu</h4>
            <div id="recipeIngredients">
                <div class="ingredient-row">
                    <input type="text" placeholder="Tên NL" class="ing-name">
                    <input type="number" placeholder="SL" class="ing-amount">
                    <input type="text" placeholder="ĐVT" class="ing-unit" value="g">
                    <input type="number" placeholder="Giá" class="ing-cost">
                    <button class="remove-ingredient" onclick="this.parentElement.remove()">×</button>
                </div>
            </div>
            <button class="btn-secondary" onclick="Recipes.addIngredientRow()" style="margin-top: 0.5rem;">+ Thêm NL</button>
            <hr style="border-color: var(--border-color); margin: 1rem 0;">
            <div class="form-group">
                <label>Giá bán</label>
                <input type="number" id="recipeSellingPrice" placeholder="VD: 50000" min="0">
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="Recipes.createRecipe()">Lưu công thức</button>
        `);
    },

    onMenuItemSelect() {
        const select = document.getElementById('recipeMenuItem');
        const customGroup = document.getElementById('customNameGroup');
        const iconInput = document.getElementById('recipeIcon');
        const priceInput = document.getElementById('recipeSellingPrice');

        if (select.value === 'custom') {
            customGroup.style.display = 'block';
        } else if (select.value) {
            customGroup.style.display = 'none';
            const option = select.options[select.selectedIndex];
            iconInput.value = option.dataset.icon || '🍽️';
            priceInput.value = option.dataset.price || '';
        } else {
            customGroup.style.display = 'none';
        }
    },

    addIngredientRow() {
        const container = document.getElementById('recipeIngredients');
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <input type="text" placeholder="Tên NL" class="ing-name">
            <input type="number" placeholder="SL" class="ing-amount">
            <input type="text" placeholder="ĐVT" class="ing-unit" value="g">
            <input type="number" placeholder="Giá" class="ing-cost">
            <button class="remove-ingredient" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(row);
    },

    createRecipe() {
        const select = document.getElementById('recipeMenuItem');
        let name, menuItemId = null;

        if (select.value === 'custom') {
            name = document.getElementById('recipeNameCustom').value.trim();
        } else if (select.value) {
            const option = select.options[select.selectedIndex];
            name = option.dataset.name;
            menuItemId = select.value;
        } else {
            toast.warning('Vui lòng chọn món từ menu hoặc nhập tên mới');
            return;
        }

        if (!name) {
            toast.warning('Vui lòng nhập tên món');
            return;
        }

        const icon = document.getElementById('recipeIcon').value || '🍽️';
        const servings = parseInt(document.getElementById('recipeServings').value) || 1;
        const prepTime = document.getElementById('recipePrepTime').value || '15 phút';
        const sellingPrice = parseInt(document.getElementById('recipeSellingPrice').value) || 0;

        // Collect ingredients
        const ingredients = [];
        let totalCost = 0;
        document.querySelectorAll('#recipeIngredients .ingredient-row').forEach(row => {
            const ingName = row.querySelector('.ing-name').value.trim();
            const amount = parseFloat(row.querySelector('.ing-amount').value) || 0;
            const unit = row.querySelector('.ing-unit').value || 'g';
            const cost = parseInt(row.querySelector('.ing-cost').value) || 0;

            if (ingName) {
                ingredients.push({ name: ingName, amount, unit, cost });
                totalCost += cost;
            }
        });

        if (ingredients.length === 0) {
            toast.warning('Vui lòng thêm ít nhất 1 nguyên liệu');
            return;
        }

        const newRecipe = {
            id: Date.now(),
            name,
            icon,
            servings,
            prepTime,
            ingredients,
            totalCost,
            sellingPrice,
            menuItemId
        };

        this.recipes.push(newRecipe);
        this.saveRecipes();

        // Update menu item cost if linked
        if (menuItemId) {
            this.updateMenuItemCost(menuItemId, totalCost, sellingPrice);
        }

        modal.close();
        this.render();
        toast.success(`Đã thêm công thức "${name}"`);
    },

    updateMenuItemCost(menuItemId, cost, price) {
        if (typeof MenuManagement !== 'undefined' && MenuManagement.masterMenu) {
            const item = MenuManagement.masterMenu.find(m => m.id === menuItemId || m.id === String(menuItemId));
            if (item) {
                item.cost = cost;
                if (price > 0) item.price = price;
                MenuManagement.saveMasterMenu();
                toast.info(`Đã cập nhật giá vốn cho "${item.name}"`);
            }
        }
    },

    view(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const ingredientsList = recipe.ingredients.map(ing =>
            `<tr>
                <td>${ing.name}</td>
                <td>${ing.amount} ${ing.unit}</td>
                <td>${formatCurrency(ing.cost)}</td>
            </tr>`
        ).join('');

        modal.open(recipe.name, `
            <div style="text-align: center; margin-bottom: 1rem;">
                <span style="font-size: 4rem;">${recipe.icon}</span>
            </div>
            ${recipe.menuItemId ? '<div style="text-align:center;margin-bottom:1rem;"><span class="linked-badge">🔗 Liên kết với Menu</span></div>' : ''}
            <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; color: var(--text-muted);">
                <span>🍽️ ${recipe.servings} phần</span>
                <span>⏱️ ${recipe.prepTime}</span>
            </div>
            <h4 style="margin-bottom: 0.75rem;">Nguyên liệu:</h4>
            <table class="data-table" style="margin-bottom: 1rem;">
                <thead>
                    <tr>
                        <th>Nguyên liệu</th>
                        <th>Định mức</th>
                        <th>Chi phí</th>
                    </tr>
                </thead>
                <tbody>${ingredientsList}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><strong>Tổng chi phí NVL</strong></td>
                        <td><strong>${formatCurrency(recipe.totalCost)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            <div style="display: flex; justify-content: space-between; padding: 1rem; background: var(--bg-hover); border-radius: var(--border-radius);">
                <div>
                    <div style="color: var(--text-muted); font-size: 0.85rem;">Giá bán</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--secondary);">${formatCurrency(recipe.sellingPrice)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--text-muted); font-size: 0.85rem;">Food Cost</div>
                    <div style="font-size: 1.25rem; font-weight: 700;">${calculateFoodCost(recipe.totalCost, recipe.sellingPrice)}%</div>
                </div>
            </div>
        `, `<button class="btn-primary" onclick="modal.close()">Đóng</button>`);
    },

    edit(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        modal.open('Sửa công thức - ' + recipe.name, `
            <div class="form-group">
                <label>Giá bán</label>
                <input type="number" id="editPrice" value="${recipe.sellingPrice}" min="0" step="1000">
            </div>
            <div class="form-group">
                <label>Thời gian chuẩn bị</label>
                <input type="text" id="editPrepTime" value="${recipe.prepTime}">
            </div>
        `, `
            <button class="btn-secondary" onclick="modal.close()">Hủy</button>
            <button class="btn-primary" onclick="Recipes.saveEdit(${recipeId})">Lưu</button>
        `);
    },

    saveEdit(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const newPrice = parseInt(document.getElementById('editPrice').value) || recipe.sellingPrice;
        const newPrepTime = document.getElementById('editPrepTime').value || recipe.prepTime;

        recipe.sellingPrice = newPrice;
        recipe.prepTime = newPrepTime;
        this.saveRecipes();

        // Update linked menu item
        if (recipe.menuItemId) {
            this.updateMenuItemCost(recipe.menuItemId, recipe.totalCost, newPrice);
        }

        modal.close();
        this.render();
        toast.success('Đã cập nhật công thức');
    },

    delete(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        if (confirm(`Xóa công thức "${recipe.name}"?`)) {
            this.recipes = this.recipes.filter(r => r.id !== recipeId);
            this.saveRecipes();
            this.render();
            toast.info('Đã xóa công thức');
        }
    }
};

window.Recipes = Recipes;
