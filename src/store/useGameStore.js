import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CLASSES,
  STARTING_WEAPONS,
  SKILLS,
  ITEMS_CATALOG,
} from '../data/characterData';
import { spawnEnemy } from '../data/enemiesData';
import {
  REGIONS,
  buildScene,
  pickRandomRareWeapon,
} from '../engine/storyGenerator';

function computeEffectiveStats(player) {
  if (!player) return null;
  const b = player.weapon?.bonuses || {
    str: 0,
    int: 0,
    dex: 0,
    def: 0,
    maxHp: 0,
    maxMp: 0,
    critChance: 0,
  };
  const shieldBuff = player.buffs?.find((bf) => bf.type === 'shield');
  const defBonus = shieldBuff ? shieldBuff.defBonus : 0;

  return {
    maxHp: player.baseStats.maxHp + (b.maxHp || 0),
    maxMp: player.baseStats.maxMp + (b.maxMp || 0),
    str: player.baseStats.str + (b.str || 0),
    int: player.baseStats.int + (b.int || 0),
    dex: player.baseStats.dex + (b.dex || 0),
    def: player.baseStats.def + (b.def || 0) + defBonus,
    critChance: player.baseStats.critChance + (b.critChance || 0),
  };
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      phase: 'creation', // 'creation' | 'story' | 'battle' | 'levelup' | 'gameover'
      player: null,
      flags: {},
      currentSceneId: 'intro_awakening',
      currentScene: null,
      pendingSceneId: null,
      lastOutcome: null,
      journal: [],
      battle: null,
      statsSummary: {
        battlesWon: 0,
        choicesMade: 0,
      },

      // Computed helper
      getEffectiveStats: () => computeEffectiveStats(get().player),

      // 1. Criação de Personagem
      startNewAdventure: ({ name, classId, weaponId, skillIds }) => {
        const classInfo = CLASSES.find((c) => c.id === classId) || CLASSES[0];
        const weapon =
          STARTING_WEAPONS.find((w) => w.id === weaponId) || STARTING_WEAPONS[0];

        const baseStats = { ...classInfo.baseStats };
        const maxHp = baseStats.maxHp + (weapon.bonuses.maxHp || 0);
        const maxMp = baseStats.maxMp + (weapon.bonuses.maxMp || 0);

        const newPlayer = {
          name: name?.trim() || 'Viajante Sem Nome',
          classInfo,
          weapon,
          weaponsOwned: [weapon],
          skills: skillIds.length > 0 ? skillIds : classInfo.recommendedSkills,
          level: 1,
          xp: 0,
          xpToNext: 100,
          hp: maxHp,
          mp: maxMp,
          shield: 0,
          buffs: [],
          baseStats,
          gold: 35,
          inventory: {
            health_potion: 2,
            mana_elixir: 1,
            smoke_bomb: 1,
          },
        };

        const initialFlags = {};
        const initialScene = buildScene('intro_awakening', {
          player: newPlayer,
          flags: initialFlags,
        });

        set({
          phase: 'story',
          player: newPlayer,
          flags: initialFlags,
          currentSceneId: 'intro_awakening',
          currentScene: initialScene,
          pendingSceneId: null,
          lastOutcome: {
            type: 'info',
            text: `${newPlayer.name} (${classInfo.name}) iniciou sua jornada empunhando ${weapon.name}!`,
          },
          journal: [
            {
              id: Date.now(),
              title: 'Início da Crônica',
              text: `${newPlayer.name}, ${classInfo.name}, partiu pelas estradas cobertas de cinza com ${weapon.name}.`,
            },
          ],
          battle: null,
          statsSummary: { battlesWon: 0, choicesMade: 0 },
        });
      },

      // Trocar arma equipada fora de combate
      equipWeapon: (weaponId) => {
        const { player } = get();
        if (!player) return;
        const target = player.weaponsOwned.find((w) => w.id === weaponId);
        if (!target) return;

        const updatedPlayer = { ...player, weapon: target };
        const eff = computeEffectiveStats(updatedPlayer);
        updatedPlayer.hp = Math.min(updatedPlayer.hp, eff.maxHp);
        updatedPlayer.mp = Math.min(updatedPlayer.mp, eff.maxMp);

        set({
          player: updatedPlayer,
          lastOutcome: {
            type: 'success',
            text: `Arma equipada: ${target.name}.`,
          },
        });
      },

      // Usar item fora de batalha
      useItemOutOfBattle: (itemId) => {
        const { player } = get();
        if (!player) return;
        const count = player.inventory[itemId] || 0;
        if (count <= 0) return;

        const item = ITEMS_CATALOG[itemId];
        if (!item || item.type === 'escape') return;

        const eff = computeEffectiveStats(player);
        let newHp = player.hp;
        let newMp = player.mp;
        let feedback = '';

        if (item.type === 'heal_hp') {
          if (player.hp >= eff.maxHp) return;
          newHp = Math.min(eff.maxHp, player.hp + item.value);
          feedback = `Usou ${item.name} e recuperou +${newHp - player.hp} HP.`;
        } else if (item.type === 'heal_mp') {
          if (player.mp >= eff.maxMp) return;
          newMp = Math.min(eff.maxMp, player.mp + item.value);
          feedback = `Usou ${item.name} e recuperou +${newMp - player.mp} MP.`;
        }

        set({
          player: {
            ...player,
            hp: newHp,
            mp: newMp,
            inventory: {
              ...player.inventory,
              [itemId]: count - 1,
            },
          },
          lastOutcome: { type: 'success', text: feedback },
        });
      },

      // 2. Escolher ação na história
      chooseStoryAction: (choice) => {
        const state = get();
        const { player, flags, journal, statsSummary, currentScene } = state;
        if (!player) return;

        const eff = computeEffectiveStats(player);
        let updatedPlayer = {
          ...player,
          baseStats: { ...player.baseStats },
          inventory: { ...player.inventory },
          weaponsOwned: [...player.weaponsOwned],
        };
        let updatedFlags = { ...flags };
        const outcomeNotes = [];
        let outcomeType = 'info';

        // Resolver teste de atributo, se houver
        let conseq = choice.consequence || {};
        if (choice.statCheck) {
          const statVal = eff[choice.statCheck.stat] || 0;
          const statNames = { str: 'Força', int: 'Inteligência', dex: 'Destreza' };
          if (statVal >= choice.statCheck.target) {
            conseq = choice.consequenceSuccess || {};
            outcomeNotes.push(
              `Sucesso em ${statNames[choice.statCheck.stat]} (${statVal}/${choice.statCheck.target})!`
            );
            outcomeType = 'success';
          } else {
            conseq = choice.consequenceFail || {};
            outcomeNotes.push(
              `Falhou no teste de ${statNames[choice.statCheck.stat]} (${statVal}/${choice.statCheck.target}).`
            );
            outcomeType = 'warning';
          }
        }

        // Aplicar consequências
        if (conseq.flag) {
          updatedFlags[conseq.flag] = true;
        }
        if (conseq.gold) {
          updatedPlayer.gold = Math.max(0, updatedPlayer.gold + conseq.gold);
          outcomeNotes.push(`${conseq.gold > 0 ? '+' : ''}${conseq.gold} Ouro`);
        }
        if (conseq.buyItem) {
          const { itemId, cost } = conseq.buyItem;
          if (updatedPlayer.gold >= cost) {
            updatedPlayer.gold -= cost;
            updatedPlayer.inventory[itemId] =
              (updatedPlayer.inventory[itemId] || 0) + 1;
            outcomeNotes.push(
              `Comprou ${ITEMS_CATALOG[itemId].name} (-${cost} Ouro)`
            );
            outcomeType = 'success';
          } else {
            outcomeNotes.push(`Ouro insuficiente (${cost} necessários)!`);
            outcomeType = 'warning';
          }
        }
        if (conseq.gambleGold) {
          if (updatedPlayer.gold >= 20) {
            if (Math.random() < 0.55) {
              updatedPlayer.gold += 30;
              outcomeNotes.push(`Sorte grande nos dados! +30 Ouro!`);
              outcomeType = 'success';
            } else {
              updatedPlayer.gold -= 20;
              updatedPlayer.xp += 20;
              outcomeNotes.push(`Perdeu 20 Ouro nos dados, mas aprendeu o truque (+20 XP).`);
              outcomeType = 'warning';
            }
          } else {
            updatedPlayer.xp += 15;
            outcomeNotes.push(`Sem ouro suficiente para apostar; o mercador contou um rumor (+15 XP).`);
          }
        }
        if (conseq.campRest) {
          if (updatedPlayer.gold >= 40) {
            updatedPlayer.gold -= 40;
            updatedPlayer.hp = eff.maxHp;
            updatedPlayer.mp = eff.maxMp;
            updatedPlayer.inventory.health_potion =
              (updatedPlayer.inventory.health_potion || 0) + 1;
            outcomeNotes.push(
              `Acampamento completo (-40 Ouro): Vida/Mana 100% e +1 Poção Vital!`
            );
            outcomeType = 'success';
          } else {
            updatedPlayer.hp = Math.min(eff.maxHp, updatedPlayer.hp + Math.round(eff.maxHp * 0.5));
            updatedPlayer.mp = Math.min(eff.maxMp, updatedPlayer.mp + Math.round(eff.maxMp * 0.5));
            outcomeNotes.push(`Descanso rápido na fogueira: recuperou 50% de HP e MP.`);
            outcomeType = 'success';
          }
        }
        if (conseq.addItem) {
          updatedPlayer.inventory[conseq.addItem] =
            (updatedPlayer.inventory[conseq.addItem] || 0) + 1;
          outcomeNotes.push(`+1 ${ITEMS_CATALOG[conseq.addItem]?.name}`);
          outcomeType = 'success';
        }
        if (conseq.permanentStat) {
          const { stat, amount } = conseq.permanentStat;
          updatedPlayer.baseStats[stat] =
            (updatedPlayer.baseStats[stat] || 0) + amount;
          outcomeNotes.push(`+${amount} ${stat.toUpperCase()} permanente!`);
          outcomeType = 'success';
        }
        if (conseq.permanentBestStat) {
          const mainStat = updatedPlayer.weapon?.scalingStat || 'str';
          updatedPlayer.baseStats[mainStat] += conseq.permanentBestStat;
          outcomeNotes.push(
            `+${conseq.permanentBestStat} ${mainStat.toUpperCase()} permanente!`
          );
          outcomeType = 'success';
        }
        if (
          conseq.grantRareWeapon ||
          (conseq.chanceRareWeapon && Math.random() < conseq.chanceRareWeapon)
        ) {
          const rare = pickRandomRareWeapon(updatedPlayer.weapon.id);
          const alreadyHas = updatedPlayer.weaponsOwned.some(
            (w) => w.id === rare.id
          );
          if (!alreadyHas) {
            updatedPlayer.weaponsOwned.push(rare);
          }
          updatedPlayer.weapon = rare;
          outcomeNotes.push(`Arma Rara obtida e equipada: ${rare.name}!`);
          outcomeType = 'success';
        }

        const newEff = computeEffectiveStats(updatedPlayer);
        if (conseq.fullRestore) {
          updatedPlayer.hp = newEff.maxHp;
          updatedPlayer.mp = newEff.maxMp;
          outcomeNotes.push(`Vida e Mana totalmente restauradas!`);
          outcomeType = 'success';
        } else {
          if (conseq.hpChange) {
            updatedPlayer.hp = Math.max(
              1,
              Math.min(newEff.maxHp, updatedPlayer.hp + conseq.hpChange)
            );
            outcomeNotes.push(
              `${conseq.hpChange > 0 ? '+' : ''}${conseq.hpChange} HP`
            );
          }
          if (conseq.mpChange) {
            updatedPlayer.mp = Math.max(
              0,
              Math.min(newEff.maxMp, updatedPlayer.mp + conseq.mpChange)
            );
            outcomeNotes.push(
              `${conseq.mpChange > 0 ? '+' : ''}${conseq.mpChange} MP`
            );
          }
        }

        if (conseq.xp) {
          updatedPlayer.xp += conseq.xp;
          outcomeNotes.push(`+${conseq.xp} XP`);
        }

        const newJournal = conseq.journalText
          ? [
              ...journal,
              {
                id: Date.now(),
                title: currentScene?.title || 'Jornada',
                text: conseq.journalText,
              },
            ]
          : journal;

        const nextSceneId = choice.nextScene || 'intro_awakening';
        const regionId = currentScene?.region || 'crossroads';
        const regionInfo = REGIONS[regionId] || REGIONS.crossroads;

        // Checar se dispara Chefe ou Batalha Aleatória!
        if (choice.forceBoss) {
          const boss = spawnEnemy('boss', updatedPlayer.level, choice.forceBoss);
          set({
            player: updatedPlayer,
            flags: updatedFlags,
            journal: newJournal,
            pendingSceneId: nextSceneId,
            statsSummary: {
              ...statsSummary,
              choicesMade: statsSummary.choicesMade + 1,
            },
            phase: 'battle',
            battle: {
              enemy: boss,
              turnCount: 1,
              isRandomEncounter: false,
              logs: [
                `⚔️ CONFRONTO DECISIVO: ${boss.name} bloqueia seu caminho!`,
                outcomeNotes.length > 0 ? outcomeNotes.join(' • ') : null,
              ].filter(Boolean),
            },
          });
          return;
        }

        const encounterProb =
          typeof choice.encounterChance === 'number'
            ? choice.encounterChance
            : regionInfo.encounterRate;

        const triggersRandomBattle = Math.random() < encounterProb;

        if (triggersRandomBattle) {
          const enemy = spawnEnemy(regionInfo.enemyTier, updatedPlayer.level);
          set({
            player: updatedPlayer,
            flags: updatedFlags,
            journal: newJournal,
            pendingSceneId: nextSceneId,
            statsSummary: {
              ...statsSummary,
              choicesMade: statsSummary.choicesMade + 1,
            },
            phase: 'battle',
            battle: {
              enemy,
              turnCount: 1,
              isRandomEncounter: true,
              logs: [
                `⚠️ Batalha Aleatória em ${regionInfo.name}! Um ${enemy.name} surgiu das sombras!`,
                outcomeNotes.length > 0 ? `Evento anterior: ${outcomeNotes.join(' • ')}` : null,
              ].filter(Boolean),
            },
          });
          return;
        }

        // Verificar se subiu de nível fora de batalha
        if (updatedPlayer.xp >= updatedPlayer.xpToNext) {
          const nextSceneObj = buildScene(nextSceneId, {
            player: updatedPlayer,
            flags: updatedFlags,
          });
          set({
            player: updatedPlayer,
            flags: updatedFlags,
            journal: newJournal,
            currentSceneId: nextSceneId,
            currentScene: nextSceneObj,
            lastOutcome: {
              type: outcomeType,
              text: outcomeNotes.join(' • ') || 'Você avançou em sua jornada.',
            },
            statsSummary: {
              ...statsSummary,
              choicesMade: statsSummary.choicesMade + 1,
            },
            phase: 'levelup',
          });
          return;
        }

        // Avanço direto para a próxima cena
        const nextSceneObj = buildScene(nextSceneId, {
          player: updatedPlayer,
          flags: updatedFlags,
        });

        set({
          player: updatedPlayer,
          flags: updatedFlags,
          journal: newJournal,
          currentSceneId: nextSceneId,
          currentScene: nextSceneObj,
          lastOutcome: {
            type: outcomeType,
            text: outcomeNotes.join(' • ') || 'Sua história avança...',
          },
          statsSummary: {
            ...statsSummary,
            choicesMade: statsSummary.choicesMade + 1,
          },
        });
      },

      // Disparar patrulha/batalha aleatória voluntária a qualquer momento na exploração
      triggerQuickHunt: () => {
        const { player, currentScene } = get();
        if (!player) return;
        const regionId = currentScene?.region || 'crossroads';
        const regionInfo = REGIONS[regionId] || REGIONS.crossroads;
        const enemy = spawnEnemy(regionInfo.enemyTier, player.level);

        set({
          pendingSceneId: null, // Permanece na cena atual após vencer
          phase: 'battle',
          battle: {
            enemy,
            turnCount: 1,
            isRandomEncounter: true,
            logs: [
              `🎯 Você patrulhou ${regionInfo.name} e encontrou ${enemy.name}!`,
            ],
          },
        });
      },

      // 3. Sistema de Combate por Turnos
      performBasicAttack: () => {
        const state = get();
        const { player, battle } = state;
        if (!player || !battle) return;

        const eff = computeEffectiveStats(player);
        const scalingStat = player.weapon?.scalingStat || 'str';
        const statPower = eff[scalingStat] || eff.str;

        const isCrit = Math.random() * 100 < eff.critChance;
        const critMult =
          player.classInfo.id === 'rogue' ? 1.75 : 1.4;

        // Fórmula balanceada: dano base mais moderado (aprox. 10~14 no nível 1)
        const baseVariance = (Math.random() * 3) - 1; // -1 a +2
        let rawDmg = (statPower * 0.55) + 3 + baseVariance;
        if (isCrit) rawDmg *= critMult;

        const finalDmg = Math.max(
          3,
          Math.round(rawDmg - (battle.enemy.def * 0.4))
        );

        // Ataque básico recupera um pouco de Mana (+5 MP)
        const mpRegen = 5;
        const updatedPlayer = {
          ...player,
          mp: Math.min(eff.maxMp, player.mp + mpRegen),
        };

        const updatedEnemy = {
          ...battle.enemy,
          hp: Math.max(0, battle.enemy.hp - finalDmg),
        };

        const attackLog = `${isCrit ? '💥 CRÍTICO! ' : '🗡️ '}Você ${
          player.weapon.flavorVerb
        } causando ${finalDmg} de dano (+${mpRegen} MP).`;

        get()._resolveAfterPlayerTurn(updatedPlayer, updatedEnemy, [attackLog]);
      },

      performSkill: (skillId) => {
        const state = get();
        const { player, battle } = state;
        if (!player || !battle) return;

        const skill = SKILLS.find((s) => s.id === skillId);
        if (!skill || player.mp < skill.cost) return;

        const eff = computeEffectiveStats(player);
        let updatedPlayer = {
          ...player,
          mp: player.mp - skill.cost,
          buffs: [...(player.buffs || [])],
        };
        let updatedEnemy = {
          ...battle.enemy,
          statuses: [...(battle.enemy.statuses || [])],
        };
        const turnLogs = [];

        if (skill.type === 'heal') {
          const healAmount = Math.round(
            eff.int * 0.9 + 16 + player.level * 4
          );
          const nextHp = Math.min(eff.maxHp, updatedPlayer.hp + healAmount);
          turnLogs.push(
            `✨ Você conjurou ${skill.name} e restaurou +${
              nextHp - updatedPlayer.hp
            } HP!`
          );
          updatedPlayer.hp = nextHp;
        } else if (skill.type === 'buff') {
          const shieldAmt = Math.round(14 + eff.def * 0.9);
          const smallHeal = 6;
          updatedPlayer.shield = (updatedPlayer.shield || 0) + shieldAmt;
          updatedPlayer.hp = Math.min(eff.maxHp, updatedPlayer.hp + smallHeal);
          updatedPlayer.buffs = [
            ...updatedPlayer.buffs.filter((b) => b.type !== 'shield'),
            {
              type: 'shield',
              duration: skill.effect.duration,
              defBonus: skill.effect.defBonus,
            },
          ];
          turnLogs.push(
            `🛡️ ${skill.name}: +${shieldAmt} de Escudo, +${skill.effect.defBonus} DEF por ${skill.effect.duration} turnos!`
          );
        } else {
          // Habilidade ofensiva
          const scalingStat = skill.scaling || player.weapon?.scalingStat || 'str';
          const statPower = eff[scalingStat] || eff.str;
          const statVal = eff[skill.scaling] || eff.str;
          const critChance = eff.critChance + (skill.bonusCrit || 0);
          const isCrit = Math.random() * 100 < critChance;
          const critMult = player.classInfo.id === 'rogue' ? 1.75 : 1.4;

          // Se for habilidade de múltiplos disparos (ex: Tiro Triplo: 3 flechas de 50% de dano base)
          if (skill.isMultiHit) {
            const hits = skill.hits || 3;
            let totalDmg = 0;
            const hitValues = [];

            for (let i = 0; i < hits; i++) {
              const variance = (Math.random() * 2) - 1;
              let arrowDmg = (statPower * 0.55 * skill.multiplier) + 1.5 + variance;
              const arrowCrit = Math.random() * 100 < eff.critChance;
              if (arrowCrit) arrowDmg *= critMult;

              const defReduction = (updatedEnemy.def * 0.15);
              const finalArrowDmg = Math.max(2, Math.round(arrowDmg - defReduction));
              hitValues.push(finalArrowDmg);
              totalDmg += finalArrowDmg;
            }

            updatedEnemy.hp = Math.max(0, updatedEnemy.hp - totalDmg);
            turnLogs.push(
              `🏹 Você disparou [${skill.name}]: ${hits} flechas atingiram causando ${totalDmg} de dano (${hitValues.join(' + ')})!`
            );
          } else {
            // Habilidades normais causam aprox. 1.3x a 1.6x o dano do ataque básico
            const skillVariance = (Math.random() * 3) - 1;
            let rawDmg = (statVal * 0.55 * skill.multiplier) + 4 + skillVariance;
            if (isCrit) rawDmg *= critMult;

            const defFactor = skill.type === 'magic' ? 0.25 : 0.35;
            const finalDmg = Math.max(
              4,
              Math.round(rawDmg - updatedEnemy.def * defFactor)
            );

            updatedEnemy.hp = Math.max(0, updatedEnemy.hp - finalDmg);
            turnLogs.push(
              `${isCrit ? '💥 CRÍTICO! ' : '🔥 '}Você usou ${
                skill.name
              } causando ${finalDmg} de dano!`
            );
          }

          if (skill.effect && updatedEnemy.hp > 0) {
            if (Math.random() < skill.effect.chance) {
              updatedEnemy.statuses = [
                ...updatedEnemy.statuses.filter(
                  (st) => st.type !== skill.effect.type
                ),
                { ...skill.effect },
              ];
              const effectNames = {
                burn: 'Queimadura',
                poison: 'Veneno',
                stun: 'Atordoamento',
                weaken: 'Enfraquecimento',
              };
              turnLogs.push(
                `⚡ ${updatedEnemy.name} sofreu [${
                  effectNames[skill.effect.type]
                }]!`
              );
            }
          }
        }

        get()._resolveAfterPlayerTurn(updatedPlayer, updatedEnemy, turnLogs);
      },

      useBattleItem: (itemId) => {
        const { player, battle } = get();
        if (!player || !battle) return;
        const count = player.inventory[itemId] || 0;
        if (count <= 0) return;

        const item = ITEMS_CATALOG[itemId];
        const eff = computeEffectiveStats(player);

        if (item.type === 'escape') {
          if (battle.enemy.isBoss) {
            set({
              battle: {
                ...battle,
                logs: [
                  ...battle.logs,
                  `❌ Não é possível usar ${item.name} contra um Chefe!`,
                ],
              },
            });
            return;
          }
          const updatedPlayer = {
            ...player,
            shield: 0,
            buffs: [],
            inventory: { ...player.inventory, [itemId]: count - 1 },
          };
          get()._finishEscape(
            updatedPlayer,
            `💨 Você lançou ${item.name} e escapou ileso da batalha!`
          );
          return;
        }

        let updatedPlayer = {
          ...player,
          inventory: { ...player.inventory, [itemId]: count - 1 },
        };
        let logMsg = '';

        if (item.type === 'heal_hp') {
          const nextHp = Math.min(eff.maxHp, player.hp + item.value);
          logMsg = `🧪 Você bebeu ${item.name} (+${nextHp - player.hp} HP).`;
          updatedPlayer.hp = nextHp;
        } else if (item.type === 'heal_mp') {
          const nextMp = Math.min(eff.maxMp, player.mp + item.value);
          logMsg = `🧪 Você bebeu ${item.name} (+${nextMp - player.mp} MP).`;
          updatedPlayer.mp = nextMp;
        }

        get()._resolveAfterPlayerTurn(updatedPlayer, battle.enemy, [logMsg]);
      },

      attemptFlee: () => {
        const { player, battle } = get();
        if (!player || !battle) return;
        if (battle.enemy.isBoss) {
          set({
            battle: {
              ...battle,
              logs: [
                ...battle.logs,
                `❌ As portas do Salão do Trono estão seladas! Não há fuga contra ${battle.enemy.name}!`,
              ],
            },
          });
          return;
        }

        const eff = computeEffectiveStats(player);
        const fleeChance = Math.min(0.85, 0.45 + eff.dex * 0.02);
        if (Math.random() < fleeChance) {
          get()._finishEscape(
            { ...player, shield: 0, buffs: [] },
            `🏃 Você conseguiu despistar ${battle.enemy.name} e recuar!`
          );
        } else {
          get()._resolveAfterPlayerTurn(player, battle.enemy, [
            `⚠️ Tentativa de fuga falhou! ${battle.enemy.name} bloqueou sua saída!`,
          ]);
        }
      },

      _finishEscape: (updatedPlayer, message) => {
        const { pendingSceneId, currentSceneId, flags } = get();
        const targetId = pendingSceneId || currentSceneId;
        const targetScene = buildScene(targetId, {
          player: updatedPlayer,
          flags,
        });

        set({
          player: updatedPlayer,
          phase: 'story',
          battle: null,
          currentSceneId: targetId,
          currentScene: targetScene,
          pendingSceneId: null,
          lastOutcome: { type: 'warning', text: message },
        });
      },

      _resolveAfterPlayerTurn: (updatedPlayer, updatedEnemy, newLogs) => {
        const state = get();
        const { battle, pendingSceneId, currentSceneId, flags, journal, statsSummary } =
          state;

        // 1. Checar se o inimigo já caiu
        if (updatedEnemy.hp <= 0) {
          get()._handleBattleVictory(updatedPlayer, updatedEnemy, newLogs);
          return;
        }

        // 2. Processar DoTs (Queimadura / Veneno) no inimigo
        let enemyStatuses = [...(updatedEnemy.statuses || [])];
        let isStunned = false;
        let isWeakened = false;

        enemyStatuses = enemyStatuses
          .map((st) => {
            if (st.type === 'burn' || st.type === 'poison') {
              const dot = st.dotDamage || 8;
              updatedEnemy.hp = Math.max(0, updatedEnemy.hp - dot);
              newLogs.push(
                `${st.type === 'burn' ? '🔥 Queimadura' : '☠️ Veneno'} causou ${dot} de dano em ${updatedEnemy.name}.`
              );
            }
            if (st.type === 'stun') isStunned = true;
            if (st.type === 'weaken') isWeakened = true;
            return { ...st, duration: st.duration - 1 };
          })
          .filter((st) => st.duration > 0);

        updatedEnemy.statuses = enemyStatuses;

        if (updatedEnemy.hp <= 0) {
          get()._handleBattleVictory(updatedPlayer, updatedEnemy, newLogs);
          return;
        }

        // 3. Turno do Inimigo
        const eff = computeEffectiveStats(updatedPlayer);

        if (isStunned) {
          newLogs.push(`💫 ${updatedEnemy.name} está atordoado e perdeu o turno!`);
        } else {
          // Passiva do Ladino: 15% esquiva
          const dodgeChance =
            updatedPlayer.classInfo.id === 'rogue' ? 0.15 : 0.04;
          if (Math.random() < dodgeChance) {
            newLogs.push(
              `💨 Você esquivou agilmente do golpe de ${updatedEnemy.name}!`
            );
          } else {
            const usesSpecial =
              updatedEnemy.specialMove &&
              Math.random() < updatedEnemy.specialMove.chance;
            const moveMult = usesSpecial
              ? updatedEnemy.specialMove.multiplier
              : 1.0;

            let rawEnemyDmg =
              updatedEnemy.atk * moveMult * (0.9 + Math.random() * 0.2);
            if (isWeakened) rawEnemyDmg *= 0.7;
            if (updatedPlayer.classInfo.id === 'warrior') rawEnemyDmg *= 0.85; // Pele de Ferro

            let dmgToPlayer = Math.max(
              3,
              Math.round(rawEnemyDmg - eff.def * 0.45)
            );

            // Absorção por escudo
            if (updatedPlayer.shield > 0) {
              const absorbed = Math.min(updatedPlayer.shield, dmgToPlayer);
              updatedPlayer.shield -= absorbed;
              dmgToPlayer -= absorbed;
              newLogs.push(`🛡️ Seu escudo absorveu ${absorbed} de dano.`);
            }

            updatedPlayer.hp = Math.max(0, updatedPlayer.hp - dmgToPlayer);
            newLogs.push(
              usesSpecial
                ? `👹 ${updatedEnemy.name} usou [${updatedEnemy.specialMove.name}] causando ${dmgToPlayer} de dano!`
                : `⚔️ ${updatedEnemy.name} atacou causando ${dmgToPlayer} de dano.`
            );
          }
        }

        // Checar Game Over
        if (updatedPlayer.hp <= 0) {
          set({
            player: updatedPlayer,
            phase: 'gameover',
            journal: [
              ...journal,
              {
                id: Date.now(),
                title: 'Queda em Batalha',
                text: `Sua jornada chegou a um fim trágico diante de ${updatedEnemy.name}.`,
              },
            ],
            battle: {
              ...battle,
              enemy: updatedEnemy,
              logs: [...battle.logs, ...newLogs, `💀 Você tombou em combate...`],
            },
          });
          return;
        }

        // Passiva do Arcanista: Fluxo Astral (+8 MP por turno)
        if (updatedPlayer.classInfo.id === 'mage') {
          const nextMp = Math.min(eff.maxMp, updatedPlayer.mp + 8);
          if (nextMp > updatedPlayer.mp) {
            updatedPlayer.mp = nextMp;
            newLogs.push(`🔮 Fluxo Astral regenerou +8 de Mana.`);
          }
        }

        // Reduzir duração de buffs do jogador
        updatedPlayer.buffs = (updatedPlayer.buffs || [])
          .map((bf) => ({ ...bf, duration: bf.duration - 1 }))
          .filter((bf) => bf.duration > 0);
        if (!updatedPlayer.buffs.some((bf) => bf.type === 'shield')) {
          updatedPlayer.shield = 0;
        }

        set({
          player: updatedPlayer,
          battle: {
            ...battle,
            enemy: updatedEnemy,
            turnCount: battle.turnCount + 1,
            logs: [...battle.logs, ...newLogs].slice(-18),
          },
        });
      },

      _handleBattleVictory: (updatedPlayer, defeatedEnemy, newLogs) => {
        const {
          pendingSceneId,
          currentSceneId,
          currentScene,
          flags,
          journal,
          statsSummary,
        } = get();

        updatedPlayer.shield = 0;
        updatedPlayer.buffs = [];
        updatedPlayer.xp += defeatedEnemy.xp;
        updatedPlayer.gold += defeatedEnemy.gold;

        const eff = computeEffectiveStats(updatedPlayer);
        const victoryNotes = [
          `Vitória contra ${defeatedEnemy.name}! +${defeatedEnemy.xp} XP, +${defeatedEnemy.gold} Ouro`,
        ];

        // Passiva do Guardião Solar: Graça da Aurora (+15% HP Máx ao vencer)
        if (updatedPlayer.classInfo.id === 'paladin') {
          const heal = Math.round(eff.maxHp * 0.15);
          updatedPlayer.hp = Math.min(eff.maxHp, updatedPlayer.hp + heal);
          victoryNotes.push(`Graça da Aurora: +${heal} HP`);
        }

        // Chance de saque de item (35% em combates normais, 100% em Chefe)
        if (defeatedEnemy.isBoss || Math.random() < 0.35) {
          const dropPool = ['health_potion', 'mana_elixir', 'smoke_bomb'];
          const dropped = dropPool[Math.floor(Math.random() * dropPool.length)];
          updatedPlayer.inventory = {
            ...updatedPlayer.inventory,
            [dropped]: (updatedPlayer.inventory[dropped] || 0) + 1,
          };
          victoryNotes.push(`Saque: +1 ${ITEMS_CATALOG[dropped].name}!`);
        }

        const targetSceneId = pendingSceneId || currentSceneId;
        const nextSceneObj = pendingSceneId
          ? buildScene(targetSceneId, { player: updatedPlayer, flags })
          : currentScene ||
            buildScene(targetSceneId, { player: updatedPlayer, flags });

        const updatedJournal = [
          ...journal,
          {
            id: Date.now(),
            title: defeatedEnemy.isBoss ? 'Triunfo Lendário' : 'Batalha Vencida',
            text: `Você derrotou ${defeatedEnemy.name} em combate e conquistou ${defeatedEnemy.xp} XP e ${defeatedEnemy.gold} moedas de ouro.`,
          },
        ];

        const leveledUp = updatedPlayer.xp >= updatedPlayer.xpToNext;

        set({
          player: updatedPlayer,
          battle: null,
          currentSceneId: targetSceneId,
          currentScene: nextSceneObj,
          pendingSceneId: null,
          journal: updatedJournal,
          statsSummary: {
            ...statsSummary,
            battlesWon: statsSummary.battlesWon + 1,
          },
          lastOutcome: {
            type: 'success',
            text: victoryNotes.join(' • '),
          },
          phase: leveledUp ? 'levelup' : 'story',
        });
      },

      // 4. Evolução de Nível (escolha de nova habilidade ou bônus de atributos)
      applyLevelUpReward: (reward) => {
        const { player } = get();
        if (!player) return;

        const nextLevel = player.level + 1;
        const leftoverXp = Math.max(0, player.xp - player.xpToNext);
        const nextXpThreshold = Math.round(player.xpToNext * 1.45);

        const newBase = {
          ...player.baseStats,
          maxHp: player.baseStats.maxHp + 14,
          maxMp: player.baseStats.maxMp + 8,
          str: player.baseStats.str + 1,
          int: player.baseStats.int + 1,
          dex: player.baseStats.dex + 1,
          def: player.baseStats.def + 1,
        };

        let newSkills = [...player.skills];
        let bonusDesc = '';

        if (reward.type === 'skill' && !newSkills.includes(reward.skillId)) {
          newSkills.push(reward.skillId);
          const sk = SKILLS.find((s) => s.id === reward.skillId);
          bonusDesc = `Nova habilidade aprendida: ${sk?.name}!`;
        } else if (reward.type === 'stat') {
          if (reward.stat === 'vitality') {
            newBase.maxHp += 22;
            newBase.def += 2;
            bonusDesc = `+22 HP Máx e +2 DEF adicionais!`;
          } else {
            newBase[reward.stat] += 3;
            bonusDesc = `+3 ${reward.stat.toUpperCase()} adicional!`;
          }
        }

        const updatedPlayer = {
          ...player,
          level: nextLevel,
          xp: leftoverXp,
          xpToNext: nextXpThreshold,
          baseStats: newBase,
          skills: newSkills,
        };

        const eff = computeEffectiveStats(updatedPlayer);
        updatedPlayer.hp = eff.maxHp;
        updatedPlayer.mp = eff.maxMp;

        set({
          player: updatedPlayer,
          phase: updatedPlayer.xp >= updatedPlayer.xpToNext ? 'levelup' : 'story',
          lastOutcome: {
            type: 'success',
            text: `🎉 Subiu para o Nível ${nextLevel}! Vida e Mana restauradas • ${bonusDesc}`,
          },
        });
      },

      // Resetar para criar novo personagem
      resetGame: () => {
        set({
          phase: 'creation',
          player: null,
          flags: {},
          currentSceneId: 'intro_awakening',
          currentScene: null,
          pendingSceneId: null,
          lastOutcome: null,
          journal: [],
          battle: null,
          statsSummary: { battlesWon: 0, choicesMade: 0 },
        });
      },
    }),
    {
      name: 'cronicas-eldoria-save-v1',
    }
  )
);
