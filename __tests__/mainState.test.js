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
          body: { gravity: { y: 0 } },
          angle: 0,
          alive: true
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
  
  test('create initializes physics and game objects', () => {
    state.create();
    
    expect(game.physics.startSystem).toHaveBeenCalledWith(Phaser.Physics.ARCADE);
    expect(game.add.group).toHaveBeenCalled();
    expect(game.add.sprite).toHaveBeenCalledWith(100, 245, 'bird');
    expect(game.physics.arcade.enable).toHaveBeenCalled();
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
}); 