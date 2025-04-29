# Flappy Bird Clone

A simple Flappy Bird clone built with Phaser.js.

## Features

- Classic Flappy Bird gameplay
- Score tracking
- Responsive controls
- Collision detection
- Pipe generation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Game

To start the game server:
```
npm start
```

Then open your browser and navigate to `http://localhost:8080`

### Testing

Run the test suite:
```
npm test
```

Run tests in watch mode:
```
npm run test:watch
```

Generate test coverage report:
```
npm run test:coverage
```

## Project Structure

- `game.js` - Main game logic and Phaser configuration
- `__tests__/` - Test files
- `jest.setup.js` - Jest configuration for Phaser testing
- `jest.config.js` - Jest configuration

## Controls

- Press SPACE to make the bird jump
- Avoid hitting the pipes
- Try to get the highest score possible

## License

MIT 