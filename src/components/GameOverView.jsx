import React from 'react';
import { Skull, RotateCcw, BookOpen } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export default function GameOverView() {
  const player = useGameStore((s) => s.player);
  const statsSummary = useGameStore((s) => s.statsSummary);
  const journal = useGameStore((s) => s.journal);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <div className="max-w-2xl mx-auto my-10 bg-stone-900/95 border border-red-900/60 rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-950 border border-red-700/50 flex items-center justify-center text-red-400">
        <Skull className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-red-400 font-bold">
          Fim da Jornada
        </span>
        <h1 className="text-3xl font-bold text-stone-100">
          {player?.name || 'O Herói'} Tombou nas Sombras
        </h1>
        <p className="text-sm text-stone-400">
          Mesmo na derrota, seus feitos foram gravados nas cinzas de Eldoria.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-3">
          <div className="text-xs text-stone-400">Nível Alcançado</div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {player?.level || 1}
          </div>
        </div>
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-3">
          <div className="text-xs text-stone-400">Batalhas Vencidas</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {statsSummary?.battlesWon || 0}
          </div>
        </div>
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-3">
          <div className="text-xs text-stone-400">Decisões Tomadas</div>
          <div className="text-xl font-bold text-purple-300 mt-1">
            {statsSummary?.choicesMade || 0}
          </div>
        </div>
      </div>

      {journal?.length > 0 && (
        <div className="text-left bg-stone-950/80 border border-stone-800 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 text-xs">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
            <BookOpen className="w-4 h-4" />
            Resumo da sua Crônica
          </div>
          {journal.map((j) => (
            <p key={j.id} className="text-stone-400">
              • {j.text}
            </p>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={resetGame}
        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold inline-flex items-center gap-2 shadow-lg transition"
      >
        <RotateCcw className="w-4 h-4" />
        Forjar Novo Personagem
      </button>
    </div>
  );
}
