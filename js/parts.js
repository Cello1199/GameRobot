// UNIFIED PARTS SYSTEM - Combines Game Parts and Grid Parts
// This file merges both systems into one coherent structure

// ============================================
// PART TYPE ENUMS
// ============================================

const PART_TYPES = {
    HEAD: 'head',
    TORSO: 'torso',
    LEFT_ARM: 'leftArm',
    RIGHT_ARM: 'rightArm',
    LEGS: 'legs',
    BACK: 'back'
};

const RARITY = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    SUPER: 'super',
    MEGA: 'mega'
};

const DROP_CHANCES = {
    [RARITY.COMMON]: 0.6,
    [RARITY.UNCOMMON]: 0.25,
    [RARITY.RARE]: 0.12,
    [RARITY.EPIC]: 0.03
};

// ============================================
// GRID SHAPES (for Grid Inventory)
// ============================================

const GRID_SHAPES = {
    chip: [[1]],
    sensor: [[1, 1]],
    wire: [[1], [1]],
    standardArm: [[1, 1], [1, 0]],
    booster: [[1], [1], [1]],
    lShape: [[1, 0], [1, 0], [1, 1]],
    tinyBlock: [[1, 1], [1, 1]],
    heavyPlate: [[1, 1, 1], [1, 1, 1]],
    laserCannon: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    longBar: [[1], [1], [1], [1], [1]],
    bigL: [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
    titanCore: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    mechaSkeleton: [[1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]]
};

// ============================================
// PART DEFINITIONS (Game + Grid Data)
// ============================================

const PART_DEFINITIONS = {
    // HEAD PARTS
    rustyHead: { 
        name: 'Rostiger Kopf', 
        type: PART_TYPES.HEAD, 
        tier: 1, 
        stats: { vision: 5, special: 0 }, 
        gridShape: 'sensor' 
    },
    sparkHead: { 
        name: 'Funken-Kopf', 
        type: PART_TYPES.HEAD, 
        tier: 1, 
        stats: { vision: 8, special: 5 }, 
        gridShape: 'sensor' 
    },
    laserHead: { 
        name: 'Laser-Visier', 
        type: PART_TYPES.HEAD, 
        tier: 2, 
        stats: { vision: 15, special: 10, autoAim: true }, 
        gridShape: 'standardArm' 
    },
    stealthHead: { 
        name: 'Tarn-Kopf', 
        type: PART_TYPES.HEAD, 
        tier: 3, 
        stats: { vision: 12, special: 20, stealth: true }, 
        gridShape: 'sensor' 
    },

    // TORSO PARTS
    rustyTorso: { 
        name: 'Rost-Torso', 
        type: PART_TYPES.TORSO, 
        tier: 1, 
        stats: { hp: 20, armor: 5 }, 
        gridShape: 'tinyBlock' 
    },
    drillTorso: { 
        name: 'Panzer-Torso', 
        type: PART_TYPES.TORSO, 
        tier: 1, 
        stats: { hp: 30, armor: 10 }, 
        gridShape: 'tinyBlock' 
    },
    bladeTorso: { 
        name: 'Leicht-Torso', 
        type: PART_TYPES.TORSO, 
        tier: 2, 
        stats: { hp: 25, armor: 5 }, 
        gridShape: 'sensor' 
    },
    heavyTorso: { 
        name: 'Panzer-Koloss', 
        type: PART_TYPES.TORSO, 
        tier: 3, 
        stats: { hp: 60, armor: 25 }, 
        gridShape: 'heavyPlate' 
    },

    // ARM PARTS
    rustyArm: { 
        name: 'Rost-Arm', 
        type: PART_TYPES.RIGHT_ARM, 
        tier: 1, 
        stats: { damage: 5, range: 30 }, 
        gridShape: 'standardArm' 
    },
    drillArm: { 
        name: 'Bohrer-Arm', 
        type: PART_TYPES.RIGHT_ARM, 
        tier: 1, 
        stats: { damage: 10, range: 25, piercing: true }, 
        gridShape: 'booster' 
    },
    laserArm: { 
        name: 'Laser-Kanone', 
        type: PART_TYPES.RIGHT_ARM, 
        tier: 2, 
        stats: { damage: 15, range: 100 }, 
        gridShape: 'laserCannon' 
    },
    shieldArm: { 
        name: 'Schild-Arm', 
        type: PART_TYPES.LEFT_ARM, 
        tier: 2, 
        stats: { damage: 5, block: 20 }, 
        gridShape: 'sensor' 
    },
    bladeArm: { 
        name: 'Klingen-Arm', 
        type: PART_TYPES.RIGHT_ARM, 
        tier: 2, 
        stats: { damage: 12, range: 35, combo: 3 }, 
        gridShape: 'booster' 
    },
    rocketArm: { 
        name: 'Raketen-Werfer', 
        type: PART_TYPES.RIGHT_ARM, 
        tier: 3, 
        stats: { damage: 25, range: 120, explosive: true }, 
        gridShape: 'bigL' 
    },
    heavyArm: { 
        name: 'Hammer-Faust', 
        type: PART_TYPES.RIGHT_ARM, 
        tier: 3, 
        stats: { damage: 30, range: 40 }, 
        gridShape: 'bigL' 
    },

    // LEG PARTS
    rustyLegs: { 
        name: 'Rost-Beine', 
        type: PART_TYPES.LEGS, 
        tier: 1, 
        stats: { speed: 2, jump: 8 }, 
        gridShape: 'sensor' 
    },
    sparkLegs: { 
        name: 'Sprung-Beine', 
        type: PART_TYPES.LEGS, 
        tier: 1, 
        stats: { speed: 4, jump: 12 }, 
        gridShape: 'booster' 
    },
    bladeLegs: { 
        name: 'Sprint-Beine', 
        type: PART_TYPES.LEGS, 
        tier: 2, 
        stats: { speed: 6, jump: 10 }, 
        gridShape: 'sensor' 
    },
    stealthLegs: { 
        name: 'Lautlos-Beine', 
        type: PART_TYPES.LEGS, 
        tier: 3, 
        stats: { speed: 5, jump: 10, silent: true }, 
        gridShape: 'booster' 
    },
    heavyLegs: { 
        name: 'Stampfer-Beine', 
        type: PART_TYPES.LEGS, 
        tier: 3, 
        stats: { speed: 1, jump: 6 }, 
        gridShape: 'sensor' 
    },

    // BACK PARTS
    shieldBack: { 
        name: 'Schild-Modul', 
        type: PART_TYPES.BACK, 
        tier: 2, 
        stats: { shield: 30 }, 
        gridShape: 'tinyBlock' 
    },
    rocketBack: { 
        name: 'Munitions-Modul', 
        type: PART_TYPES.BACK, 
        tier: 3, 
        stats: { ammo: 50 }, 
        gridShape: 'tinyBlock' 
    },
    stealthBack: { 
        name: 'Tarn-Feld', 
        type: PART_TYPES.BACK, 
        tier: 3, 
        stats: { stealth: 5 }, 
        gridShape: 'tinyBlock' 
    }
};

// Combination recipes
const COMBINATIONS = {
    'rustyArm+rustyArm+rustyArm': {
        result: 'superRustyArm',
        name: 'Super-Schrott-Arm',
        type: PART_TYPES.RIGHT_ARM,
        rarity: RARITY.SUPER,
        stats: { damage: 8, range: 45 },
        gridShape: 'bigL'
    },
    'drillArm+drillArm+drillArm': {
        result: 'superDrillArm',
        name: 'Bohrer-Faust',
        type: PART_TYPES.RIGHT_ARM,
        rarity: RARITY.SUPER,
        stats: { damage: 15, range: 38, piercing: true, shieldBreak: true },
        gridShape: 'laserCannon'
    },
    'sparkLegs+sparkLegs+sparkLegs': {
        result: 'superSparkLegs',
        name: 'Hyper-Springer',
        type: PART_TYPES.LEGS,
        rarity: RARITY.SUPER,
        stats: { speed: 6, jump: 18, doubleJump: true },
        gridShape: 'longBar'
    }
};

// ============================================
// UNIFIED PART CLASS
// ============================================

class Part {
    constructor(partKey, rarity = RARITY.COMMON, rotation = 0) {
        const def = PART_DEFINITIONS[partKey];
        if (!def) {
            console.error('Unknown part:', partKey);
            return;
        }

        // Core properties
        this.id = Date.now() + Math.random();
        this.key = partKey;
        this.name = def.name;
        this.type = def.type;
        this.tier = def.tier;
        this.rarity = rarity;
        this.isPermanent = false;
        this.stats = { ...def.stats };

        // Grid properties
        this.gridShape = def.gridShape || 'chip';
        this.shape = this.rotateShape(GRID_SHAPES[this.gridShape] || [[1]], rotation);
        this.originalShape = GRID_SHAPES[this.gridShape] || [[1]];
        this.rotation = rotation;
        this.gridX = null;
        this.gridY = null;
        this.bodyPart = null;

        this.applyRarityBonus();
    }

    applyRarityBonus() {
        const multipliers = {
            [RARITY.COMMON]: 1.0,
            [RARITY.UNCOMMON]: 1.25,
            [RARITY.RARE]: 1.5,
            [RARITY.EPIC]: 2.0,
            [RARITY.SUPER]: 2.5,
            [RARITY.MEGA]: 4.0
        };

        const mult = multipliers[this.rarity] || 1.0;

        for (let stat in this.stats) {
            if (typeof this.stats[stat] === 'number') {
                this.stats[stat] = Math.floor(this.stats[stat] * mult);
            }
        }
    }

    rotateShape(shape, rotations) {
        let rotated = JSON.parse(JSON.stringify(shape));
        for (let i = 0; i < rotations; i++) {
            rotated = this.rotate90(rotated);
        }
        return rotated;
    }

    rotate90(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = [];

        for (let c = 0; c < cols; c++) {
            rotated[c] = [];
            for (let r = rows - 1; r >= 0; r--) {
                rotated[c][rows - 1 - r] = shape[r][c];
            }
        }
        return rotated;
    }

    rotate() {
        this.rotation = (this.rotation + 1) % 4;
        this.shape = this.rotateShape(this.originalShape, this.rotation);
    }

    getWidth() {
        return this.shape[0].length;
    }

    getHeight() {
        return this.shape.length;
    }

    getSize() {
        let size = 0;
        for (let row of this.shape) {
            for (let cell of row) {
                if (cell === 1) size++;
            }
        }
        return size;
    }

    getRarityColor() {
        const colors = {
            [RARITY.COMMON]: '#888888',
            [RARITY.UNCOMMON]: '#00ff00',
            [RARITY.RARE]: '#0088ff',
            [RARITY.EPIC]: '#aa00ff',
            [RARITY.SUPER]: '#ffaa00',
            [RARITY.MEGA]: '#ff00ff'
        };
        return colors[this.rarity] || '#888888';
    }

    clone() {
        return new Part(this.key, this.rarity, this.rotation);
    }
}

// ============================================
// PARTS MANAGER
// ============================================

class PartsManager {
    static rollRarity() {
        const rand = Math.random();
        let cumulative = 0;

        for (let rarity in DROP_CHANCES) {
            cumulative += DROP_CHANCES[rarity];
            if (rand <= cumulative) {
                return rarity;
            }
        }

        return RARITY.COMMON;
    }

    static createRandomPart(enemyType, forcePermanent = false) {
        const possibleParts = Object.keys(PART_DEFINITIONS).filter(key => {
            const def = PART_DEFINITIONS[key];
            if (enemyType === 'tier1') return def.tier === 1;
            if (enemyType === 'tier2') return def.tier === 2;
            if (enemyType === 'tier3') return def.tier === 3;
            return true;
        });

        const partKey = possibleParts[Math.floor(Math.random() * possibleParts.length)];
        const rarity = forcePermanent ? RARITY.RARE : this.rollRarity();

        return new Part(partKey, rarity);
    }

    static tryCombine(parts) {
        if (!parts || parts.length < 2 || parts.length > 3) {
            return null;
        }

        const sortedKeys = parts.map(p => p.key).sort();
        const recipeKey = sortedKeys.join('+');

        const recipe = COMBINATIONS[recipeKey];
        if (!recipe) {
            return null;
        }

        const combined = new Part(recipe.result, recipe.rarity);
        combined.name = recipe.name;
        combined.stats = { ...recipe.stats };
        combined.isPermanent = parts.every(p => p.isPermanent);

        return combined;
    }
}
