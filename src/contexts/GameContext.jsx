import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const WORLD_SIZE = 20;

const initialState = {
  character: {
    x: Math.floor(WORLD_SIZE / 2),
    y: Math.floor(WORLD_SIZE / 2),
    level: 1,
    hp: 100,
    maxHp: 100,
    sp: 50,
    maxSp: 50,
    exp: 0,
    maxExp: 100,
  },
  mapTiles: [],
  inventory: [],
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'MOVE_CHARACTER':
      return {
        ...state,
        character: {
          ...state.character,
          x: action.payload.x,
          y: action.payload.y,
        },
      };
    case 'USE_SKILL':
      console.log(`使用技能 ${action.payload.skillIndex} 在位置 (${action.payload.x}, ${action.payload.y})`);
      return state;
    case 'OPEN_CHEST':
      console.log(`開啟位置 (${action.payload.x}, ${action.payload.y}) 的寶箱`);
      return {
        ...state,
        mapTiles: state.mapTiles.map(tile => 
          tile.x === action.payload.x && tile.y === action.payload.y
            ? {...tile, type: 'grass'}
            : tile
        ),
        inventory: [...state.inventory, '寶物']
      };
    case 'SET_MAP_TILES':
      return {
        ...state,
        mapTiles: action.payload
      };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}