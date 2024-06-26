import { useCallback } from 'react';
import { useGame } from '../contexts/GameContext';

export function useGameLogic() {
  const { state, dispatch } = useGame();

  const moveCharacter = useCallback((x, y) => {
    dispatch({ type: 'MOVE_CHARACTER', payload: { x, y } });
  }, [dispatch]);

  const useSkill = useCallback((skillIndex, x, y) => {
    console.log(`使用技能 ${skillIndex} 在位置 (${x}, ${y})`);
    dispatch({ type: 'USE_SKILL', payload: { skillIndex, x, y } });
  }, [dispatch]);

  const interact = useCallback(() => {
    const { x, y } = state.character;
    const surroundingTiles = [
      { x: x-1, y }, { x: x+1, y }, { x, y: y-1 }, { x, y: y+1 }
    ];
    const chestTile = surroundingTiles.find(tile => 
      state.mapTiles.find(mapTile => 
        mapTile.x === tile.x && mapTile.y === tile.y && mapTile.type === 'chest'
      )
    );
    if (chestTile) {
      console.log('打開寶箱！');
      dispatch({ type: 'OPEN_CHEST', payload: chestTile });
    }
  }, [state.character, state.mapTiles, dispatch]);

  return { state, moveCharacter, useSkill, interact, dispatch };
}