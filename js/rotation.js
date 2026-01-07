// Rotation System - Handle part rotation logic

class RotationManager {
    constructor() {
        this.rotationHistory = []; // Track rotation operations for undo
    }

    // Rotate a part 90 degrees clockwise
    rotatePart(part) {
        if (!part) return false;

        const oldRotation = part.rotation;
        part.rotate();

        // Store in history
        this.rotationHistory.push({
            part: part,
            oldRotation: oldRotation,
            newRotation: part.rotation,
            timestamp: Date.now()
        });

        return true;
    }

    // Rotate a part to a specific rotation (0, 1, 2, 3)
    rotatePartTo(part, targetRotation) {
        if (!part || targetRotation < 0 || targetRotation > 3) return false;

        const currentRotation = part.rotation;
        const rotationsNeeded = (targetRotation - currentRotation + 4) % 4;

        for (let i = 0; i < rotationsNeeded; i++) {
            part.rotate();
        }

        return true;
    }

    // Find best rotation for a part to fit in available space
    findBestRotation(part, gridManager, targetX, targetY) {
        const originalRotation = part.rotation;
        const possibleRotations = [];

        // Try all 4 rotations
        for (let rot = 0; rot < 4; rot++) {
            this.rotatePartTo(part, rot);

            if (gridManager.canPlacePart(part, targetX, targetY)) {
                possibleRotations.push({
                    rotation: rot,
                    width: part.getWidth(),
                    height: part.getHeight(),
                    fits: true
                });
            }
        }

        // Restore original rotation
        this.rotatePartTo(part, originalRotation);

        if (possibleRotations.length === 0) {
            return null;
        }

        // Prefer rotations that use less space
        possibleRotations.sort((a, b) => {
            const aArea = a.width * a.height;
            const bArea = b.width * b.height;
            return aArea - bArea;
        });

        return possibleRotations[0].rotation;
    }

    // Auto-rotate part to fit if possible
    autoRotateToFit(part, gridManager, targetX, targetY) {
        const bestRotation = this.findBestRotation(part, gridManager, targetX, targetY);

        if (bestRotation !== null) {
            this.rotatePartTo(part, bestRotation);
            return true;
        }

        return false;
    }

    // Check if a part shape is symmetrical (rotation doesn't matter)
    isSymmetrical(shape) {
        const height = shape.length;
        const width = shape[0].length;

        // Check if square
        if (height !== width) return false;

        // Check if rotationally symmetrical
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Check 180 degree symmetry
                if (shape[y][x] !== shape[height - 1 - y][width - 1 - x]) {
                    return false;
                }
            }
        }

        return true;
    }

    // Get all unique rotations of a shape (some shapes have fewer than 4 unique rotations)
    getUniqueRotations(part) {
        const uniqueShapes = [];
        const shapeStrings = new Set();
        const originalRotation = part.rotation;

        for (let rot = 0; rot < 4; rot++) {
            this.rotatePartTo(part, rot);
            const shapeString = JSON.stringify(part.shape);

            if (!shapeStrings.has(shapeString)) {
                shapeStrings.add(shapeString);
                uniqueShapes.push({
                    rotation: rot,
                    shape: JSON.parse(JSON.stringify(part.shape))
                });
            }
        }

        this.rotatePartTo(part, originalRotation);
        return uniqueShapes;
    }

    // Visual feedback: Get rotation angle in degrees
    getRotationAngle(rotation) {
        return rotation * 90;
    }

    // Undo last rotation
    undoLastRotation() {
        if (this.rotationHistory.length === 0) return false;

        const lastOp = this.rotationHistory.pop();
        this.rotatePartTo(lastOp.part, lastOp.oldRotation);

        return true;
    }

    // Clear rotation history
    clearHistory() {
        this.rotationHistory = [];
    }
}
