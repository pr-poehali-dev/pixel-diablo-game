import { useState, useEffect } from 'react';
import { Character, CLASS_BONUSES, CharacterClass, Quest } from '@/types/game';
import { INITIAL_QUESTS, WEAPONS } from '@/data/gameData';
import CharacterCreation from '@/components/game/CharacterCreation';
import CharacterSheet from '@/components/game/CharacterSheet';
import Dungeon3D from '@/components/game/Dungeon3D';
import Inventory from '@/components/game/Inventory';
import QuestLog from '@/components/game/QuestLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'diablo_legacy_save';

export default function Index() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [showMainMenu, setShowMainMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCharacter(data.character);
        setQuests(data.quests || INITIAL_QUESTS);
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }
  }, []);

  useEffect(() => {
    if (character) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ character, quests }));
      
      const updatedQuests = quests.map(quest => {
        if (quest.id === 'quest_1' && !quest.isCompleted) {
          const newObjectives = quest.objectives.map(obj => ({
            ...obj,
            completed: obj.current >= obj.target,
          }));
          const allCompleted = newObjectives.every(obj => obj.completed);
          return {
            ...quest,
            objectives: newObjectives,
            isCompleted: allCompleted,
          };
        }
        if (quest.id === 'quest_2' && !quest.isCompleted) {
          const newObjectives = quest.objectives.map(obj => ({
            ...obj,
            current: character.level,
            completed: character.level >= obj.target,
          }));
          const allCompleted = newObjectives.every(obj => obj.completed);
          return {
            ...quest,
            objectives: newObjectives,
            isCompleted: allCompleted,
          };
        }
        return quest;
      });
      setQuests(updatedQuests);
    }
  }, [character]);

  const createCharacter = (name: string, charClass: CharacterClass) => {
    const bonuses = CLASS_BONUSES[charClass];
    
    const newChar: Character = {
      id: Date.now().toString(),
      name,
      class: charClass,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      stats: {
        strength: bonuses.strength,
        dexterity: bonuses.dexterity,
        intelligence: bonuses.intelligence,
        vitality: bonuses.vitality,
      },
      combat: {
        health: bonuses.vitality * bonuses.healthMultiplier,
        maxHealth: bonuses.vitality * bonuses.healthMultiplier,
        mana: bonuses.intelligence * bonuses.manaMultiplier,
        maxMana: bonuses.intelligence * bonuses.manaMultiplier,
        damage: bonuses.strength + 5,
        defense: bonuses.vitality,
      },
      position: { x: 0, y: 0 },
      gold: 100,
      inventory: [WEAPONS[0]],
      equipped: {},
    };
    
    setCharacter(newChar);
    setQuests(INITIAL_QUESTS);
  };

  const handleNewGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCharacter(null);
    setQuests(INITIAL_QUESTS);
    setShowMainMenu(false);
  };

  if (!character) {
    return <CharacterCreation onCreateCharacter={createCharacter} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl pixel-font glow text-primary">DIABLO LEGACY</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMainMenu(!showMainMenu)}
              className="pixel-font border-2 border-primary/50"
            >
              {showMainMenu ? 'Играть' : 'Меню'}
            </Button>
          </div>
        </div>

        {showMainMenu ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="space-y-4 w-full max-w-md">
              <Button
                onClick={() => setShowMainMenu(false)}
                className="w-full h-16 text-xl pixel-font bg-primary hover:bg-primary/80"
              >
                Продолжить игру
              </Button>
              <Button
                onClick={handleNewGame}
                variant="destructive"
                className="w-full h-16 text-xl pixel-font"
              >
                Новая игра
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <CharacterSheet character={character} />
              <QuestLog quests={quests} />
            </div>

            <div className="lg:col-span-2">
              <Tabs defaultValue="dungeon" className="w-full">
                <TabsList className="grid w-full grid-cols-2 pixel-font">
                  <TabsTrigger value="dungeon">🗺️ Подземелье</TabsTrigger>
                  <TabsTrigger value="inventory">🎒 Инвентарь</TabsTrigger>
                </TabsList>
                <TabsContent value="dungeon" className="mt-6">
                  <Dungeon3D
                    character={character}
                    onCharacterUpdate={setCharacter}
                  />
                </TabsContent>
                <TabsContent value="inventory" className="mt-6">
                  <Inventory
                    character={character}
                    onCharacterUpdate={setCharacter}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}