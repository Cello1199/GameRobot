// Auto-Fit Algorithm - Automatically place parts optimally

class AutoFitManager {
    constructor(gridManager, placementManager, synergyManager, rotationManager) {
        this.gridManager = gridManager;
        this.placementManager = placementManager;
        this.synergyManager = synergyManager;
        this.rotationManager = rotationManager;
    }

    // Auto-fit all parts in inventory to current body part
    autoFitAll(partsToPlace) {
        const results = {
            placed: [],
            failed: [],
            synergies: 0
        };

        // Sort parts by priority
        const sortedParts = this.sortPartsByPriority(partsToPlace);

        // Try to place each part
        for (let part of sortedParts) {
            const placed = this.placementManager.autoPlacePart(part, this.rotationManager);

            if (placed) {
                results.placed.push(part);
            } else {
                results.failed.push(part);
            }
        }

        // Calculate synergies
        this.synergyManager.calculateSynergies();
        results.synergies = this.synergyManager.activeSynergies.length;

        return results;
    }

    // Sort parts by placement priority
    sortPartsByPriority(parts) {
        return parts.sort((a, b) => {
            // Priority 1: Larger parts first
            const sizeA = a.getSize();
            const sizeB = b.getSize();
            if (sizeA !== sizeB) return sizeB - sizeA;

            // Priority 2: Higher rarity first
            const rarityOrder = {
                legendary: 5,
                epic: 4,
                rare: 3,
                uncommon: 2,
                common: 1
            };
            const rarityA = rarityOrder[a.rarity] || 0;
            const rarityB = rarityOrder[b.rarity] || 0;
            if (rarityA !== rarityB) return rarityB - rarityA;

            // Priority 3: Parts with higher total stats
            const statsA = this.getTotalStatValue(a);
            const statsB = this.getTotalStatValue(b);
            return statsB - statsA;
        });
    }

    // Get total stat value for a part
    getTotalStatValue(part) {
        let total = 0;
        for (let stat in part.stats) {
            if (typeof part.stats[stat] === 'number') {
                total += part.stats[stat];
            }
        }
        return total;
    }

    // Find optimal placement for maximum synergies
    findOptimalPlacement(parts) {
        // Use genetic algorithm approach for small sets
        if (parts.length <= 6) {
            return this.geneticOptimization(parts);
        }

        // Use greedy approach for larger sets
        return this.greedyOptimization(parts);
    }

    // Greedy optimization: place parts one by one optimally
    greedyOptimization(parts) {
        const sortedParts = this.sortPartsByPriority(parts);
        const placements = [];

        for (let part of sortedParts) {
            // Find position that maximizes synergies
            const synergyPositions = this.synergyManager.findSynergyPositions(part);

            if (synergyPositions.length > 0) {
                // Place at best synergy position
                const bestPos = synergyPositions[0];
                placements.push({
                    part: part,
                    x: bestPos.x,
                    y: bestPos.y,
                    rotation: part.rotation,
                    score: bestPos.score
                });
            } else {
                // Place at any valid position
                const validPositions = this.placementManager.findValidPositions(part);
                if (validPositions.length > 0) {
                    placements.push({
                        part: part,
                        x: validPositions[0].x,
                        y: validPositions[0].y,
                        rotation: part.rotation,
                        score: 0
                    });
                }
            }
        }

        return placements;
    }

    // Genetic algorithm for optimal placement (small part count)
    geneticOptimization(parts) {
        const populationSize = 20;
        const generations = 50;
        const mutationRate = 0.1;

        let population = this.generateInitialPopulation(parts, populationSize);

        for (let gen = 0; gen < generations; gen++) {
            // Evaluate fitness
            population = population.map(individual => ({
                ...individual,
                fitness: this.evaluateFitness(individual)
            }));

            // Sort by fitness
            population.sort((a, b) => b.fitness - a.fitness);

            // Keep top 50%
            population = population.slice(0, Math.floor(populationSize / 2));

            // Generate offspring
            while (population.length < populationSize) {
                const parent1 = population[Math.floor(Math.random() * population.length / 2)];
                const parent2 = population[Math.floor(Math.random() * population.length / 2)];

                const offspring = this.crossover(parent1, parent2);

                if (Math.random() < mutationRate) {
                    this.mutate(offspring);
                }

                population.push(offspring);
            }
        }

        // Return best solution
        population.sort((a, b) => b.fitness - a.fitness);
        return population[0].placements;
    }

    // Generate random initial population
    generateInitialPopulation(parts, size) {
        const population = [];

        for (let i = 0; i < size; i++) {
            const placements = [];

            // Clear grid
            this.gridManager.placedParts[this.gridManager.currentBodyPart] = [];

            for (let part of parts) {
                // Random rotation
                const rotation = Math.floor(Math.random() * 4);
                this.rotationManager.rotatePartTo(part, rotation);

                // Try to place
                const placed = this.placementManager.autoPlacePart(part);
                if (placed) {
                    placements.push({
                        part: part,
                        x: part.gridX,
                        y: part.gridY,
                        rotation: part.rotation
                    });
                }
            }

            population.push({ placements: placements });
        }

        return population;
    }

    // Evaluate fitness of a placement configuration
    evaluateFitness(individual) {
        let score = 0;

        // Clear and apply placements
        this.gridManager.placedParts[this.gridManager.currentBodyPart] = [];

        for (let placement of individual.placements) {
            this.rotationManager.rotatePartTo(placement.part, placement.rotation);
            this.gridManager.placePart(placement.part, placement.x, placement.y);
        }

        // Score: number of parts placed
        score += individual.placements.length * 100;

        // Score: synergies
        this.synergyManager.calculateSynergies();
        score += this.synergyManager.activeSynergies.length * 50;

        // Score: compactness (less fragmentation)
        const fragmentation = this.placementManager.calculateFragmentation([]);
        score -= fragmentation.fragmentedSlots * 10;

        // Score: total stats
        const stats = this.gridManager.getBodyPartStats();
        for (let stat in stats) {
            if (typeof stats[stat] === 'number') {
                score += stats[stat];
            }
        }

        return score;
    }

    // Crossover two parents
    crossover(parent1, parent2) {
        const splitPoint = Math.floor(Math.random() * Math.min(parent1.placements.length, parent2.placements.length));

        const offspring = {
            placements: [
                ...parent1.placements.slice(0, splitPoint),
                ...parent2.placements.slice(splitPoint)
            ]
        };

        // Remove duplicates
        const seen = new Set();
        offspring.placements = offspring.placements.filter(p => {
            if (seen.has(p.part.id)) return false;
            seen.add(p.part.id);
            return true;
        });

        return offspring;
    }

    // Mutate an individual
    mutate(individual) {
        if (individual.placements.length === 0) return;

        const index = Math.floor(Math.random() * individual.placements.length);
        const placement = individual.placements[index];

        // Randomly rotate or shift position
        if (Math.random() < 0.5) {
            placement.rotation = (placement.rotation + 1) % 4;
        } else {
            placement.x = Math.max(0, placement.x + (Math.random() < 0.5 ? -1 : 1));
            placement.y = Math.max(0, placement.y + (Math.random() < 0.5 ? -1 : 1));
        }
    }

    // Quick-equip: find best body part and position for a single part
    quickEquip(part) {
        let bestPlacement = null;
        let bestScore = -1;
        let bestBodyPart = null;

        // Try each body part
        for (let bodyPart in this.gridManager.placedParts) {
            // Switch to this body part
            const originalBodyPart = this.gridManager.currentBodyPart;
            this.gridManager.switchBodyPart(bodyPart);

            // Find best position with synergies
            const synergyPositions = this.synergyManager.findSynergyPositions(part);

            if (synergyPositions.length > 0) {
                const pos = synergyPositions[0];
                if (pos.score > bestScore) {
                    bestScore = pos.score;
                    bestPlacement = pos;
                    bestBodyPart = bodyPart;
                }
            } else {
                // Try normal placement
                const validPositions = this.placementManager.findValidPositions(part);
                if (validPositions.length > 0 && bestScore < 0) {
                    bestPlacement = validPositions[0];
                    bestBodyPart = bodyPart;
                    bestScore = 0;
                }
            }

            // Restore original body part
            this.gridManager.switchBodyPart(originalBodyPart);
        }

        // Apply best placement
        if (bestPlacement && bestBodyPart) {
            this.gridManager.switchBodyPart(bestBodyPart);
            return this.gridManager.placePart(part, bestPlacement.x, bestPlacement.y);
        }

        return false;
    }

    // Suggest improvements for current layout
    suggestImprovements() {
        const suggestions = [];

        // Check for possible swaps that increase synergies
        const parts = this.gridManager.placedParts[this.gridManager.currentBodyPart];

        for (let i = 0; i < parts.length; i++) {
            for (let j = i + 1; j < parts.length; j++) {
                const part1 = parts[i];
                const part2 = parts[j];

                // Calculate current synergies
                const currentSynergies = this.synergyManager.activeSynergies.length;

                // Try swap
                if (this.placementManager.swapParts(part1, part2)) {
                    const newSynergies = this.synergyManager.calculateSynergies().length;

                    if (newSynergies > currentSynergies) {
                        suggestions.push({
                            type: 'swap',
                            part1: part1,
                            part2: part2,
                            improvement: `+${newSynergies - currentSynergies} Synergien`
                        });
                    }

                    // Swap back
                    this.placementManager.swapParts(part1, part2);
                }
            }
        }

        // Check for rotation improvements
        for (let part of parts) {
            const originalRotation = part.rotation;

            for (let rot = 0; rot < 4; rot++) {
                if (rot === originalRotation) continue;

                this.gridManager.removePart(part);
                this.rotationManager.rotatePartTo(part, rot);

                if (this.gridManager.placePart(part, part.gridX, part.gridY)) {
                    const newSynergies = this.synergyManager.calculateSynergies().length;
                    const currentSynergies = this.synergyManager.activeSynergies.length;

                    if (newSynergies > currentSynergies) {
                        suggestions.push({
                            type: 'rotate',
                            part: part,
                            rotation: rot,
                            improvement: `+${newSynergies - currentSynergies} Synergien`
                        });
                    }
                }

                this.gridManager.removePart(part);
            }

            // Restore original
            this.rotationManager.rotatePartTo(part, originalRotation);
            this.gridManager.placePart(part, part.gridX, part.gridY);
        }

        return suggestions;
    }
}
