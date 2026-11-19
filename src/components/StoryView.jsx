import React from 'react';
import {
  Compass,
  Swords,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Skull,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { REGIONS } from '../engine/storyGenerator';

export default function StoryView() {
  const currentScene = useGameStore((s) => s.currentScene);
  const lastOutcome = useGameStore((s) => s.lastOutcome);
  const chooseStoryAction = useGameStore((s) => s.chooseStoryAction);
  const triggerQuickHunt = useGameStore((s) => s.triggerQuickHunt);
  const getEffectiveStats = useGameStore((s) => s.getEffectiveStats);

  if (!currentScene) return null;
  const eff = getEffectiveStats();
  const regionInfo = REGIONS[currentScene.region] || REGIONS.crossroads;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Banner de resultado da última ação */}
      {lastOutcome?.text && (
        <div
          className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2.5 ${
            lastOutcome.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : lastOutcome.type === 'warning'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              : 'bg-stone-900/90 border-stone-700 text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{lastOutcome.text}</span>
        </div>
      )}

      {/* Cartão Principal da Narrativa */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-6 md:p-8 shadow-xl space-y-6">
        {/* Cabeçalho da Cena & Região */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              {currentScene.chapter}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-100 mt-1">
              {currentScene.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-lg">
            <Compass className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold text-stone-200">
                {regionInfo.name}
              </div>
              <div className="text-[11px] text-stone-400">
                Batalha Aleatória: {regionInfo.dangerLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Texto da História */}
        <div className="space-y-4 text-stone-200 leading-relaxed text-base md:text-[17px]">
          {currentScene.paragraphs.map((p, idx) => (
            <p key={idx} className="first-letter:text-2xl first-letter:font-serif first-letter:text-amber-400 first-letter:mr-0.5">
              {p}
            </p>
          ))}
        </div>

        {/* Escolhas de Ação */}
        <div className="pt-4 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-stone-400 font-semibold font-sans">
              Escolha sua próxima ação
            </h3>
            <button
              type="button"
              onClick={triggerQuickHunt}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 flex items-center gap-1.5 transition"
              title="Procurar inimigos nos arredores para ganhar XP e Ouro"
            >
              <Swords className="w-3.5 h-3.5" />
              Caçar Monstros (Batalha Aleatória)
            </button>
          </div>

          <div className="space-y-3">
            {currentScene.choices.map((choice) => {
              const hasStatCheck = Boolean(choice.statCheck);
              const statVal = hasStatCheck
                ? eff[choice.statCheck.stat] || 0
                : 0;
              const meetsStat = hasStatCheck
                ? statVal >= choice.statCheck.target
                : true;

              const encounterPct =
                typeof choice.encounterChance === 'number'
                  ? Math.round(choice.encounterChance * 100)
                  : Math.round(regionInfo.encounterRate * 100);

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => chooseStoryAction(choice)}
                  className={`w-full text-left p-4 rounded-xl border transition-all group flex items-center justify-between gap-4 ${
                    choice.forceBoss
                      ? 'bg-red-950/25 hover:bg-red-950/40 border-red-800/60 hover:border-red-500'
                      : 'bg-stone-950/70 hover:bg-stone-800/70 border-stone-800 hover:border-amber-500/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-stone-100 group-hover:text-amber-300 transition flex flex-wrap items-center gap-2">
                      {choice.forceBoss && (
                        <Skull className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{choice.label}</span>
                      {hasStatCheck && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            meetsStat
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          Seu {choice.statCheck.stat.toUpperCase()}: {statVal}/
                          {choice.statCheck.target}
                        </span>
                      )}
                    </div>

                    {choice.hint && (
                      <p className="text-xs text-stone-400">{choice.hint}</p>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-500">
                      {choice.forceBoss ? (
                        <span className="text-red-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Combate de Chefe Garantido
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Swords className="w-3 h-3 text-stone-500" />
                          Risco de Batalha: {encounterPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
