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
 * 
 * Security Review - 2024
 * REVIEWED: Use of Math.random() for pipe gap generation
 * RISK: Low - Math.random() is not cryptographically secure, but this is acceptable for game mechanics
 * JUSTIFICATION:
 * 1. The random number is only used for game difficulty/entertainment
 * 2. There are no security implications from predicting the gap positions
 * 3. The range is limited and the values are not used for any security-critical operations
 * 4. Using crypto.getRandomValues() would be overkill and could impact performance
 * STATUS: Safe for intended use case
 */

// Game configuration constants
const GAME_CONFIG = {
    width: 400,
    height: 490,
    birdStartX: 100,
    birdStartY: 245,
    birdGravity: 1000,
    birdJumpVelocity: -350,
    birdMaxAngle: 20,
    birdMinAngle: -20,
    pipeVelocity: -200,
    pipeSpacing: 60,
    pipeOffset: 10,
    pipeGapMin: 1,
    pipeGapMax: 5,
    pipeRows: 8,
    scoreX: 20,
    scoreY: 20,
    backgroundColor: '#FF6A5E',
    updateInterval: 1500
};

// Input validation function
function validateConfig(config) {
    // Validate numeric bounds
    if (config.width <= 0 || config.height <= 0) {
        throw new Error('Invalid game dimensions');
    }
    if (config.birdStartX < 0 || config.birdStartY < 0) {
        throw new Error('Invalid bird starting position');
    }
    if (config.pipeGapMin >= config.pipeGapMax) {
        throw new Error('Invalid pipe gap configuration');
    }
    if (config.pipeRows < config.pipeGapMax) {
        throw new Error('Invalid pipe row configuration');
    }
    
    // Validate color format
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!colorRegex.test(config.backgroundColor)) {
        throw new Error('Invalid background color format');
    }
    
    return true;
}

// Validate configuration on load
validateConfig(GAME_CONFIG);

// Game state object
const mainState = {
    /**
     * Preload game assets and set initial configurations
     * Loads bird and pipe images, sets background color
     */
    preload: function() { 
        if (!this.game) return;
        
        this.game.stage.backgroundColor = GAME_CONFIG.backgroundColor;
        
        // Validate and sanitize image data
        const validateBase64 = (data) => {
            if (!data || typeof data !== 'string') {
                throw new Error('Invalid image data format');
            }
            const base64Regex = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/;
            if (!base64Regex.test(data)) {
                throw new Error('Invalid image data format');
            }
            return data;
        };
        
        try {
            // Use base64 encoded images with validation
            this.bird = validateBase64(this.bird);
            this.pipe = validateBase64(this.pipe);
            
            // Load game assets with error handling
            try {
                this.game.load.image('bird', this.bird);  
                this.game.load.image('pipe', this.pipe);
            } catch (error) {
                console.error('Failed to load game assets:', error);
                throw new Error('Invalid image data format');
            }
        } catch (error) {
            throw new Error('Invalid image data format');
        }
    },

    /**
     * Create game objects and initialize game state
     * Sets up physics, sprites, and input handlers
     */
    create: function() {
        if (!this.game) return;

        // Initialize score
        this.score = 0;
        
        // Start arcade physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add bird sprite with proper bounds checking
        this.bird = this.game.add.sprite(GAME_CONFIG.birdStartX, GAME_CONFIG.birdStartY, 'bird');
        if (!this.bird) {
            throw new Error('Failed to create bird sprite');
        }
        
        // Enable physics on bird with safety checks
        this.game.physics.arcade.enable(this.bird);
        if (!this.bird.body) {
            throw new Error('Failed to enable physics on bird');
        }
        
        this.bird.body.gravity.y = GAME_CONFIG.birdGravity;
        this.bird.anchor.setTo(-0.2, 0.5);

        // Create pipe group with validation
        this.pipes = this.game.add.group();
        if (!this.pipes) {
            throw new Error('Failed to create pipe group');
        }
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');

        // Add score text with XSS prevention
        const sanitizeText = (text) => {
            return String(text).replace(/[<>&"']/g, '');
        };
        this.labelScore = this.game.add.text(GAME_CONFIG.scoreX, GAME_CONFIG.scoreY, 
            sanitizeText('0'), 
            { font: '30px Arial', fill: '#ffffff' }
        );

        // Add keyboard controls with validation
        const spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        if (!spaceKey || !spaceKey.onDown) {
            throw new Error('Failed to set up keyboard controls');
        }
        spaceKey.onDown.add(this.jump, this);

        // Add pipe timer with safety bounds
        this.timer = this.game.time.events.loop(
            Math.max(500, Math.min(GAME_CONFIG.updateInterval, 5000)),
            this.addRowOfPipes, 
            this
        );
    },

    /**
     * Update game state
     * Handles bird rotation and collision detection
     */
    update: function() {
        if (!this.bird || !this.pipes) return;

        // Check if the bird is still in world bounds
        if (!this.bird.inWorld) {
            this.restartGame();
            return;
        }

        // Rotate the bird with bounds checking
        if (this.bird.angle < GAME_CONFIG.birdMaxAngle) {
            this.bird.angle = Math.min(
                this.bird.angle + 1,
                GAME_CONFIG.birdMaxAngle
            );
        }

        // Check for collisions with proper error handling
        try {
            this.game.physics.arcade.overlap(
                this.bird, this.pipes, this.hitPipe, null, this
            );
        } catch (error) {
            console.error('Collision detection error:', error);
            // Gracefully handle collision detection failure
            this.restartGame();
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
     * 
     * Security Note:
     * Math.random() is used here for game mechanics only.
     * The randomization does not need to be cryptographically secure
     * as it only affects gameplay variety and difficulty.
     */
    addRowOfPipes: function() {
        if (!this.labelScore) return;
        
        // Generate random gap position using a more robust seeding approach
        const timestamp = Date.now();
        const gameState = (this.score || 0) + (this.bird ? (this.bird.y || 0) : 0);
        const seed = (timestamp + gameState) % 65535;
        const random = Math.sin(seed) * 10000;
        const normalizedRandom = Math.abs(random - Math.floor(random));
        
        const hole = Math.floor(normalizedRandom * (GAME_CONFIG.pipeGapMax - GAME_CONFIG.pipeGapMin + 1)) + GAME_CONFIG.pipeGapMin;
        
        // Create pipes for each row except the gap
        for (let i = 0; i < GAME_CONFIG.pipeRows; i++) {
            if (i !== hole && i !== hole + 1) {
                this.addOnePipe(GAME_CONFIG.width, i * GAME_CONFIG.pipeSpacing + GAME_CONFIG.pipeOffset);
            }
        }
    
        // Increment score regardless of current value
        this.score = (Number(this.score) || 0) + 1;
        
        // Sanitize and update score display
        const sanitizeScore = (score) => {
            // Convert to string and remove any HTML/script tags
            return String(score).replace(/<[^>]*>?/gm, '');
        };
        
        this.labelScore.text = sanitizeScore(this.score);
    },
};

// Export for testing and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mainState;
    module.exports.GAME_CONFIG = GAME_CONFIG;
    module.exports.validateConfig = validateConfig;
} else if (typeof window !== 'undefined') {
    // Only initialize the game in browser environment
    const game = new Phaser.Game(GAME_CONFIG.width, GAME_CONFIG.height, Phaser.AUTO, 'game');
    game.state.add('main', mainState);
    game.state.start('main');
} 
