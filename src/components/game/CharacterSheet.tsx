import { Character } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface CharacterSheetProps {
  character: Character;
}

export default function CharacterSheet({ character }: CharacterSheetProps) {
  const healthPercent = (character.combat.health / character.combat.maxHealth) * 100;
  const manaPercent = (character.combat.mana / character.combat.maxMana) * 100;
  const expPercent = (character.experience / character.experienceToNextLevel) * 100;

  const getClassIcon = () => {
    switch (character.class) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'rogue': return '🗡️';
    }
  };

  const getClassName = () => {
    switch (character.class) {
      case 'warrior': return 'Воин';
      case 'mage': return 'Маг';
      case 'rogue': return 'Разбойник';
    }
  };

  return (
    <Card className="bg-card/95 border-2 border-primary/50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-2xl pixel-font text-primary">
          <span className="text-3xl">{getClassIcon()}</span>
          <div>
            <div>{character.name}</div>
            <div className="text-sm text-muted-foreground pixel-text">
              {getClassName()} • Уровень {character.level}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm pixel-text">
            <span className="text-red-500 flex items-center gap-1">
              <Icon name="Heart" size={14} className="inline" />
              Здоровье
            </span>
            <span className="text-foreground">
              {character.combat.health} / {character.combat.maxHealth}
            </span>
          </div>
          <Progress value={healthPercent} className="h-3 bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm pixel-text">
            <span className="text-blue-400 flex items-center gap-1">
              <Icon name="Sparkles" size={14} className="inline" />
              Мана
            </span>
            <span className="text-foreground">
              {character.combat.mana} / {character.combat.maxMana}
            </span>
          </div>
          <Progress value={manaPercent} className="h-3 bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm pixel-text">
            <span className="text-primary flex items-center gap-1">
              <Icon name="Star" size={14} className="inline" />
              Опыт
            </span>
            <span className="text-foreground">
              {character.experience} / {character.experienceToNextLevel}
            </span>
          </div>
          <Progress value={expPercent} className="h-3 bg-muted" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t-2 border-border">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground pixel-text">Характеристики</div>
            <div className="space-y-1 text-sm pixel-text">
              <div className="flex justify-between">
                <span className="text-red-500">⚔️ Сила</span>
                <span>{character.stats.strength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500">🏃 Ловкость</span>
                <span>{character.stats.dexterity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">✨ Интеллект</span>
                <span>{character.stats.intelligence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-500">❤️ Выносливость</span>
                <span>{character.stats.vitality}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground pixel-text">Боевые</div>
            <div className="space-y-1 text-sm pixel-text">
              <div className="flex justify-between">
                <span className="text-red-500">⚔️ Урон</span>
                <span>{character.combat.damage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">🛡️ Защита</span>
                <span>{character.combat.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-500">💰 Золото</span>
                <span>{character.gold}</span>
              </div>
            </div>
          </div>
        </div>

        {character.equipped.weapon && (
          <div className="pt-2 border-t-2 border-border">
            <div className="text-xs text-muted-foreground pixel-text mb-1">Оружие</div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-xl">{character.equipped.weapon.icon}</span>
              <div className="flex-1">
                <div className="text-sm pixel-text text-primary">
                  {character.equipped.weapon.name}
                </div>
                <div className="text-xs pixel-text text-muted-foreground">
                  Урон: {character.equipped.weapon.damage}
                </div>
              </div>
            </div>
          </div>
        )}

        {character.equipped.armor && (
          <div>
            <div className="text-xs text-muted-foreground pixel-text mb-1">Броня</div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-xl">{character.equipped.armor.icon}</span>
              <div className="flex-1">
                <div className="text-sm pixel-text text-primary">
                  {character.equipped.armor.name}
                </div>
                <div className="text-xs pixel-text text-muted-foreground">
                  Защита: {character.equipped.armor.defense}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
