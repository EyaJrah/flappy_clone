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

var mainState = {
    /**
     * Preload game assets and set initial configurations
     * Loads bird and pipe images, sets background color
     */
    preload: function() { 
        this.game.stage.backgroundColor = '#FF6A5E';
        this.bird = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        this.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEV0vy4AAADnrrHQAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        this.game.load.image('bird', this.bird);  
        this.game.load.image('pipe', this.pipe); 
    },

    /**
     * Create game objects and initialize the game state
     * Sets up physics, creates bird and pipes, initializes controls and score
     */
    create: function() { 
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = this.game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');  
        this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);           

        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000; 

        // New anchor position
        this.bird.anchor.setTo(-0.2, 0.5); 
 
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 

        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  

        // Add the jump sound
        this.jumpSound = this.game.add.audio('jump');
    },

    /**
     * Update game state on each frame
     * Handles collisions, bird rotation, and game over conditions
     */
    update: function() {
        if (this.bird.inWorld == false)
            this.restartGame(); 

        this.game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 

        // Rotate the bird    
        if (this.bird.angle < 20)
            		this.bird.angle += 1;
    },

    /**
     * Handle bird jump action
     * Controls bird velocity and rotation for jump animation
     */
    jump: function() {
        // If the bird is dead, he can't jump
        if (this.bird.alive == false)
            return; 

        this.bird.body.velocity.y = -350;

        // Jump animation
        this.game.add.tween(this.bird).to({angle: -20}, 100).start();
    },

    /**
     * Handle pipe collision
     * Manages game state when bird hits a pipe
     */
    hitPipe: function() {
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
            return;
            
        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        this.game.time.events.remove(this.timer);
    
        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },

    /**
     * Restart the game
     * Resets game state to initial conditions
     */
    restartGame: function() {
        this.game.state.start('main');
    },

    /**
     * Add a single pipe to the game
     * @param {number} x - The x position of the pipe
     * @param {number} y - The y position of the pipe
     */
    addOnePipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();

        pipe.reset(x, y);
        pipe.body.velocity.x = -200;  
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    /**
     * Add a row of pipes with a random gap
     * Increases score when pipes are added
     */
    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1) 
                this.addOnePipe(400, i*60+10);   
    
        this.score += 1;
        this.labelScore.text = this.score;  
    },
};

// Export mainState for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mainState;
} else {
    // Only initialize the game in browser environment
    var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game');
    game.state.add('main', mainState);
    game.state.start('main');
} 
