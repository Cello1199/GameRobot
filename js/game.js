// Main Game - Scrap Rising

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Game state
        this.state = 'start'; // 'start', 'playing', 'paused', 'gameover', 'victory'
        this.currentLevel = 1;
        this.score = 0;

        // Game objects
        this.inventory = new Inventory();
        this.player = null;
        this.level = null;
        this.camera = null;
        this.spawner = new EnemySpawner();
        this.boss = null;

        // Dropped parts (visible in world)
        this.droppedParts = [];

        // Game loop
        this.lastTime = 0;
        this.animationId = null;

        // Touch controls
        this.setupControls();

        // UI setup
        initInventoryUI(this.inventory);
        this.setupUI();

        // Start screen
        document.getElementById('startBtn').onclick = () => this.startGame();
        document.getElementById('restartBtn').onclick = () => this.restart();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        if (this.camera) {
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
        }
    }

    setupControls() {
        // Touch/Click controls
        const controls = {
            'btnLeft': 'left',
            'btnRight': 'right',
            'btnJump': 'jump',
            'btnAttack': 'attack',
            'btnSpecial': 'special',
            'btnInventory': 'inventory'
        };

        for (let btnId in controls) {
            const btn = document.getElementById(btnId);
            const action = controls[btnId];

            // Touch events
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleInput(action, true);
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleInput(action, false);
            });

            // Mouse events (for testing on desktop)
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.handleInput(action, true);
            });

            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.handleInput(action, false);
            });
        }

        // Keyboard controls (for testing)
        window.addEventListener('keydown', (e) => {
            if (this.state !== 'playing') return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.player.input.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.player.input.right = true;
                    break;
                case 'ArrowUp':
                case 'w':
                case ' ':
                    this.player.input.jump = true;
                    break;
                case 'x':
                case 'j':
                    this.player.input.attack = true;
                    break;
                case 'c':
                case 'k':
                    this.player.input.special = true;
                    break;
                case 'i':
                case 'Escape':
                    this.inventory.toggle();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.state !== 'playing') return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.player.input.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.player.input.right = false;
                    break;
                case 'x':
                case 'j':
                    this.player.input.attack = false;
                    break;
                case 'c':
                case 'k':
                    this.player.input.special = false;
                    break;
            }
        });
    }

    handleInput(action, pressed) {
        if (this.state !== 'playing') return;

        switch (action) {
            case 'left':
                this.player.input.left = pressed;
                break;
            case 'right':
                this.player.input.right = pressed;
                break;
            case 'jump':
                if (pressed) this.player.input.jump = true;
                break;
            case 'attack':
                if (pressed) this.handleAttack();
                break;
            case 'special':
                if (pressed) this.handleSpecial();
                break;
            case 'inventory':
                if (pressed) this.inventory.toggle();
                break;
        }
    }

    setupUI() {
        // Additional UI setup if needed
    }

    startGame() {
        document.getElementById('startScreen').style.display = 'none';

        this.currentLevel = 1;
        this.score = 0;

        // Initialize game objects
        this.level = new Level(this.currentLevel);
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.player = new Player(this.level.spawnPoint.x, this.level.spawnPoint.y, this.inventory);
        this.spawner = new EnemySpawner();
        this.boss = null;
        this.droppedParts = [];

        // Give player a starting part
        const startingPart = new Part('rustyArm', RARITY.UNCOMMON, true);
        this.inventory.addPart(startingPart);
        this.inventory.equipPart(startingPart.id);
        this.player.updateStats();

        this.state = 'playing';

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();

        this.updateHUD();
    }

    restart() {
        document.getElementById('gameOverScreen').style.display = 'none';

        // Keep permanent parts only
        this.inventory.clearTemporaryParts();

        this.startGame();
    }

    gameLoop(currentTime) {
        if (this.state !== 'playing') return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime);

        // Draw
        this.draw();

        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.inventory.isOpen) {
            // Don't update game when inventory is open
            return;
        }

        // Update player
        this.player.update(deltaTime, this.level);

        // Update camera
        this.camera.follow(this.player, this.level.width, this.level.height);

        // Check if player should trigger boss
        if (!this.level.bossActive && !this.level.bossDefeated) {
            if (this.player.x > this.level.width - 500) {
                this.boss = this.level.spawnBoss();
                this.spawner.clear(); // Clear regular enemies
                document.getElementById('bossHealth').style.display = 'block';
            }
        }

        // Update enemies or boss
        if (this.boss && this.boss.alive) {
            this.boss.update(deltaTime, this.player, this.level, this.spawner);

            // Check player attacks hitting boss
            this.checkCombat();

            // Update boss health bar
            const bossHpPercent = (this.boss.hp / this.boss.maxHp) * 100;
            document.getElementById('bossHealthBar').style.width = bossHpPercent + '%';

            // Boss defeated
            if (!this.boss.alive) {
                this.onBossDefeated();
            }
        } else {
            this.spawner.update(deltaTime, this.player, this.level);
            this.checkCombat();
        }

        // Update dropped parts
        this.updateDroppedParts();

        // Check hazards
        const hazard = this.level.checkHazardCollisions(this.player);
        if (hazard) {
            this.player.takeDamage(hazard.damage);
        }

        // Check game over
        if (this.player.hp <= 0) {
            this.gameOver();
        }

        // Update HUD
        this.updateHUD();
    }

    checkCombat() {
        const enemies = this.boss && this.boss.alive ? [this.boss] : this.spawner.enemies;

        enemies.forEach(enemy => {
            if (!enemy.alive) return;

            // Check if player attack hits enemy
            if (this.currentAttack) {
                const hit = this.checkCollision(this.currentAttack, enemy);
                if (hit) {
                    const died = enemy.takeDamage(this.currentAttack.damage, this.currentAttack.piercing);
                    if (died) {
                        this.onEnemyKilled(enemy);
                    }
                }
            }

            // Enemy attacks player (handled in enemy update)
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    handleAttack() {
        this.currentAttack = this.player.attack();

        if (this.currentAttack) {
            // Attack lasts for a few frames
            setTimeout(() => {
                this.currentAttack = null;
            }, 200);
        }
    }

    handleSpecial() {
        const special = this.player.useSpecial();
        if (special) {
            // Handle special effects
        }
    }

    onEnemyKilled(enemy) {
        // Drop part
        const part = enemy.dropPart();
        if (part) {
            this.droppedParts.push({
                part: part,
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: -5,
                rotation: Math.random() * Math.PI * 2,
                lifetime: 600 // 10 seconds
            });
        }

        this.score += 10 * enemy.tier;
    }

    onBossDefeated() {
        document.getElementById('bossHealth').style.display = 'none';

        // Boss drops permanent part
        const bossPart = this.boss.dropPart();
        if (bossPart) {
            this.droppedParts.push({
                part: bossPart,
                x: this.boss.x + this.boss.width / 2,
                y: this.boss.y + this.boss.height / 2,
                vx: 0,
                vy: -8,
                rotation: 0,
                lifetime: 1200 // 20 seconds for boss parts
            });
        }

        this.level.onBossDefeated();

        // Show victory message
        setTimeout(() => {
            alert(`Level ${this.currentLevel} abgeschlossen!\n\nBoss besiegt! Permanent-Teil erhalten.\nAlle temporären Teile werden gelöscht.`);

            // Clear temporary parts
            this.inventory.clearTemporaryParts();

            // Next level or victory
            this.currentLevel++;
            if (this.currentLevel > 3) {
                this.victory();
            } else {
                this.startGame();
            }
        }, 2000);
    }

    updateDroppedParts() {
        for (let i = this.droppedParts.length - 1; i >= 0; i--) {
            const drop = this.droppedParts[i];

            // Physics
            drop.vy += 0.3; // Gravity
            drop.x += drop.vx;
            drop.y += drop.vy;
            drop.rotation += 0.1;

            // Ground collision
            if (drop.y > this.level.height - 60) {
                drop.y = this.level.height - 60;
                drop.vy *= -0.5;
                drop.vx *= 0.8;
            }

            // Player pickup
            const distToPlayer = Math.hypot(this.player.x - drop.x, this.player.y - drop.y);
            if (distToPlayer < 40) {
                this.inventory.addPart(drop.part);
                this.droppedParts.splice(i, 1);

                // Show notification
                this.showNotification(`${drop.part.name} erhalten!`);
                continue;
            }

            // Lifetime
            drop.lifetime--;
            if (drop.lifetime <= 0) {
                this.droppedParts.splice(i, 1);
            }
        }
    }

    showNotification(message) {
        // Simple notification (could be improved with better UI)
        console.log(message);
    }

    updateHUD() {
        // Health bar
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('playerHealthBar').style.width = hpPercent + '%';

        // Energy (for special)
        document.getElementById('energyValue').textContent = this.player.specialPower;

        // Parts count is updated by inventory
        this.inventory.updateStatsUI();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw level
        this.level.draw(this.ctx, this.camera);

        // Draw dropped parts
        this.droppedParts.forEach(drop => {
            const screenX = drop.x - this.camera.x;
            const screenY = drop.y - this.camera.y;

            this.ctx.save();
            this.ctx.translate(screenX, screenY);
            this.ctx.rotate(drop.rotation);

            // Glow effect
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = drop.part.getRarityColor();

            // Draw part icon
            this.ctx.fillStyle = drop.part.getRarityColor();
            this.ctx.fillRect(-10, -10, 20, 20);

            // Blinking for rare parts
            if (drop.part.rarity === RARITY.RARE || drop.part.rarity === RARITY.EPIC) {
                if (Math.floor(Date.now() / 200) % 2 === 0) {
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(-12, -12, 24, 24);
                }
            }

            // Permanent indicator
            if (drop.part.isPermanent) {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 14px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('★', 0, -15);
            }

            this.ctx.restore();
        });

        // Draw enemies or boss
        if (this.boss && this.boss.alive) {
            this.boss.draw(this.ctx, this.camera);
        } else {
            this.spawner.draw(this.ctx, this.camera);
        }

        // Draw player
        this.player.draw(this.ctx, this.camera);

        // Draw player attack
        if (this.currentAttack && this.currentAttack.lifetime > 0) {
            this.player.drawAttack(this.ctx, this.camera, this.currentAttack);
            this.currentAttack.lifetime--;
        }
    }

    gameOver() {
        this.state = 'gameover';

        document.getElementById('gameOverMessage').textContent = `Level ${this.currentLevel} erreicht - Score: ${this.score}`;
        document.getElementById('gameOverScreen').style.display = 'flex';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    victory() {
        this.state = 'victory';

        document.getElementById('gameOverMessage').textContent = `SIEG!\n\nAlle Levels abgeschlossen!\nFinaler Score: ${this.score}`;
        document.getElementById('gameOverScreen').style.display = 'flex';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
