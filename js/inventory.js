// Inventory System - Manages part collection, equipment, and combinations

class Inventory {
    constructor() {
        this.parts = []; // All collected parts
        this.equipped = {
            head: null,
            torso: null,
            leftArm: null,
            rightArm: null,
            legs: null,
            back: null
        };
        this.comboSlots = [null, null, null];
        this.isOpen = false;
        this.currentFilter = 'all';
    }

    addPart(part) {
        this.parts.push(part);
        this.updateUI();
        return part;
    }

    removePart(partId) {
        const index = this.parts.findIndex(p => p.id === partId);
        if (index !== -1) {
            this.parts.splice(index, 1);
            this.updateUI();
            return true;
        }
        return false;
    }

    equipPart(partId) {
        const part = this.parts.find(p => p.id === partId);
        if (!part) return false;

        const slot = part.type;

        // Unequip old part if exists
        if (this.equipped[slot]) {
            // Part goes back to inventory (already there)
        }

        // Equip new part
        this.equipped[slot] = part;
        this.updateUI();
        return true;
    }

    unequipPart(slot) {
        if (this.equipped[slot]) {
            this.equipped[slot] = null;
            this.updateUI();
            return true;
        }
        return false;
    }

    getEquippedStats() {
        const stats = {
            hp: 50,          // Base human stats
            armor: 0,
            damage: 5,
            range: 30,
            speed: 3,
            jump: 10,
            vision: 10,
            special: 0
        };

        // Add stats from equipped parts
        for (let slot in this.equipped) {
            const part = this.equipped[slot];
            if (part && part.stats) {
                for (let stat in part.stats) {
                    if (typeof part.stats[stat] === 'number' && typeof stats[stat] === 'number') {
                        stats[stat] += part.stats[stat];
                    } else if (part.stats[stat] === true) {
                        // Boolean abilities
                        stats[stat] = true;
                    }
                }
            }
        }

        return stats;
    }

    getEquippedCount() {
        return Object.values(this.equipped).filter(p => p !== null).length;
    }

    clearTemporaryParts() {
        // Remove all temporary parts
        this.parts = this.parts.filter(p => p.isPermanent);

        // Unequip temporary parts
        for (let slot in this.equipped) {
            if (this.equipped[slot] && !this.equipped[slot].isPermanent) {
                this.equipped[slot] = null;
            }
        }

        this.updateUI();
    }

    // Combination methods
    addToComboSlot(partId, slotIndex) {
        if (slotIndex < 0 || slotIndex > 2) return false;

        const part = this.parts.find(p => p.id === partId);
        if (!part) return false;

        this.comboSlots[slotIndex] = part;
        this.updateComboUI();
        return true;
    }

    clearComboSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 2) {
            this.comboSlots[slotIndex] = null;
            this.updateComboUI();
        }
    }

    clearAllComboSlots() {
        this.comboSlots = [null, null, null];
        this.updateComboUI();
    }

    tryCombine() {
        const filledSlots = this.comboSlots.filter(p => p !== null);
        if (filledSlots.length < 2) {
            return { success: false, message: 'Mindestens 2 Teile benötigt!' };
        }

        const result = PartsManager.tryCombine(filledSlots);

        if (!result) {
            return { success: false, message: 'Keine gültige Kombination!' };
        }

        // Remove used parts from inventory
        filledSlots.forEach(part => {
            this.removePart(part.id);
            // Also unequip if equipped
            for (let slot in this.equipped) {
                if (this.equipped[slot] && this.equipped[slot].id === part.id) {
                    this.equipped[slot] = null;
                }
            }
        });

        // Add result to inventory
        this.addPart(result);
        this.clearAllComboSlots();

        return { success: true, message: `${result.name} erstellt!`, part: result };
    }

    // UI Methods
    open() {
        this.isOpen = true;
        document.getElementById('inventoryScreen').style.display = 'flex';
        this.updateUI();
    }

    close() {
        this.isOpen = false;
        document.getElementById('inventoryScreen').style.display = 'none';
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    updateUI() {
        this.updateEquippedUI();
        this.updateInventoryGridUI();
        this.updateStatsUI();
    }

    updateEquippedUI() {
        for (let slot in this.equipped) {
            const element = document.getElementById(`equip-${slot}`);
            if (element) {
                const part = this.equipped[slot];
                if (part) {
                    element.innerHTML = `
                        <div class="inventory-item ${part.rarity}" style="border-width: 2px; padding: 5px;">
                            <strong>${part.name}</strong>
                        </div>
                    `;
                    element.onclick = () => this.unequipPart(slot);
                } else {
                    element.innerHTML = '<span style="color: #666;">Leer</span>';
                    element.onclick = null;
                }
            }
        }
    }

    updateInventoryGridUI() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        // Filter parts
        let filteredParts = this.parts;
        if (this.currentFilter === 'temporary') {
            filteredParts = this.parts.filter(p => !p.isPermanent);
        } else if (this.currentFilter === 'permanent') {
            filteredParts = this.parts.filter(p => p.isPermanent);
        }

        // Filter out parts that are already placed in grid system
        if (window.gridInventoryManager && window.gridInventoryManager.gridManager) {
            filteredParts = filteredParts.filter(part => {
                const isInGrid = Object.values(window.gridInventoryManager.gridManager.placedParts)
                    .some(bodyParts => bodyParts.some(p => p.id === part.id));
                return !isInGrid;
            });
        }

        grid.innerHTML = '';

        filteredParts.forEach(part => {
            const div = document.createElement('div');
            div.className = `inventory-item ${part.rarity} ${part.isPermanent ? 'permanent' : 'temporary'}`;
            div.style.position = 'relative';
            div.innerHTML = `
                <strong>${part.name}</strong><br>
                <small>${this.getPartTypeLabel(part.type)}</small>
            `;

            div.onclick = () => {
                if (!this.isPartEquipped(part.id)) {
                    this.equipPart(part.id);
                }
            };

            // Add long-press for adding to combo
            let pressTimer;
            div.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    this.addPartToFirstEmptyComboSlot(part.id);
                }, 500);
            });
            div.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });

            grid.appendChild(div);
        });

        if (filteredParts.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Keine Teile</p>';
        }
    }

    updateStatsUI() {
        // Update HUD
        const stats = this.getEquippedStats();
        document.getElementById('partsValue').textContent = `${this.getEquippedCount()}/6`;
    }

    updateComboUI() {
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`combo-slot-${i + 1}`);
            if (slot) {
                const part = this.comboSlots[i];
                if (part) {
                    slot.innerHTML = `<strong>${part.name}</strong>`;
                    slot.style.borderColor = part.getRarityColor();
                    slot.onclick = () => this.clearComboSlot(i);
                } else {
                    slot.innerHTML = '+';
                    slot.style.borderColor = '#00ffff';
                    slot.onclick = null;
                }
            }
        }

        // Update combine button
        const combineBtn = document.getElementById('combineBtn');
        const filledCount = this.comboSlots.filter(p => p !== null).length;
        combineBtn.disabled = filledCount < 2;

        // Preview result
        if (filledCount >= 2) {
            const preview = PartsManager.tryCombine(this.comboSlots.filter(p => p !== null));
            const resultDiv = document.getElementById('combo-result');
            if (preview) {
                resultDiv.innerHTML = `<strong>${preview.name}</strong>`;
                resultDiv.style.borderColor = preview.getRarityColor ? preview.getRarityColor() : '#00ff88';
            } else {
                resultDiv.innerHTML = '?';
                resultDiv.style.borderColor = '#666';
            }
        } else {
            document.getElementById('combo-result').innerHTML = '?';
        }
    }

    addPartToFirstEmptyComboSlot(partId) {
        for (let i = 0; i < 3; i++) {
            if (this.comboSlots[i] === null) {
                this.addToComboSlot(partId, i);
                return true;
            }
        }
        return false;
    }

    isPartEquipped(partId) {
        return Object.values(this.equipped).some(p => p && p.id === partId);
    }

    getPartTypeLabel(type) {
        const labels = {
            head: 'Kopf',
            torso: 'Torso',
            leftArm: 'L-Arm',
            rightArm: 'R-Arm',
            legs: 'Beine',
            back: 'Rücken'
        };
        return labels[type] || type;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.updateInventoryGridUI();

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }
}

// Initialize inventory UI events
function initInventoryUI(inventory) {
    // Close button
    document.getElementById('closeInventory').onclick = () => inventory.close();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        // Skip grid view button (handled by grid-integration.js)
        if (btn.id === 'gridViewBtn') return;
        btn.onclick = () => inventory.setFilter(btn.dataset.filter);
    });

    // Combine button
    document.getElementById('combineBtn').onclick = () => {
        const result = inventory.tryCombine();
        alert(result.message);
    };

    // Initialize grid inventory system
    if (typeof initGridInventory === 'function') {
        initGridInventory(inventory);
    }
}
