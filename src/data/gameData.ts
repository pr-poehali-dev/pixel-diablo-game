import { InventoryItem, Monster, Quest, Weapon, Armor } from '@/types/game';

export const WEAPONS: Weapon[] = [
  {
    id: 'sword_1',
    name: 'Ржавый меч',
    type: 'weapon',
    rarity: 'common',
    icon: '🗡️',
    description: 'Старый меч новичка',
    value: 50,
    damage: 8,
    attackSpeed: 1.2,
    damageType: 'physical',
  },
  {
    id: 'staff_1',
    name: 'Посох огня',
    type: 'weapon',
    rarity: 'rare',
    icon: '🔥',
    description: 'Магический посох с огненной силой',
    value: 200,
    damage: 15,
    attackSpeed: 0.8,
    damageType: 'magical',
  },
  {
    id: 'dagger_1',
    name: 'Кинжал теней',
    type: 'weapon',
    rarity: 'epic',
    icon: '🗡️',
    description: 'Быстрый кинжал для скрытых ударов',
    value: 350,
    damage: 12,
    attackSpeed: 2.0,
    damageType: 'physical',
  },
  {
    id: 'sword_legendary',
    name: 'Меч Заката',
    type: 'weapon',
    rarity: 'legendary',
    icon: '⚔️',
    description: 'Легендарный меч древних героев',
    value: 1000,
    damage: 35,
    attackSpeed: 1.5,
    damageType: 'physical',
  },
];

export const ARMORS: Armor[] = [
  {
    id: 'armor_1',
    name: 'Кожаная броня',
    type: 'armor',
    rarity: 'common',
    icon: '🛡️',
    description: 'Простая кожаная защита',
    value: 80,
    defense: 5,
    resistance: 2,
  },
  {
    id: 'armor_2',
    name: 'Стальная кираса',
    type: 'armor',
    rarity: 'rare',
    icon: '🛡️',
    description: 'Прочная стальная броня',
    value: 250,
    defense: 15,
    resistance: 8,
  },
  {
    id: 'armor_legendary',
    name: 'Доспехи Дракона',
    type: 'armor',
    rarity: 'legendary',
    icon: '🛡️',
    description: 'Легендарная броня из чешуи дракона',
    value: 1500,
    defense: 40,
    resistance: 25,
  },
];

export const POTIONS: InventoryItem[] = [
  {
    id: 'potion_health',
    name: 'Зелье здоровья',
    type: 'potion',
    rarity: 'common',
    icon: '🧪',
    description: 'Восстанавливает 50 HP',
    value: 25,
  },
  {
    id: 'potion_mana',
    name: 'Зелье маны',
    type: 'potion',
    rarity: 'common',
    icon: '🔵',
    description: 'Восстанавливает 30 маны',
    value: 30,
  },
];

export const MONSTER_TEMPLATES = {
  skeleton: {
    name: 'Скелет',
    type: 'undead',
    icon: '💀',
    baseHealth: 30,
    baseDamage: 5,
    baseDefense: 2,
    experience: 15,
    goldDrop: 10,
  },
  zombie: {
    name: 'Зомби',
    type: 'undead',
    icon: '🧟',
    baseHealth: 50,
    baseDamage: 8,
    baseDefense: 3,
    experience: 25,
    goldDrop: 15,
  },
  demon: {
    name: 'Демон',
    type: 'demon',
    icon: '👹',
    baseHealth: 80,
    baseDamage: 12,
    baseDefense: 5,
    experience: 50,
    goldDrop: 30,
  },
  dragon: {
    name: 'Дракон',
    type: 'beast',
    icon: '🐉',
    baseHealth: 200,
    baseDamage: 25,
    baseDefense: 15,
    experience: 150,
    goldDrop: 100,
  },
  imp: {
    name: 'Бес',
    type: 'demon',
    icon: '👿',
    baseHealth: 40,
    baseDamage: 10,
    baseDefense: 2,
    experience: 20,
    goldDrop: 12,
  },
};

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_1',
    title: 'Очищение подземелья',
    description: 'Уничтожьте 5 монстров в подземелье',
    type: 'kill',
    objectives: [
      {
        description: 'Убить монстров',
        current: 0,
        target: 5,
        completed: false,
      },
    ],
    rewards: {
      experience: 100,
      gold: 50,
    },
    isCompleted: false,
    isActive: true,
  },
  {
    id: 'quest_2',
    title: 'Накопление силы',
    description: 'Достигните 3 уровня',
    type: 'explore',
    objectives: [
      {
        description: 'Достичь уровня 3',
        current: 1,
        target: 3,
        completed: false,
      },
    ],
    rewards: {
      experience: 200,
      gold: 100,
      items: [WEAPONS[1]],
    },
    isCompleted: false,
    isActive: true,
  },
];

export function generateMonster(level: number): Monster {
  const templates = Object.values(MONSTER_TEMPLATES);
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const levelMultiplier = 1 + (level - 1) * 0.3;
  
  const loot: InventoryItem[] = [];
  if (Math.random() > 0.7) {
    loot.push(POTIONS[Math.floor(Math.random() * POTIONS.length)]);
  }
  if (Math.random() > 0.9) {
    const allItems = [...WEAPONS, ...ARMORS];
    loot.push(allItems[Math.floor(Math.random() * allItems.length)]);
  }
  
  return {
    id: `monster_${Date.now()}_${Math.random()}`,
    name: template.name,
    type: template.type,
    level,
    health: Math.floor(template.baseHealth * levelMultiplier),
    maxHealth: Math.floor(template.baseHealth * levelMultiplier),
    damage: Math.floor(template.baseDamage * levelMultiplier),
    defense: Math.floor(template.baseDefense * levelMultiplier),
    position: { x: 0, y: 0 },
    experience: Math.floor(template.experience * levelMultiplier),
    goldDrop: Math.floor(template.goldDrop * levelMultiplier),
    lootTable: loot,
    isAlive: true,
  };
}
