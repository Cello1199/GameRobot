// Grid Expansion System - Unlock additional grid slots

const GRID_EXPANSIONS = {
    headExpansion_S: {
        id: 'headExpansion_S',
        target: 'head',
        adds: { width: 1, height: 0 },
        source: 'Boss Level 1',
        description: 'Kopf-Grid +1 Spalte'
    },
    headExpansion_M: {
        id: 'headExpansion_M',
        target: 'head',
        adds: { width: 1, height: 2 },
        source: 'Boss Level 2',
        description: 'Kopf-Grid +1 Spalte, +2 Reihen'
    },
    torsoExpansion_S: {
        id: 'torsoExpansion_S',
        target: 'torso',
        adds: { width: 1, height: 0 },
        source: 'Boss Level 1',
        description: 'Torso-Grid +1 Spalte'
    },
    torsoExpansion_M: {
        id: 'torsoExpansion_M',
        target: 'torso',
        adds: { width: 1, height: 1 },
        source: 'Boss Level 3',
        description: 'Torso-Grid +1 Spalte, +1 Reihe'
    },
    armExpansion_Dual: {
        id: 'armExpansion_Dual',
        target: ['leftArm', 'rightArm'],
        adds: { width: 0, height: 2 },
        source: 'Secret Level 5',
        description: 'Beide Arm-Grids +2 Reihen'
    },
    backExpansion_L: {
        id: 'backExpansion_L',
        target: 'back',
        adds: { width: 2, height: 2 },
        source: 'Boss Level 3',
        description: 'Rücken-Grid +2 Spalten, +2 Reihen'
    },
    legsExpansion_M: {
        id: 'legsExpansion_M',
        target: 'legs',
        adds: { width: 2, height: 1 },
        source: 'Boss Level 2',
        description: 'Bein-Grid +2 Spalten, +1 Reihe'
    }
};

class ExpansionManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.unlockedExpansions = [];
    }

    // Apply an expansion to a body part grid
    applyExpansion(expansionId) {
        const expansion = GRID_EXPANSIONS[expansionId];
        if (!expansion) {
            console.error('Expansion not found:', expansionId);
            return false;
        }

        // Check if already unlocked
        if (this.unlockedExpansions.includes(expansionId)) {
            console.warn('Expansion already unlocked:', expansionId);
            return false;
        }

        // Get target body parts
        const targets = Array.isArray(expansion.target) ? expansion.target : [expansion.target];

        // Apply to each target
        for (let target of targets) {
            const gridConfig = BODY_GRIDS[target];
            if (!gridConfig) continue;

            // Calculate new grid size
            const newWidth = Math.min(
                gridConfig.currentGrid.width + expansion.adds.width,
                gridConfig.maxGrid.width
            );
            const newHeight = Math.min(
                gridConfig.currentGrid.height + expansion.adds.height,
                gridConfig.maxGrid.height
            );

            // Apply expansion
            gridConfig.currentGrid.width = newWidth;
            gridConfig.currentGrid.height = newHeight;
        }

        // Mark as unlocked
        this.unlockedExpansions.push(expansionId);

        // If viewing an affected grid, update display
        if (targets.includes(this.gridManager.currentBodyPart)) {
            this.gridManager.updateCanvasSize();
            this.gridManager.render();
        }

        return true;
    }

    // Get available expansions for a body part
    getAvailableExpansions(bodyPart) {
        return Object.keys(GRID_EXPANSIONS).filter(key => {
            const exp = GRID_EXPANSIONS[key];
            const targets = Array.isArray(exp.target) ? exp.target : [exp.target];
            return targets.includes(bodyPart) && !this.unlockedExpansions.includes(key);
        }).map(key => GRID_EXPANSIONS[key]);
    }

    // Check if grid can be expanded further
    canExpand(bodyPart) {
        const gridConfig = BODY_GRIDS[bodyPart];
        if (!gridConfig) return false;

        return gridConfig.currentGrid.width < gridConfig.maxGrid.width ||
               gridConfig.currentGrid.height < gridConfig.maxGrid.height;
    }

    // Get expansion progress
    getExpansionProgress(bodyPart) {
        const gridConfig = BODY_GRIDS[bodyPart];
        if (!gridConfig) return { current: 0, max: 0, percent: 0 };

        const currentSlots = gridConfig.currentGrid.width * gridConfig.currentGrid.height;
        const maxSlots = gridConfig.maxGrid.width * gridConfig.maxGrid.height;

        return {
            current: currentSlots,
            max: maxSlots,
            percent: (currentSlots / maxSlots) * 100
        };
    }
}
