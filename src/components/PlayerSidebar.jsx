import React, { useState } from 'react';
import {
  Heart,
  Droplets,
  Coins,
  Sword,
  Backpack,
  BookOpen,
  RotateCcw,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { ITEMS_CATALOG, SKILLS } from '../data/characterData';

export default function PlayerSidebar() {
  const player = useGameStore((s) => s.player);
  const phase = useGameStore((s) => s.phase);
  const journal = useGameStore((s) => s.journal);
  const getEffectiveStats = useGameStore((s) => s.getEffectiveStats);
  const useItemOutOfBattle = useGameStore((s) => s.useItemOutOfBattle);
  const equipWeapon = useGameStore((s) => s.equipWeapon);
  const resetGame = useGameStore((s) => s.resetGame);

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'bag' | 'journal'

  if (!player) return null;
  const eff = getEffectiveStats();

  const hpPct = Math.max(0, Math.min(100, (player.hp / eff.maxHp) * 100));
  const mpPct = Math.max(0, Math.min(100, (player.mp / eff.maxMp) * 100));
  const xpPct = Math.max(
    0,
    Math.min(100, (player.xp / player.xpToNext) * 100)
  );

  return (
    <aside className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      {/* Identificação e Nível */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-stone-100 leading-tight">
            {player.name}
          </h2>
          <p className="text-xs text-amber-400 font-medium mt-0.5">
            {player.classInfo.name} • Nível {player.level}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg text-amber-300 text-xs font-bold">
          <Coins className="w-3.5 h-3.5" />
          <span>{player.gold}</span>
        </div>
      </div>

      {/* Barras de HP, MP e XP */}
      <div className="space-y-2.5">
        {/* HP */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-300 font-medium flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-red-500/40 text-red-400" />
              Vida
              {player.shield > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[10px]">
                  +{player.shield} Escudo
                </span>
              )}
            </span>
            <span className="text-stone-200 font-semibold">
              {player.hp} / {eff.maxHp}
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* MP */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-300 font-medium flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 fill-blue-500/40 text-blue-400" />
              Mana
            </span>
            <span className="text-stone-200 font-semibold">
              {player.mp} / {eff.maxMp}
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-300"
              style={{ width: `${mpPct}%` }}
            />
          </div>
        </div>

        {/* XP */}
        <div>
          <div className="flex justify-between text-[11px] text-stone-400 mb-1">
            <span>Experiência (XP)</span>
            <span>
              {player.xp} / {player.xpToNext}
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="grid grid-cols-3 gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`py-1.5 rounded-md font-medium flex items-center justify-center gap-1 transition ${
            activeTab === 'stats'
              ? 'bg-stone-800 text-amber-300'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sword className="w-3.5 h-3.5" />
          Ficha
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bag')}
          className={`py-1.5 rounded-md font-medium flex items-center justify-center gap-1 transition ${
            activeTab === 'bag'
              ? 'bg-stone-800 text-amber-300'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Backpack className="w-3.5 h-3.5" />
          Mochila
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('journal')}
          className={`py-1.5 rounded-md font-medium flex items-center justify-center gap-1 transition ${
            activeTab === 'journal'
              ? 'bg-stone-800 text-amber-300'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Crônica
        </button>
      </div>

      {/* Conteúdo da Aba */}
      {activeTab === 'stats' && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-2 flex justify-between">
              <span className="text-stone-400">FOR</span>
              <span className="font-bold text-stone-100">{eff.str}</span>
            </div>
            <div className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-2 flex justify-between">
              <span className="text-stone-400">INT</span>
              <span className="font-bold text-stone-100">{eff.int}</span>
            </div>
            <div className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-2 flex justify-between">
              <span className="text-stone-400">DES</span>
              <span className="font-bold text-stone-100">{eff.dex}</span>
            </div>
            <div className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-2 flex justify-between">
              <span className="text-stone-400">DEF</span>
              <span className="font-bold text-stone-100">{eff.def}</span>
            </div>
          </div>

          <div className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-2.5">
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
              Arma Equipada
            </div>
            <div className="font-semibold text-stone-100 mt-0.5">
              {player.weapon.name}
            </div>
            <div className="text-[11px] text-stone-400">
              {player.weapon.type} • Crítico Total: {eff.critChance}%
            </div>

            {player.weaponsOwned?.length > 1 && phase === 'story' && (
              <div className="mt-2 pt-2 border-t border-stone-800">
                <label className="block text-[10px] text-stone-400 mb-1">
                  Trocar Arma:
                </label>
                <select
                  value={player.weapon.id}
                  onChange={(e) => equipWeapon(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200"
                >
                  {player.weaponsOwned.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold">
              Habilidades Conhecidas ({player.skills.length})
            </div>
            {player.skills.map((skId) => {
              const sk = SKILLS.find((s) => s.id === skId);
              if (!sk) return null;
              return (
                <div
                  key={sk.id}
                  className="bg-stone-950/60 border border-stone-800/80 rounded-lg p-2"
                >
                  <div className="flex justify-between font-medium text-stone-200">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-400" />
                      {sk.name}
                    </span>
                    <span className="text-blue-300">{sk.cost} MP</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {sk.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'bag' && (
        <div className="space-y-2 text-xs">
          <p className="text-[11px] text-stone-400">
            {phase === 'story'
              ? 'Clique em uma poção para usar fora de combate.'
              : 'Use a aba de itens na arena durante seu turno.'}
          </p>
          {Object.entries(ITEMS_CATALOG).map(([id, item]) => {
            const qty = player.inventory[id] || 0;
            const canClick =
              phase === 'story' && qty > 0 && item.type !== 'escape';

            return (
              <div
                key={id}
                className="bg-stone-950/70 border border-stone-800 rounded-lg p-2.5 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-stone-200">
                    {item.name}{' '}
                    <span className="text-amber-400 font-bold">x{qty}</span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {item.description}
                  </div>
                </div>
                {canClick && (
                  <button
                    type="button"
                    onClick={() => useItemOutOfBattle(id)}
                    className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium shrink-0 transition"
                  >
                    Usar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
          {journal
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className="bg-stone-950/70 border-l-2 border-amber-500/70 pl-3 py-2 pr-2 rounded-r-lg"
              >
                <div className="font-semibold text-amber-300 text-[11px]">
                  {entry.title}
                </div>
                <p className="text-stone-300 mt-0.5 leading-relaxed">
                  {entry.text}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Rodapé: Passiva & Botão Reiniciar */}
      <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1 truncate" title={player.classInfo.passive.description}>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          Passiva: {player.classInfo.passive.name}
        </span>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                'Deseja encerrar esta aventura e criar um novo personagem?'
              )
            ) {
              resetGame();
            }
          }}
          className="text-stone-400 hover:text-red-300 flex items-center gap-1 shrink-0 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Novo Herói
        </button>
      </div>
    </aside>
  );
}
