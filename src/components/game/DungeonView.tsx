import { useState, useEffect } from 'react';
import { Character, Monster, DungeonTile } from '@/types/game';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateMonster } from '@/data/gameData';
import { toast } from 'sonner';

interface DungeonViewProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

const DUNGEON_SIZE = 8;

export default function DungeonView({ character, onCharacterUpdate }: DungeonViewProps) {
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

  const getTileContent = (x: number, y: number) => {
    if (character.position.x === x && character.position.y === y) {
      return <span className="text-2xl animate-pulse">👤</span>;
    }
    
    const monster = monsters.find(m => m.position.x === x && m.position.y === y && m.isAlive);
    if (monster && dungeon[y][x].revealed) {
      return <span className="text-2xl animate-pulse-glow">{monster.type === 'undead' ? '💀' : monster.type === 'demon' ? '👹' : '🐉'}</span>;
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/95 border-2 border-primary/50">
        <CardContent className="p-4">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${DUNGEON_SIZE}, minmax(0, 1fr))` }}>
            {dungeon.map((row, y) =>
              row.map((tile, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`aspect-square flex items-center justify-center text-xs border transition-all ${
                    tile.revealed
                      ? tile.type === 'wall'
                        ? 'bg-muted border-border'
                        : 'bg-background border-border/50'
                      : 'bg-black border-black'
                  }`}
                >
                  {tile.revealed && getTileContent(x, y)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {inCombat && currentMonster ? (
        <Card className="bg-card/95 border-2 border-destructive shadow-lg shadow-destructive/20">
          <CardContent className="p-4 space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-float">{currentMonster.type === 'undead' ? '💀' : currentMonster.type === 'demon' ? '👹' : '🐉'}</div>
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
