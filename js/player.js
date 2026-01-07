// Player Class - Handles player character with mecha parts

class Player {
    constructor(x, y, inventory) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.inventory = inventory;

        // Movement
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facing = 1; // 1 = right, -1 = left

        // Input state
        this.input = {
            left: false,
            right: false,
            jump: false,
            attack: false,
            special: false
        };

        // Combat
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.invincibleFrames = 0;

        // Get initial stats from inventory
        this.updateStats();
    }

    updateStats() {
        const stats = this.inventory.getEquippedStats();

        this.maxHp = stats.hp;
        this.hp = Math.min(this.hp || stats.hp, stats.hp);
        this.armor = stats.armor;
        this.damage = stats.damage;
        this.attackRange = stats.range;
        this.moveSpeed = stats.speed;
        this.jumpPower = stats.jump;
        this.vision = stats.vision;
        this.specialPower = stats.special;

        // Special abilities
        this.hasDoubleJump = stats.doubleJump || false;
        this.hasFlight = stats.flight || false;
        this.hasAutoAim = stats.autoAim || false;
        this.hasStealth = stats.stealth || false;
        this.canPierceShields = stats.shieldBreak || false;

        this.doubleJumpUsed = false;
    }

    update(deltaTime, level) {
        // Apply gravity
        if (!this.onGround) {
            this.vy += 0.5; // Gravity
        }

        // Horizontal movement
        this.vx = 0;
        if (this.input.left) {
            this.vx = -this.moveSpeed;
            this.facing = -1;
        }
        if (this.input.right) {
            this.vx = this.moveSpeed;
            this.facing = 1;
        }

        // Jumping
        if (this.input.jump && this.onGround) {
            this.vy = -this.jumpPower;
            this.onGround = false;
            this.doubleJumpUsed = false;
        } else if (this.input.jump && !this.onGround && this.hasDoubleJump && !this.doubleJumpUsed) {
            this.vy = -this.jumpPower * 0.8;
            this.doubleJumpUsed = true;
        }

        // Clear jump input after processing
        this.input.jump = false;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Collision with level
        this.handleCollisions(level);

        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.invincibleFrames > 0) this.invincibleFrames--;

        // Clamp velocity
        if (this.vy > 15) this.vy = 15;
    }

    handleCollisions(level) {
        if (!level || !level.platforms) return;

        this.onGround = false;

        // Platform collisions
        level.platforms.forEach(platform => {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {

                // Landing on platform from above
                if (this.vy > 0 && this.y + this.height - this.vy <= platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.doubleJumpUsed = false;
                }
                // Hit platform from below
                else if (this.vy < 0 && this.y - this.vy >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions
                else if (this.vx > 0) {
                    this.x = platform.x - this.width;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width;
                }
            }
        });

        // Ground collision (bottom of screen)
        if (this.y + this.height > level.height) {
            this.y = level.height - this.height;
            this.vy = 0;
            this.onGround = true;
            this.doubleJumpUsed = false;
        }

        // Keep player in bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > level.width) this.x = level.width - this.width;
    }

    attack() {
        if (this.attackCooldown > 0) return null;

        this.attackCooldown = 30; // ~0.5 seconds at 60fps

        // Create attack hitbox
        const attack = {
            x: this.x + (this.facing === 1 ? this.width : -this.attackRange),
            y: this.y + this.height / 2 - 15,
            width: this.attackRange,
            height: 30,
            damage: this.damage,
            piercing: this.canPierceShields,
            lifetime: 10
        };

        return attack;
    }

    useSpecial() {
        if (this.specialCooldown > 0) return null;
        if (this.specialPower < 10) return null;

        this.specialCooldown = 180; // 3 seconds at 60fps

        // Special attack based on equipped parts
        const special = {
            x: this.x,
            y: this.y,
            type: 'basic',
            damage: this.damage * 2,
            lifetime: 60
        };

        // Check for special abilities from equipped parts
        const equipped = this.inventory.equipped;

        // Stealth ability
        if (this.hasStealth) {
            this.invincibleFrames = 300; // 5 seconds
            special.type = 'stealth';
        }

        return special;
    }

    takeDamage(amount) {
        if (this.invincibleFrames > 0) return false;

        const actualDamage = Math.max(1, amount - this.armor);
        this.hp -= actualDamage;

        this.invincibleFrames = 60; // 1 second

        if (this.hp <= 0) {
            this.hp = 0;
            return true; // Player died
        }

        return false;
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Flicker when invincible
        if (this.invincibleFrames > 0 && Math.floor(this.invincibleFrames / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Draw player base (human)
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(screenX, screenY, this.width, this.height);

        // Draw equipped parts indicators
        const equipped = this.inventory.equipped;

        // Head
        if (equipped.head) {
            ctx.fillStyle = equipped.head.getRarityColor();
            ctx.fillRect(screenX + 5, screenY, 20, 10);
        }

        // Torso
        if (equipped.torso) {
            ctx.fillStyle = equipped.torso.getRarityColor();
            ctx.fillRect(screenX + 5, screenY + 15, 20, 20);
        }

        // Arms
        if (equipped.leftArm) {
            ctx.fillStyle = equipped.leftArm.getRarityColor();
            ctx.fillRect(screenX - 5, screenY + 15, 8, 15);
        }
        if (equipped.rightArm) {
            ctx.fillStyle = equipped.rightArm.getRarityColor();
            ctx.fillRect(screenX + this.width - 3, screenY + 15, 8, 15);
        }

        // Legs
        if (equipped.legs) {
            ctx.fillStyle = equipped.legs.getRarityColor();
            ctx.fillRect(screenX + 8, screenY + 35, 7, 15);
            ctx.fillRect(screenX + 17, screenY + 35, 7, 15);
        }

        // Back module
        if (equipped.back) {
            ctx.fillStyle = equipped.back.getRarityColor();
            ctx.fillRect(screenX + (this.facing === -1 ? -8 : this.width), screenY + 10, 8, 20);
        }

        // Direction indicator
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            screenX + (this.facing === 1 ? this.width - 5 : 0),
            screenY + this.height / 2 - 2,
            5,
            4
        );

        ctx.globalAlpha = 1.0;
    }

    drawAttack(ctx, camera, attack) {
        if (!attack) return;

        const screenX = attack.x - camera.x;
        const screenY = attack.y - camera.y;

        ctx.fillStyle = attack.piercing ? '#ff00ff' : '#ffff00';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(screenX, screenY, attack.width, attack.height);
        ctx.globalAlpha = 1.0;
    }
}
