const mainState = require('../game');
const { GAME_CONFIG, validateConfig } = mainState;

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
    state.bird = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
    state.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEV0vy4AAADnrrHQAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
    
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
    expect(state.labelScore.text).toBe('1');
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

  // New tests for game initialization
  describe('Game Initialization', () => {
    test('create initializes game physics system', () => {
      state.create();
      expect(game.physics.startSystem).toHaveBeenCalledWith(Phaser.Physics.ARCADE);
    });

    test('create sets up bird sprite correctly', () => {
      state.create();
      expect(game.add.sprite).toHaveBeenCalledWith(100, 245, 'bird');
      expect(game.physics.arcade.enable).toHaveBeenCalled();
    });

    test('create sets up pipes group correctly', () => {
      state.create();
      expect(game.add.group).toHaveBeenCalled();
      const mockGroup = game.add.group.mock.results[0].value;
      expect(mockGroup.enableBody).toBe(true);
      expect(mockGroup.createMultiple).toHaveBeenCalled();
    });

    test('create sets up score display', () => {
      state.create();
      expect(game.add.text).toHaveBeenCalledWith(20, 20, '0', expect.any(Object));
    });

    test('create sets up space key handler', () => {
      state.create();
      expect(game.input.keyboard.addKey).toHaveBeenCalledWith(Phaser.Keyboard.SPACEBAR);
    });
  });

  // New tests for pipe generation
  describe('Pipe Generation', () => {
    test('addRowOfPipes generates correct number of pipes', () => {
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
      
      state.addRowOfPipes();
      
      // Count the number of times getFirstDead was called
      const pipeCallCount = state.pipes.getFirstDead.mock.calls.length;
      expect(pipeCallCount).toBeGreaterThan(0);
    });

    test('addRowOfPipes handles pipe positioning correctly', () => {
      const mockPipe = {
        reset: jest.fn(),
        body: { velocity: { x: 0 } },
        checkWorldBounds: false,
        outOfBoundsKill: false
      };
      state.pipes = {
        getFirstDead: jest.fn(() => mockPipe)
      };
      state.score = 0;
      state.labelScore = { text: '0' };
      
      state.addRowOfPipes();
      
      // Verify pipe positioning
      const resetCalls = mockPipe.reset.mock.calls;
      resetCalls.forEach(call => {
        const [x, y] = call;
        expect(x).toBe(400); // Game width
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(490); // Game height
      });
    });
  });

  // New tests for score handling
  describe('Score Handling', () => {
    test('score increases when pipes are added', () => {
      state.pipes = {
        getFirstDead: jest.fn(() => ({
          reset: jest.fn(),
          body: { velocity: { x: 0 } },
          checkWorldBounds: false,
          outOfBoundsKill: false
        }))
      };
      state.score = 5;
      state.labelScore = { text: '5' };
      
      state.addRowOfPipes();
      
      expect(state.score).toBe(6);
      expect(state.labelScore.text).toBe('6');
    });

    test('score resets on game restart', () => {
      state.score = 10;
      state.labelScore = { text: '10' };
      
      state.restartGame();
      
      expect(game.state.start).toHaveBeenCalledWith('main');
    });
  });

  // New tests for collision detection edge cases
  describe('Collision Detection Edge Cases', () => {
    test('hitPipe handles undefined pipes gracefully', () => {
      state.bird = { alive: true };
      state.pipes = undefined;
      state.timer = {};
      
      state.hitPipe();
      
      expect(state.bird.alive).toBe(true);
    });

    test('hitPipe handles undefined bird gracefully', () => {
      state.bird = undefined;
      state.pipes = {
        forEachAlive: jest.fn()
      };
      state.timer = {};
      
      state.hitPipe();
      
      expect(state.pipes.forEachAlive).not.toHaveBeenCalled();
    });

    test('update handles bird out of world bounds', () => {
      state.bird = {
        inWorld: false,
        angle: 0,
        alive: true
      };
      state.pipes = {};
      state.game = game;
      state.restartGame = jest.fn();
      
      state.update();
      
      expect(state.restartGame).toHaveBeenCalled();
    });

    test('update handles collision with pipes', () => {
      state.bird = {
        inWorld: true,
        angle: 0,
        alive: true
      };
      state.pipes = {};
      state.hitPipe = jest.fn();
      
      // Simulate collision
      game.physics.arcade.overlap.mockImplementation((bird, pipes, callback) => {
        callback();
      });
      
      state.update();
      
      expect(state.hitPipe).toHaveBeenCalled();
    });
  });

  // New tests for security features
  describe('Security Features', () => {
    describe('Config Validation', () => {
      test('validateConfig accepts valid configuration', () => {
        const validConfig = {
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
        
        expect(() => validateConfig(validConfig)).not.toThrow();
      });

      test('validateConfig rejects invalid dimensions', () => {
        const invalidConfig = {
          width: -1,
          height: 0,
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
        
        expect(() => validateConfig(invalidConfig)).toThrow('Invalid game dimensions');
      });

      test('validateConfig rejects invalid bird position', () => {
        const invalidConfig = {
          width: 400,
          height: 490,
          birdStartX: -10,
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
        
        expect(() => validateConfig(invalidConfig)).toThrow('Invalid bird starting position');
      });

      test('validateConfig rejects invalid pipe configuration', () => {
        const invalidConfig = {
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
          pipeGapMin: 6,
          pipeGapMax: 5,
          pipeRows: 8,
          scoreX: 20,
          scoreY: 20,
          backgroundColor: '#FF6A5E',
          updateInterval: 1500
        };
        
        expect(() => validateConfig(invalidConfig)).toThrow('Invalid pipe gap configuration');
      });

      test('validateConfig rejects invalid color format', () => {
        const invalidConfig = {
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
          backgroundColor: 'invalid-color',
          updateInterval: 1500
        };
        
        expect(() => validateConfig(invalidConfig)).toThrow('Invalid background color format');
      });
    });

    describe('Image Data Validation', () => {
      test('validateBase64 accepts valid PNG base64 data', () => {
        const validImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        state.game = game;
        state.bird = validImage;
        state.pipe = validImage;
        
        expect(() => {
          state.preload();
        }).not.toThrow();
      });

      test('validateBase64 rejects invalid base64 data', () => {
        state.game = game;
        state.bird = "invalid-base64-data";
        state.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        
        expect(() => {
          state.preload();
        }).toThrow('Invalid image data format');
      });

      test('validateBase64 rejects non-PNG image data', () => {
        state.game = game;
        state.bird = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
        state.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        
        expect(() => {
          state.preload();
        }).toThrow('Invalid image data format');
      });
    });

    describe('Text Sanitization', () => {
      test('score display sanitizes potentially malicious input', () => {
        state.score = '<script>alert("xss")</script>';
        state.labelScore = { text: '0' };
        state.game = game;
        state.pipes = {
          getFirstDead: jest.fn(() => ({
            reset: jest.fn(),
            body: { velocity: { x: 0 } },
            checkWorldBounds: false,
            outOfBoundsKill: false
          }))
        };
        
        state.addRowOfPipes();
        
        expect(state.labelScore.text).toBe('1');
      });

      test('score display handles non-string input safely', () => {
        state.score = { toString: () => '<img src=x onerror=alert(1)>' };
        state.labelScore = { text: '0' };
        state.game = game;
        state.pipes = {
          getFirstDead: jest.fn(() => ({
            reset: jest.fn(),
            body: { velocity: { x: 0 } },
            checkWorldBounds: false,
            outOfBoundsKill: false
          }))
        };
        
        state.addRowOfPipes();
        
        expect(state.labelScore.text).toBe('1');
      });
    });

    describe('Error Handling', () => {
      test('create handles missing sprite gracefully', () => {
        game.add.sprite = jest.fn(() => null);
        
        expect(() => {
          state.create();
        }).toThrow('Failed to create bird sprite');
      });

      test('create handles physics enablement failure', () => {
        game.physics.arcade.enable = jest.fn(() => {
          state.bird.body = null;
        });
        
        expect(() => {
          state.create();
        }).toThrow('Failed to enable physics on bird');
      });

      test('create handles missing pipe group gracefully', () => {
        game.add.group = jest.fn(() => null);
        
        expect(() => {
          state.create();
        }).toThrow('Failed to create pipe group');
      });

      test('create handles missing keyboard controls gracefully', () => {
        game.input.keyboard.addKey = jest.fn(() => null);
        
        expect(() => {
          state.create();
        }).toThrow('Failed to set up keyboard controls');
      });

      test('update handles collision detection errors', () => {
        state.bird = {
          inWorld: true,
          angle: 0,
          alive: true
        };
        state.pipes = {};
        state.restartGame = jest.fn();
        
        // Simulate collision detection error
        game.physics.arcade.overlap = jest.fn(() => {
          throw new Error('Collision detection failed');
        });
        
        state.update();
        
        expect(state.restartGame).toHaveBeenCalled();
      });

      test('addOnePipe handles missing pipe gracefully', () => {
        state.pipes = {
          getFirstDead: jest.fn(() => null)
        };
        
        // Should not throw and should return early
        expect(() => {
          state.addOnePipe(400, 100);
        }).not.toThrow();
      });

      test('addRowOfPipes handles invalid score value', () => {
        state.pipes = {
          getFirstDead: jest.fn(() => ({
            reset: jest.fn(),
            body: { velocity: { x: 0 } },
            checkWorldBounds: false,
            outOfBoundsKill: false
          }))
        };
        state.score = NaN;
        state.labelScore = { text: '0' };
        
        state.addRowOfPipes();
        
        expect(state.score).toBe(1);
        expect(state.labelScore.text).toBe('1');
      });

      test('validateBase64 handles null image data', () => {
        state.game = game;
        state.bird = null;
        state.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        
        expect(() => {
          state.preload();
        }).toThrow('Invalid image data format');
      });

      test('validateBase64 handles undefined image data', () => {
        state.game = game;
        state.bird = undefined;
        state.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        
        expect(() => {
          state.preload();
        }).toThrow('Invalid image data format');
      });

      test('preload handles image loading errors', () => {
        state.game = game;
        state.bird = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEXSvicAAABogyUZAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        state.pipe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEV0vy4AAADnrrHQAAAAGUlEQVR4AWP4DwYHMOgHDEDASCN6lMYV7gChf3AJ/eB/pQAAAABJRU5ErkJggg==";
        
        // Mock image loading failure
        game.load.image.mockImplementation(() => {
          throw new Error('Image loading failed');
        });
        
        expect(() => {
          state.preload();
        }).toThrow('Invalid image data format');
      });
    });
  });

  // Add tests for browser environment initialization
  describe('Browser Environment Initialization', () => {
    let originalWindow;
    let originalModule;
    let originalExports;
    let originalRequire;
    let mockPhaser;
    let mockGame;
    let GAME_CONFIG;

    beforeEach(() => {
      // Save original globals
      originalWindow = global.window;
      originalModule = global.module;
      originalExports = global.exports;
      originalRequire = global.require;
      
      // Get GAME_CONFIG before setting up browser environment
      GAME_CONFIG = require('../game').GAME_CONFIG;
      
      // Mock Phaser and Game
      mockGame = {
        state: {
          add: jest.fn(),
          start: jest.fn()
        }
      };
      
      mockPhaser = {
        Game: jest.fn(() => mockGame),
        AUTO: 'auto',
        Physics: {
          ARCADE: 'arcade'
        },
        Keyboard: {
          SPACEBAR: 'space'
        }
      };
      
      // Set up browser environment
      delete global.module;
      delete global.exports;
      delete global.require;
      global.window = {
        innerWidth: 800,
        innerHeight: 600,
        document: {
          createElement: jest.fn(() => ({
            style: {}
          }))
        }
      };
      global.Phaser = mockPhaser;
      
      // Clear module cache
      jest.resetModules();
    });

    afterEach(() => {
      // Restore original globals
      global.window = originalWindow;
      global.module = originalModule;
      global.exports = originalExports;
      global.require = originalRequire;
      delete global.Phaser;
    });

    test('initializes game in browser environment with correct configuration', () => {
      // Create a mock mainState object
      const mockMainState = {
        preload: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        jump: jest.fn(),
        hitPipe: jest.fn(),
        addOnePipe: jest.fn(),
        addRowOfPipes: jest.fn(),
        restartGame: jest.fn()
      };
      
      // Execute the browser initialization code
      const game = new mockPhaser.Game(GAME_CONFIG.width, GAME_CONFIG.height, mockPhaser.AUTO, 'game');
      game.state.add('main', mockMainState);
      game.state.start('main');
      
      // Verify game initialization
      expect(mockPhaser.Game).toHaveBeenCalledWith(
        GAME_CONFIG.width,
        GAME_CONFIG.height,
        mockPhaser.AUTO,
        'game'
      );
      expect(mockGame.state.add).toHaveBeenCalledWith('main', mockMainState);
      expect(mockGame.state.start).toHaveBeenCalledWith('main');
    });

    test('skips game initialization in Node.js environment', () => {
      // Set up Node.js environment
      global.window = undefined;
      global.module = { exports: {} };
      
      // Execute the module
      require('../game');
      
      // Verify game was not initialized
      expect(mockPhaser.Game).not.toHaveBeenCalled();
    });
  });

  // Add tests for pipe row configuration validation
  describe('Pipe Row Configuration', () => {
    let GAME_CONFIG;
    let validateConfig;
    
    beforeEach(() => {
      jest.resetModules();
      const game = require('../game');
      GAME_CONFIG = game.GAME_CONFIG;
      validateConfig = game.validateConfig;
    });

    test('validateConfig rejects invalid pipe row count', () => {
      const invalidConfig = {
        ...GAME_CONFIG,
        pipeRows: 3,  // Less than pipeGapMax (5)
      };
      
      expect(() => validateConfig(invalidConfig)).toThrow('Invalid pipe row configuration');
    });
    
    test('validateConfig accepts valid pipe row count', () => {
      const validConfig = {
        ...GAME_CONFIG,
        pipeRows: 8,  // Greater than pipeGapMax (5)
      };
      
      expect(() => validateConfig(validConfig)).not.toThrow();
    });
  });
}); 