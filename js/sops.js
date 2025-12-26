// ========================================
// F&B MASTER - SOPS MODULE
// ========================================

const SOPs = {
    currentSOP: 'opening',
    completedItems: {},

    init() {
        this.loadState();
        this.render();
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.querySelectorAll('.sop-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.sop-cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSOP = e.target.dataset.sop;
                this.render();
            });
        });

        document.getElementById('resetSopBtn').addEventListener('click', () => this.reset());
        document.getElementById('completeSopBtn').addEventListener('click', () => this.completeAll());
    },

    loadState() {
        const saved = storage.get('sop_state');
        if (saved) {
            this.completedItems = saved;
        }
    },

    saveState() {
        storage.set('sop_state', this.completedItems);
    },

    render() {
        const sop = sopsData[this.currentSOP];
        if (!sop) return;

        document.getElementById('sopTitle').textContent = sop.title;

        const checklist = document.getElementById('sopChecklist');
        checklist.innerHTML = '';

        const sopKey = this.currentSOP;
        if (!this.completedItems[sopKey]) {
            this.completedItems[sopKey] = [];
        }

        sop.items.forEach(item => {
            const isCompleted = this.completedItems[sopKey].includes(item.id);

            const itemEl = document.createElement('div');
            itemEl.className = `sop-item ${isCompleted ? 'completed' : ''}`;
            itemEl.innerHTML = `
                <div class="sop-checkbox"></div>
                <span class="sop-text">${item.text}</span>
                ${item.time ? `<span class="sop-time">${item.time}</span>` : ''}
            `;

            itemEl.addEventListener('click', () => this.toggleItem(item.id));
            checklist.appendChild(itemEl);
        });

        this.updateProgress();
    },

    toggleItem(itemId) {
        const sopKey = this.currentSOP;

        if (this.completedItems[sopKey].includes(itemId)) {
            this.completedItems[sopKey] = this.completedItems[sopKey].filter(id => id !== itemId);
        } else {
            this.completedItems[sopKey].push(itemId);
        }

        this.saveState();
        this.render();
    },

    updateProgress() {
        const sop = sopsData[this.currentSOP];
        const sopKey = this.currentSOP;
        const totalItems = sop.items.length;
        const completedCount = this.completedItems[sopKey]?.length || 0;
        const percentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

        document.getElementById('sopProgress').textContent = `${completedCount}/${totalItems}`;
        document.getElementById('sopProgressBar').style.width = `${percentage}%`;
    },

    reset() {
        if (confirm('Reset tất cả checklist của SOP này?')) {
            this.completedItems[this.currentSOP] = [];
            this.saveState();
            this.render();
            toast.info('Đã reset checklist');
        }
    },

    completeAll() {
        const sop = sopsData[this.currentSOP];
        const sopKey = this.currentSOP;

        this.completedItems[sopKey] = sop.items.map(item => item.id);
        this.saveState();
        this.render();

        toast.success(`Hoàn thành ${sop.title}!`);
    }
};

window.SOPs = SOPs;
