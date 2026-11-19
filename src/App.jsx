import React from 'react';
import { useGameStore } from './store/useGameStore';
import CharacterCreation from './components/CharacterCreation';
import PlayerSidebar from './components/PlayerSidebar';
import StoryView from './components/StoryView';
import BattleView from './components/BattleView';
import LevelUpModal from './components/LevelUpModal';
import GameOverView from './components/GameOverView';

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const player = useGameStore((s) => s.player);

  if (phase === 'creation' || !player) {
    return (
      <main className="min-h-screen pb-12">
        <CharacterCreation />
      </main>
    );
  }

  if (phase === 'gameover') {
    return (
      <main className="min-h-screen px-4 py-8">
        <GameOverView />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra Superior */}
      <header className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-rpg text-base sm:text-lg font-bold tracking-wider text-stone-100">
              Crônicas de <span className="text-amber-400">Eldoria</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
              RPG
            </span>
          </div>

          <div className="text-[11px] sm:text-xs text-stone-400 flex items-center gap-1.5">
            <span className="hidden xs:inline">Modo:</span>
            <strong className="text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {phase === 'battle'
                ? 'Em Combate'
                : phase === 'levelup'
                ? 'Level Up'
                : 'História'}
            </strong>
          </div>
        </div>
      </header>

      {/* Layout Principal: Sidebar do Jogador + Palco Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-20 order-2 lg:order-1">
          <PlayerSidebar />
        </div>

        <div className="lg:col-span-8 order-1 lg:order-2">
          {phase === 'story' && <StoryView />}
          {phase === 'battle' && <BattleView />}
          {phase === 'levelup' && <LevelUpModal />}
        </div>
      </main>
    </div>
  );
}
