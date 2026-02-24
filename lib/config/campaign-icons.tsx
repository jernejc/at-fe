import { createElement } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  Bird,
  Bone,
  Cat,
  Dog,
  Fish,
  Origami,
  Panda,
  Rabbit,
  Rat,
  Snail,
  Squirrel,
  Turtle,
  Balloon,
  ChessBishop,
  ChessKing,
  ChessKnight,
  ChessPawn,
  ChessQueen,
  ChessRook,
  Apple,
  Carrot,
  Cherry,
  Citrus,
  CupSoda,
  Donut,
  Hop,
  IceCreamBowl,
  Lollipop,
  Milk,
  Pizza,
  Sandwich,
  Gamepad,
  Gem,
  Ghost,
  Gift,
  Pickaxe,
  Skull,
  Swords,
  TreePalm,
  TreePine,
  Trees,
  TentTree,
} from 'lucide-react';

/** Available campaign icon names that users can pick from. */
export type CampaignIconName =
  | 'bird'
  | 'bone'
  | 'cat'
  | 'dog'
  | 'fish'
  | 'origami'
  | 'panda'
  | 'rabbit'
  | 'rat'
  | 'snail'
  | 'squirrel'
  | 'turtle'
  | 'balloon'
  | 'chess-bishop'
  | 'chess-king'
  | 'chess-knight'
  | 'chess-pawn'
  | 'chess-queen'
  | 'chess-rook'
  | 'apple'
  | 'carrot'
  | 'cherry'
  | 'citrus'
  | 'cup-soda'
  | 'donut'
  | 'hop'
  | 'ice-cream-bowl'
  | 'lollipop'
  | 'milk'
  | 'pizza'
  | 'sandwich'
  | 'gamepad'
  | 'gem'
  | 'ghost'
  | 'gift'
  | 'pickaxe'
  | 'skull'
  | 'swords'
  | 'tree-palm'
  | 'tree-pine'
  | 'trees'
  | 'tent-tree';

/** Registry mapping icon name → Lucide component. */
export const CAMPAIGN_ICONS: Record<CampaignIconName, LucideIcon> = {
  bird: Bird,
  bone: Bone,
  cat: Cat,
  dog: Dog,
  fish: Fish,
  origami: Origami,
  panda: Panda,
  rabbit: Rabbit,
  rat: Rat,
  snail: Snail,
  squirrel: Squirrel,
  turtle: Turtle,
  balloon: Balloon,
  'chess-bishop': ChessBishop,
  'chess-king': ChessKing,
  'chess-knight': ChessKnight,
  'chess-pawn': ChessPawn,
  'chess-queen': ChessQueen,
  'chess-rook': ChessRook,
  apple: Apple,
  carrot: Carrot,
  cherry: Cherry,
  citrus: Citrus,
  'cup-soda': CupSoda,
  donut: Donut,
  hop: Hop,
  'ice-cream-bowl': IceCreamBowl,
  lollipop: Lollipop,
  milk: Milk,
  pizza: Pizza,
  sandwich: Sandwich,
  gamepad: Gamepad,
  gem: Gem,
  ghost: Ghost,
  gift: Gift,
  pickaxe: Pickaxe,
  skull: Skull,
  swords: Swords,
  'tree-palm': TreePalm,
  'tree-pine': TreePine,
  trees: Trees,
  'tent-tree': TentTree,
};

/** All icon names as an ordered array (for pickers / design system display). */
export const CAMPAIGN_ICON_NAMES = Object.keys(CAMPAIGN_ICONS) as CampaignIconName[];

/** Default fallback icon when campaign has no icon set. */
export const DEFAULT_CAMPAIGN_ICON: CampaignIconName = 'gem';

/** Resolve a campaign icon name to its Lucide component, with fallback. */
export function getCampaignIcon(name?: string | null): LucideIcon {
  if (name && name in CAMPAIGN_ICONS) return CAMPAIGN_ICONS[name as CampaignIconName];
  return CAMPAIGN_ICONS[DEFAULT_CAMPAIGN_ICON];
}

/** Renders a campaign icon by name. Uses createElement to avoid React compiler error with dynamic components. */
export function CampaignIcon({ name, ...props }: { name?: string | null | undefined } & Omit<LucideProps, 'name'>) {
  return createElement(getCampaignIcon(name), props);
}
