import React from 'react';
import { useGame } from '../contexts/GameContext';

const GameUI = () => {
  const { state } = useGame();
  const { character } = state;

  const expPercentage = (character.exp / character.maxExp) * 100;
  const hpPercentage = (character.hp / character.maxHp) * 100;
  const spPercentage = (character.sp / character.maxSp) * 100;

  return (
    <>
      <div style={styles.statsContainer}>
        <div style={styles.characterInfo}>
          <div style={styles.avatar}></div>
          <div style={styles.levelBadge}>Lv.{character.level}</div>
        </div>
        <div style={styles.bars}>
          <div style={styles.barContainer}>
            <div style={{...styles.bar, ...styles.hpBar, width: `${hpPercentage}%`}}></div>
            <span style={styles.barText}>HP: {character.hp}/{character.maxHp}</span>
          </div>
          <div style={styles.barContainer}>
            <div style={{...styles.bar, ...styles.spBar, width: `${spPercentage}%`}}></div>
            <span style={styles.barText}>SP: {character.sp}/{character.maxSp}</span>
          </div>
          <div style={styles.barContainer}>
            <div style={{...styles.bar, ...styles.expBar, width: `${expPercentage}%`}}></div>
            <span style={styles.barText}>EXP: {character.exp}/{character.maxExp}</span>
          </div>
        </div>
      </div>
      <div style={styles.skillBar}>
        {[1, 2, 3, 4, 5].map((skill) => (
          <div key={skill} style={styles.skillSlot}>
            {skill}
            <div style={styles.keyHint}>{skill}</div>
          </div>
        ))}
      </div>
    </>
  );
};

const styles = {
  statsContainer: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    width: '250px',
    background: 'rgba(0,0,0,0.7)',
    borderRadius: '10px',
    padding: '10px',
    fontFamily: 'Arial, sans-serif',
    color: 'white',
    zIndex: 10,
  },
  characterInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'gray',
    border: '2px solid gold',
    marginRight: '10px',
  },
  levelBadge: {
    background: 'gold',
    color: 'black',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  bars: {
    width: '100%',
  },
  barContainer: {
    height: '20px',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '10px',
    marginBottom: '5px',
    position: 'relative',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    transition: 'width 0.3s ease-in-out',
  },
  hpBar: {
    background: 'linear-gradient(to right, #ff0000, #ff6666)',
  },
  spBar: {
    background: 'linear-gradient(to right, #0000ff, #6666ff)',
  },
  expBar: {
    background: 'linear-gradient(to right, #00ff00, #66ff66)',
  },
  barText: {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    textShadow: '1px 1px 2px black',
  },
  skillBar: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)',
    borderRadius: '10px',
    padding: '10px',
    zIndex: 10,
  },
  skillSlot: {
    width: '50px',
    height: '50px',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid #444',
    borderRadius: '5px',
    margin: '0 5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#ddd',
    position: 'relative',
  },
  keyHint: {
    position: 'absolute',
    top: '-15px',
    right: '-5px',
    background: 'gold',
    color: 'black',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default GameUI;