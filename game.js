/**
 * Flappy Bird Clone
 * A simple implementation of the classic Flappy Bird game using Phaser.js
 * 
 * Game Mechanics:
 * - Press SPACEBAR to make the bird jump
 * - Avoid hitting the pipes
 * - Score increases for each pipe passed
 * - Game ends when bird hits a pipe or falls out of bounds
 * 
 * Technical Features:
 * - Bird physics and controls using Phaser.js physics engine
 * - Procedurally generated pipe obstacles
 * - Score tracking and display
 * - Game over and restart functionality
 * - Smooth bird rotation animations
 */

// Constants for game configuration
const GAME_CONFIG = {
    width: 400,
    height: 490,
    birdStartX: 100,
    birdStartY: 245,
    birdGravity: 1000,
    birdJumpVelocity: -350,
    birdMaxAngle: 20,
    birdRotationSpeed: 1,
    pipeVelocity: -200,
    pipeSpawnInterval: 1500,
    pipeCount: 20,
    pipeRows: 8,
    pipeGapMin: 1,
    pipeGapMax: 5,
    pipeSpacing: 60,
    pipeOffset: 10
};

// Game state object
const mainState = {
    /**
     * Preload game assets and set initial configurations
     * Loads bird and pipe images, sets background color
     */
    preload: function() { 
        if (!this.game) return;
        
        this.game.stage.backgroundColor = '#FF6A5E';
        
        // Use base64 encoded images for simplicity
        this.bird = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        this.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEV0vy4AAADnrrHQAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        
        // Load game assets
        this.game.load.image('bird', this.bird);  
        this.game.load.image('pipe', this.pipe); 
    },

    /**
     * Create game objects and initialize the game state
     * Sets up physics, creates bird and pipes, initializes controls and score
     */
    create: function() { 
        if (!this.game) return;
        
        // Initialize physics system
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // Create pipe group
        this.pipes = this.game.add.group();
        if (this.pipes) {
            this.pipes.enableBody = true;
            this.pipes.createMultiple(GAME_CONFIG.pipeCount, 'pipe');
        }
        
        // Set up pipe spawning timer
        this.timer = this.game.time.events.loop(GAME_CONFIG.pipeSpawnInterval, this.addRowOfPipes, this);           

        // Create bird sprite
        this.bird = this.game.add.sprite(GAME_CONFIG.birdStartX, GAME_CONFIG.birdStartY, 'bird');
        if (this.bird) {
            this.game.physics.arcade.enable(this.bird);
            this.bird.body.gravity.y = GAME_CONFIG.birdGravity; 
            this.bird.anchor.setTo(-0.2, 0.5);
            this.bird.alive = true;
        }
 
        // Set up keyboard controls
        const spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        if (spaceKey) {
            spaceKey.onDown.add(this.jump, this);
        }

        // Initialize score
        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  
    },

    /**
     * Update game state on each frame
     * Handles collisions, bird rotation, and game over conditions
     */
    update: function() {
        if (!this.bird || !this.pipes) return;
        
        // Check if bird is out of bounds
        if (this.bird.inWorld === false) {
            this.restartGame(); 
        }

        // Check for collisions
        this.game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 

        // Rotate the bird    
        if (this.bird.angle < GAME_CONFIG.birdMaxAngle) {
            this.bird.angle += GAME_CONFIG.birdRotationSpeed;
        }
    },

    /**
     * Handle bird jump action
     * Controls bird velocity and rotation for jump animation
     */
    jump: function() {
        if (!this.bird || this.bird.alive === false) return;

        // Set bird velocity for jump
        this.bird.body.velocity.y = GAME_CONFIG.birdJumpVelocity;

        // Jump animation
        this.game.add.tween(this.bird).to({angle: -GAME_CONFIG.birdMaxAngle}, 100).start();
    },

    /**
     * Handle pipe collision
     * Manages game state when bird hits a pipe
     */
    hitPipe: function() {
        if (!this.bird || !this.pipes || this.bird.alive === false) return;
            
        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        if (this.timer) {
            this.game.time.events.remove(this.timer);
        }
    
        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p){
            if (p && p.body) {
                p.body.velocity.x = 0;
            }
        }, this);
    },

    /**
     * Restart the game
     * Resets game state to initial conditions
     */
    restartGame: function() {
        if (!this.game) return;
        this.game.state.start('main');
    },

    /**
     * Add a single pipe to the game
     * @param {number} x - The x position of the pipe
     * @param {number} y - The y position of the pipe
     */
    addOnePipe: function(x, y) {
        if (!this.pipes) return;
        
        const pipe = this.pipes.getFirstDead();
        if (!pipe) return;

        pipe.reset(x, y);
        pipe.body.velocity.x = GAME_CONFIG.pipeVelocity;  
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    /**
     * Add a row of pipes with a random gap
     * Increases score when pipes are added
     */
    addRowOfPipes: function() {
        if (!this.labelScore) return;
        
        // Generate random gap position
        const hole = Math.floor(Math.random() * (GAME_CONFIG.pipeGapMax - GAME_CONFIG.pipeGapMin + 1)) + GAME_CONFIG.pipeGapMin;
        
        // Create pipes for each row except the gap
        for (let i = 0; i < GAME_CONFIG.pipeRows; i++) {
            if (i !== hole && i !== hole + 1) {
                this.addOnePipe(GAME_CONFIG.width, i * GAME_CONFIG.pipeSpacing + GAME_CONFIG.pipeOffset);
            }
        }
    
        // Update score
        this.score += 1;
        this.labelScore.text = this.score;  
    },
};

// Export mainState for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mainState;
} else {
    // Only initialize the game in browser environment
    const game = new Phaser.Game(GAME_CONFIG.width, GAME_CONFIG.height, Phaser.AUTO, 'game');
    game.state.add('main', mainState);
    game.state.start('main');
} 
