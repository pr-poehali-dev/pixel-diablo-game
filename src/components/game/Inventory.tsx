import { Character, InventoryItem, Weapon, Armor } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InventoryProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

export default function Inventory({ character, onCharacterUpdate }: InventoryProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-500';
      default: return 'text-foreground';
    }
  };

  const equipItem = (item: InventoryItem) => {
    if (item.type === 'weapon') {
      const weapon = item as Weapon;
      const updatedChar = {
        ...character,
        equipped: { ...character.equipped, weapon },
        combat: {
          ...character.combat,
          damage: character.stats.strength + weapon.damage,
        },
      };
      onCharacterUpdate(updatedChar);
      toast.success(`Экипировано: ${weapon.name}`);
    } else if (item.type === 'armor') {
      const armor = item as Armor;
      const updatedChar = {
        ...character,
        equipped: { ...character.equipped, armor },
        combat: {
          ...character.combat,
          defense: character.stats.vitality + armor.defense,
        },
      };
      onCharacterUpdate(updatedChar);
      toast.success(`Экипировано: ${armor.name}`);
    } else if (item.type === 'potion') {
      usePotion(item);
    }
  };

  const usePotion = (item: InventoryItem) => {
    if (item.id === 'potion_health') {
      const newHealth = Math.min(
        character.combat.maxHealth,
        character.combat.health + 50
      );
      onCharacterUpdate({
        ...character,
        combat: { ...character.combat, health: newHealth },
        inventory: character.inventory.filter(i => i.id !== item.id),
      });
      toast.success('Здоровье восстановлено на 50!');
    } else if (item.id === 'potion_mana') {
      const newMana = Math.min(
        character.combat.maxMana,
        character.combat.mana + 30
      );
      onCharacterUpdate({
        ...character,
        combat: { ...character.combat, mana: newMana },
        inventory: character.inventory.filter(i => i.id !== item.id),
      });
      toast.success('Мана восстановлена на 30!');
    }
  };

  const sellItem = (item: InventoryItem) => {
    const isEquipped = 
      character.equipped.weapon?.id === item.id ||
      character.equipped.armor?.id === item.id;

    if (isEquipped) {
      toast.error('Нельзя продать экипированный предмет!');
      return;
    }

    onCharacterUpdate({
      ...character,
      gold: character.gold + item.value,
      inventory: character.inventory.filter(i => i.id !== item.id),
    });
    toast.success(`Продано: ${item.name} за ${item.value} золота`);
  };

  const isEquipped = (item: InventoryItem) => {
    return (
      character.equipped.weapon?.id === item.id ||
      character.equipped.armor?.id === item.id
    );
  };

  return (
    <Card className="bg-card/95 border-2 border-primary/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl pixel-font text-primary flex items-center gap-2">
          🎒 Инвентарь
          <span className="text-sm text-muted-foreground pixel-text ml-auto">
            ({character.inventory.length} предметов)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {character.inventory.length === 0 ? (
            <div className="text-center text-muted-foreground pixel-text py-8">
              Инвентарь пуст
            </div>
          ) : (
            character.inventory.map((item, index) => (
              <Card
                key={`${item.id}-${index}`}
                className={`bg-muted/30 border transition-all hover:bg-muted/50 ${
                  isEquipped(item)
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-border'
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`pixel-font text-sm ${getRarityColor(item.rarity)}`}>
                        {item.name}
                        {isEquipped(item) && (
                          <span className="ml-2 text-xs text-primary">[Экипировано]</span>
                        )}
                      </div>
                      <div className="text-xs pixel-text text-muted-foreground">
                        {item.description}
                      </div>
                      {item.type === 'weapon' && (
                        <div className="text-xs pixel-text text-red-500">
                          Урон: {(item as Weapon).damage}
                        </div>
                      )}
                      {item.type === 'armor' && (
                        <div className="text-xs pixel-text text-blue-500">
                          Защита: {(item as Armor).defense}
                        </div>
                      )}
                      <div className="text-xs pixel-text text-yellow-500 mt-1">
                        Цена: {item.value} золота
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {(item.type === 'weapon' || item.type === 'armor' || item.type === 'potion') && (
                        <Button
                          size="sm"
                          onClick={() => equipItem(item)}
                          disabled={isEquipped(item) && item.type !== 'potion'}
                          className="pixel-text text-xs h-7"
                        >
                          {item.type === 'potion' ? 'Использовать' : 'Экипировать'}
                        </Button>
                      )}
                      {item.type !== 'potion' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => sellItem(item)}
                          disabled={isEquipped(item)}
                          className="pixel-text text-xs h-7"
                        >
                          Продать
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
