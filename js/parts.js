// Parts System - Defines all robot parts, rarities, and combinations

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

// Base part definitions
const PART_DEFINITIONS = {
    // Tier 1 - Schrott-Bots
    rustyHead: { name: 'Rostiger Kopf', type: PART_TYPES.HEAD, tier: 1, stats: { vision: 5, special: 0 } },
    rustyTorso: { name: 'Rost-Torso', type: PART_TYPES.TORSO, tier: 1, stats: { hp: 20, armor: 5 } },
    rustyArm: { name: 'Rost-Arm', type: PART_TYPES.RIGHT_ARM, tier: 1, stats: { damage: 5, range: 30 } },
    rustyLegs: { name: 'Rost-Beine', type: PART_TYPES.LEGS, tier: 1, stats: { speed: 2, jump: 8 } },

    sparkHead: { name: 'Funken-Kopf', type: PART_TYPES.HEAD, tier: 1, stats: { vision: 8, special: 5 } },
    sparkLegs: { name: 'Sprung-Beine', type: PART_TYPES.LEGS, tier: 1, stats: { speed: 4, jump: 12 } },

    drillArm: { name: 'Bohrer-Arm', type: PART_TYPES.RIGHT_ARM, tier: 1, stats: { damage: 10, range: 25, piercing: true } },
    drillTorso: { name: 'Panzer-Torso', type: PART_TYPES.TORSO, tier: 1, stats: { hp: 30, armor: 10 } },

    // Tier 2 - Industrie-Bots
    laserHead: { name: 'Laser-Visier', type: PART_TYPES.HEAD, tier: 2, stats: { vision: 15, special: 10, autoAim: true } },
    laserArm: { name: 'Laser-Kanone', type: PART_TYPES.RIGHT_ARM, tier: 2, stats: { damage: 15, range: 100 } },

    shieldArm: { name: 'Schild-Arm', type: PART_TYPES.LEFT_ARM, tier: 2, stats: { damage: 5, block: 20 } },
    shieldBack: { name: 'Schild-Modul', type: PART_TYPES.BACK, tier: 2, stats: { shield: 30 } },

    bladeArm: { name: 'Klingen-Arm', type: PART_TYPES.RIGHT_ARM, tier: 2, stats: { damage: 12, range: 35, combo: 3 } },
    bladeTorso: { name: 'Leicht-Torso', type: PART_TYPES.TORSO, tier: 2, stats: { hp: 25, armor: 5 } },
    bladeLegs: { name: 'Sprint-Beine', type: PART_TYPES.LEGS, tier: 2, stats: { speed: 6, jump: 10 } },

    // Tier 3 - Militär-Bots
    rocketArm: { name: 'Raketen-Werfer', type: PART_TYPES.RIGHT_ARM, tier: 3, stats: { damage: 25, range: 120, explosive: true } },
    rocketBack: { name: 'Munitions-Modul', type: PART_TYPES.BACK, tier: 3, stats: { ammo: 50 } },

    stealthHead: { name: 'Tarn-Kopf', type: PART_TYPES.HEAD, tier: 3, stats: { vision: 12, special: 20, stealth: true } },
    stealthLegs: { name: 'Lautlos-Beine', type: PART_TYPES.LEGS, tier: 3, stats: { speed: 5, jump: 10, silent: true } },
    stealthBack: { name: 'Tarn-Feld', type: PART_TYPES.BACK, tier: 3, stats: { stealth: 5 } },

    heavyTorso: { name: 'Panzer-Koloss', type: PART_TYPES.TORSO, tier: 3, stats: { hp: 60, armor: 25 } },
    heavyArm: { name: 'Hammer-Faust', type: PART_TYPES.RIGHT_ARM, tier: 3, stats: { damage: 30, range: 40 } },
    heavyLegs: { name: 'Stampfer-Beine', type: PART_TYPES.LEGS, tier: 3, stats: { speed: 1, jump: 6 } }
};

// Combination recipes
const COMBINATIONS = {
    // Super parts (3 same parts)
    'rustyArm+rustyArm+rustyArm': {
        result: 'superRustyArm',
        name: 'Super-Schrott-Arm',
        type: PART_TYPES.RIGHT_ARM,
        rarity: RARITY.SUPER,
        stats: { damage: 8, range: 45 } // +50% of base
    },
    'drillArm+drillArm+drillArm': {
        result: 'superDrillArm',
        name: 'Bohrer-Faust',
        type: PART_TYPES.RIGHT_ARM,
        rarity: RARITY.SUPER,
        stats: { damage: 15, range: 38, piercing: true, shieldBreak: true }
    },
    'sparkLegs+sparkLegs+sparkLegs': {
        result: 'superSparkLegs',
        name: 'Hyper-Springer',
        type: PART_TYPES.LEGS,
        rarity: RARITY.SUPER,
        stats: { speed: 6, jump: 18, doubleJump: true }
    },
    'laserArm+laserArm+rocketArm': {
        result: 'plasmaCannon',
        name: 'Plasma-Kanone',
        type: PART_TYPES.RIGHT_ARM,
        rarity: RARITY.SUPER,
        stats: { damage: 20, range: 110, explosive: true, burn: true }
    },
    'stealthHead+stealthLegs+stealthBack': {
        result: 'phantomModule',
        name: 'Phantom-Modul',
        type: PART_TYPES.BACK,
        rarity: RARITY.SUPER,
        stats: { stealth: 10, invisibilityDuration: 5 }
    },

    // Mega parts (2-3 super parts)
    'superRustyArm+superRustyArm+superDrillArm': {
        result: 'titanUpperBody',
        name: 'TITAN-OBERKÖRPER',
        type: PART_TYPES.TORSO,
        rarity: RARITY.MEGA,
        stats: { hp: 100, armor: 30, damage: 25, range: 50 }
    },
    'superSparkLegs+phantomModule': {
        result: 'jetpackDrive',
        name: 'JETPACK-ANTRIEB',
        type: PART_TYPES.BACK,
        rarity: RARITY.MEGA,
        stats: { speed: 8, jump: 25, flight: true, stealth: 5 }
    }
};

class Part {
    constructor(partKey, rarity = RARITY.COMMON, isPermanent = false) {
        const def = PART_DEFINITIONS[partKey];
        if (!def) {
            console.error('Unknown part:', partKey);
            return;
        }

        this.id = Date.now() + Math.random();
        this.key = partKey;
        this.name = def.name;
        this.type = def.type;
        this.tier = def.tier;
        this.rarity = rarity;
        this.isPermanent = isPermanent;
        this.stats = { ...def.stats };

        // Apply rarity multiplier
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

        // Multiply numeric stats
        for (let stat in this.stats) {
            if (typeof this.stats[stat] === 'number') {
                this.stats[stat] = Math.floor(this.stats[stat] * mult);
            }
        }
    }

    getRarityColor() {
        const colors = {
            [RARITY.COMMON]: '#888',
            [RARITY.UNCOMMON]: '#00ff00',
            [RARITY.RARE]: '#0088ff',
            [RARITY.EPIC]: '#aa00ff',
            [RARITY.SUPER]: '#ffaa00',
            [RARITY.MEGA]: '#ff00ff'
        };
        return colors[this.rarity] || '#888';
    }
}

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
        // Get parts that match enemy type (simplified - you can expand this)
        const possibleParts = Object.keys(PART_DEFINITIONS).filter(key => {
            const def = PART_DEFINITIONS[key];
            if (enemyType === 'tier1') return def.tier === 1;
            if (enemyType === 'tier2') return def.tier === 2;
            if (enemyType === 'tier3') return def.tier === 3;
            return true;
        });

        const partKey = possibleParts[Math.floor(Math.random() * possibleParts.length)];
        const rarity = forcePermanent ? RARITY.RARE : this.rollRarity();

        return new Part(partKey, rarity, forcePermanent);
    }

    static tryCombinatione(parts) {
        if (!parts || parts.length < 2 || parts.length > 3) {
            return null;
        }

        // Sort parts by key to match recipes
        const sortedKeys = parts.map(p => p.key).sort();
        const recipeKey = sortedKeys.join('+');

        const recipe = COMBINATIONS[recipeKey];
        if (!recipe) {
            return null;
        }

        // Create combined part
        const combined = {
            id: Date.now() + Math.random(),
            key: recipe.result,
            name: recipe.name,
            type: recipe.type,
            rarity: recipe.rarity,
            stats: { ...recipe.stats },
            isPermanent: parts.every(p => p.isPermanent)
        };

        return combined;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PART_TYPES, RARITY, Part, PartsManager, PART_DEFINITIONS, COMBINATIONS };
}
