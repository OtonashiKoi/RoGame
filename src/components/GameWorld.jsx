import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

const TILE_SIZE = 50;
const WORLD_SIZE = 20;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const SAFE_ZONE_SIZE = 3;

// 添加 findPath 函數
const findPath = (start, end, mapTiles) => {
  const queue = [[start]];
  const visited = new Set();
  const key = (x, y) => `${x},${y}`;
  
  while (queue.length > 0) {
    const path = queue.shift();
    const { x, y } = path[path.length - 1];
    
    if (x === end.x && y === end.y) {
      return path;
    }
    
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const newKey = key(newX, newY);
      
      if (!visited.has(newKey) && 
          newX >= 0 && newX < WORLD_SIZE && 
          newY >= 0 && newY < WORLD_SIZE) {
        const tile = mapTiles.find(t => t.x === newX && t.y === newY);
        if (tile && tile.type !== 'tree') {
          visited.add(newKey);
          queue.push([...path, { x: newX, y: newY }]);
        }
      }
    }
  }
  
  return null; // 沒有找到路徑
};

const GameWorld = () => {
  const { state, moveCharacter, useSkill, interact, dispatch } = useGameLogic();
  const worldRef = useRef(null);
  const [movePath, setMovePath] = useState([]);
  const [showChestPrompt, setShowChestPrompt] = useState(false);

  useEffect(() => {
    // 生成隨機地圖
    const newMapTiles = [];
    const centerX = Math.floor(WORLD_SIZE / 2);
    const centerY = Math.floor(WORLD_SIZE / 2);
    
    for (let y = 0; y < WORLD_SIZE; y++) {
      for (let x = 0; x < WORLD_SIZE; x++) {
        let type = 'grass';
        
        // 檢查是否在安全區內
        const inSafeZone = Math.abs(x - centerX) < SAFE_ZONE_SIZE / 2 && 
                           Math.abs(y - centerY) < SAFE_ZONE_SIZE / 2;
        
        if (x === 0 || y === 0 || x === WORLD_SIZE - 1 || y === WORLD_SIZE - 1) {
          type = 'tree'; // 邊界設為樹
        } else if (!inSafeZone && Math.random() < 0.2) {
          type = 'tree';
        } else if (!inSafeZone && Math.random() < 0.05) {
          type = 'chest';
        }
        newMapTiles.push({ x, y, type });
      }
    }
    
    // 將角色放置在安全區域的隨機位置
    const safeX = centerX + Math.floor(Math.random() * SAFE_ZONE_SIZE - SAFE_ZONE_SIZE / 2);
    const safeY = centerY + Math.floor(Math.random() * SAFE_ZONE_SIZE - SAFE_ZONE_SIZE / 2);
    moveCharacter(safeX, safeY);
    
    dispatch({ type: 'SET_MAP_TILES', payload: newMapTiles });
  }, [moveCharacter, dispatch]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        interact();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [interact]);

  useEffect(() => {
    // 檢查是否靠近寶箱
    const nearbyChest = state.mapTiles.find(tile => 
      tile.type === 'chest' && 
      Math.abs(tile.x - state.character.x) <= 1 && 
      Math.abs(tile.y - state.character.y) <= 1
    );
    setShowChestPrompt(!!nearbyChest);
  }, [state.character, state.mapTiles]);

  const handleClick = useCallback((targetX, targetY) => {
    const path = findPath(state.character, { x: targetX, y: targetY }, state.mapTiles);
    if (path) {
      setMovePath(path.slice(1)); // 移除起始位置
    }
  }, [state.character, state.mapTiles]);

  useEffect(() => {
    if (movePath.length > 0) {
      const timer = setTimeout(() => {
        const nextPos = movePath[0];
        moveCharacter(nextPos.x, nextPos.y);
        setMovePath(prev => prev.slice(1));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [movePath, moveCharacter]);

  const handleSkillUse = (skillIndex, x, y) => {
    const targetTile = state.mapTiles.find(tile => tile.x === x && tile.y === y);
    if (targetTile && targetTile.type === 'tree') {
      useSkill(skillIndex, x, y);
      dispatch({ type: 'SET_MAP_TILES', payload: state.mapTiles.map(tile => 
        tile.x === x && tile.y === y ? {...tile, type: 'grass'} : tile
      )});
    }
  };

  const viewportStyle = {
    position: 'absolute',
    width: WORLD_SIZE * TILE_SIZE,
    height: WORLD_SIZE * TILE_SIZE,
    transform: `translate(${-state.character.x * TILE_SIZE + VIEWPORT_WIDTH / 2}px, ${-state.character.y * TILE_SIZE + VIEWPORT_HEIGHT / 2}px)`,
    transition: 'transform 0.3s'
  };

  return (
    <div 
      ref={worldRef}
      style={{
        width: `${VIEWPORT_WIDTH}px`,
        height: `${VIEWPORT_HEIGHT}px`,
        position: 'relative',
        overflow: 'hidden',
        background: '#87CEEB', // 天空藍色背景
      }}
    >
      <div style={viewportStyle}>
        {state.mapTiles.map((tile, index) => (
          <div 
            key={index} 
            onClick={() => handleClick(tile.x, tile.y)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleSkillUse(1, tile.x, tile.y);
            }}
            style={{
              position: 'absolute',
              left: tile.x * TILE_SIZE,
              top: tile.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              background: tile.type === 'tree' ? 'green' : 
                          tile.type === 'chest' ? 'gold' : 'lightgreen',
              border: '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }} 
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: state.character.x * TILE_SIZE,
            top: state.character.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            background: 'red',
            borderRadius: '50%',
            zIndex: 10,
            transition: 'left 0.3s, top 0.3s'
          }}
        />
      </div>
      {showChestPrompt && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -150px)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 20
        }}>
          按 F 開啟寶箱
        </div>
      )}
    </div>
  );
};

export default GameWorld;