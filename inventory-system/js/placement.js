// Placement Logic - Validation and placement rules

class PlacementManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.placementHistory = [];
    }

    // Validate if a part can be placed at position
    validatePlacement(part, gridX, gridY, allowOverload = false) {
        const shape = part.shape;
        const grid = this.gridManager.gridConfig.currentGrid;

        let overhangCount = 0;
        let occupiedSlots = [];

        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx] === 1) {
                    const checkX = gridX + sx;
                    const checkY = gridY + sy;

                    // Check if out of bounds
                    if (checkX < 0 || checkY < 0) {
                        return { valid: false, reason: 'out_of_bounds_negative' };
                    }

                    // Check if beyond current grid (overhang)
                    if (checkX >= grid.width || checkY >= grid.height) {
                        overhangCount++;
                        if (!allowOverload || overhangCount > 2) {
                            return {
                                valid: false,
                                reason: 'out_of_bounds',
                                overhang: overhangCount
                            };
                        }
                        continue;
                    }

                    // Check if slot is occupied
                    const occupyingPart = this.gridManager.isSlotOccupied(checkX, checkY);
                    if (occupyingPart) {
                        occupiedSlots.push({ x: checkX, y: checkY, part: occupyingPart });
                    }
                }
            }
        }

        // If slots are occupied by other parts
        if (occupiedSlots.length > 0) {
            return {
                valid: false,
                reason: 'occupied',
                occupiedSlots: occupiedSlots
            };
        }

        // Valid placement (with or without overload)
        return {
            valid: true,
            overhang: overhangCount,
            overloaded: overhangCount > 0
        };
    }

    // Find all valid placement positions for a part
    findValidPositions(part) {
        const grid = this.gridManager.gridConfig.currentGrid;
        const validPositions = [];

        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const validation = this.validatePlacement(part, x, y, false);
                if (validation.valid) {
                    validPositions.push({
                        x: x,
                        y: y,
                        score: this.scorePosition(part, x, y)
                    });
                }
            }
        }

        // Sort by score (best positions first)
        validPositions.sort((a, b) => b.score - a.score);

        return validPositions;
    }

    // Score a position for auto-placement (higher is better)
    scorePosition(part, x, y) {
        let score = 0;

        // Prefer corners and edges (better space utilization)
        const grid = this.gridManager.gridConfig.currentGrid;
        if (x === 0 || y === 0) score += 10;
        if (x + part.getWidth() === grid.width || y + part.getHeight() === grid.height) {
            score += 10;
        }

        // Prefer positions that leave compact empty space
        const emptyNeighbors = this.countEmptyNeighbors(part, x, y);
        score += emptyNeighbors;

        // Check for potential synergies
        const adjacentParts = this.getAdjacentParts(part, x, y);
        score += adjacentParts.length * 20;

        return score;
    }

    // Count empty neighboring slots
    countEmptyNeighbors(part, x, y) {
        const shape = part.shape;
        let count = 0;

        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx] === 1) {
                    const checkX = x + sx;
                    const checkY = y + sy;

                    // Check all 4 neighbors
                    const neighbors = [
                        { x: checkX - 1, y: checkY },
                        { x: checkX + 1, y: checkY },
                        { x: checkX, y: checkY - 1 },
                        { x: checkX, y: checkY + 1 }
                    ];

                    for (let neighbor of neighbors) {
                        if (neighbor.x >= 0 && neighbor.x < this.gridManager.gridConfig.currentGrid.width &&
                            neighbor.y >= 0 && neighbor.y < this.gridManager.gridConfig.currentGrid.height) {
                            if (!this.gridManager.isSlotOccupied(neighbor.x, neighbor.y)) {
                                count++;
                            }
                        }
                    }
                }
            }
        }

        return count;
    }

    // Get adjacent parts
    getAdjacentParts(part, x, y) {
        const shape = part.shape;
        const adjacentParts = new Set();

        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[sy].length; sx++) {
                if (shape[sy][sx] === 1) {
                    const checkX = x + sx;
                    const checkY = y + sy;

                    // Check all 4 neighbors
                    const neighbors = [
                        { x: checkX - 1, y: checkY },
                        { x: checkX + 1, y: checkY },
                        { x: checkX, y: checkY - 1 },
                        { x: checkX, y: checkY + 1 }
                    ];

                    for (let neighbor of neighbors) {
                        const occupyingPart = this.gridManager.isSlotOccupied(neighbor.x, neighbor.y);
                        if (occupyingPart && occupyingPart !== part) {
                            adjacentParts.add(occupyingPart);
                        }
                    }
                }
            }
        }

        return Array.from(adjacentParts);
    }

    // Auto-place a part in the best available position
    autoPlacePart(part, rotationManager = null) {
        // Try all rotations if rotation manager is provided
        const rotationsToTry = rotationManager ? 4 : 1;
        const originalRotation = part.rotation;
        let bestPlacement = null;
        let bestScore = -1;

        for (let rot = 0; rot < rotationsToTry; rot++) {
            if (rotationManager && rot > 0) {
                part.rotate();
            }

            const validPositions = this.findValidPositions(part);

            if (validPositions.length > 0) {
                const topPosition = validPositions[0];
                if (topPosition.score > bestScore) {
                    bestScore = topPosition.score;
                    bestPlacement = {
                        x: topPosition.x,
                        y: topPosition.y,
                        rotation: part.rotation
                    };
                }
            }
        }

        // Restore original rotation if no placement found
        if (!bestPlacement && rotationManager) {
            while (part.rotation !== originalRotation) {
                part.rotate();
            }
            return null;
        }

        // Apply best placement
        if (bestPlacement && rotationManager) {
            while (part.rotation !== bestPlacement.rotation) {
                part.rotate();
            }
        }

        if (bestPlacement) {
            return this.gridManager.placePart(part, bestPlacement.x, bestPlacement.y);
        }

        return false;
    }

    // Try to swap two parts
    swapParts(part1, part2) {
        if (!part1.bodyPart || !part2.bodyPart) {
            return false;
        }

        const pos1 = { x: part1.gridX, y: part1.gridY };
        const pos2 = { x: part2.gridX, y: part2.gridY };

        // Remove both parts
        this.gridManager.removePart(part1);
        this.gridManager.removePart(part2);

        // Try to place them in swapped positions
        const placed1 = this.gridManager.placePart(part2, pos1.x, pos1.y);
        const placed2 = this.gridManager.placePart(part1, pos2.x, pos2.y);

        if (placed1 && placed2) {
            return true;
        }

        // Restore original positions if swap failed
        this.gridManager.placePart(part1, pos1.x, pos1.y);
        this.gridManager.placePart(part2, pos2.x, pos2.y);

        return false;
    }

    // Compact all parts (move to fill gaps)
    compactGrid() {
        const parts = [...this.gridManager.placedParts[this.gridManager.currentBodyPart]];

        // Remove all parts
        parts.forEach(part => this.gridManager.removePart(part));

        // Re-place them using auto-placement
        const failed = [];
        parts.forEach(part => {
            if (!this.autoPlacePart(part)) {
                failed.push(part);
            }
        });

        return failed;
    }

    // Calculate fragmentation (empty slots that can't fit any part)
    calculateFragmentation(availableParts = []) {
        const grid = this.gridManager.gridConfig.currentGrid;
        let fragmentedSlots = 0;

        // Find all empty regions
        const emptyRegions = this.findEmptyRegions();

        // Check if any available part can fit in each region
        for (let region of emptyRegions) {
            let canFit = false;

            for (let part of availableParts) {
                // Try all rotations
                for (let rot = 0; rot < 4; rot++) {
                    part.rotate();

                    // Try placing in region
                    for (let pos of region) {
                        if (this.validatePlacement(part, pos.x, pos.y).valid) {
                            canFit = true;
                            break;
                        }
                    }

                    if (canFit) break;
                }

                if (canFit) break;
            }

            if (!canFit) {
                fragmentedSlots += region.length;
            }
        }

        return {
            fragmentedSlots: fragmentedSlots,
            totalEmptySlots: grid.width * grid.height - this.gridManager.getOccupiedSlots(),
            fragmentationPercent: (fragmentedSlots / (grid.width * grid.height)) * 100
        };
    }

    // Find contiguous empty regions
    findEmptyRegions() {
        const grid = this.gridManager.gridConfig.currentGrid;
        const visited = Array(grid.height).fill(null).map(() => Array(grid.width).fill(false));
        const regions = [];

        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                if (!visited[y][x] && !this.gridManager.isSlotOccupied(x, y)) {
                    const region = this.floodFill(x, y, visited);
                    if (region.length > 0) {
                        regions.push(region);
                    }
                }
            }
        }

        return regions;
    }

    // Flood fill to find connected empty slots
    floodFill(startX, startY, visited) {
        const grid = this.gridManager.gridConfig.currentGrid;
        const region = [];
        const stack = [{ x: startX, y: startY }];

        while (stack.length > 0) {
            const { x, y } = stack.pop();

            if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) continue;
            if (visited[y][x]) continue;
            if (this.gridManager.isSlotOccupied(x, y)) continue;

            visited[y][x] = true;
            region.push({ x, y });

            // Add neighbors
            stack.push({ x: x + 1, y: y });
            stack.push({ x: x - 1, y: y });
            stack.push({ x: x, y: y + 1 });
            stack.push({ x: x, y: y - 1 });
        }

        return region;
    }

    // Record placement for undo
    recordPlacement(part, x, y) {
        this.placementHistory.push({
            action: 'place',
            part: part,
            x: x,
            y: y,
            bodyPart: this.gridManager.currentBodyPart,
            timestamp: Date.now()
        });
    }

    // Undo last placement
    undoLastPlacement() {
        if (this.placementHistory.length === 0) return false;

        const lastAction = this.placementHistory.pop();

        if (lastAction.action === 'place') {
            this.gridManager.removePart(lastAction.part);
        } else if (lastAction.action === 'remove') {
            this.gridManager.placePart(lastAction.part, lastAction.x, lastAction.y);
        }

        return true;
    }
}
