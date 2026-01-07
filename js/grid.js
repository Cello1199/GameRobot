// Grid System - Core grid rendering and management

// Body Part Grid Definitions
const BODY_GRIDS = {
    head: {
        name: 'Kopf',
        baseGrid: { width: 2, height: 2 },
        maxGrid: { width: 4, height: 4 },
        currentGrid: { width: 2, height: 2 },
        affects: ['vision', 'targeting', 'special_ability']
    },
    torso: {
        name: 'Torso',
        baseGrid: { width: 3, height: 3 },
        maxGrid: { width: 5, height: 5 },
        currentGrid: { width: 3, height: 3 },
        affects: ['hp', 'armor', 'energy_capacity']
    },
    leftArm: {
        name: 'Linker Arm',
        baseGrid: { width: 2, height: 3 },
        maxGrid: { width: 3, height: 5 },
        currentGrid: { width: 2, height: 3 },
        affects: ['block', 'secondary_attack', 'utility']
    },
    rightArm: {
        name: 'Rechter Arm',
        baseGrid: { width: 2, height: 3 },
        maxGrid: { width: 3, height: 5 },
        currentGrid: { width: 2, height: 3 },
        affects: ['primary_attack', 'damage', 'range']
    },
    back: {
        name: 'Rücken',
        baseGrid: { width: 2, height: 4 },
        maxGrid: { width: 4, height: 6 },
        currentGrid: { width: 2, height: 4 },
        affects: ['mobility_special', 'shield', 'support_systems']
    },
    legs: {
        name: 'Beine',
        baseGrid: { width: 3, height: 2 },
        maxGrid: { width: 5, height: 4 },
        currentGrid: { width: 3, height: 2 },
        affects: ['speed', 'jump_height', 'stability']
    }
};

class GridManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.currentBodyPart = 'torso'; // Default view
        this.gridConfig = BODY_GRIDS[this.currentBodyPart];

        this.slotSize = 50; // Pixels per grid slot
        this.slotGap = 2;   // Pixels between slots
        this.padding = 20;   // Canvas padding

        this.placedParts = {}; // Parts placed in each body part grid
        this.selectedPart = null; // Part being dragged/selected
        this.hoveredSlot = null; // Grid position under mouse/touch

        // Initialize placed parts storage for each body part
        for (let bodyPart in BODY_GRIDS) {
            this.placedParts[bodyPart] = [];
        }

        this.initCanvas();
    }

    initCanvas() {
        this.updateCanvasSize();
        this.render();
    }

    updateCanvasSize() {
        const grid = this.gridConfig.currentGrid;
        const canvasWidth = (grid.width * this.slotSize) +
                           ((grid.width - 1) * this.slotGap) +
                           (this.padding * 2);
        const canvasHeight = (grid.height * this.slotSize) +
                            ((grid.height - 1) * this.slotGap) +
                            (this.padding * 2);

        // Set canvas size (accounting for device pixel ratio)
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = canvasWidth * dpr;
        this.canvas.height = canvasHeight * dpr;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';

        this.ctx.scale(dpr, dpr);
    }

    switchBodyPart(bodyPart) {
        if (!BODY_GRIDS[bodyPart]) {
            console.error('Invalid body part:', bodyPart);
            return;
        }

        this.currentBodyPart = bodyPart;
        this.gridConfig = BODY_GRIDS[bodyPart];
        this.selectedPart = null;
        this.hoveredSlot = null;

        this.updateCanvasSize();
        this.render();
    }

    // Convert canvas coordinates to grid coordinates
    canvasToGrid(canvasX, canvasY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = canvasX - rect.left;
        const y = canvasY - rect.top;

        const gridX = Math.floor((x - this.padding) / (this.slotSize + this.slotGap));
        const gridY = Math.floor((y - this.padding) / (this.slotSize + this.slotGap));

        const grid = this.gridConfig.currentGrid;
        if (gridX >= 0 && gridX < grid.width && gridY >= 0 && gridY < grid.height) {
            return { x: gridX, y: gridY };
        }

        return null;
    }

    // Convert grid coordinates to canvas coordinates
    gridToCanvas(gridX, gridY) {
        const x = this.padding + (gridX * (this.slotSize + this.slotGap));
        const y = this.padding + (gridY * (this.slotSize + this.slotGap));
        return { x, y };
    }

    // Check if a slot is available (not locked)
    isSlotAvailable(gridX, gridY) {
        const grid = this.gridConfig.currentGrid;
        const maxGrid = this.gridConfig.maxGrid;

        // Check if within current grid
        if (gridX < 0 || gridX >= grid.width || gridY < 0 || gridY >= grid.height) {
            return false;
        }

        // Check if slot is locked (beyond current expansion)
        return true; // For now, all slots in currentGrid are available
    }

    // Check if a slot is occupied by a part
    isSlotOccupied(gridX, gridY) {
        const parts = this.placedParts[this.currentBodyPart];

        for (let part of parts) {
            const shape = part.shape;
            for (let sy = 0; sy < shape.length; sy++) {
                for (let sx = 0; sx < shape[sy].length; sx++) {
                    if (shape[sy][sx] === 1) {
                        const partX = part.gridX + sx;
                        const partY = part.gridY + sy;
                        if (partX === gridX && partY === gridY) {
                            return part;
                        }
                    }
                }
            }
        }

        return null;
    }

    // Get part at specific grid position
    getPartAtPosition(gridX, gridY) {
        return this.isSlotOccupied(gridX, gridY);
    }

    // Place a part in the grid
    placePart(part, gridX, gridY) {
        if (!this.canPlacePart(part, gridX, gridY)) {
            return false;
        }

        part.gridX = gridX;
        part.gridY = gridY;
        part.bodyPart = this.currentBodyPart;

        this.placedParts[this.currentBodyPart].push(part);
        this.render();

        return true;
    }

    // Check if part can be placed at position
    canPlacePart(part, gridX, gridY, ignorePart = null) {
        const shape = part.shape;
        const grid = this.gridConfig.currentGrid;

        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx] === 1) {
                    const checkX = gridX + sx;
                    const checkY = gridY + sy;

                    // Check bounds
                    if (checkX < 0 || checkX >= grid.width ||
                        checkY < 0 || checkY >= grid.height) {
                        return false;
                    }

                    // Check if slot is available
                    if (!this.isSlotAvailable(checkX, checkY)) {
                        return false;
                    }

                    // Check if occupied by another part
                    const occupyingPart = this.isSlotOccupied(checkX, checkY);
                    if (occupyingPart && occupyingPart !== ignorePart) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // Remove a part from the grid
    removePart(part) {
        const bodyPart = part.bodyPart || this.currentBodyPart;
        const parts = this.placedParts[bodyPart];
        const index = parts.indexOf(part);

        if (index !== -1) {
            parts.splice(index, 1);
            part.gridX = null;
            part.gridY = null;
            part.bodyPart = null;
            this.render();
            return true;
        }

        return false;
    }

    // Calculate occupied slots
    getOccupiedSlots() {
        const parts = this.placedParts[this.currentBodyPart];
        let count = 0;

        for (let part of parts) {
            count += part.getSize();
        }

        return count;
    }

    // Calculate total available slots
    getTotalSlots() {
        const grid = this.gridConfig.currentGrid;
        return grid.width * grid.height;
    }

    // Render the grid
    render() {
        const ctx = this.ctx;
        const grid = this.gridConfig.currentGrid;
        const maxGrid = this.gridConfig.maxGrid;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid slots
        for (let y = 0; y < maxGrid.height; y++) {
            for (let x = 0; x < maxGrid.width; x++) {
                const pos = this.gridToCanvas(x, y);
                const isAvailable = x < grid.width && y < grid.height;
                const isOccupied = isAvailable && this.isSlotOccupied(x, y);
                const isHovered = this.hoveredSlot && this.hoveredSlot.x === x && this.hoveredSlot.y === y;

                // Determine slot color
                let fillColor, strokeColor;

                if (!isAvailable) {
                    // Locked slot
                    fillColor = '#0d0d0d';
                    strokeColor = '#333333';
                } else if (isOccupied) {
                    // Occupied slot (will be drawn with part later)
                    continue;
                } else if (isHovered) {
                    // Hovered slot
                    fillColor = '#0f3460';
                    strokeColor = '#00ffff';
                } else {
                    // Empty available slot
                    fillColor = '#16213e';
                    strokeColor = '#00aaaa';
                }

                // Draw slot
                ctx.fillStyle = fillColor;
                ctx.fillRect(pos.x, pos.y, this.slotSize, this.slotSize);

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(pos.x, pos.y, this.slotSize, this.slotSize);

                // Draw diagonal lines for locked slots
                if (!isAvailable) {
                    ctx.strokeStyle = '#222222';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(pos.x + this.slotSize, pos.y + this.slotSize);
                    ctx.moveTo(pos.x + this.slotSize, pos.y);
                    ctx.lineTo(pos.x, pos.y + this.slotSize);
                    ctx.stroke();
                }
            }
        }

        // Draw placed parts
        this.renderPlacedParts();

        // Draw preview of selected part (if hovering)
        if (this.selectedPart && this.hoveredSlot) {
            this.renderPartPreview(this.selectedPart, this.hoveredSlot.x, this.hoveredSlot.y);
        }
    }

    renderPlacedParts() {
        const ctx = this.ctx;
        const parts = this.placedParts[this.currentBodyPart];

        for (let part of parts) {
            const shape = part.shape;
            const rarityColor = part.getRarityColor();

            for (let sy = 0; sy < shape.length; sy++) {
                for (let sx = 0; sx < shape[sy].length; sx++) {
                    if (shape[sy][sx] === 1) {
                        const gridX = part.gridX + sx;
                        const gridY = part.gridY + sy;
                        const pos = this.gridToCanvas(gridX, gridY);

                        // Draw part cell
                        ctx.fillStyle = '#0f3460';
                        ctx.fillRect(pos.x, pos.y, this.slotSize, this.slotSize);

                        // Draw border with rarity color
                        ctx.strokeStyle = rarityColor;
                        ctx.lineWidth = 3;
                        ctx.strokeRect(pos.x, pos.y, this.slotSize, this.slotSize);

                        // Add glow effect
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = rarityColor;
                        ctx.strokeRect(pos.x, pos.y, this.slotSize, this.slotSize);
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // Draw part name (on first cell)
            const firstPos = this.gridToCanvas(part.gridX, part.gridY);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                part.name.substring(0, 8),
                firstPos.x + this.slotSize / 2,
                firstPos.y + this.slotSize / 2
            );
        }
    }

    renderPartPreview(part, gridX, gridY) {
        const ctx = this.ctx;
        const shape = part.shape;
        const canPlace = this.canPlacePart(part, gridX, gridY);
        const previewColor = canPlace ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 68, 0.5)';
        const borderColor = canPlace ? '#00ff88' : '#ff0044';

        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx] === 1) {
                    const previewX = gridX + sx;
                    const previewY = gridY + sy;
                    const pos = this.gridToCanvas(previewX, previewY);

                    // Draw preview cell
                    ctx.fillStyle = previewColor;
                    ctx.fillRect(pos.x, pos.y, this.slotSize, this.slotSize);

                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(pos.x, pos.y, this.slotSize, this.slotSize);
                }
            }
        }
    }

    // Get all stats from placed parts in current body part
    getBodyPartStats() {
        const parts = this.placedParts[this.currentBodyPart];
        const stats = {};

        for (let part of parts) {
            for (let stat in part.stats) {
                if (!stats[stat]) {
                    stats[stat] = 0;
                }

                if (typeof part.stats[stat] === 'number') {
                    stats[stat] += part.stats[stat];
                } else {
                    stats[stat] = part.stats[stat];
                }
            }
        }

        return stats;
    }

    // Get total stats from all body parts
    getTotalStats() {
        const totalStats = {
            hp: 0,
            armor: 0,
            damage: 0,
            range: 0,
            speed: 0,
            jump_height: 0,
            vision: 0,
            targeting: 0,
            energy_capacity: 0,
            shield: 0
        };

        for (let bodyPart in this.placedParts) {
            const parts = this.placedParts[bodyPart];
            for (let part of parts) {
                for (let stat in part.stats) {
                    if (typeof part.stats[stat] === 'number') {
                        if (!totalStats[stat]) {
                            totalStats[stat] = 0;
                        }
                        totalStats[stat] += part.stats[stat];
                    }
                }
            }
        }

        return totalStats;
    }
}
