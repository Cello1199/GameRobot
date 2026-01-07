// Boss System - Special powerful enemies with guaranteed permanent drops

class Boss extends Enemy {
    constructor(x, y, bossType, level) {
        super(x, y, bossType, level);

        this.isBoss = true;
        this.bossType = bossType;
        this.phase = 1;
        this.maxPhase = 3;

        this.initBossStats();
    }

    initBossStats() {
        const bossStats = {
            schrottkoloss: {
                name: 'Schrottkoloss',
                hp: 300,
                damage: 15,
                speed: 0.5,
                width: 80,
                height: 100,
                attacks: ['slam', 'charge', 'summon'],
                color: '#884444'
            },
            fabrikmeister: {
                name: 'Fabrikmeister',
                hp: 400,
                damage: 20,
                speed: 1,
                width: 70,
                height: 90,
                attacks: ['laser', 'summon', 'shield'],
                color: '#448888'
            },
            generalChrome: {
                name: 'General Chrome',
                hp: 600,
                damage: 30,
                speed: 2,
                width: 75,
                height: 95,
                attacks: ['combo', 'rocket', 'laser', 'charge'],
                color: '#888844'
            }
        };

        const stats = bossStats[this.bossType] || bossStats.schrottkoloss;

        this.name = stats.name;
        this.maxHp = stats.hp;
        this.hp = this.maxHp;
        this.damage = stats.damage;
        this.moveSpeed = stats.speed;
        this.width = stats.width;
        this.height = stats.height;
        this.attacks = stats.attacks;
        this.bossColor = stats.color;

        this.attackPattern = 0;
        this.attackPhaseTimer = 0;
        this.isAttacking = false;
        this.vulnerableTimer = 0;
    }

    update(deltaTime, player, level, spawner) {
        if (!this.alive) return;

        // Check phase transitions
        const hpPercent = this.hp / this.maxHp;
        if (hpPercent < 0.66 && this.phase === 1) {
            this.phase = 2;
            this.onPhaseChange();
        } else if (hpPercent < 0.33 && this.phase === 2) {
            this.phase = 3;
            this.onPhaseChange();
        }

        // Apply gravity
        if (!this.onGround) {
            this.vy += 0.5;
        }

        // Boss AI
        this.updateBossAI(player, level, spawner);

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Collision
        this.handleCollisions(level);

        // Update timers
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.hitFlash > 0) this.hitFlash--;
        if (this.vulnerableTimer > 0) this.vulnerableTimer--;
        this.aiTimer++;
        this.attackPhaseTimer++;

        // Clamp velocity
        if (this.vy > 15) this.vy = 15;
    }

    onPhaseChange() {
        // Visual/audio indicator of phase change
        this.invincibleFrames = 60;
        this.moveSpeed *= 1.2;
        this.damage *= 1.1;

        // Special phase effects
        if (this.bossType === 'fabrikmeister' && this.phase >= 2) {
            // Spawn minions faster
        }
    }

    updateBossAI(player, level, spawner) {
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

        // Attack pattern cycle
        if (this.attackPhaseTimer > 180) { // 3 seconds
            this.attackPhaseTimer = 0;
            this.attackPattern = (this.attackPattern + 1) % this.attacks.length;
        }

        // Execute current attack
        const currentAttack = this.attacks[this.attackPattern];

        switch (currentAttack) {
            case 'slam':
                this.attackSlam(player);
                break;
            case 'charge':
                this.attackCharge(player);
                break;
            case 'summon':
                this.attackSummon(spawner, level);
                break;
            case 'laser':
                this.attackLaser(player);
                break;
            case 'rocket':
                this.attackRocket(player);
                break;
            case 'combo':
                this.attackCombo(player);
                break;
            case 'shield':
                this.hasShield = true;
                break;
        }

        // Basic movement towards player
        if (!this.isAttacking) {
            if (distToPlayer > 100) {
                if (player.x < this.x) {
                    this.vx = -this.moveSpeed;
                    this.facing = -1;
                } else {
                    this.vx = this.moveSpeed;
                    this.facing = 1;
                }
            } else {
                this.vx = 0;
            }
        }
    }

    attackSlam(player) {
        if (this.attackCooldown > 0) return;

        // Jump and slam down
        if (this.onGround && !this.isAttacking) {
            this.vy = -15;
            this.isAttacking = true;
            this.attackCooldown = 120;
        }

        // Deal damage on landing
        if (this.onGround && this.isAttacking) {
            const distToPlayer = Math.abs(player.x - this.x);
            if (distToPlayer < 150) {
                player.takeDamage(this.damage);
            }
            this.isAttacking = false;
        }
    }

    attackCharge(player) {
        if (this.attackCooldown > 0) return;

        // Charge towards player
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.chargeDirection = player.x < this.x ? -1 : 1;
            this.attackCooldown = 180;
        }

        if (this.isAttacking && this.attackCooldown > 120) {
            this.vx = this.chargeDirection * this.moveSpeed * 5;

            // Check collision with player
            if (Math.abs(player.x - this.x) < 50 && Math.abs(player.y - this.y) < 50) {
                player.takeDamage(this.damage * 1.5);
            }
        } else if (this.attackCooldown <= 120) {
            this.isAttacking = false;
            this.vx = 0;
        }
    }

    attackSummon(spawner, level) {
        if (this.attackCooldown > 0) return;

        // Summon minions
        if (spawner && spawner.enemies.length < 8) {
            spawner.spawnRandomEnemy(level);
            this.attackCooldown = 300; // 5 seconds
        }
    }

    attackLaser(player) {
        if (this.attackCooldown > 0) return;

        // Shoot laser at player (simplified)
        const inRange = Math.abs(player.y - this.y) < 50;
        if (inRange) {
            player.takeDamage(this.damage * 0.8);
        }

        this.attackCooldown = 90;
    }

    attackRocket(player) {
        if (this.attackCooldown > 0) return;

        // Fire rocket (simplified - area damage)
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (distToPlayer < 200) {
            player.takeDamage(this.damage);
        }

        this.attackCooldown = 120;
    }

    attackCombo(player) {
        // Multiple quick attacks
        if (this.attackCooldown <= 0) {
            const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
            if (distToPlayer < 80) {
                player.takeDamage(this.damage * 0.5);
                this.attackCooldown = 20; // Fast attacks
            }
        }
    }

    takeDamage(amount, piercing = false) {
        // Boss has damage reduction unless vulnerable
        if (this.vulnerableTimer <= 0) {
            amount *= 0.5;
        }

        const died = super.takeDamage(amount, piercing);

        // Make vulnerable after taking damage
        this.vulnerableTimer = 120; // 2 seconds

        return died;
    }

    dropPart() {
        // Bosses drop guaranteed high-quality PERMANENT parts
        let bossDrops = [];

        switch (this.bossType) {
            case 'schrottkoloss':
                bossDrops = ['heavyTorso', 'heavyArm', 'drillTorso'];
                break;
            case 'fabrikmeister':
                bossDrops = ['laserHead', 'laserArm', 'shieldBack'];
                break;
            case 'generalChrome':
                bossDrops = ['rocketArm', 'stealthBack', 'bladeTorso'];
                break;
            default:
                bossDrops = ['heavyTorso', 'heavyArm'];
        }

        const partKey = bossDrops[Math.floor(Math.random() * bossDrops.length)];

        // Boss drops are ALWAYS rare or epic and PERMANENT
        const rarity = Math.random() < 0.5 ? RARITY.EPIC : RARITY.RARE;

        return new Part(partKey, rarity, true); // PERMANENT
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        if (!this.alive) return;

        // Flash when hit
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.5;
        }

        // Boss glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.bossColor;

        // Draw boss body
        ctx.fillStyle = this.bossColor;
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // Draw boss details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX + this.width / 4, screenY + 10, 10, 10); // Eyes
        ctx.fillRect(screenX + this.width * 3/4 - 10, screenY + 10, 10, 10);

        // Phase indicator
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`★ ${this.name} ★`, screenX + this.width / 2, screenY - 15);
        ctx.fillText(`Phase ${this.phase}`, screenX + this.width / 2, screenY - 30);

        ctx.shadowBlur = 0;

        // Health bar (larger for boss)
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#000000';
        ctx.fillRect(screenX - 10, screenY - 10, this.width + 20, 8);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - 8, screenY - 8, (this.width + 16), 4);
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(screenX - 8, screenY - 8, (this.width + 16) * hpPercent, 4);

        // Vulnerable indicator
        if (this.vulnerableTimer > 0) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX, screenY, this.width, this.height);
        }

        ctx.globalAlpha = 1.0;
    }
}
