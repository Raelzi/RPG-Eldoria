import React from 'react';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { SKILLS } from '../data/characterData';

export default function LevelUpModal() {
  const player = useGameStore((s) => s.player);
  const applyLevelUpReward = useGameStore((s) => s.applyLevelUpReward);

  if (!player) return null;

  const unlearnedSkills = SKILLS.filter(
    (s) => !player.skills.includes(s.id) && (!s.classId || s.classId === player.classInfo.id)
  );

  const statOptions = [
    {
      stat: 'str',
      title: 'Maestria Bélica (+3 FOR)',
      desc: 'Aumenta permanentemente o dano físico e testes de Força.',
    },
    {
      stat: 'int',
      title: 'Erudição Arcana (+3 INT)',
      desc: 'Amplia o poder de magias, curas e testes de Inteligência.',
    },
    {
      stat: 'dex',
      title: 'Reflexo Sombrio (+3 DES)',
      desc: 'Aumenta ataques ágeis, chance de fuga e testes de Destreza.',
    },
    {
      stat: 'vitality',
      title: 'Corpo Inquebrável (+22 HP & +2 DEF)',
      desc: 'Fortalece sua sobrevivência contra chefes e emboscadas.',
    },
  ];

  return (
    <div className="bg-stone-900/95 border border-amber-500/50 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Evolução de Personagem
        </div>
        <h2 className="text-3xl font-bold text-stone-100">
          Você alcançou o Nível {player.level + 1}!
        </h2>
        <p className="text-sm text-stone-400 max-w-xl mx-auto">
          Seus atributos base aumentaram (+14 HP, +8 MP, +1 em todos os atributos) e sua Vida e Mana serão 100% restauradas. Escolha uma especialização adicional:
        </p>
      </div>

      {unlearnedSkills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-purple-300 font-semibold font-sans">
            Opção A — Aprender Nova Habilidade
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unlearnedSkills.slice(0, 4).map((sk) => (
              <button
                key={sk.id}
                type="button"
                onClick={() =>
                  applyLevelUpReward({ type: 'skill', skillId: sk.id })
                }
                className="p-4 rounded-xl bg-stone-950/80 hover:bg-purple-950/30 border border-stone-800 hover:border-purple-400 text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400" />
                    {sk.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {sk.cost} MP
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1.5">{sk.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2 border-t border-stone-800">
        <h3 className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-sans">
          {unlearnedSkills.length > 0
            ? 'Opção B — Aprimorar Atributo Principal'
            : 'Escolha um Aprimoramento de Atributo'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statOptions.map((opt) => (
            <button
              key={opt.stat}
              type="button"
              onClick={() =>
                applyLevelUpReward({ type: 'stat', stat: opt.stat })
              }
              className="p-4 rounded-xl bg-stone-950/80 hover:bg-amber-950/25 border border-stone-800 hover:border-amber-500 text-left transition"
            >
              <div className="font-bold text-stone-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                {opt.title}
              </div>
              <p className="text-xs text-stone-400 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
