// Enemy Classes - Modular robot enemies that drop parts

class Enemy {
    constructor(x, y, type, tier = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.tier = tier;
        this.width = 40;
        this.height = 40;

        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facing = -1;

        this.alive = true;
        this.hitFlash = 0;

        this.aiState = 'patrol';
        this.aiTimer = 0;
        this.aggroRange = 200;
        this.attackRange = 50;
        this.attackCooldown = 0;

        this.initStats();
    }

    initStats() {
        // Base stats by tier
        const tierMultiplier = this.tier;

        // Type-specific stats - reduced speeds for less hectic gameplay
        const typeStats = {
            rustyWalker: { hp: 30, damage: 5, speed: 0.8, behavior: 'walker' },
            sparkHopper: { hp: 20, damage: 8, speed: 2, behavior: 'hopper' },
            drillGrunt: { hp: 40, damage: 12, speed: 1.2, behavior: 'aggressive' },
            laserSentinel: { hp: 25, damage: 10, speed: 0.8, behavior: 'ranged' },
            shieldBearer: { hp: 50, damage: 8, speed: 0.8, behavior: 'defender' },
            bladeDancer: { hp: 30, damage: 15, speed: 2.5, behavior: 'combo' },
            rocketTrooper: { hp: 35, damage: 20, speed: 1.2, behavior: 'ranged' },
            stealthHunter: { hp: 25, damage: 18, speed: 2, behavior: 'stealth' },
            heavyCrusher: { hp: 80, damage: 25, speed: 0.4, behavior: 'tank' }
        };

        const stats = typeStats[this.type] || typeStats.rustyWalker;

        this.maxHp = stats.hp * tierMultiplier;
        this.hp = this.maxHp;
        this.damage = stats.damage * tierMultiplier;
        this.moveSpeed = stats.speed;
        this.behavior = stats.behavior;

        // Behavior-specific properties
        this.hasShield = this.behavior === 'defender';
        this.canJump = this.behavior === 'hopper';
        this.isRanged = this.behavior === 'ranged';
    }

    update(deltaTime, player, level) {
        if (!this.alive) return;

        // Apply gravity
        if (!this.onGround) {
            this.vy += 0.5;
        }

        // AI behavior
        this.updateAI(player, level);

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Collision
        this.handleCollisions(level);

        // Update timers
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.hitFlash > 0) this.hitFlash--;
        this.aiTimer++;

        // Clamp velocity
        if (this.vy > 15) this.vy = 15;
    }

    updateAI(player, level) {
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

        // Determine AI state
        if (distToPlayer < this.attackRange) {
            this.aiState = 'attack';
        } else if (distToPlayer < this.aggroRange) {
            this.aiState = 'chase';
        } else {
            this.aiState = 'patrol';
        }

        // Execute behavior
        switch (this.aiState) {
            case 'patrol':
                this.patrol();
                break;
            case 'chase':
                this.chase(player);
                break;
            case 'attack':
                this.attackPlayer(player);
                break;
        }
    }

    patrol() {
        // Simple back and forth patrol
        if (this.aiTimer % 120 === 0) {
            this.facing *= -1;
        }

        this.vx = this.moveSpeed * this.facing;
    }

    chase(player) {
        // Move towards player
        if (player.x < this.x) {
            this.vx = -this.moveSpeed;
            this.facing = -1;
        } else {
            this.vx = this.moveSpeed;
            this.facing = 1;
        }

        // Jump if hopper
        if (this.canJump && this.onGround && Math.random() < 0.02) {
            this.vy = -12;
        }
    }

    attackPlayer(player) {
        this.vx = 0;

        if (this.attackCooldown <= 0) {
            // Check if player is in attack range
            const inRange = Math.abs(player.x - this.x) < this.attackRange &&
                           Math.abs(player.y - this.y) < this.height * 2;

            if (inRange) {
                // Deal damage to player
                const died = player.takeDamage(this.damage);
                this.attackCooldown = 60;

                return true;
            }
        }

        // Move slightly towards player
        if (player.x < this.x) {
            this.vx = -this.moveSpeed * 0.5;
            this.facing = -1;
        } else {
            this.vx = this.moveSpeed * 0.5;
            this.facing = 1;
        }

        return false;
    }

    takeDamage(amount, piercing = false) {
        // Shield blocks non-piercing damage
        if (this.hasShield && !piercing && this.facing === -1) {
            return false;
        }

        this.hp -= amount;
        this.hitFlash = 10;

        if (this.hp <= 0) {
            this.alive = false;
            return true; // Enemy died
        }

        return false;
    }

    handleCollisions(level) {
        if (!level || !level.platforms) return;

        this.onGround = false;

        level.platforms.forEach(platform => {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {

                if (this.vy > 0 && this.y + this.height - this.vy <= platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                } else if (this.vy < 0 && this.y - this.vy >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                } else if (this.vx > 0) {
                    this.x = platform.x - this.width;
                    this.facing *= -1;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width;
                    this.facing *= -1;
                }
            }
        });

        // Ground collision
        if (this.y + this.height > level.height) {
            this.y = level.height - this.height;
            this.vy = 0;
            this.onGround = true;
        }
    }

    dropPart() {
        // Determine which parts this enemy can drop based on type
        let possibleParts = [];

        switch (this.type) {
            case 'rustyWalker':
                possibleParts = ['rustyHead', 'rustyTorso', 'rustyArm', 'rustyLegs'];
                break;
            case 'sparkHopper':
                possibleParts = ['sparkHead', 'sparkLegs'];
                break;
            case 'drillGrunt':
                possibleParts = ['drillArm', 'drillTorso'];
                break;
            case 'laserSentinel':
                possibleParts = ['laserHead', 'laserArm'];
                break;
            case 'shieldBearer':
                possibleParts = ['shieldArm', 'shieldBack'];
                break;
            case 'bladeDancer':
                possibleParts = ['bladeArm', 'bladeTorso', 'bladeLegs'];
                break;
            case 'rocketTrooper':
                possibleParts = ['rocketArm', 'rocketBack'];
                break;
            case 'stealthHunter':
                possibleParts = ['stealthHead', 'stealthLegs', 'stealthBack'];
                break;
            case 'heavyCrusher':
                possibleParts = ['heavyTorso', 'heavyArm', 'heavyLegs'];
                break;
            default:
                possibleParts = ['rustyArm', 'rustyTorso'];
        }

        // Random part from possible parts
        const partKey = possibleParts[Math.floor(Math.random() * possibleParts.length)];
        const rarity = PartsManager.rollRarity();

        return new Part(partKey, rarity, false); // Not permanent
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        if (!this.alive) return;

        // Flash when hit
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.5;
        }

        // Enemy body color by tier
        const tierColors = ['#cc6666', '#cc8844', '#cc4444'];
        ctx.fillStyle = tierColors[this.tier - 1] || '#cc6666';

        // Draw enemy body
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // Draw shield if applicable
        if (this.hasShield) {
            ctx.fillStyle = '#4488ff';
            ctx.fillRect(screenX - 5, screenY + 5, 8, 30);
        }

        // Draw type indicator
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.slice(0, 4), screenX + this.width / 2, screenY - 5);

        // Health bar
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX, screenY - 8, this.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(screenX, screenY - 8, this.width * hpPercent, 4);

        ctx.globalAlpha = 1.0;
    }
}

class EnemySpawner {
    constructor() {
        this.enemies = [];
        this.maxEnemies = 3; // Reduced for easier start
        this.spawnTimer = 0;
        this.spawnInterval = 300; // 5 seconds at 60fps - slower spawning
    }

    update(deltaTime, player, level) {
        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, player, level);
        });

        // Remove dead enemies
        this.enemies = this.enemies.filter(e => e.alive);

        // Spawn new enemies
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnRandomEnemy(level);
            this.spawnTimer = 0;
        }
    }

    spawnRandomEnemy(level) {
        // Random enemy type based on level tier
        const tier1Types = ['rustyWalker', 'sparkHopper', 'drillGrunt'];
        const tier2Types = ['laserSentinel', 'shieldBearer', 'bladeDancer'];
        const tier3Types = ['rocketTrooper', 'stealthHunter', 'heavyCrusher'];

        let types = tier1Types;
        if (level.tier === 2) types = [...tier1Types, ...tier2Types];
        if (level.tier === 3) types = [...tier2Types, ...tier3Types];

        const type = types[Math.floor(Math.random() * types.length)];

        // Random spawn position (off screen or at spawn points)
        const spawnX = Math.random() * (level.width - 100) + 50;
        const spawnY = 100;

        const enemy = new Enemy(spawnX, spawnY, type, level.tier);
        this.enemies.push(enemy);

        return enemy;
    }

    draw(ctx, camera) {
        this.enemies.forEach(enemy => {
            enemy.draw(ctx, camera);
        });
    }

    clear() {
        this.enemies = [];
    }
}
