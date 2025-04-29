// Mock Phaser for testing
global.Phaser = {
  Game: jest.fn(),
  Physics: {
    ARCADE: 'arcade'
  },
  AUTO: 'auto',
  Keyboard: {
    SPACEBAR: 32
  }
};

// Mock canvas and WebGL context
const createCanvasMock = () => {
  const canvas = {
    getContext: jest.fn(() => ({
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
    }))
  };
  return canvas;
};

// Mock document.createElement
document.createElement = jest.fn((tagName) => {
  if (tagName === 'canvas') {
    return createCanvasMock();
  }
  return {};
});

// Mock window.requestAnimationFrame
window.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
window.cancelAnimationFrame = jest.fn();

// Mock audio context
window.AudioContext = jest.fn(() => ({
  createBuffer: jest.fn(),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 0 }
  }))
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock console methods to prevent noise in tests
console.error = jest.fn();
console.warn = jest.fn();
console.log = jest.fn(); 