import React from 'react'
import { GameProvider } from './contexts/GameContext'
import GameWorld from './components/GameWorld'
import GameUI from './components/GameUI'

function App() {
  return (
    <GameProvider>
      <div style={styles.container}>
        <div style={styles.gameArea}>
          <GameWorld />
        </div>
        <GameUI />
      </div>
    </GameProvider>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#1a1a1a',
    overflow: 'hidden',
  },
  gameArea: {
    width: '800px',
    height: '600px',
    border: '2px solid #333',
    borderRadius: '10px',
    overflow: 'hidden',
  },
};

export default App