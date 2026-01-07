// UI Manager - Handle all UI interactions
class UIManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'overview'; // 'overview' or 'grid'
        this.inventoryParts = []; // Parts not yet equipped
    }

    init() {
        // Body part buttons
        document.querySelectorAll('.body-part-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bodyPart = btn.dataset.part;
                this.showGridView(bodyPart);
            });
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showOverview();
        });

        // Rotate button
        document.getElementById('rotateBtn').addEventListener('click', () => {
            if (this.app.gridManager.selectedPart) {
                this.app.rotationManager.rotatePart(this.app.gridManager.selectedPart);
                this.app.gridManager.render();
            }
        });

        // Remove part button
        document.getElementById('removePartBtn').addEventListener('click', () => {
            const gridPos = this.app.gridManager.hoveredSlot;
            if (gridPos) {
                const part = this.app.gridManager.getPartAtPosition(gridPos.x, gridPos.y);
                if (part) {
                    this.app.gridManager.removePart(part);
                    this.inventoryParts.push(part);
                    this.updateInventoryUI();
                }
            }
        });

        // Auto-fit button
        document.getElementById('autoFitBtn').addEventListener('click', () => {
            this.autoFitAll();
        });

        this.updateOverview();
        this.updateInventoryUI();
    }

    showOverview() {
        document.getElementById('bodyOverview').style.display = 'block';
        document.getElementById('gridView').style.display = 'none';
        this.currentView = 'overview';
        document.getElementById('headerTitle').textContent = 'AUSRÜSTUNG';
        this.updateOverview();
    }

    showGridView(bodyPart) {
        document.getElementById('bodyOverview').style.display = 'none';
        document.getElementById('gridView').style.display = 'flex';
        this.currentView = 'grid';

        this.app.gridManager.switchBodyPart(bodyPart);
        document.getElementById('gridTitle').textContent = `${BODY_GRIDS[bodyPart].name.toUpperCase()} GRID`;
        document.getElementById('headerTitle').textContent = BODY_GRIDS[bodyPart].name.toUpperCase();

        this.updateSynergies();
    }

    updateOverview() {
        // Update fill indicators for each body part
        for (let bodyPart in BODY_GRIDS) {
            const fillElement = document.querySelector(`[data-fill="${bodyPart}"]`);
            if (fillElement) {
                const occupied = this.app.gridManager.placedParts[bodyPart]
                    .reduce((sum, part) => sum + part.getSize(), 0);
                const total = BODY_GRIDS[bodyPart].currentGrid.width *
                             BODY_GRIDS[bodyPart].currentGrid.height;
                fillElement.textContent = `${occupied}/${total}`;
            }
        }

        // Update total stats
        this.updateTotalStats();
    }

    updateTotalStats() {
        const stats = this.app.gridManager.getTotalStats();

        const updateStat = (id, value, max = 100) => {
            const element = document.getElementById(id);
            if (element) {
                const percent = Math.min((value / max) * 100, 100);
                element.style.width = percent + '%';
                element.textContent = Math.floor(value);
            }
        };

        updateStat('stat-hp', stats.hp || 0, 200);
        updateStat('stat-damage', stats.damage || 0, 100);
        updateStat('stat-armor', stats.armor || 0, 50);
        updateStat('stat-speed', stats.speed || 0, 20);
    }

    updateSynergies() {
        this.app.synergyManager.calculateSynergies();
        const synergies = this.app.synergyManager.getActiveSynergies();

        const synergyList = document.getElementById('synergyList');
        synergyList.innerHTML = '';

        if (synergies.length === 0) {
            synergyList.innerHTML = '<p style="color: #666;">Keine aktiven Synergien</p>';
            return;
        }

        synergies.forEach(synergy => {
            const div = document.createElement('div');
            div.className = 'synergy-item';
            div.innerHTML = `
                <span class="synergy-icon">${synergy.rule.icon}</span>
                <span>${this.app.synergyManager.formatSynergyDescription(synergy)}</span>
            `;
            synergyList.appendChild(div);
        });
    }

    updateInventoryUI() {
        const grid = document.getElementById('inventoryGrid');
        grid.innerHTML = '';

        this.inventoryParts.forEach(part => {
            const div = document.createElement('div');
            div.className = `inventory-item ${part.rarity}`;
            div.innerHTML = `
                <div class="item-shape-preview"></div>
                <div class="item-name">${part.name}</div>
                <div class="item-size">${part.size}</div>
            `;

            div.addEventListener('click', () => {
                this.app.gridManager.selectedPart = part;
                document.querySelectorAll('.inventory-item').forEach(el =>
                    el.classList.remove('selected'));
                div.classList.add('selected');
            });

            grid.appendChild(div);
        });
    }

    autoFitAll() {
        const results = this.app.autoFitManager.autoFitAll(this.inventoryParts);

        // Remove placed parts from inventory
        this.inventoryParts = results.failed;

        this.updateInventoryUI();
        this.updateOverview();
        this.updateSynergies();

        this.showNotification(`${results.placed.length} Teile platziert, ${results.synergies} Synergien aktiv!`);
    }

    showNotification(message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('toastMessage');

        toast.className = `toast ${type}`;
        toastMessage.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    addPartToInventory(part) {
        this.inventoryParts.push(part);
        this.updateInventoryUI();
    }
}
