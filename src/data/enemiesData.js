export const ENEMIES_BY_TIER = {
  tier1: [
    {
      id: 'ash_wolf',
      name: 'Lobo das Cinzas',
      title: 'Predador faminto das planícies queimadas',
      baseHp: 58,
      baseAtk: 13,
      baseDef: 4,
      xpReward: 38,
      goldReward: [12, 22],
      specialMove: {
        name: 'Mordida Dilacerante',
        multiplier: 1.35,
        chance: 0.3,
      },
    },
    {
      id: 'goblin_raider',
      name: 'Saqueador Goblin',
      title: 'Batedor astuto armado com lâminas enferrujadas',
      baseHp: 52,
      baseAtk: 14,
      baseDef: 3,
      xpReward: 35,
      goldReward: [15, 28],
      specialMove: {
        name: 'Arremesso de Adaga Suja',
        multiplier: 1.25,
        chance: 0.35,
      },
    },
    {
      id: 'crypt_skeleton',
      name: 'Sentinela Ossudo',
      title: 'Restos mortais reanimados por magia residual',
      baseHp: 65,
      baseAtk: 12,
      baseDef: 7,
      xpReward: 42,
      goldReward: [14, 25],
      specialMove: {
        name: 'Golpe de Escudo Quebrado',
        multiplier: 1.3,
        chance: 0.25,
      },
    },
  ],
  tier2: [
    {
      id: 'veil_specter',
      name: 'Espectro do Véu',
      title: 'Espírito atormentado que drena o calor dos vivos',
      baseHp: 92,
      baseAtk: 19,
      baseDef: 6,
      xpReward: 68,
      goldReward: [26, 42],
      specialMove: {
        name: 'Lamento Congelante',
        multiplier: 1.4,
        chance: 0.35,
      },
    },
    {
      id: 'corrupted_knight',
      name: 'Cavaleiro Juramentado Caído',
      title: 'Antigo defensor de Eldoria consumido pela sombra',
      baseHp: 115,
      baseAtk: 21,
      baseDef: 11,
      xpReward: 82,
      goldReward: [32, 55],
      specialMove: {
        name: 'Fenda Sombria',
        multiplier: 1.45,
        chance: 0.3,
      },
    },
    {
      id: 'obsidian_golem',
      name: 'Golem de Obsidiana',
      title: 'Guardião rúnico esculpido em rocha vulcânica viva',
      baseHp: 135,
      baseAtk: 20,
      baseDef: 14,
      xpReward: 90,
      goldReward: [35, 60],
      specialMove: {
        name: 'Tremor Sísmico',
        multiplier: 1.4,
        chance: 0.28,
      },
    },
  ],
  boss: [
    {
      id: 'malakor_eclipse',
      name: 'Malakor, Arauto do Eclipse',
      title: 'Senhor da Cidadela Partida • Chefe',
      isBoss: true,
      baseHp: 210,
      baseAtk: 26,
      baseDef: 12,
      xpReward: 200,
      goldReward: [120, 180],
      specialMove: {
        name: 'Chama Negra do Eclipse',
        multiplier: 1.55,
        chance: 0.4,
      },
    },
  ],
};

export function spawnEnemy(tier = 'tier1', playerLevel = 1, specificId = null) {
  const pool = ENEMIES_BY_TIER[tier] || ENEMIES_BY_TIER.tier1;
  const template = specificId
    ? pool.find((e) => e.id === specificId) || pool[0]
    : pool[Math.floor(Math.random() * pool.length)];

  const levelScale = 1 + (playerLevel - 1) * 0.16;
  const maxHp = Math.round(template.baseHp * levelScale);
  const atk = Math.round(template.baseAtk * levelScale);
  const def = Math.round(template.baseDef * (1 + (playerLevel - 1) * 0.1));
  const [minG, maxG] = template.goldReward;
  const gold = Math.round((minG + Math.random() * (maxG - minG)) * levelScale);
  const xp = Math.round(template.xpReward * (1 + (playerLevel - 1) * 0.12));

  return {
    ...template,
    level: template.isBoss ? Math.max(3, playerLevel + 1) : playerLevel,
    hp: maxHp,
    maxHp,
    atk,
    def,
    gold,
    xp,
    statuses: [], // { type: 'burn'|'poison'|'stun'|'weaken', duration, dotDamage }
  };
}
