// Player Class - Handles player character with mecha parts

class Player {
    constructor(x, y, inventory) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.inventory = inventory;

        // Movement with acceleration - smoother values
        this.vx = 0;
        this.vy = 0;
        this.acceleration = 0.4; // Reduced for smoother acceleration
        this.deceleration = 0.88; // Smoother deceleration
        this.maxSpeed = 4; // Slightly slower for better control
        this.onGround = false;
        this.facing = 1; // 1 = right, -1 = left

        // Input state
        this.input = {
            left: false,
            right: false,
            jump: false,
            jumpPressed: false // Track if jump was just pressed
        };

        // Mouse aiming
        this.mouseX = 0;
        this.mouseY = 0;
        this.aimAngle = 0;

        // Combat
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.invincibleFrames = 0;
        this.weaponType = 'sword'; // 'sword' or 'gun'

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

        // Determine weapon type based on equipped arm
        const rightArm = this.inventory.equipped.rightArm;
        if (rightArm) {
            // Check if it's a ranged weapon (higher range = gun)
            this.weaponType = this.attackRange > 100 ? 'gun' : 'sword';
        } else {
            this.weaponType = 'sword'; // Default starter
        }

        // Special abilities
        this.hasDoubleJump = stats.doubleJump || false;
        this.hasFlight = stats.flight || false;
        this.hasAutoAim = stats.autoAim || false;
        this.hasStealth = stats.stealth || false;
        this.canPierceShields = stats.shieldBreak || false;

        this.doubleJumpUsed = false;
    }

    updateMousePosition(mouseX, mouseY, camera) {
        this.mouseX = mouseX + camera.x;
        this.mouseY = mouseY + camera.y;

        // Calculate aim angle
        const dx = this.mouseX - (this.x + this.width / 2);
        const dy = this.mouseY - (this.y + this.height / 2);
        this.aimAngle = Math.atan2(dy, dx);

        // Update facing direction based on mouse
        this.facing = dx >= 0 ? 1 : -1;
    }

    update(deltaTime, level) {
        // Apply gravity - reduced for less hectic gameplay
        if (!this.onGround) {
            this.vy += 0.4; // Reduced gravity
        }

        // Smooth horizontal movement with acceleration
        let targetVx = 0;
        if (this.input.left) {
            targetVx = -this.moveSpeed;
        }
        if (this.input.right) {
            targetVx = this.moveSpeed;
        }

        // Accelerate towards target velocity
        if (targetVx !== 0) {
            this.vx += (targetVx - this.vx) * this.acceleration;
        } else {
            // Decelerate when no input
            this.vx *= this.deceleration;
        }

        // Clamp horizontal velocity
        const maxVel = this.maxSpeed;
        if (Math.abs(this.vx) > maxVel) {
            this.vx = maxVel * Math.sign(this.vx);
        }

        // Stop if velocity is very small
        if (Math.abs(this.vx) < 0.1) {
            this.vx = 0;
        }

        // Jumping - only trigger on new press
        if (this.input.jumpPressed) {
            if (this.onGround) {
                this.vy = -this.jumpPower;
                this.onGround = false;
                this.doubleJumpUsed = false;
            } else if (this.hasDoubleJump && !this.doubleJumpUsed) {
                this.vy = -this.jumpPower * 0.8;
                this.doubleJumpUsed = true;
            }
            this.input.jumpPressed = false; // Clear after processing
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Collision with level
        this.handleCollisions(level);

        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.invincibleFrames > 0) this.invincibleFrames--;

        // Clamp vertical velocity
        if (this.vy > 20) this.vy = 20;
    }

    handleCollisions(level) {
        if (!level || !level.platforms) return;

        this.onGround = false;

        // Platform collisions - improved detection
        level.platforms.forEach(platform => {
            // Check if player overlaps with platform
            const overlapX = this.x + this.width > platform.x && this.x < platform.x + platform.width;
            const overlapY = this.y + this.height > platform.y && this.y < platform.y + platform.height;

            if (overlapX && overlapY) {
                // Determine collision direction based on previous position
                const prevBottom = this.y + this.height - this.vy;
                const prevTop = this.y - this.vy;
                const prevRight = this.x + this.width - this.vx;
                const prevLeft = this.x - this.vx;

                // Landing on platform from above
                if (this.vy >= 0 && prevBottom <= platform.y + 8) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.doubleJumpUsed = false;
                }
                // Hit platform from below
                else if (this.vy < 0 && prevTop >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions
                else if (this.vx > 0 && prevRight <= platform.x + 5) {
                    this.x = platform.x - this.width;
                    this.vx = 0;
                } else if (this.vx < 0 && prevLeft >= platform.x + platform.width - 5) {
                    this.x = platform.x + platform.width;
                    this.vx = 0;
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
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
            this.vx = 0;
        }
    }

    attack() {
        if (this.attackCooldown > 0) return null;

        // Different cooldown for different weapons - increased for less hectic gameplay
        this.attackCooldown = this.weaponType === 'gun' ? 20 : 40;

        let attack;

        if (this.weaponType === 'gun') {
            // Projectile attack - reduced speed for less hectic gameplay
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            attack = {
                type: 'projectile',
                x: centerX,
                y: centerY,
                vx: Math.cos(this.aimAngle) * 7, // Reduced from 10 to 7
                vy: Math.sin(this.aimAngle) * 7,
                width: 8,
                height: 8,
                damage: this.damage,
                piercing: this.canPierceShields,
                lifetime: 150, // Increased lifetime since slower
                angle: this.aimAngle
            };
        } else {
            // Melee attack (sword/triangle)
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const range = this.attackRange;

            attack = {
                type: 'melee',
                x: centerX + Math.cos(this.aimAngle) * range / 2 - range / 2,
                y: centerY + Math.sin(this.aimAngle) * range / 2 - 15,
                width: range,
                height: 30,
                damage: this.damage,
                piercing: this.canPierceShields,
                lifetime: 10,
                angle: this.aimAngle
            };
        }

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

        ctx.globalAlpha = 1.0;
    }

    drawCrosshair(ctx, camera) {
        const screenX = this.mouseX - camera.x;
        const screenY = this.mouseY - camera.y;

        ctx.save();
        ctx.translate(screenX, screenY);

        if (this.weaponType === 'gun') {
            // Gun crosshair - circle with cross
            ctx.strokeStyle = '#00fff5';
            ctx.lineWidth = 2;

            // Outer circle
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();

            // Cross lines
            ctx.beginPath();
            ctx.moveTo(-25, 0);
            ctx.lineTo(-5, 0);
            ctx.moveTo(5, 0);
            ctx.lineTo(25, 0);
            ctx.moveTo(0, -25);
            ctx.lineTo(0, -5);
            ctx.moveTo(0, 5);
            ctx.lineTo(0, 25);
            ctx.stroke();

            // Center dot
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(-1, -1, 2, 2);
        } else {
            // Sword triangle - points towards attack direction
            ctx.rotate(this.aimAngle + Math.PI / 2);

            ctx.strokeStyle = '#00fff5';
            ctx.fillStyle = 'rgba(0, 255, 245, 0.3)';
            ctx.lineWidth = 2;

            // Triangle
            ctx.beginPath();
            ctx.moveTo(0, -25);
            ctx.lineTo(-15, 10);
            ctx.lineTo(15, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Attack range indicator
            const range = this.attackRange;
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, -25, range, -Math.PI/3, Math.PI/3);
            ctx.stroke();
        }

        ctx.restore();

        // Attack cooldown indicator
        if (this.attackCooldown > 0) {
            const cooldownPercent = this.attackCooldown / (this.weaponType === 'gun' ? 20 : 40);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(screenX - 15, screenY + 30, 30 * (1 - cooldownPercent), 4);
        }
    }

    drawAttack(ctx, camera, attack) {
        if (!attack) return;

        if (attack.type === 'projectile') {
            // Draw bullet/projectile
            const screenX = attack.x - camera.x;
            const screenY = attack.y - camera.y;

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(attack.angle);

            // Bullet glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = attack.piercing ? '#ff00ff' : '#ffff00';

            ctx.fillStyle = attack.piercing ? '#ff00ff' : '#ffff00';
            ctx.fillRect(-4, -2, 8, 4);

            // Bullet trail
            ctx.globalAlpha = 0.3;
            ctx.fillRect(-8, -1, 4, 2);

            ctx.restore();
            ctx.shadowBlur = 0;
        } else {
            // Draw melee slash
            const screenX = attack.x - camera.x;
            const screenY = attack.y - camera.y;

            ctx.save();
            ctx.translate(screenX + attack.width / 2, screenY + attack.height / 2);
            ctx.rotate(attack.angle);

            // Slash effect
            ctx.strokeStyle = attack.piercing ? '#ff00ff' : '#ffff00';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7 - (10 - attack.lifetime) / 15;

            const range = attack.width;
            ctx.beginPath();
            ctx.arc(0, 0, range * 0.8, -Math.PI/3, Math.PI/3);
            ctx.stroke();

            ctx.restore();
        }

        ctx.globalAlpha = 1.0;
    }
}
