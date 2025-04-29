import mainState from '../game';

describe('Main State', () => {
  let game;
  let state;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a mock game object with more complete Phaser functionality
    game = {
      stage: { 
        backgroundColor: '' 
      },
      load: { 
        image: jest.fn() 
      },
      physics: { 
        startSystem: jest.fn(),
        arcade: { 
          enable: jest.fn(),
          overlap: jest.fn()
        }
      },
      add: {
        group: jest.fn(() => ({
          enableBody: true,
          createMultiple: jest.fn()
        })),
        sprite: jest.fn(() => ({
          anchor: { setTo: jest.fn() },
          body: { gravity: { y: 0 }, velocity: { y: 0, x: 0 } },
          angle: 0,
          alive: true,
          inWorld: true
        })),
        text: jest.fn(),
        tween: jest.fn(() => ({
          to: jest.fn(() => ({
            start: jest.fn()
          }))
        })),
        audio: jest.fn()
      },
      input: {
        keyboard: {
          addKey: jest.fn(() => ({
            onDown: { add: jest.fn() }
          }))
        }
      },
      time: {
        events: {
          loop: jest.fn(),
          remove: jest.fn()
        }
      },
      state: {
        start: jest.fn()
      }
    };
    
    // Set up global game object
    global.game = game;
    
    // Create a new instance of the state for each test
    state = Object.create(mainState);
    state.game = game;
  });
  
  test('preload sets background color and loads assets', () => {
    state.preload();
    
    expect(game.stage.backgroundColor).toBe('#FF6A5E');
    expect(game.load.image).toHaveBeenCalledWith('bird', expect.any(String));
    expect(game.load.image).toHaveBeenCalledWith('pipe', expect.any(String));
  });
  
  test('preload does nothing if game is not defined', () => {
    state.game = undefined;
    state.preload();
    
    // Should not throw an error
    expect(true).toBe(true);
  });
  
  test('create initializes physics and game objects', () => {
    state.create();
    
    expect(game.physics.startSystem).toHaveBeenCalledWith(Phaser.Physics.ARCADE);
    expect(game.add.group).toHaveBeenCalled();
    expect(game.add.sprite).toHaveBeenCalledWith(100, 245, 'bird');
    expect(game.physics.arcade.enable).toHaveBeenCalled();
  });
  
  test('create does nothing if game is not defined', () => {
    state.game = undefined;
    state.create();
    
    // Should not throw an error
    expect(true).toBe(true);
  });
  
  test('jump sets bird velocity when alive', () => {
    // Setup
    state.bird = {
      alive: true,
      body: { velocity: { y: 0 } },
      angle: 0
    };
    
    // Execute
    state.jump();
    
    // Verify
    expect(state.bird.body.velocity.y).toBe(-350);
    expect(game.add.tween).toHaveBeenCalledWith(state.bird);
  });
  
  test('jump does nothing when bird is dead', () => {
    // Setup
    state.bird = {
      alive: false,
      body: { velocity: { y: 0 } }
    };
    
    // Execute
    state.jump();
    
    // Verify
    expect(state.bird.body.velocity.y).toBe(0);
  });
  
  test('jump does nothing when bird is not defined', () => {
    // Setup
    state.bird = undefined;
    
    // Execute
    state.jump();
    
    // Should not throw an error
    expect(true).toBe(true);
  });
  
  test('hitPipe marks bird as dead and stops pipes', () => {
    // Setup
    state.bird = { alive: true };
    state.pipes = {
      forEachAlive: jest.fn()
    };
    state.timer = {};
    state.game = game;
    
    // Execute
    state.hitPipe();
    
    // Verify
    expect(state.bird.alive).toBe(false);
    expect(state.game.time.events.remove).toHaveBeenCalledWith(state.timer);
    expect(state.pipes.forEachAlive).toHaveBeenCalled();
  });
  
  test('hitPipe does nothing when bird is already dead', () => {
    // Setup
    state.bird = { alive: false };
    state.pipes = {
      forEachAlive: jest.fn()
    };
    state.timer = {};
    state.game = game;
    
    // Execute
    state.hitPipe();
    
    // Verify
    expect(state.bird.alive).toBe(false);
    expect(state.game.time.events.remove).not.toHaveBeenCalled();
    expect(state.pipes.forEachAlive).not.toHaveBeenCalled();
  });
  
  test('hitPipe does nothing when bird is not defined', () => {
    // Setup
    state.bird = undefined;
    state.pipes = {
      forEachAlive: jest.fn()
    };
    state.timer = {};
    state.game = game;
    
    // Execute
    state.hitPipe();
    
    // Should not throw an error
    expect(true).toBe(true);
  });
  
  test('addRowOfPipes creates pipes and increases score', () => {
    // Setup
    state.pipes = {
      getFirstDead: jest.fn(() => ({
        reset: jest.fn(),
        body: { velocity: { x: 0 } },
        checkWorldBounds: false,
        outOfBoundsKill: false
      }))
    };
    state.score = 0;
    state.labelScore = { text: '0' };
    
    // Execute
    state.addRowOfPipes();
    
    // Verify
    expect(state.score).toBe(1);
    expect(state.labelScore.text).toBe(1);
    expect(state.pipes.getFirstDead).toHaveBeenCalled();
  });
  
  test('addRowOfPipes does nothing when labelScore is not defined', () => {
    // Setup
    state.pipes = {
      getFirstDead: jest.fn(() => ({
        reset: jest.fn(),
        body: { velocity: { x: 0 } },
        checkWorldBounds: false,
        outOfBoundsKill: false
      }))
    };
    state.score = 0;
    state.labelScore = undefined;
    
    // Execute
    state.addRowOfPipes();
    
    // Verify
    expect(state.score).toBe(0);
    expect(state.pipes.getFirstDead).not.toHaveBeenCalled();
  });
  
  test('update handles bird out of world and collisions', () => {
    // Setup
    state.bird = {
      inWorld: false,
      angle: 0
    };
    state.pipes = {};
    state.game = {
      physics: {
        arcade: {
          overlap: jest.fn()
        }
      }
    };
    state.restartGame = jest.fn();
    
    // Execute
    state.update();
    
    // Verify
    expect(state.restartGame).toHaveBeenCalled();
  });
  
  test('update does nothing when bird is not defined', () => {
    // Setup
    state.bird = undefined;
    state.pipes = {};
    state.game = {
      physics: {
        arcade: {
          overlap: jest.fn()
        }
      }
    };
    state.restartGame = jest.fn();
    
    // Execute
    state.update();
    
    // Verify
    expect(state.restartGame).not.toHaveBeenCalled();
  });
  
  test('update does nothing when pipes is not defined', () => {
    // Setup
    state.bird = {
      inWorld: true,
      angle: 0
    };
    state.pipes = undefined;
    state.game = {
      physics: {
        arcade: {
          overlap: jest.fn()
        }
      }
    };
    
    // Execute
    state.update();
    
    // Should not throw an error
    expect(true).toBe(true);
  });
  
  test('bird rotation in update', () => {
    // Setup
    state.bird = {
      inWorld: true,
      angle: 15
    };
    state.pipes = {};
    state.game = {
      physics: {
        arcade: {
          overlap: jest.fn()
        }
      }
    };
    
    // Execute
    state.update();
    
    // Verify
    expect(state.bird.angle).toBe(16);
  });
  
  test('restartGame restarts the game state', () => {
    state.restartGame();
    expect(state.game.state.start).toHaveBeenCalledWith('main');
  });
  
  test('restartGame does nothing when game is not defined', () => {
    // Setup
    state.game = undefined;
    
    // Execute
    state.restartGame();
    
    // Should not throw an error
    expect(true).toBe(true);
  });
  
  test('addOnePipe creates and configures a pipe', () => {
    // Setup
    const mockPipe = {
      reset: jest.fn(),
      body: { velocity: { x: 0 } },
      checkWorldBounds: false,
      outOfBoundsKill: false
    };
    state.pipes = {
      getFirstDead: jest.fn(() => mockPipe)
    };
    
    // Execute
    state.addOnePipe(400, 100);
    
    // Verify
    expect(state.pipes.getFirstDead).toHaveBeenCalled();
    expect(mockPipe.reset).toHaveBeenCalledWith(400, 100);
    expect(mockPipe.body.velocity.x).toBe(-200);
    expect(mockPipe.checkWorldBounds).toBe(true);
    expect(mockPipe.outOfBoundsKill).toBe(true);
  });
  
  test('addOnePipe does nothing when pipes is not defined', () => {
    // Setup
    state.pipes = undefined;
    
    // Execute
    state.addOnePipe(400, 100);
    
    // Should not throw an error
    expect(true).toBe(true);
  });
  
  test('addOnePipe does nothing when no dead pipes are available', () => {
    // Setup
    state.pipes = {
      getFirstDead: jest.fn(() => null)
    };
    
    // Execute
    state.addOnePipe(400, 100);
    
    // Verify
    expect(state.pipes.getFirstDead).toHaveBeenCalled();
  });
  
  test('hitPipe stops all pipes when bird hits a pipe', () => {
    // Setup
    state.bird = { alive: true };
    const mockPipe1 = { body: { velocity: { x: 100 } } };
    const mockPipe2 = { body: { velocity: { x: 200 } } };
    state.pipes = {
      forEachAlive: jest.fn((callback) => {
        callback(mockPipe1);
        callback(mockPipe2);
      })
    };
    state.timer = {};
    state.game = {
      time: {
        events: {
          remove: jest.fn()
        }
      }
    };
    
    // Execute
    state.hitPipe();
    
    // Verify
    expect(state.bird.alive).toBe(false);
    expect(state.game.time.events.remove).toHaveBeenCalledWith(state.timer);
    expect(state.pipes.forEachAlive).toHaveBeenCalled();
    expect(mockPipe1.body.velocity.x).toBe(0);
    expect(mockPipe2.body.velocity.x).toBe(0);
  });
  
  test('module exports mainState in Node environment', () => {
    const exported = require('../game');
    expect(exported).toBe(mainState);
  });
  
  test('module exports are handled correctly in browser environment', () => {
    // Save original values
    const originalModule = global.module;
    const originalExports = global.exports;
    const originalRequire = global.require;
    
    // Mock browser environment by removing Node.js globals
    delete global.module;
    delete global.exports;
    delete global.require;
    
    // Clear the module cache to force re-execution
    jest.resetModules();
    
    // Execute the module in browser environment
    require('../game');
    
    // Restore globals
    global.module = originalModule;
    global.exports = originalExports;
    global.require = originalRequire;
  });
}); 