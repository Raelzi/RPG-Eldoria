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
      <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-rpg text-lg font-bold tracking-wider text-stone-100">
              Crônicas de <span className="text-amber-400">Eldoria</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-stone-800 text-stone-400">
              Protótipo RPG
            </span>
          </div>

          <div className="text-xs text-stone-400">
            Modo:{' '}
            <strong className="text-amber-300 uppercase">
              {phase === 'battle'
                ? 'Em Combate'
                : phase === 'levelup'
                ? 'Subindo de Nível'
                : 'Exploração & História'}
            </strong>
          </div>
        </div>
      </header>

      {/* Layout Principal: Sidebar do Jogador + Palco Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <PlayerSidebar />
        </div>

        <div className="lg:col-span-8">
          {phase === 'story' && <StoryView />}
          {phase === 'battle' && <BattleView />}
          {phase === 'levelup' && <LevelUpModal />}
        </div>
      </main>
    </div>
  );
}
