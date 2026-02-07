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
                        <md-outlined-button onclick="Recipes.view(${recipe.id})">Chi tiết</md-outlined-button>
                        <md-filled-button onclick="Recipes.edit(${recipe.id})">Sửa</md-filled-button>
                        <md-icon-button class="btn-danger-sm" onclick="Recipes.delete(${recipe.id})" style="color:var(--error);">
                            <md-icon>delete</md-icon>
                        </md-icon-button>
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
            `<md-select-option value="${item.id}" data-name="${item.name}" data-price="${item.price}" data-icon="${item.icon}">
                <div slot="headline">${item.icon} ${item.name} - ${formatCurrency(item.price)}</div>
             </md-select-option>`
        ).join('');
    },

    showAddRecipeModal() {
        const menuOptions = this.getMenuOptions();

        modal.open('Thêm công thức mới', `
            <div class="form-group">
                <md-outlined-select label="Chọn món từ Menu" id="recipeMenuItem" onchange="Recipes.onMenuItemSelect()">
                    <md-select-option value=""><div slot="headline">-- Chọn món từ menu --</div></md-select-option>
                    ${menuOptions}
                    <md-select-option value="custom"><div slot="headline">✏️ Nhập tên món mới...</div></md-select-option>
                </md-outlined-select>
            </div>
            <div class="form-group" id="customNameGroup" style="display:none;">
                <md-outlined-text-field label="Tên món mới" id="recipeNameCustom" placeholder="VD: Bún bò đặc biệt"></md-outlined-text-field>
            </div>
            <div class="form-group">
                <md-outlined-text-field label="Icon" id="recipeIcon" value="🍽️" maxlength="4"></md-outlined-text-field>
            </div>
            <div class="form-group">
                <md-outlined-text-field label="Số phần" type="number" id="recipeServings" value="1" min="1"></md-outlined-text-field>
            </div>
            <div class="form-group">
                <md-outlined-text-field label="Thời gian chuẩn bị" id="recipePrepTime" value="15 phút"></md-outlined-text-field>
            </div>
            <hr style="border-color: var(--border-color); margin: 1rem 0;">
            <h4 style="margin-bottom: 1rem;">Nguyên liệu</h4>
            <div id="recipeIngredients">
                <div class="ingredient-row" style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
                    <md-outlined-text-field placeholder="Tên NL" class="ing-name" style="flex:2"></md-outlined-text-field>
                    <md-outlined-text-field placeholder="SL" type="number" class="ing-amount" style="flex:1"></md-outlined-text-field>
                    <md-outlined-text-field placeholder="ĐVT" class="ing-unit" value="g" style="flex:1"></md-outlined-text-field>
                    <md-outlined-text-field placeholder="Giá" type="number" class="ing-cost" style="flex:1"></md-outlined-text-field>
                    <md-icon-button class="remove-ingredient" onclick="this.parentElement.remove()"><md-icon>close</md-icon></md-icon-button>
                </div>
            </div>
            <md-text-button onclick="Recipes.addIngredientRow()" style="margin-top: 0.5rem;">+ Thêm NL</md-text-button>
            <hr style="border-color: var(--border-color); margin: 1rem 0;">
            <div class="form-group">
                <md-outlined-text-field label="Giá bán" type="number" id="recipeSellingPrice" placeholder="VD: 50000" min="0"></md-outlined-text-field>
            </div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="Recipes.createRecipe()">Lưu công thức</md-filled-button>
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
        row.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
        row.innerHTML = `
            <md-outlined-text-field placeholder="Tên NL" class="ing-name" style="flex:2"></md-outlined-text-field>
            <md-outlined-text-field placeholder="SL" type="number" class="ing-amount" style="flex:1"></md-outlined-text-field>
            <md-outlined-text-field placeholder="ĐVT" class="ing-unit" value="g" style="flex:1"></md-outlined-text-field>
            <md-outlined-text-field placeholder="Giá" type="number" class="ing-cost" style="flex:1"></md-outlined-text-field>
            <md-icon-button class="remove-ingredient" onclick="this.parentElement.remove()"><md-icon>close</md-icon></md-icon-button>
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
            <div style="display: flex; justify-content: space-between; padding: 1rem; background: var(--surface-container); border-radius: 8px;">
                <div>
                    <div style="color: var(--text-muted); font-size: 0.85rem;">Giá bán</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--secondary);">${formatCurrency(recipe.sellingPrice)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--text-muted); font-size: 0.85rem;">Food Cost</div>
                    <div style="font-size: 1.25rem; font-weight: 700;">${calculateFoodCost(recipe.totalCost, recipe.sellingPrice)}%</div>
                </div>
            </div>
        `, `<md-filled-button onclick="modal.close()">Đóng</md-filled-button>`);
    },

    edit(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        modal.open('Sửa công thức - ' + recipe.name, `
            <div class="form-group">
                <md-outlined-text-field label="Giá bán" type="number" id="editPrice" value="${recipe.sellingPrice}" min="0" step="1000"></md-outlined-text-field>
            </div>
            <div class="form-group">
                <md-outlined-text-field label="Thời gian chuẩn bị" id="editPrepTime" value="${recipe.prepTime}"></md-outlined-text-field>
            </div>
        `, `
            <md-outlined-button onclick="modal.close()">Hủy</md-outlined-button>
            <md-filled-button onclick="Recipes.saveEdit(${recipeId})">Lưu</md-filled-button>
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
