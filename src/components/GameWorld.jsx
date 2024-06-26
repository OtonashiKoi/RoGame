import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

// 導入圖片 (保持原有的導入)
import grassImg from '../assets/grass.png';
import treeImg from '../assets/tree.png';
import chestImg from '../assets/chest.png';
import characterImg from '../assets/character.png';
import characterAttackImg from '../assets/character_attack.png';
import redPotionImg from '../assets/red_potion.png';
import bluePotionImg from '../assets/blue_potion.png';
import swordImg from '../assets/sword.png';
import bowImg from '../assets/bow.png';
import axeImg from '../assets/axe.png';

const TILE_SIZE = 50;
const WORLD_SIZE = 20;
const EXTENDED_WORLD_SIZE = 30;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const SAFE_ZONE_SIZE = 3;

const GameWorld = () => {
  const { state, moveCharacter, useSkill, interact, dispatch } = useGameLogic();
  const worldRef = useRef(null);
  const [showChestPrompt, setShowChestPrompt] = useState(false);
  const [movePath, setMovePath] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  // 地圖生成函數
  const generateMap = useCallback(() => {
    const newMapTiles = [];
    const centerX = Math.floor(EXTENDED_WORLD_SIZE / 2);
    const centerY = Math.floor(EXTENDED_WORLD_SIZE / 2);
    
    for (let y = 0; y < EXTENDED_WORLD_SIZE; y++) {
      for (let x = 0; x < EXTENDED_WORLD_SIZE; x++) {
        let type = 'tree';
        
        if (x >= 5 && x < EXTENDED_WORLD_SIZE - 5 && y >= 5 && y < EXTENDED_WORLD_SIZE - 5) {
          const inSafeZone = Math.abs(x - centerX) < SAFE_ZONE_SIZE / 2 && 
                             Math.abs(y - centerY) < SAFE_ZONE_SIZE / 2;
          
          if (inSafeZone) {
            type = 'grass';
          } else if (Math.random() < 0.2) {
            type = 'tree';
          } else if (Math.random() < 0.05) {
            type = 'chest';
          } else {
            type = 'grass';
          }
        }
        newMapTiles.push({ x, y, type });
      }
    }
    return newMapTiles;
  }, []);

  // 初始化地圖和角色位置
  useEffect(() => {
    const newMapTiles = generateMap();
    const centerX = Math.floor(EXTENDED_WORLD_SIZE / 2);
    const centerY = Math.floor(EXTENDED_WORLD_SIZE / 2);
    dispatch({ type: 'SET_MAP_TILES', payload: newMapTiles });
    moveCharacter(centerX, centerY);
  }, [dispatch, moveCharacter, generateMap]);

  // 檢查是否可以移動到目標位置
  const canMoveTo = useCallback((x, y) => {
    const tile = state.mapTiles.find(t => t.x === x && t.y === y);
    return tile && tile.type !== 'tree';
  }, [state.mapTiles]);

  // 簡單的尋路算法（廣度優先搜索）
  const findPath = useCallback((startX, startY, targetX, targetY) => {
    const queue = [[startX, startY]];
    const visited = new Set();
    const parent = new Map();
    
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
      
      if (x === targetX && y === targetY) {
        const path = [];
        let current = key;
        while (current) {
          const [cx, cy] = current.split(',').map(Number);
          path.unshift([cx, cy]);
          current = parent.get(current);
        }
        return path;
      }
      
      if (!visited.has(key)) {
        visited.add(key);
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          if (canMoveTo(newX, newY) && !visited.has(`${newX},${newY}`)) {
            queue.push([newX, newY]);
            parent.set(`${newX},${newY}`, key);
          }
        }
      }
    }
    
    return null;
  }, [canMoveTo]);

  // 處理移動
  const handleMove = useCallback((targetX, targetY) => {
    const path = findPath(state.character.x, state.character.y, targetX, targetY);
    if (path && path.length > 1) {
      setMovePath(path.slice(1));
    }
  }, [state.character, findPath]);

  // 執行移動
  useEffect(() => {
    if (movePath.length > 0) {
      const timer = setTimeout(() => {
        const [nextX, nextY] = movePath[0];
        moveCharacter(nextX, nextY);
        setMovePath(prev => prev.slice(1));
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [movePath, moveCharacter]);

  // 處理寶箱交互
  const handleChestInteraction = useCallback(() => {
    const { x, y } = state.character;
    const surroundingTiles = [
      { x: x-1, y }, { x: x+1, y }, { x, y: y-1 }, { x, y: y+1 }, { x, y }
    ];
    const chestTile = surroundingTiles.find(tile => 
      state.mapTiles.find(mapTile => 
        mapTile.x === tile.x && mapTile.y === tile.y && mapTile.type === 'chest'
      )
    );
    if (chestTile) {
      console.log('Opening chest!');
      const items = ['red_potion', 'blue_potion', 'sword', 'bow'];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      dispatch({ type: 'OPEN_CHEST', payload: { ...chestTile, item: randomItem } });
      if (randomItem === 'sword' || randomItem === 'bow') {
        dispatch({ type: 'EQUIP_WEAPON', payload: randomItem });
      }
    }
  }, [state.character, state.mapTiles, dispatch]);

  // 處理攻擊
  const handleAttack = useCallback(() => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 300);
    // 這裡可以添加攻擊邏輯，例如檢查是否擊中敵人等
  }, []);

  // 監聽鍵盤事件
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        handleChestInteraction();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInventory(prev => !prev);
      } else if (e.key === '1') {
        handleAttack();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleChestInteraction, handleAttack]);

  // 檢查是否靠近寶箱
  useEffect(() => {
    const { x, y } = state.character;
    const surroundingTiles = [
      { x: x-1, y }, { x: x+1, y }, { x, y: y-1 }, { x, y: y+1 }, { x, y }
    ];
    const nearbyChest = surroundingTiles.some(tile => 
      state.mapTiles.find(mapTile => 
        mapTile.x === tile.x && mapTile.y === tile.y && mapTile.type === 'chest'
      )
    );
    setShowChestPrompt(nearbyChest);
  }, [state.character, state.mapTiles]);

  const getTileImage = (type) => {
    switch (type) {
      case 'tree': return treeImg;
      case 'chest': return chestImg;
      default: return grassImg;
    }
  };

  const getItemImage = (itemType) => {
    switch (itemType) {
      case 'red_potion': return redPotionImg;
      case 'blue_potion': return bluePotionImg;
      case 'sword': return swordImg;
      case 'bow': return bowImg;
      default: return null;
    }
  };

  const viewportStyle = {
    position: 'absolute',
    width: EXTENDED_WORLD_SIZE * TILE_SIZE,
    height: EXTENDED_WORLD_SIZE * TILE_SIZE,
    transform: `translate(${-state.character.x * TILE_SIZE + VIEWPORT_WIDTH / 2}px, ${-state.character.y * TILE_SIZE + VIEWPORT_HEIGHT / 2}px)`,
    transition: 'transform 0.3s'
  };

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={worldRef}
        style={{
          width: `${VIEWPORT_WIDTH}px`,
          height: `${VIEWPORT_HEIGHT}px`,
          position: 'relative',
          overflow: 'hidden',
          background: '#87CEEB',
        }}
      >
        <div style={viewportStyle}>
          {state.mapTiles && state.mapTiles.length > 0 ? (
            state.mapTiles.map((tile, index) => (
              <div 
                key={index} 
                onClick={() => handleMove(tile.x, tile.y)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  useSkill(1, tile.x, tile.y);
                }}
                style={{
                  position: 'absolute',
                  left: tile.x * TILE_SIZE,
                  top: tile.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundImage: `url(${getTileImage(tile.type)})`,
                  backgroundSize: 'cover',
                  cursor: 'pointer'
                }} 
              />
            ))
          ) : (
            <div>No tiles to render</div>
          )}
          {state.character && (
            <div
              style={{
                position: 'absolute',
                left: state.character.x * TILE_SIZE,
                top: state.character.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundImage: `url(${isAttacking ? characterAttackImg : characterImg})`,
                backgroundSize: 'cover',
                zIndex: 10,
                transition: 'left 0.3s, top 0.3s',
                transform: isAttacking ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          )}
        </div>
      </div>
      
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button onClick={() => setShowInventory(prev => !prev)} style={{
          padding: '10px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          物品欄
        </button>
      </div>

      {showInventory && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 30,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px'
        }}>
          {state.inventory && state.inventory.length > 0 ? (
            state.inventory.map((item, index) => (
              <div key={index} style={{
                width: '50px',
                height: '50px',
                background: `url(${getItemImage(item)}) no-repeat center/cover`,
                border: '1px solid white'
              }} />
            ))
          ) : (
            <div style={{ color: 'white', gridColumn: 'span 5', textAlign: 'center' }}>
              物品欄是空的
            </div>
          )}
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '5px',
        borderRadius: '5px'
      }}>
        當前武器: {state.equippedWeapon || '空手'}
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