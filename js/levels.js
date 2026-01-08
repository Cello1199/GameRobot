// Level System - Procedural level generation and management

class Level {
    constructor(levelNumber) {
        this.levelNumber = levelNumber;
        this.tier = Math.min(Math.ceil(levelNumber / 1), 3);
        this.width = 2000;
        this.height = 600;

        this.platforms = [];
        this.hazards = [];
        this.collectibles = [];

        this.spawnPoint = { x: 100, y: 100 };
        this.bossSpawnPoint = { x: this.width - 200, y: 200 };

        this.bossActive = false;
        this.bossDefeated = false;
        this.levelComplete = false;

        this.generateLevel();
    }

    generateLevel() {
        // Ground
        this.platforms.push({
            x: 0,
            y: this.height - 50,
            width: this.width,
            height: 50,
            type: 'ground'
        });

        // Starting platform
        this.platforms.push({
            x: 50,
            y: this.height - 150,
            width: 150,
            height: 20,
            type: 'solid'
        });

        // Generate platforms across the level
        let currentX = 250;
        const sections = 8;

        for (let i = 0; i < sections; i++) {
            this.generateSection(currentX, i);
            currentX += this.width / sections;
        }

        // Boss arena platform
        this.platforms.push({
            x: this.width - 400,
            y: this.height - 150,
            width: 350,
            height: 20,
            type: 'boss'
        });

        // Add some hazards
        this.generateHazards();
    }

    generateSection(startX, sectionIndex) {
        const sectionWidth = this.width / 8;
        const patterns = ['stairway', 'gap', 'vertical', 'random'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        switch (pattern) {
            case 'stairway':
                for (let i = 0; i < 3; i++) {
                    this.platforms.push({
                        x: startX + i * 80,
                        y: this.height - 200 - i * 50,
                        width: 100,
                        height: 20,
                        type: 'solid'
                    });
                }
                break;

            case 'gap':
                this.platforms.push({
                    x: startX,
                    y: this.height - 200,
                    width: 80,
                    height: 20,
                    type: 'solid'
                });
                this.platforms.push({
                    x: startX + 180,
                    y: this.height - 200,
                    width: 80,
                    height: 20,
                    type: 'solid'
                });
                break;

            case 'vertical':
                this.platforms.push({
                    x: startX + 30,
                    y: this.height - 200,
                    width: 100,
                    height: 20,
                    type: 'solid'
                });
                this.platforms.push({
                    x: startX + 50,
                    y: this.height - 300,
                    width: 100,
                    height: 20,
                    type: 'solid'
                });
                break;

            case 'random':
                const numPlatforms = Math.floor(Math.random() * 3) + 2;
                for (let i = 0; i < numPlatforms; i++) {
                    this.platforms.push({
                        x: startX + Math.random() * (sectionWidth - 100),
                        y: this.height - 150 - Math.random() * 200,
                        width: 60 + Math.random() * 80,
                        height: 20,
                        type: 'solid'
                    });
                }
                break;
        }
    }

    generateHazards() {
        // Add some spikes and hazards - spawn only in later sections
        const numHazards = 3 + this.tier;

        for (let i = 0; i < numHazards; i++) {
            // Spawn spikes only after 60% of the level (avoid beginning)
            const hazardX = this.width * 0.6 + Math.random() * (this.width * 0.35);

            this.hazards.push({
                x: hazardX,
                y: this.height - 70,
                width: 40,
                height: 20,
                damage: 10 * this.tier,
                type: 'spikes'
            });
        }
    }

    spawnBoss() {
        if (this.bossActive) return null;

        const bossTypes = ['schrottkoloss', 'fabrikmeister', 'generalChrome'];
        const bossType = bossTypes[Math.min(this.levelNumber - 1, 2)];

        const boss = new Boss(
            this.bossSpawnPoint.x,
            this.bossSpawnPoint.y,
            bossType,
            this.tier
        );

        this.bossActive = true;
        return boss;
    }

    onBossDefeated() {
        this.bossDefeated = true;
        this.bossActive = false;
        this.levelComplete = true;
    }

    checkHazardCollisions(entity) {
        for (let hazard of this.hazards) {
            if (entity.x + entity.width > hazard.x &&
                entity.x < hazard.x + hazard.width &&
                entity.y + entity.height > hazard.y &&
                entity.y < hazard.y + hazard.height) {
                return hazard;
            }
        }
        return null;
    }

    draw(ctx, camera) {
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f1e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Grid background
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let x = -camera.x % 50; x < ctx.canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();
        }

        for (let y = -camera.y % 50; y < ctx.canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
        }

        // Platforms
        this.platforms.forEach(platform => {
            const screenX = platform.x - camera.x;
            const screenY = platform.y - camera.y;

            if (platform.type === 'ground') {
                ctx.fillStyle = '#333333';
            } else if (platform.type === 'boss') {
                ctx.fillStyle = '#884444';
            } else {
                ctx.fillStyle = '#00aaaa';
            }

            ctx.fillRect(screenX, screenY, platform.width, platform.height);

            // Platform border
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, platform.width, platform.height);
        });

        // Hazards
        this.hazards.forEach(hazard => {
            const screenX = hazard.x - camera.x;
            const screenY = hazard.y - camera.y;

            ctx.fillStyle = '#ff0000';

            // Draw spikes
            if (hazard.type === 'spikes') {
                ctx.beginPath();
                for (let i = 0; i < hazard.width; i += 10) {
                    ctx.moveTo(screenX + i, screenY + hazard.height);
                    ctx.lineTo(screenX + i + 5, screenY);
                    ctx.lineTo(screenX + i + 10, screenY + hazard.height);
                }
                ctx.fill();
            }
        });

        // Level info
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${this.levelNumber} - Tier ${this.tier}`, 10, 80);
    }
}

class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }

    follow(target, levelWidth, levelHeight) {
        // Center camera on target
        this.x = target.x - this.width / 2 + target.width / 2;
        this.y = target.y - this.height / 2 + target.height / 2;

        // Clamp camera to level bounds
        this.x = Math.max(0, Math.min(this.x, levelWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, levelHeight - this.height));
    }
}
