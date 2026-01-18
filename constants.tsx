
import { Category, ThemeConfig } from './types';

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 8;
export const INITIAL_TIME = 120; // 2 minutes

export const THEMES: Record<Category, ThemeConfig> = {
  [Category.SOE]: {
    key: 'soe',
    label: '中国国企',
    items: [
      { label: '国家电网', icon: '⚡' },
      { label: '中石油', icon: '⛽' },
      { label: '工商银行', icon: '💰' },
      { label: '中国移动', icon: '📶' },
      { label: '中国建筑', icon: '🏗️' },
      { label: '中国中铁', icon: '🚄' },
      { label: '中国石化', icon: '🛢️' },
      { label: '航天科技', icon: '🚀' },
    ],
  },
  [Category.SPORTS]: {
    key: 'sports',
    label: '球类运动',
    items: [
      { label: '篮球', icon: '🏀' },
      { label: '足球', icon: '⚽' },
      { label: '网球', icon: '🎾' },
      { label: '排球', icon: '🏐' },
      { label: '棒球', icon: '⚾' },
      { label: '乒乓球', icon: '🏓' },
      { label: '橄榄球', icon: '🏈' },
      { label: '高尔夫', icon: '⛳' },
    ],
  },
  [Category.FRUIT]: {
    key: 'fruit',
    label: '新鲜水果',
    items: [
      { label: '苹果', icon: '🍎' },
      { label: '香蕉', icon: '🍌' },
      { label: '葡萄', icon: '🍇' },
      { label: '西瓜', icon: '🍉' },
      { label: '草莓', icon: '🍓' },
      { label: '菠萝', icon: '🍍' },
      { label: '樱桃', icon: '🍒' },
      { label: '梨子', icon: '🍐' },
    ],
  },
  [Category.CAR]: {
    key: 'car',
    label: '现代汽车',
    items: [
      { label: '轿车', icon: '🚗' },
      { label: '跑车', icon: '🏎️' },
      { label: '越野车', icon: '🚙' },
      { label: '大巴车', icon: '🚌' },
      { label: '货车', icon: '🚚' },
      { label: '警车', icon: '🚓' },
      { label: '赛车', icon: '🏁' },
      { label: '出租车', icon: '🚕' },
    ],
  },
  [Category.WEAPON]: {
    key: 'weapon',
    label: '传奇武器',
    items: [
      { label: '宝剑', icon: '⚔️' },
      { label: '长弓', icon: '🏹' },
      { label: '盾牌', icon: '🛡️' },
      { label: '手雷', icon: '💣' },
      { label: '大炮', icon: '🧨' },
      { label: '匕首', icon: '🗡️' },
      { label: '战斧', icon: '🪓' },
      { label: '链锤', icon: '⛓️' },
    ],
  },
};
