export type CharacterClass = 'warrior' | 'mage' | 'rogue';

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    vitality: number;
  };
  combat: {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    damage: number;
    defense: number;
  };
  position: { x: number; y: number };
  gold: number;
  inventory: InventoryItem[];
  equipped: {
    weapon?: Weapon;
    armor?: Armor;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'scroll';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  description: string;
  value: number;
}

export interface Weapon extends InventoryItem {
  type: 'weapon';
  damage: number;
  attackSpeed: number;
  damageType: 'physical' | 'magical';
}

export interface Armor extends InventoryItem {
  type: 'armor';
  defense: number;
  resistance: number;
}

export interface Monster {
  id: string;
  name: string;
  type: string;
  level: number;
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  position: { x: number; y: number };
  experience: number;
  goldDrop: number;
  lootTable: InventoryItem[];
  isAlive: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'kill' | 'collect' | 'explore';
  objectives: {
    description: string;
    current: number;
    target: number;
    completed: boolean;
  }[];
  rewards: {
    experience: number;
    gold: number;
    items?: InventoryItem[];
  };
  isCompleted: boolean;
  isActive: boolean;
}

export interface DungeonTile {
  x: number;
  y: number;
  type: 'floor' | 'wall' | 'door' | 'stairs' | 'chest';
  walkable: boolean;
  revealed: boolean;
}

export const CLASS_BONUSES = {
  warrior: {
    strength: 10,
    dexterity: 5,
    intelligence: 2,
    vitality: 12,
    healthMultiplier: 15,
    manaMultiplier: 5,
  },
  mage: {
    strength: 2,
    dexterity: 5,
    intelligence: 12,
    vitality: 5,
    healthMultiplier: 8,
    manaMultiplier: 15,
  },
  rogue: {
    strength: 5,
    dexterity: 12,
    intelligence: 5,
    vitality: 8,
    healthMultiplier: 10,
    manaMultiplier: 10,
  },
};
