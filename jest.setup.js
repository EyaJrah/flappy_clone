// Mock Phaser
global.Phaser = {
  Game: jest.fn(),
  Scene: jest.fn(),
  Physics: {
    ARCADE: 'arcade',
    Arcade: {
      Sprite: jest.fn(),
      Group: jest.fn(),
      PhysicsGroup: jest.fn()
    }
  },
  GameObjects: {
    Sprite: jest.fn(),
    Group: jest.fn(),
    Text: jest.fn(),
    Rectangle: jest.fn()
  },
  Math: {
    Vector2: jest.fn()
  },
  Input: {
    Keyboard: {
      KeyCode: {
        SPACE: 32
      }
    }
  },
  Keyboard: {
    SPACEBAR: 32
  }
};

// Mock canvas
global.HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4)
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({
    width: 0
  })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn()
}); 