// Part Definitions and Shapes for Grid Inventory System

// Part Shapes (as 2D arrays, 1 = occupied, 0 = empty)
const PART_SHAPES = {
    // TINY (1 slot)
    chip: [[1]],

    // SMALL (2 slots)
    sensor: [[1, 1]],
    wire: [[1], [1]],

    // MEDIUM (3-4 slots)
    standardArm: [
        [1, 1],
        [1, 0]
    ],
    booster: [
        [1],
        [1],
        [1]
    ],
    lShape: [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    tinyBlock: [
        [1, 1],
        [1, 1]
    ],

    // LARGE (5-6 slots)
    heavyPlate: [
        [1, 1, 1],
        [1, 1, 1]
    ],
    laserCannon: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    longBar: [
        [1],
        [1],
        [1],
        [1],
        [1]
    ],
    bigL: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0]
    ],

    // MASSIVE (7+ slots)
    titanCore: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ],
    mechaSkeleton: [
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
    ],
    ultraPlate: [
        [1, 1, 1, 1],
        [1, 1, 1, 1]
    ],
    crossShape: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
    ]
};

// Part Rarity Enum
const PART_RARITY = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

// Part Type/Category
const PART_TYPE = {
    HEAD: 'head',
    TORSO: 'torso',
    LEFT_ARM: 'leftArm',
    RIGHT_ARM: 'rightArm',
    LEGS: 'legs',
    BACK: 'back',
    UNIVERSAL: 'universal' // Can fit in any slot
};

// Part Size Category
const PART_SIZE = {
    TINY: 'tiny',
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    MASSIVE: 'massive'
};

// Part Database
const PART_DATABASE = {
    // HEAD PARTS
    basicSensor: {
        id: 'basicSensor',
        name: 'Basis-Sensor',
        shape: PART_SHAPES.sensor,
        type: PART_TYPE.HEAD,
        rarity: PART_RARITY.COMMON,
        size: PART_SIZE.SMALL,
        stats: { vision: 5, targeting: 0 },
        description: 'Einfacher Sensor für Grundsicht'
    },
    advancedOptics: {
        id: 'advancedOptics',
        name: 'Erweiterte Optik',
        shape: PART_SHAPES.standardArm,
        type: PART_TYPE.HEAD,
        rarity: PART_RARITY.UNCOMMON,
        size: PART_SIZE.MEDIUM,
        stats: { vision: 15, targeting: 10 },
        description: 'Verbesserte Sichtweite und Zielsystem'
    },
    aiCore: {
        id: 'aiCore',
        name: 'KI-Kern',
        shape: PART_SHAPES.tinyBlock,
        type: PART_TYPE.HEAD,
        rarity: PART_RARITY.RARE,
        size: PART_SIZE.MEDIUM,
        stats: { vision: 20, targeting: 25, special_ability: 'auto_aim' },
        description: 'KI-gestütztes Zielsystem'
    },

    // TORSO PARTS
    lightArmor: {
        id: 'lightArmor',
        name: 'Leichte Rüstung',
        shape: PART_SHAPES.tinyBlock,
        type: PART_TYPE.TORSO,
        rarity: PART_RARITY.COMMON,
        size: PART_SIZE.MEDIUM,
        stats: { hp: 20, armor: 5 },
        description: 'Basis-Schutzpanzerung'
    },
    reinforcedPlate: {
        id: 'reinforcedPlate',
        name: 'Verstärkte Platte',
        shape: PART_SHAPES.heavyPlate,
        type: PART_TYPE.TORSO,
        rarity: PART_RARITY.UNCOMMON,
        size: PART_SIZE.LARGE,
        stats: { hp: 50, armor: 15 },
        description: 'Schwere Panzerung'
    },
    energyCore: {
        id: 'energyCore',
        name: 'Energie-Kern',
        shape: PART_SHAPES.laserCannon,
        type: PART_TYPE.TORSO,
        rarity: PART_RARITY.RARE,
        size: PART_SIZE.LARGE,
        stats: { hp: 40, armor: 10, energy_capacity: 100 },
        description: 'Energiespeicher mit mittlerer Panzerung'
    },
    titanChest: {
        id: 'titanChest',
        name: 'Titan-Brustplatte',
        shape: PART_SHAPES.titanCore,
        type: PART_TYPE.TORSO,
        rarity: PART_RARITY.EPIC,
        size: PART_SIZE.MASSIVE,
        stats: { hp: 100, armor: 30, energy_capacity: 50 },
        description: 'Massive Panzerung'
    },

    // ARM PARTS
    basicManipulator: {
        id: 'basicManipulator',
        name: 'Basis-Greifer',
        shape: PART_SHAPES.sensor,
        type: PART_TYPE.RIGHT_ARM,
        rarity: PART_RARITY.COMMON,
        size: PART_SIZE.SMALL,
        stats: { damage: 5, range: 20 },
        description: 'Einfacher Nahkampf-Arm'
    },
    laserEmitter: {
        id: 'laserEmitter',
        name: 'Laser-Emitter',
        shape: PART_SHAPES.booster,
        type: PART_TYPE.RIGHT_ARM,
        rarity: PART_RARITY.UNCOMMON,
        size: PART_SIZE.MEDIUM,
        stats: { damage: 15, range: 80 },
        description: 'Laser-Fernkampfwaffe'
    },
    plasmaCannon: {
        id: 'plasmaCannon',
        name: 'Plasma-Kanone',
        shape: PART_SHAPES.bigL,
        type: PART_TYPE.RIGHT_ARM,
        rarity: PART_RARITY.RARE,
        size: PART_SIZE.LARGE,
        stats: { damage: 30, range: 100, splash: 20 },
        description: 'Schwere Energiewaffe'
    },
    megaFist: {
        id: 'megaFist',
        name: 'Mega-Faust',
        shape: PART_SHAPES.mechaSkeleton,
        type: PART_TYPE.RIGHT_ARM,
        rarity: PART_RARITY.EPIC,
        size: PART_SIZE.MASSIVE,
        stats: { damage: 50, range: 30, knockback: 100 },
        description: 'Verheerende Nahkampfwaffe'
    },

    // LEG PARTS
    standardLegs: {
        id: 'standardLegs',
        name: 'Standard-Beine',
        shape: PART_SHAPES.sensor,
        type: PART_TYPE.LEGS,
        rarity: PART_RARITY.COMMON,
        size: PART_SIZE.SMALL,
        stats: { speed: 5, jump_height: 10 },
        description: 'Basis-Fortbewegung'
    },
    sprintLegs: {
        id: 'sprintLegs',
        name: 'Sprint-Beine',
        shape: PART_SHAPES.booster,
        type: PART_TYPE.LEGS,
        rarity: PART_RARITY.UNCOMMON,
        size: PART_SIZE.MEDIUM,
        stats: { speed: 12, jump_height: 15 },
        description: 'Schnelle Fortbewegung'
    },
    jumpJets: {
        id: 'jumpJets',
        name: 'Sprung-Jets',
        shape: PART_SHAPES.lShape,
        type: PART_TYPE.LEGS,
        rarity: PART_RARITY.RARE,
        size: PART_SIZE.MEDIUM,
        stats: { speed: 8, jump_height: 30, double_jump: true },
        description: 'Ermöglicht Doppelsprung'
    },

    // BACK PARTS
    smallBattery: {
        id: 'smallBattery',
        name: 'Kleine Batterie',
        shape: PART_SHAPES.chip,
        type: PART_TYPE.BACK,
        rarity: PART_RARITY.COMMON,
        size: PART_SIZE.TINY,
        stats: { energy_capacity: 25 },
        description: 'Zusätzliche Energie'
    },
    shieldGenerator: {
        id: 'shieldGenerator',
        name: 'Schild-Generator',
        shape: PART_SHAPES.tinyBlock,
        type: PART_TYPE.BACK,
        rarity: PART_RARITY.UNCOMMON,
        size: PART_SIZE.MEDIUM,
        stats: { shield: 50 },
        description: 'Energie-Schild'
    },
    jetpack: {
        id: 'jetpack',
        name: 'Jetpack',
        shape: PART_SHAPES.crossShape,
        type: PART_TYPE.BACK,
        rarity: PART_RARITY.RARE,
        size: PART_SIZE.LARGE,
        stats: { mobility_special: 'flight', speed: 5 },
        description: 'Ermöglicht kurzes Fliegen'
    },

    // UNIVERSAL ADAPTERS
    universalAdapter: {
        id: 'universalAdapter',
        name: 'Universal-Adapter',
        shape: PART_SHAPES.chip,
        type: PART_TYPE.UNIVERSAL,
        rarity: PART_RARITY.UNCOMMON,
        size: PART_SIZE.TINY,
        stats: {},
        special: 'synergy_bridge',
        description: 'Ermöglicht Synergie zwischen inkompatiblen Teilen'
    },
    compressionChip: {
        id: 'compressionChip',
        name: 'Kompressions-Chip',
        shape: PART_SHAPES.chip,
        type: PART_TYPE.UNIVERSAL,
        rarity: PART_RARITY.RARE,
        size: PART_SIZE.TINY,
        stats: {},
        special: 'size_reduction',
        description: 'Ein angrenzendes Teil zählt als 1 Slot kleiner'
    }
};

// Part Class
class Part {
    constructor(partData, rotation = 0) {
        this.id = partData.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.partId = partData.id;
        this.name = partData.name;
        this.shape = this.rotateShape(partData.shape, rotation);
        this.originalShape = partData.shape;
        this.type = partData.type;
        this.rarity = partData.rarity;
        this.size = partData.size;
        this.stats = { ...partData.stats };
        this.description = partData.description;
        this.special = partData.special || null;
        this.rotation = rotation; // 0, 1, 2, 3 (0° 90°, 180°, 270°)

        // Position in grid (set when placed)
        this.gridX = null;
        this.gridY = null;
        this.bodyPart = null; // Which body part grid this is in
    }

    rotateShape(shape, rotations) {
        let rotated = JSON.parse(JSON.stringify(shape)); // Deep copy
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
            [PART_RARITY.COMMON]: '#888888',
            [PART_RARITY.UNCOMMON]: '#00ff00',
            [PART_RARITY.RARE]: '#0088ff',
            [PART_RARITY.EPIC]: '#aa00ff',
            [PART_RARITY.LEGENDARY]: '#ff8800'
        };
        return colors[this.rarity] || '#888888';
    }

    clone() {
        const partData = PART_DATABASE[this.partId];
        return new Part(partData, this.rotation);
    }
}

// Helper function to create parts
function createPart(partId, rotation = 0) {
    const partData = PART_DATABASE[partId];
    if (!partData) {
        console.error('Part not found:', partId);
        return null;
    }
    return new Part(partData, rotation);
}

// Helper function to get all parts of a type
function getPartsByType(type) {
    return Object.keys(PART_DATABASE).filter(key => {
        const part = PART_DATABASE[key];
        return part.type === type || part.type === PART_TYPE.UNIVERSAL;
    });
}

// Helper function to get all parts by rarity
function getPartsByRarity(rarity) {
    return Object.keys(PART_DATABASE).filter(key => {
        return PART_DATABASE[key].rarity === rarity;
    });
}
