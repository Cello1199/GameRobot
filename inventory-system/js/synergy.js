// Synergy System - Calculate bonuses from adjacent parts

// Synergy Definitions
const SYNERGY_RULES = {
    // Same rarity bonus
    sameRarity: {
        id: 'sameRarity',
        name: 'Gleiche Qualität',
        condition: (part1, part2) => part1.rarity === part2.rarity,
        bonus: { multiplier: 1.1 },
        description: '+10% auf alle Stats beider Teile',
        icon: '⚡'
    },

    // Laser + Energy synergy
    laserEnergy: {
        id: 'laserEnergy',
        name: 'Energie-Verstärkung',
        condition: (part1, part2) => {
            return (part1.partId === 'laserEmitter' && part2.partId === 'energyCore') ||
                   (part2.partId === 'laserEmitter' && part1.partId === 'energyCore');
        },
        bonus: { damage: 1.25, energy_cost: 0.85 },
        description: '+25% Laser-Schaden, -15% Energieverbrauch',
        icon: '⚡'
    },

    // Heavy armor synergy
    armorStack: {
        id: 'armorStack',
        name: 'Panzer-Verbund',
        condition: (part1, part2) => {
            return (part1.partId.includes('armor') || part1.partId.includes('Plate')) &&
                   (part2.partId.includes('armor') || part2.partId.includes('Plate'));
        },
        bonus: { armor: 1.3 },
        description: '+30% Rüstung für beide Teile',
        icon: '🛡️'
    },

    // Speed synergy
    mobilityBoost: {
        id: 'mobilityBoost',
        name: 'Mobilitäts-Boost',
        condition: (part1, part2) => {
            return (part1.stats.speed && part2.stats.speed) ||
                   (part1.partId === 'jetpack' || part2.partId === 'jetpack');
        },
        bonus: { speed: 1.2, jump_height: 1.2 },
        description: '+20% Geschwindigkeit und Sprunghöhe',
        icon: '💨'
    },

    // Combat synergy
    weaponLink: {
        id: 'weaponLink',
        name: 'Waffen-Link',
        condition: (part1, part2) => {
            return (part1.stats.damage && part2.stats.damage);
        },
        bonus: { damage: 1.15 },
        description: '+15% Schaden für beide Waffen',
        icon: '⚔️'
    },

    // Universal adapter special
    adapterLink: {
        id: 'adapterLink',
        name: 'Adapter-Verbindung',
        condition: (part1, part2) => {
            return part1.special === 'synergy_bridge' || part2.special === 'synergy_bridge';
        },
        bonus: { multiplier: 1.05 },
        description: 'Ermöglicht Synergien zwischen allen Teilen',
        icon: '🔗'
    }
};

class SynergyManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.activeSynergies = [];
    }

    // Check all synergies for placed parts in current grid
    calculateSynergies() {
        this.activeSynergies = [];
        const parts = this.gridManager.placedParts[this.gridManager.currentBodyPart];

        for (let i = 0; i < parts.length; i++) {
            for (let j = i + 1; j < parts.length; j++) {
                const part1 = parts[i];
                const part2 = parts[j];

                // Check if parts are adjacent
                if (this.arePartsAdjacent(part1, part2)) {
                    // Check all synergy rules
                    for (let ruleKey in SYNERGY_RULES) {
                        const rule = SYNERGY_RULES[ruleKey];

                        if (rule.condition(part1, part2)) {
                            this.activeSynergies.push({
                                rule: rule,
                                part1: part1,
                                part2: part2,
                                bodyPart: this.gridManager.currentBodyPart
                            });
                        }
                    }
                }
            }
        }

        return this.activeSynergies;
    }

    // Check if two parts are adjacent (share an edge)
    arePartsAdjacent(part1, part2) {
        const shape1 = part1.shape;
        const shape2 = part2.shape;

        // Get all occupied cells for both parts
        const cells1 = [];
        const cells2 = [];

        for (let sy = 0; sy < shape1.length; sy++) {
            for (let sx = 0; sx < shape1[sy].length; sx++) {
                if (shape1[sy][sx] === 1) {
                    cells1.push({
                        x: part1.gridX + sx,
                        y: part1.gridY + sy
                    });
                }
            }
        }

        for (let sy = 0; sy < shape2.length; sy++) {
            for (let sx = 0; sx < shape2[sy].length; sx++) {
                if (shape2[sy][sx] === 1) {
                    cells2.push({
                        x: part2.gridX + sx,
                        y: part2.gridY + sy
                    });
                }
            }
        }

        // Check if any cells are adjacent (Manhattan distance = 1)
        for (let cell1 of cells1) {
            for (let cell2 of cells2) {
                const distance = Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);
                if (distance === 1) {
                    return true;
                }
            }
        }

        return false;
    }

    // Get all synergies for a specific part
    getSynergiesForPart(part) {
        return this.activeSynergies.filter(synergy => {
            return synergy.part1 === part || synergy.part2 === part;
        });
    }

    // Apply synergy bonuses to part stats
    applyBonusesToPart(part) {
        const baseSt stats = { ...part.stats };
        const synergies = this.getSynergiesForPart(part);

        let modifiedStats = { ...baseStats };

        for (let synergy of synergies) {
            const bonus = synergy.rule.bonus;

            // Apply multiplier to all stats
            if (bonus.multiplier) {
                for (let stat in modifiedStats) {
                    if (typeof modifiedStats[stat] === 'number') {
                        modifiedStats[stat] *= bonus.multiplier;
                    }
                }
            }

            // Apply specific stat bonuses
            for (let stat in bonus) {
                if (stat !== 'multiplier' && modifiedStats[stat] !== undefined) {
                    if (typeof modifiedStats[stat] === 'number') {
                        modifiedStats[stat] *= bonus[stat];
                    }
                }
            }
        }

        return modifiedStats;
    }

    // Get total stats for body part with synergies applied
    getBodyPartStatsWithSynergies() {
        const parts = this.gridManager.placedParts[this.gridManager.currentBodyPart];
        const totalStats = {};

        for (let part of parts) {
            const modifiedStats = this.applyBonusesToPart(part);

            for (let stat in modifiedStats) {
                if (typeof modifiedStats[stat] === 'number') {
                    if (!totalStats[stat]) {
                        totalStats[stat] = 0;
                    }
                    totalStats[stat] += modifiedStats[stat];
                }
            }
        }

        return totalStats;
    }

    // Get all active synergies for current body part
    getActiveSynergies() {
        this.calculateSynergies();
        return this.activeSynergies.filter(s => s.bodyPart === this.gridManager.currentBodyPart);
    }

    // Check potential synergies if part is placed at position
    checkPotentialSynergies(part, gridX, gridY) {
        const potentialSynergies = [];
        const parts = this.gridManager.placedParts[this.gridManager.currentBodyPart];

        // Temporarily set part position
        const oldX = part.gridX;
        const oldY = part.gridY;
        part.gridX = gridX;
        part.gridY = gridY;

        // Check synergies with existing parts
        for (let existingPart of parts) {
            if (this.arePartsAdjacent(part, existingPart)) {
                for (let ruleKey in SYNERGY_RULES) {
                    const rule = SYNERGY_RULES[ruleKey];

                    if (rule.condition(part, existingPart)) {
                        potentialSynergies.push({
                            rule: rule,
                            part1: part,
                            part2: existingPart
                        });
                    }
                }
            }
        }

        // Restore original position
        part.gridX = oldX;
        part.gridY = oldY;

        return potentialSynergies;
    }

    // Get positions where placing part would create synergies
    findSynergyPositions(part) {
        const grid = this.gridManager.gridConfig.currentGrid;
        const synergyPositions = [];

        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                if (this.gridManager.canPlacePart(part, x, y)) {
                    const synergies = this.checkPotentialSynergies(part, x, y);
                    if (synergies.length > 0) {
                        synergyPositions.push({
                            x: x,
                            y: y,
                            synergies: synergies,
                            score: synergies.length
                        });
                    }
                }
            }
        }

        synergyPositions.sort((a, b) => b.score - a.score);
        return synergyPositions;
    }

    // Get visual connection lines between synergized parts
    getSynergyLines() {
        const lines = [];

        for (let synergy of this.activeSynergies) {
            const part1 = synergy.part1;
            const part2 = synergy.part2;

            // Get center positions of parts
            const center1 = {
                x: part1.gridX + part1.getWidth() / 2,
                y: part1.gridY + part1.getHeight() / 2
            };

            const center2 = {
                x: part2.gridX + part2.getWidth() / 2,
                y: part2.gridY + part2.getHeight() / 2
            };

            lines.push({
                from: center1,
                to: center2,
                synergy: synergy.rule,
                color: this.getSynergyColor(synergy.rule)
            });
        }

        return lines;
    }

    // Get color for synergy type
    getSynergyColor(rule) {
        const colors = {
            sameRarity: '#ffd700',
            laserEnergy: '#00ffff',
            armorStack: '#888888',
            mobilityBoost: '#00ff88',
            weaponLink: '#ff0044',
            adapterLink: '#ff00ff'
        };

        return colors[rule.id] || '#ffd700';
    }

    // Format synergy description for display
    formatSynergyDescription(synergy) {
        return `${synergy.rule.icon} ${synergy.rule.name}: ${synergy.rule.description}`;
    }

    // Get summary of all synergies
    getSynergySummary() {
        const summary = {
            total: this.activeSynergies.length,
            byType: {},
            totalBonus: 0
        };

        for (let synergy of this.activeSynergies) {
            const ruleId = synergy.rule.id;
            if (!summary.byType[ruleId]) {
                summary.byType[ruleId] = {
                    count: 0,
                    rule: synergy.rule
                };
            }
            summary.byType[ruleId].count++;
        }

        return summary;
    }
}
