import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Character, Monster, DungeonTile } from '@/types/game';
import { generateMonster } from '@/data/gameData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as THREE from 'three';

interface Dungeon3DProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

const DUNGEON_SIZE = 8;
const TILE_SIZE = 2;

function Floor({ position, revealed }: { position: [number, number, number]; revealed: boolean }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
      <meshStandardMaterial 
        color={revealed ? '#2a1810' : '#000000'} 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

function Wall({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[TILE_SIZE, TILE_SIZE * 2, TILE_SIZE]} />
      <meshStandardMaterial 
        color="#4a3020" 
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

function Player({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1e40af" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.3} />
      </mesh>
      <pointLight position={[0, 1, 0]} intensity={2} distance={5} color="#3b82f6" />
    </group>
  );
}

function MonsterMesh({ position, type }: { position: [number, number, number]; type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.y += 0.02;
    }
  });

  const color = type === 'undead' ? '#8b5cf6' : type === 'demon' ? '#dc2626' : '#f97316';
  const emissive = type === 'undead' ? '#6d28d9' : type === 'demon' ? '#991b1b' : '#c2410c';

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 1.2, 1]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.6} />
      </mesh>
      <pointLight position={[0, 1, 0]} intensity={3} distance={6} color={color} />
    </group>
  );
}

function Scene({ 
  dungeon, 
  character, 
  monsters 
}: { 
  dungeon: DungeonTile[][]; 
  character: Character; 
  monsters: Monster[];
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (cameraRef.current) {
      const targetX = character.position.x * TILE_SIZE;
      const targetZ = character.position.y * TILE_SIZE;
      
      cameraRef.current.position.x = THREE.MathUtils.lerp(
        cameraRef.current.position.x,
        targetX + 8,
        0.05
      );
      cameraRef.current.position.z = THREE.MathUtils.lerp(
        cameraRef.current.position.z,
        targetZ + 8,
        0.05
      );
      
      cameraRef.current.lookAt(targetX, 0, targetZ);
    }
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[10, 12, 10]} 
        fov={60}
      />
      
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <fog attach="fog" args={['#000000', 5, 25]} />

      {dungeon.map((row, y) =>
        row.map((tile, x) => {
          const pos: [number, number, number] = [x * TILE_SIZE, 0, y * TILE_SIZE];
          
          return (
            <group key={`${x}-${y}`}>
              <Floor position={pos} revealed={tile.revealed} />
              {tile.type === 'wall' && tile.revealed && (
                <Wall position={[x * TILE_SIZE, TILE_SIZE, y * TILE_SIZE]} />
              )}
            </group>
          );
        })
      )}

      <Player 
        position={[
          character.position.x * TILE_SIZE, 
          0, 
          character.position.y * TILE_SIZE
        ]} 
      />

      {monsters.filter(m => m.isAlive).map((monster) => {
        const tile = dungeon[monster.position.y]?.[monster.position.x];
        if (!tile?.revealed) return null;
        
        return (
          <MonsterMesh
            key={monster.id}
            position={[
              monster.position.x * TILE_SIZE,
              0,
              monster.position.y * TILE_SIZE
            ]}
            type={monster.type}
          />
        );
      })}
    </>
  );
}

export default function Dungeon3D({ character, onCharacterUpdate }: Dungeon3DProps) {
  const [dungeon, setDungeon] = useState<DungeonTile[][]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [inCombat, setInCombat] = useState(false);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  useEffect(() => {
    generateDungeon();
  }, []);

  const generateDungeon = () => {
    const newDungeon: DungeonTile[][] = [];
    const newMonsters: Monster[] = [];

    for (let y = 0; y < DUNGEON_SIZE; y++) {
      const row: DungeonTile[] = [];
      for (let x = 0; x < DUNGEON_SIZE; x++) {
        const isWall = Math.random() < 0.15 && !(x === 0 && y === 0);
        row.push({
          x,
          y,
          type: isWall ? 'wall' : 'floor',
          walkable: !isWall,
          revealed: x === 0 && y === 0,
        });
      }
      newDungeon.push(row);
    }

    for (let i = 0; i < 5; i++) {
      const monster = generateMonster(character.level);
      let x, y;
      do {
        x = Math.floor(Math.random() * DUNGEON_SIZE);
        y = Math.floor(Math.random() * DUNGEON_SIZE);
      } while ((x === 0 && y === 0) || !newDungeon[y][x].walkable);
      
      monster.position = { x, y };
      newMonsters.push(monster);
    }

    setDungeon(newDungeon);
    setMonsters(newMonsters);
  };

  const moveCharacter = (dx: number, dy: number) => {
    if (inCombat) return;

    const newX = character.position.x + dx;
    const newY = character.position.y + dy;

    if (
      newX < 0 || newX >= DUNGEON_SIZE ||
      newY < 0 || newY >= DUNGEON_SIZE ||
      !dungeon[newY][newX].walkable
    ) {
      return;
    }

    const monsterAtPosition = monsters.find(
      m => m.position.x === newX && m.position.y === newY && m.isAlive
    );

    if (monsterAtPosition) {
      startCombat(monsterAtPosition);
      return;
    }

    const updatedChar = { ...character, position: { x: newX, y: newY } };
    onCharacterUpdate(updatedChar);

    const newDungeon = dungeon.map(row =>
      row.map(tile => ({
        ...tile,
        revealed: tile.revealed || 
          (Math.abs(tile.x - newX) <= 1 && Math.abs(tile.y - newY) <= 1)
      }))
    );
    setDungeon(newDungeon);
  };

  const startCombat = (monster: Monster) => {
    setInCombat(true);
    setCurrentMonster(monster);
    setCombatLog([`Вы встретили ${monster.name}! (Уровень ${monster.level})`]);
  };

  const attack = () => {
    if (!currentMonster) return;

    const playerDamage = Math.max(1, character.combat.damage - currentMonster.defense);
    const monsterDamage = Math.max(1, currentMonster.damage - character.combat.defense);

    const updatedMonster = {
      ...currentMonster,
      health: Math.max(0, currentMonster.health - playerDamage),
    };

    const newLog = [...combatLog];
    newLog.push(`Вы наносите ${playerDamage} урона!`);

    if (updatedMonster.health <= 0) {
      updatedMonster.isAlive = false;
      newLog.push(`${currentMonster.name} повержен!`);
      newLog.push(`+${currentMonster.experience} опыта, +${currentMonster.goldDrop} золота`);

      const newExp = character.experience + currentMonster.experience;
      const newGold = character.gold + currentMonster.goldDrop;
      let newLevel = character.level;
      let newExpNeeded = character.experienceToNextLevel;
      let newStats = { ...character.stats };
      let newCombat = { ...character.combat };

      if (newExp >= character.experienceToNextLevel) {
        newLevel++;
        newExpNeeded = Math.floor(newExpNeeded * 1.5);
        newStats = {
          strength: character.stats.strength + 2,
          dexterity: character.stats.dexterity + 2,
          intelligence: character.stats.intelligence + 2,
          vitality: character.stats.vitality + 2,
        };
        newCombat = {
          ...character.combat,
          maxHealth: character.combat.maxHealth + 20,
          health: character.combat.maxHealth + 20,
          maxMana: character.combat.maxMana + 10,
          mana: character.combat.maxMana + 10,
          damage: character.combat.damage + 3,
          defense: character.combat.defense + 2,
        };
        toast.success(`Уровень повышен! Теперь ${newLevel} уровень!`);
      }

      const inventory = [...character.inventory];
      if (currentMonster.lootTable.length > 0) {
        currentMonster.lootTable.forEach(item => {
          inventory.push(item);
          newLog.push(`Получен предмет: ${item.name}`);
        });
      }

      onCharacterUpdate({
        ...character,
        level: newLevel,
        experience: newExp >= character.experienceToNextLevel ? newExp - character.experienceToNextLevel : newExp,
        experienceToNextLevel: newExpNeeded,
        gold: newGold,
        stats: newStats,
        combat: newCombat,
        inventory,
      });

      setMonsters(monsters.map(m => 
        m.id === currentMonster.id ? updatedMonster : m
      ));
      
      setTimeout(() => {
        setInCombat(false);
        setCurrentMonster(null);
        setCombatLog([]);
      }, 2000);
    } else {
      setCurrentMonster(updatedMonster);
      
      const newHealth = Math.max(0, character.combat.health - monsterDamage);
      newLog.push(`${currentMonster.name} наносит ${monsterDamage} урона!`);

      if (newHealth <= 0) {
        newLog.push('Вы погибли!');
        toast.error('Вы погибли! Игра окончена.');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }

      onCharacterUpdate({
        ...character,
        combat: { ...character.combat, health: newHealth },
      });
    }

    setCombatLog(newLog);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/95 border-2 border-primary/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full h-[500px]">
            <Canvas shadows>
              <Scene dungeon={dungeon} character={character} monsters={monsters} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {inCombat && currentMonster ? (
        <Card className="bg-card/95 border-2 border-destructive shadow-lg shadow-destructive/20">
          <CardContent className="p-4 space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-float">
                {currentMonster.type === 'undead' ? '💀' : currentMonster.type === 'demon' ? '👹' : '🐉'}
              </div>
              <div className="text-xl pixel-font text-destructive">{currentMonster.name}</div>
              <div className="text-sm pixel-text text-muted-foreground">
                HP: {currentMonster.health} / {currentMonster.maxHealth}
              </div>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto bg-muted/30 p-3 rounded text-xs pixel-text">
              {combatLog.map((log, i) => (
                <div key={i} className="text-foreground">{log}</div>
              ))}
            </div>

            <Button
              onClick={attack}
              disabled={!currentMonster.isAlive}
              className="w-full pixel-font bg-destructive hover:bg-destructive/80"
            >
              Атаковать
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/95 border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <Button onClick={() => moveCharacter(0, -1)} className="pixel-font">↑</Button>
              <div />
              <Button onClick={() => moveCharacter(-1, 0)} className="pixel-font">←</Button>
              <div className="flex items-center justify-center pixel-text text-xs text-muted-foreground">
                Движение
              </div>
              <Button onClick={() => moveCharacter(1, 0)} className="pixel-font">→</Button>
              <div />
              <Button onClick={() => moveCharacter(0, 1)} className="pixel-font">↓</Button>
              <div />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
