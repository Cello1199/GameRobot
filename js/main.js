// Main Entry Point for Grid Inventory System

class GridInventoryApp {
    constructor() {
        this.gridManager = new GridManager('gridCanvas');
        this.rotationManager = new RotationManager();
        this.placementManager = new PlacementManager(this.gridManager);
        this.synergyManager = new SynergyManager(this.gridManager);
        this.expansionManager = new ExpansionManager(this.gridManager);
        this.autoFitManager = new AutoFitManager(
            this.gridManager,
            this.placementManager,
            this.synergyManager,
            this.rotationManager
        );
        this.uiManager = new UIManager(this);
        this.touchManager = new TouchManager(this.gridManager);

        this.init();
    }

    init() {
        // Initialize UI
        this.uiManager.init();

        // Initialize touch controls
        this.touchManager.init();

        // Add some test parts to inventory
        this.addTestParts();

        // Debug panel toggle
        const toggleDebug = document.getElementById('toggleDebug');
        if (toggleDebug) {
            toggleDebug.addEventListener('click', () => {
                const panel = document.getElementById('debugPanel');
                panel.classList.toggle('hidden');
                toggleDebug.textContent = panel.classList.contains('hidden') ? 'Show Debug' : 'Hide Debug';
            });
        }

        console.log('Grid Inventory System initialized');
    }

    addTestParts() {
        // Add some test parts for demonstration
        const testParts = [
            'basicSensor',
            'lightArmor',
            'basicManipulator',
            'standardLegs',
            'smallBattery',
            'advancedOptics',
            'reinforcedPlate',
            'laserEmitter',
            'energyCore',
            'sprintLegs',
            'shieldGenerator'
        ];

        testParts.forEach(partId => {
            const part = createPart(partId);
            if (part) {
                this.uiManager.addPartToInventory(part);
            }
        });
    }

    // API for external use
    equipPart(part, bodyPart, gridX, gridY) {
        this.gridManager.switchBodyPart(bodyPart);
        return this.gridManager.placePart(part, gridX, gridY);
    }

    removePart(part) {
        return this.gridManager.removePart(part);
    }

    getTotalStats() {
        return this.gridManager.getTotalStats();
    }

    applyExpansion(expansionId) {
        return this.expansionManager.applyExpansion(expansionId);
    }

    saveState() {
        const state = {
            placedParts: {},
            unlockedExpansions: this.expansionManager.unlockedExpansions,
            inventoryParts: this.uiManager.inventoryParts.map(p => ({
                partId: p.partId,
                rotation: p.rotation
            }))
        };

        for (let bodyPart in this.gridManager.placedParts) {
            state.placedParts[bodyPart] = this.gridManager.placedParts[bodyPart].map(part => ({
                partId: part.partId,
                rotation: part.rotation,
                gridX: part.gridX,
                gridY: part.gridY
            }));
        }

        return JSON.stringify(state);
    }

    loadState(stateJson) {
        try {
            const state = JSON.parse(stateJson);

            // Clear current state
            for (let bodyPart in this.gridManager.placedParts) {
                this.gridManager.placedParts[bodyPart] = [];
            }
            this.uiManager.inventoryParts = [];

            // Restore expansions
            state.unlockedExpansions.forEach(expId => {
                this.expansionManager.applyExpansion(expId);
            });

            // Restore placed parts
            for (let bodyPart in state.placedParts) {
                this.gridManager.switchBodyPart(bodyPart);

                state.placedParts[bodyPart].forEach(partData => {
                    const part = createPart(partData.partId, partData.rotation);
                    if (part) {
                        this.gridManager.placePart(part, partData.gridX, partData.gridY);
                    }
                });
            }

            // Restore inventory
            state.inventoryParts.forEach(partData => {
                const part = createPart(partData.partId, partData.rotation);
                if (part) {
                    this.uiManager.addPartToInventory(part);
                }
            });

            this.uiManager.updateOverview();
            return true;
        } catch (e) {
            console.error('Failed to load state:', e);
            return false;
        }
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    window.gridInventoryApp = new GridInventoryApp();
});
