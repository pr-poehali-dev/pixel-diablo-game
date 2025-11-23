import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CharacterClass, CLASS_BONUSES } from '@/types/game';

interface CharacterCreationProps {
  onCreateCharacter: (name: string, characterClass: CharacterClass) => void;
}

const CHARACTER_CLASSES = [
  {
    id: 'warrior' as CharacterClass,
    name: 'Воин',
    icon: '⚔️',
    description: 'Мастер ближнего боя с высокой выносливостью',
    color: 'text-red-500',
    bgColor: 'bg-red-950/30',
    borderColor: 'border-red-500',
  },
  {
    id: 'mage' as CharacterClass,
    name: 'Маг',
    icon: '🔮',
    description: 'Владеет разрушительной магией стихий',
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/30',
    borderColor: 'border-purple-400',
  },
  {
    id: 'rogue' as CharacterClass,
    name: 'Разбойник',
    icon: '🗡️',
    description: 'Быстрый и ловкий убийца из теней',
    color: 'text-green-500',
    bgColor: 'bg-green-950/30',
    borderColor: 'border-green-500',
  },
];

export default function CharacterCreation({ onCreateCharacter }: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);

  const handleCreate = () => {
    if (name.trim() && selectedClass) {
      onCreateCharacter(name.trim(), selectedClass);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-black via-red-950/20 to-black">
      <Card className="w-full max-w-4xl bg-card/95 border-2 border-primary shadow-2xl shadow-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl pixel-font glow text-primary mb-4">
            DIABLO LEGACY
          </CardTitle>
          <CardDescription className="text-xl pixel-text text-muted-foreground">
            Создайте своего героя и спуститесь в подземелья
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <label className="text-lg pixel-text text-primary mb-2 block">
              Имя героя
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя..."
              className="text-xl pixel-text bg-input border-2 border-border focus:border-primary h-14"
              maxLength={20}
            />
          </div>

          <div>
            <label className="text-lg pixel-text text-primary mb-4 block">
              Выберите класс
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CHARACTER_CLASSES.map((charClass) => {
                const bonuses = CLASS_BONUSES[charClass.id];
                const isSelected = selectedClass === charClass.id;
                
                return (
                  <Card
                    key={charClass.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected
                        ? `${charClass.bgColor} border-4 ${charClass.borderColor} shadow-lg shadow-current`
                        : 'bg-card/50 border-2 border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedClass(charClass.id)}
                  >
                    <CardHeader className="text-center pb-2">
                      <div className={`text-6xl mb-2 ${isSelected ? 'animate-float' : ''}`}>
                        {charClass.icon}
                      </div>
                      <CardTitle className={`text-2xl pixel-font ${charClass.color}`}>
                        {charClass.name}
                      </CardTitle>
                      <CardDescription className="pixel-text text-sm">
                        {charClass.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm pixel-text">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Сила:</span>
                        <span className={charClass.color}>+{bonuses.strength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ловкость:</span>
                        <span className={charClass.color}>+{bonuses.dexterity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Интеллект:</span>
                        <span className={charClass.color}>+{bonuses.intelligence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Выносливость:</span>
                        <span className={charClass.color}>+{bonuses.vitality}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !selectedClass}
            className="w-full h-16 text-2xl pixel-font bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all disabled:opacity-50"
          >
            {!name.trim() || !selectedClass
              ? 'Выберите имя и класс'
              : 'Начать приключение'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
