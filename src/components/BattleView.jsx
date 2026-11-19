import React, { useEffect, useRef, useState } from 'react';
import {
  Sword,
  Zap,
  FlaskConical,
  Footprints,
  Skull,
  Shield,
  Flame,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { SKILLS, ITEMS_CATALOG } from '../data/characterData';

export default function BattleView() {
  const player = useGameStore((s) => s.player);
  const battle = useGameStore((s) => s.battle);
  const performBasicAttack = useGameStore((s) => s.performBasicAttack);
  const performSkill = useGameStore((s) => s.performSkill);
  const useBattleItem = useGameStore((s) => s.useBattleItem);
  const attemptFlee = useGameStore((s) => s.attemptFlee);

  const [actionPanel, setActionPanel] = useState('skills'); // 'skills' | 'items'
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battle?.logs]);

  if (!battle || !player) return null;

  const { enemy, turnCount, logs, isRandomEncounter } = battle;
  const enemyHpPct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));

  const statusLabels = {
    burn: { text: 'Queimando', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    poison: { text: 'Envenenado', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    stun: { text: 'Atordoado', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    weaken: { text: 'Enfraquecido', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Arena do Inimigo */}
      <div
        className={`rounded-xl p-4 sm:p-6 border shadow-xl ${
          enemy.isBoss
            ? 'bg-gradient-to-b from-red-950/50 to-stone-900 border-red-700/60'
            : 'bg-stone-900/95 border-stone-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <span
            className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold px-2.5 py-0.5 sm:py-1 rounded-full border ${
              enemy.isBoss
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {enemy.isBoss
              ? 'Chefe da Cidadela'
              : isRandomEncounter
              ? 'Batalha Aleatória'
              : 'Combate'}
          </span>
          <span className="text-xs text-stone-400 font-medium">
            Turno {turnCount}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 sm:w-14 h-11 sm:h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
                enemy.isBoss
                  ? 'bg-red-950 border-red-500/50 text-red-400'
                  : 'bg-stone-950 border-stone-700 text-amber-400'
              }`}
            >
              {enemy.isBoss ? (
                <Flame className="w-6 sm:w-8 h-6 sm:h-8" />
              ) : (
                <Skull className="w-5 sm:w-7 h-5 sm:h-7" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-stone-100 truncate">
                {enemy.name}{' '}
                <span className="text-xs sm:text-sm font-sans font-normal text-stone-400">
                  (Nv. {enemy.level})
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400 truncate">{enemy.title}</p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 text-xs self-start sm:self-auto">
            <div className="bg-stone-950/80 border border-stone-800 px-2.5 sm:px-3 py-1 rounded-lg">
              <span className="text-stone-400">ATK: </span>
              <strong className="text-red-300">{enemy.atk}</strong>
            </div>
            <div className="bg-stone-950/80 border border-stone-800 px-2.5 sm:px-3 py-1 rounded-lg">
              <span className="text-stone-400">DEF: </span>
              <strong className="text-stone-200">{enemy.def}</strong>
            </div>
          </div>
        </div>

        {/* Barra de Vida do Inimigo */}
        <div className="mt-4 sm:mt-5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-stone-300 font-medium text-[11px] sm:text-xs">Vitalidade do Inimigo</span>
            <span className="font-bold text-red-300 text-xs">
              {enemy.hp} / {enemy.maxHp} HP
            </span>
          </div>
          <div className="w-full h-3 sm:h-3.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-red-500 to-amber-500 transition-all duration-300"
              style={{ width: `${enemyHpPct}%` }}
            />
          </div>
        </div>

        {/* Efeitos Negativos Ativos no Inimigo */}
        {enemy.statuses?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {enemy.statuses.map((st, i) => {
              const info = statusLabels[st.type] || {
                text: st.type,
                cls: 'bg-stone-800 text-stone-200',
              };
              return (
                <span
                  key={i}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border font-medium ${info.cls}`}
                >
                  {info.text} ({st.duration}t)
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Log de Combate */}
      <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 sm:p-4 h-36 sm:h-48 overflow-y-auto space-y-1.5 text-xs sm:text-sm font-mono">
        {logs.map((line, index) => (
          <div
            key={index}
            className={`${
              index === logs.length - 1
                ? 'text-amber-200 font-semibold'
                : 'text-stone-400'
            }`}
          >
            {line}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Comandos de Turno do Jogador */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-sans">
            Seu Turno
          </h3>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActionPanel('skills')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition ${
                actionPanel === 'skills'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                  : 'bg-stone-950 text-stone-400 border border-stone-800'
              }`}
            >
              Habilidades
            </button>
            <button
              type="button"
              onClick={() => setActionPanel('items')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                actionPanel === 'items'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                  : 'bg-stone-950 text-stone-400 border border-stone-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Itens
            </button>
          </div>
        </div>

        {/* Botões Rápidos: Ataque Básico e Fuga */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={performBasicAttack}
            className="sm:col-span-2 p-3 sm:p-3.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-left transition active:scale-[0.99] flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                <Sword className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-stone-100 group-hover:text-amber-200 text-sm sm:text-base truncate">
                  Ataque com {player.weapon.name}
                </div>
                <div className="text-[11px] sm:text-xs text-stone-400">
                  Sem custo • Regenera +5 Mana
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-300 shrink-0 ml-2">
              Atacar
            </span>
          </button>

          <button
            type="button"
            disabled={enemy.isBoss}
            onClick={attemptFlee}
            className="p-3 sm:p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed border border-stone-800 text-left transition active:scale-[0.99] flex items-center gap-2.5"
          >
            <Footprints className="w-4 sm:w-5 h-4 sm:h-5 text-stone-400 shrink-0" />
            <div>
              <div className="font-semibold text-stone-200 text-xs sm:text-sm">
                {enemy.isBoss ? 'Sem Fuga' : 'Tentar Fugir'}
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-400">
                Destreza
              </div>
            </div>
          </button>
        </div>

        {/* Painel de Habilidades ou Itens */}
        {actionPanel === 'skills' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-stone-800">
            {player.skills.map((skId) => {
              const sk = SKILLS.find((s) => s.id === skId);
              if (!sk) return null;
              const enoughMp = player.mp >= sk.cost;

              return (
                <button
                  key={sk.id}
                  type="button"
                  disabled={!enoughMp}
                  onClick={() => performSkill(sk.id)}
                  className="p-3 sm:p-3.5 rounded-xl bg-stone-950/80 hover:bg-purple-950/30 disabled:opacity-40 disabled:cursor-not-allowed border border-stone-800 hover:border-purple-500/50 text-left transition active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-stone-100 text-xs sm:text-sm flex items-center gap-1.5 truncate">
                      {sk.type === 'buff' ? (
                        <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-purple-400 shrink-0" />
                      )}
                      <span className="truncate">{sk.name}</span>
                    </span>
                    <span
                      className={`text-[11px] sm:text-xs px-2 py-0.5 rounded font-semibold shrink-0 ${
                        enoughMp
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {sk.cost} MP
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-400 mt-1 leading-snug">
                    {sk.description}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2 border-t border-stone-800">
            {Object.entries(ITEMS_CATALOG).map(([id, item]) => {
              const qty = player.inventory[id] || 0;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={qty <= 0}
                  onClick={() => useBattleItem(id)}
                  className="p-2.5 sm:p-3 rounded-xl bg-stone-950/80 hover:bg-emerald-950/30 disabled:opacity-40 disabled:cursor-not-allowed border border-stone-800 hover:border-emerald-500/50 text-left transition active:scale-[0.99]"
                >
                  <div className="flex justify-between items-center gap-1">
                    <span className="font-semibold text-stone-100 text-xs truncate">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-amber-400 shrink-0">
                      x{qty}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
