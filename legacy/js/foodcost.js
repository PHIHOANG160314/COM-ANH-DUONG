// ========================================
// F&B MASTER - FOOD COST MODULE
// ========================================

const FoodCost = {
    ingredients: [],

    init() {
        this.setupEventListeners();
        this.addIngredientRow();
    },

    setupEventListeners() {
        document.getElementById('addIngredientBtn').addEventListener('click', () => this.addIngredientRow());
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculate());
        document.getElementById('saveRecipeBtn').addEventListener('click', () => this.saveRecipe());
    },

    addIngredientRow() {
        const container = document.getElementById('ingredientsList');
        const rowId = Date.now();

        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.dataset.id = rowId;
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        row.style.marginBottom = '8px';

        row.innerHTML = `
            <md-outlined-text-field placeholder="Tên nguyên liệu" class="ing-name" style="flex: 2;"></md-outlined-text-field>
            <md-outlined-text-field placeholder="SL" type="number" class="ing-amount" min="0" step="0.1" style="flex: 1;"></md-outlined-text-field>
            <md-outlined-text-field placeholder="Đơn vị" class="ing-unit" value="g" style="flex: 1;"></md-outlined-text-field>
            <md-outlined-text-field placeholder="Đơn giá" type="number" class="ing-price" min="0" style="flex: 1;"></md-outlined-text-field>
            <md-icon-button class="remove-ingredient" onclick="FoodCost.removeIngredientRow(${rowId})">
                <md-icon>close</md-icon>
            </md-icon-button>
        `;

        container.appendChild(row);
    },

    removeIngredientRow(rowId) {
        const row = document.querySelector(`.ingredient-row[data-id="${rowId}"]`);
        if (row) row.remove();
    },

    getIngredients() {
        const rows = document.querySelectorAll('.ingredient-row');
        const ingredients = [];

        rows.forEach(row => {
            const name = row.querySelector('.ing-name').value.trim();
            const amount = parseFloat(row.querySelector('.ing-amount').value) || 0;
            const unit = row.querySelector('.ing-unit').value.trim();
            const price = parseFloat(row.querySelector('.ing-price').value) || 0;

            if (name && amount > 0) {
                ingredients.push({
                    name,
                    amount,
                    unit,
                    price,
                    cost: amount * price
                });
            }
        });

        return ingredients;
    },

    calculate() {
        const dishName = document.getElementById('dishName').value.trim();
        const targetFoodCost = parseFloat(document.getElementById('targetFoodCost').value) || 30;
        const ingredients = this.getIngredients();

        if (!dishName) {
            toast.warning('Vui lòng nhập tên món');
            return;
        }

        if (ingredients.length === 0) {
            toast.warning('Vui lòng thêm nguyên liệu');
            return;
        }

        const totalCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0);
        const suggestedPrice = calculateSuggestedPrice(totalCost, targetFoodCost);
        const actualFoodCost = calculateFoodCost(totalCost, suggestedPrice);
        const grossProfit = suggestedPrice - totalCost;

        document.getElementById('totalCost').textContent = formatCurrency(totalCost);
        document.getElementById('suggestedPrice').textContent = formatCurrency(suggestedPrice);
        document.getElementById('actualFoodCost').textContent = actualFoodCost + '%';
        document.getElementById('grossProfit').textContent = formatCurrency(grossProfit);

        this.currentRecipe = {
            name: dishName,
            ingredients,
            totalCost,
            sellingPrice: suggestedPrice,
            foodCostPercent: actualFoodCost
        };

        toast.success('Đã tính toán xong!');
    },

    saveRecipe() {
        if (!this.currentRecipe) {
            toast.warning('Vui lòng tính toán trước khi lưu');
            return;
        }

        const recipe = {
            id: Date.now(),
            name: this.currentRecipe.name,
            icon: '🍽️',
            servings: 1,
            prepTime: '15 phút',
            ingredients: this.currentRecipe.ingredients,
            totalCost: this.currentRecipe.totalCost,
            sellingPrice: this.currentRecipe.sellingPrice
        };

        recipesData.push(recipe);

        // Also add to menu
        const newMenuItem = {
            id: menuItems.length + 1,
            name: recipe.name,
            price: recipe.sellingPrice,
            category: 'food',
            icon: '🍽️',
            cost: recipe.totalCost
        };
        menuItems.push(newMenuItem);

        toast.success(`Đã lưu công thức "${recipe.name}"`);
        this.reset();

        // Refresh recipes
        if (Recipes) Recipes.render();
    },

    reset() {
        document.getElementById('dishName').value = '';
        document.getElementById('ingredientsList').innerHTML = '';
        document.getElementById('totalCost').textContent = '0đ';
        document.getElementById('suggestedPrice').textContent = '0đ';
        document.getElementById('actualFoodCost').textContent = '0%';
        document.getElementById('grossProfit').textContent = '0đ';
        this.currentRecipe = null;
        this.addIngredientRow();
    }
};

window.FoodCost = FoodCost;
