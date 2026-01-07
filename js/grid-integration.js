// Grid System Integration - Connects grid-based inventory to main game

class GridInventoryManager {
    constructor(inventory) {
        this.inventory = inventory;
        this.gridManager = null;
        this.placementManager = null;
        this.synergyManager = null;
        this.rotationManager = null;
        this.autoFitManager = null;
        this.uiManager = null;

        this.currentBodyPart = null;
        this.isGridViewActive = false;

        this.init();
    }

    init() {
        // Initialize grid managers
        this.gridManager = new GridManager('bodyGridCanvas');
        this.rotationManager = new RotationManager();
        this.placementManager = new PlacementManager(this.gridManager);
        this.synergyManager = new SynergyManager(this.gridManager);
        this.autoFitManager = new AutoFitManager(
            this.gridManager,
            this.placementManager,
            this.synergyManager,
            this.rotationManager
        );
        this.touchManager = new TouchManager(this.gridManager);
        this.touchManager.init();

        // Add context menu for removing parts
        this.setupPartRemoval();

        this.setupEventHandlers();
    }

    setupPartRemoval() {
        const canvas = this.gridManager.canvas;

        // Right-click to remove part
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const gridPos = this.gridManager.canvasToGrid(e.clientX, e.clientY);
            if (gridPos) {
                const part = this.gridManager.isSlotOccupied(gridPos.x, gridPos.y);
                if (part) {
                    this.gridManager.removePart(part);
                    this.updateAllGridFills();
                    this.updateAvailableParts();
                    this.updateSynergies();
                    this.inventory.updateUI(); // Update classic view
                }
            }
        });

        // Long press to remove part (mobile)
        let longPressTimer;
        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            longPressTimer = setTimeout(() => {
                const gridPos = this.gridManager.canvasToGrid(touch.clientX, touch.clientY);
                if (gridPos) {
                    const part = this.gridManager.isSlotOccupied(gridPos.x, gridPos.y);
                    if (part) {
                        // Vibrate if available
                        if (navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                        this.gridManager.removePart(part);
                        this.updateAllGridFills();
                        this.updateAvailableParts();
                        this.updateSynergies();
                        this.inventory.updateUI();
                    }
                }
            }, 500); // 500ms long press
        });

        canvas.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        canvas.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    setupEventHandlers() {
        // Grid View Button - toggle between old and grid view
        const gridViewBtn = document.getElementById('gridViewBtn');
        if (gridViewBtn) {
            gridViewBtn.onclick = () => this.toggleGridView();
        }

        // Body Part Buttons - select which grid to view
        document.querySelectorAll('.body-grid-btn').forEach(btn => {
            btn.onclick = () => {
                const bodyPart = btn.dataset.bodypart;
                this.showBodyPartGrid(bodyPart);
            };
        });

        // Back to Overview Button
        const backBtn = document.getElementById('backToBodyBtn');
        if (backBtn) {
            backBtn.onclick = () => this.showBodyOverview();
        }

        // Rotate Part Button
        const rotateBtn = document.getElementById('rotatePartBtn');
        if (rotateBtn) {
            rotateBtn.onclick = () => this.rotatePart();
        }

        // Auto-Fit Button
        const autoFitBtn = document.getElementById('autoFitGridBtn');
        if (autoFitBtn) {
            autoFitBtn.onclick = () => this.autoFitParts();
        }
    }

    toggleGridView() {
        this.isGridViewActive = !this.isGridViewActive;

        const oldView = document.getElementById('oldInventoryView');
        const gridView = document.getElementById('gridInventoryView');
        const gridViewBtn = document.getElementById('gridViewBtn');

        if (this.isGridViewActive) {
            // Show grid view
            oldView.style.display = 'none';
            gridView.style.display = 'block';
            gridViewBtn.textContent = '📦 KLASSISCH';

            // Show body overview
            this.showBodyOverview();

            // Update grid fills
            this.updateAllGridFills();
        } else {
            // Show old view
            oldView.style.display = 'block';
            gridView.style.display = 'none';
            gridViewBtn.textContent = '🎮 GRID-ANSICHT';

            // Update classic inventory to reflect grid changes
            this.inventory.updateUI();
        }
    }

    showBodyOverview() {
        document.getElementById('bodyOverview').style.display = 'block';
        document.getElementById('gridDetailView').style.display = 'none';
        this.currentBodyPart = null;

        this.updateAllGridFills();
    }

    showBodyPartGrid(bodyPart) {
        this.currentBodyPart = bodyPart;

        // Hide overview, show detail
        document.getElementById('bodyOverview').style.display = 'none';
        document.getElementById('gridDetailView').style.display = 'flex';

        // Update title
        const bodyPartNames = {
            head: 'KOPF',
            torso: 'TORSO',
            leftArm: 'LINKER ARM',
            rightArm: 'RECHTER ARM',
            legs: 'BEINE',
            back: 'RÜCKEN'
        };
        const titleElement = document.getElementById('currentBodyPartTitle');
        if (titleElement) {
            titleElement.textContent = bodyPartNames[bodyPart] + ' GRID' || bodyPart.toUpperCase();
        }

        // Switch grid manager to this body part
        this.gridManager.switchBodyPart(bodyPart);

        // Render the grid
        this.gridManager.render();

        // Update synergies
        this.updateSynergies();

        // Update available parts list
        this.updateAvailableParts();
    }

    updateAllGridFills() {
        for (let bodyPart in BODY_GRIDS) {
            const fillElement = document.getElementById(`grid-fill-${bodyPart}`);
            if (fillElement) {
                const occupied = this.gridManager.placedParts[bodyPart]
                    .reduce((sum, part) => sum + part.getSize(), 0);
                const total = BODY_GRIDS[bodyPart].currentGrid.width *
                             BODY_GRIDS[bodyPart].currentGrid.height;
                fillElement.textContent = `${occupied}/${total}`;
            }
        }
    }

    updateSynergies() {
        this.synergyManager.calculateSynergies();
        const synergies = this.synergyManager.getActiveSynergies();

        const synergyList = document.getElementById('activeSynergiesList');
        if (!synergyList) return;

        synergyList.innerHTML = '';

        if (synergies.length === 0) {
            synergyList.innerHTML = '<p style="color: #666; padding: 10px;">Keine aktiven Synergien</p>';
            return;
        }

        synergies.forEach(synergy => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 8px; margin: 4px 0; background: rgba(0,255,255,0.1); border-left: 3px solid #00ffff;';
            div.innerHTML = `
                <span style="font-size: 16px; margin-right: 8px;">${synergy.rule.icon}</span>
                <span style="font-size: 12px;">${this.synergyManager.formatSynergyDescription(synergy)}</span>
            `;
            synergyList.appendChild(div);
        });
    }

    updateAvailableParts() {
        const partsList = document.getElementById('gridPartsList');
        if (!partsList) return;

        // Get unequipped parts from inventory that match current body part
        const availableParts = this.inventory.parts.filter(part => {
            // Check if part is not already in any grid
            const isInGrid = Object.values(this.gridManager.placedParts)
                .some(bodyParts => bodyParts.some(p => p.id === part.id));
            return !isInGrid;
        });

        partsList.innerHTML = '';

        if (availableParts.length === 0) {
            partsList.innerHTML = '<p style="color: #666; padding: 10px;">Keine verfügbaren Teile</p>';
            return;
        }

        availableParts.forEach(part => {
            const div = document.createElement('div');
            div.className = `inventory-item ${part.rarity}`;
            div.style.cssText = 'margin: 4px; padding: 8px; cursor: pointer; border: 2px solid;';
            div.innerHTML = `
                <strong>${part.name}</strong><br>
                <small>${part.size || 'Shape: ' + part.gridShape}</small>
            `;

            div.onclick = () => {
                this.gridManager.selectedPart = part;
                // Highlight selected
                document.querySelectorAll('#gridPartsList .inventory-item').forEach(el => {
                    el.style.opacity = '0.5';
                });
                div.style.opacity = '1.0';
                div.style.borderColor = part.getRarityColor();
            };

            partsList.appendChild(div);
        });
    }

    rotatePart() {
        if (this.gridManager.selectedPart) {
            this.rotationManager.rotatePart(this.gridManager.selectedPart);
            this.gridManager.render();
        }
    }

    autoFitParts() {
        // Get all available parts
        const availableParts = this.inventory.parts.filter(part => {
            const isInGrid = Object.values(this.gridManager.placedParts)
                .some(bodyParts => bodyParts.some(p => p.id === part.id));
            return !isInGrid;
        });

        if (availableParts.length === 0) {
            alert('Keine Teile zum Platzieren verfügbar!');
            return;
        }

        // Try to fit all parts across all body areas
        let totalPlaced = 0;
        let totalSynergies = 0;

        for (let bodyPart in BODY_GRIDS) {
            this.gridManager.switchBodyPart(bodyPart);

            const results = this.autoFitManager.autoFitAll(availableParts);
            totalPlaced += results.placed.length;
            totalSynergies += results.synergies;

            // Remove successfully placed parts from available list
            results.placed.forEach(placedPart => {
                const index = availableParts.findIndex(p => p.id === placedPart.id);
                if (index !== -1) {
                    availableParts.splice(index, 1);
                }
            });
        }

        // Return to current body part
        if (this.currentBodyPart) {
            this.gridManager.switchBodyPart(this.currentBodyPart);
            this.gridManager.render();
        }

        this.updateAllGridFills();
        this.updateSynergies();
        this.updateAvailableParts();

        alert(`Auto-Fit abgeschlossen!\n\n${totalPlaced} Teile platziert\n${totalSynergies} Synergien aktiv`);
    }

    // Get total stats from grid system
    getTotalStats() {
        return this.gridManager.getTotalStats();
    }

    // Sync equipped parts from old inventory to grid
    syncFromOldInventory() {
        // This can be called to migrate old equipped parts to grid system
        for (let slot in this.inventory.equipped) {
            const part = this.inventory.equipped[slot];
            if (part) {
                // Try to place in corresponding grid
                this.gridManager.switchBodyPart(slot);
                this.placementManager.autoPlacePart(part, this.rotationManager);
            }
        }
    }
}

// Initialize grid inventory when page loads
function initGridInventory(inventory) {
    window.gridInventoryManager = new GridInventoryManager(inventory);
}
