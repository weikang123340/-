
import { Category } from './types';

export const COURIER_COMPANIES = [
  '顺丰速运', '中通快递', '圆通速递', '申通快递', '韵达快递', '极兔速递', '京东快递', '邮政EMS'
];

export const SHELF_ZONES = ['A', 'B', 'C', 'D', 'E', '大件区'];
export const ROWS = [1, 2, 3, 4, 5];
export const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Added missing constants required by game logic and board components
export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 8;

export const THEMES: Record<Category, { items: { label: string; icon: string }[] }> = {
  [Category.FOOD]: {
    items: [
      { label: '苹果', icon: '🍎' },
      { label: '香蕉', icon: '🍌' },
      { label: '西瓜', icon: '🍉' },
      { label: '草莓', icon: '🍓' },
    ],
  },
  [Category.ANIMAL]: {
    items: [
      { label: '猫', icon: '🐱' },
      { label: '狗', icon: '🐶' },
      { label: '兔', icon: '🐰' },
      { label: '熊', icon: '🐻' },
    ],
  },
  [Category.TRANSPORT]: {
    items: [
      { label: '车', icon: '🚗' },
      { label: '飞机', icon: '✈️' },
      { label: '船', icon: '🚢' },
      { label: '单车', icon: '🚲' },
    ],
  },
  [Category.SPORTS]: {
    items: [
      { label: '球', icon: '⚽' },
      { label: '篮球', icon: '🏀' },
      { label: '网球', icon: '🎾' },
      { label: '排球', icon: '🏐' },
    ],
  },
};
