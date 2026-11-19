import React, { useState } from 'react';
import {
  Shield,
  Flame,
  Sword,
  Sparkles,
  Dices,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { CLASSES, STARTING_WEAPONS, SKILLS } from '../data/characterData';
import { useGameStore } from '../store/useGameStore';

const CLASS_ICONS = {
  Shield,
  Flame,
  Sword,
  Sparkles,
};

const FANTASY_NAMES = [
  'Kaelen Corvo-Cinzento',
  'Lyra do Véu Astral',
  'Theron Quebra-Ferro',
  'Vaelis Lâmina-Noturna',
  'Seraphina Solari',
  'Draven de Eldoria',
  'Elowen Sussurro-Verde',
];

export default function CharacterCreation() {
  const startNewAdventure = useGameStore((s) => s.startNewAdventure);

  const [name, setName] = useState('Kaelen de Eldoria');
  const [selectedClassId, setSelectedClassId] = useState(CLASSES[0].id);
  const [selectedWeaponId, setSelectedWeaponId] = useState(
    CLASSES[0].recommendedWeapon
  );
  const [selectedSkills, setSelectedSkills] = useState(
    [CLASSES[0].recommendedSkills[0]]
  );

  const currentClass =
    CLASSES.find((c) => c.id === selectedClassId) || CLASSES[0];
  const currentWeapon =
    STARTING_WEAPONS.find((w) => w.id === selectedWeaponId) ||
    STARTING_WEAPONS[0];

  // Habilidades disponíveis para a classe selecionada
  // Se for Ladino e a arma NÃO for arco, exibe Tiro Certo como bloqueada ou com aviso
  const availableSkills = SKILLS.filter((sk) => {
    if (sk.classId !== selectedClassId) return false;
    return true;
  });

  const handleSelectClass = (cls) => {
    setSelectedClassId(cls.id);
    setSelectedWeaponId(cls.recommendedWeapon);
    // Para a nova classe, seleciona a primeira habilidade recomendada
    setSelectedSkills([cls.recommendedSkills[0]]);
  };

  const handleSelectWeapon = (weaponId) => {
    setSelectedWeaponId(weaponId);
    // Se for Ladino e trocar para o Arco, verifica se a habilidade atual é melee
    if (selectedClassId === 'rogue') {
      if (weaponId === 'longbow') {
        const currentSkill = SKILLS.find((s) => s.id === selectedSkills[0]);
        if (currentSkill?.requiresWeaponType === 'melee') {
          setSelectedSkills(['sure_shot']);
        }
      } else {
        const currentSkill = SKILLS.find((s) => s.id === selectedSkills[0]);
        if (currentSkill?.requiresWeapon === 'longbow') {
          setSelectedSkills(['crit_slash']);
        }
      }
    }
  };

  const toggleSkill = (skillId) => {
    const targetSkill = SKILLS.find((s) => s.id === skillId);
    // Não permite selecionar se estiver bloqueada para a arma atual
    if (targetSkill?.requiresWeapon && selectedWeaponId !== targetSkill.requiresWeapon) {
      return;
    }
    if (targetSkill?.requiresWeaponType === 'melee' && selectedWeaponId === 'longbow') {
      return;
    }
    setSelectedSkills([skillId]);
  };

  const randomizeName = () => {
    const others = FANTASY_NAMES.filter((n) => n !== name);
    setName(others[Math.floor(Math.random() * others.length)]);
  };

  const previewStats = {
    hp: currentClass.baseStats.maxHp + (currentWeapon.bonuses.maxHp || 0),
    mp: currentClass.baseStats.maxMp + (currentWeapon.bonuses.maxMp || 0),
    str: currentClass.baseStats.str + (currentWeapon.bonuses.str || 0),
    int: currentClass.baseStats.int + (currentWeapon.bonuses.int || 0),
    dex: currentClass.baseStats.dex + (currentWeapon.bonuses.dex || 0),
    def: currentClass.baseStats.def + (currentWeapon.bonuses.def || 0),
    crit:
      currentClass.baseStats.critChance +
      (currentWeapon.bonuses.critChance || 0),
  };

  const canStart = name.trim().length > 0 && selectedSkills.length === 1;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-6 sm:mb-8">
        <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2 sm:mb-3">
          RPG Interativo em JavaScript
        </span>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-stone-100 tracking-wide">
          Crônicas de <span className="text-amber-400">Eldoria</span>
        </h1>
        <p className="text-stone-400 mt-2 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2">
          Forje seu herói escolhendo sua classe, arma inicial e uma habilidade de combate. Cada decisão moldará sua história — e cada estrada esconde batalhas inesperadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Coluna Esquerda / Principal: Escolhas */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* 1. Nome do Personagem */}
          <section className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 sm:p-5 shadow-lg">
            <label className="block text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
              1. Nome do Personagem
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                maxLength={32}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do seu herói..."
                className="flex-1 bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-lg px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-stone-100 outline-none transition"
              />
              <button
                type="button"
                onClick={randomizeName}
                className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition shrink-0"
                title="Sortear nome"
              >
                <Dices className="w-4 h-4 text-amber-400" />
                <span>Sortear</span>
              </button>
            </div>
          </section>

          {/* 2. Escolha da Classe */}
          <section className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
              <h2 className="text-xs sm:text-sm uppercase tracking-wider text-amber-400 font-semibold font-sans">
                2. Escolha sua Classe
              </h2>
              <span className="text-[11px] text-stone-400">
                Define atributos e passiva
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CLASSES.map((cls) => {
                const IconComp = CLASS_ICONS[cls.icon] || Shield;
                const isSelected = cls.id === selectedClassId;

                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleSelectClass(cls)}
                    className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-950/30'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          <IconComp className="w-4 sm:w-5 h-4 sm:h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-100 text-sm sm:text-base leading-snug">
                            {cls.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-amber-400/90 line-clamp-1">
                            {cls.tagline}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-stone-400 mt-2 leading-relaxed">
                      {cls.description}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-[11px] text-stone-300">
                      <span className="text-amber-300 font-medium">
                        Passiva:
                      </span>{' '}
                      {cls.passive.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Escolha da Arma Inicial */}
          <section className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
              <h2 className="text-xs sm:text-sm uppercase tracking-wider text-amber-400 font-semibold font-sans">
                3. Arma Inicial
              </h2>
              <span className="text-[11px] text-stone-400">
                Escalona o ataque básico
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTING_WEAPONS.map((wpn) => {
                const isSelected = wpn.id === selectedWeaponId;
                const isRec = wpn.id === currentClass.recommendedWeapon;
                const scaleLabels = {
                  str: 'Força',
                  int: 'Inteligência',
                  dex: 'Destreza',
                };

                return (
                  <button
                    key={wpn.id}
                    type="button"
                    onClick={() => handleSelectWeapon(wpn.id)}
                    className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-stone-100 text-sm">
                        {wpn.name}
                      </span>
                      {isRec && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Ideal
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Tipo: {wpn.type} • Escala com{' '}
                      <strong className="text-stone-200">
                        {scaleLabels[wpn.scalingStat]}
                      </strong>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {wpn.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(wpn.bonuses)
                        .filter(([, val]) => val > 0)
                        .map(([k, val]) => (
                          <span
                            key={k}
                            className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-stone-800 text-emerald-300 font-medium"
                          >
                            +{val} {k.toUpperCase()}
                          </span>
                        ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Habilidades Iniciais */}
          <section className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
              <h2 className="text-xs sm:text-sm uppercase tracking-wider text-amber-400 font-semibold font-sans">
                4. Habilidade Inicial
              </h2>
              <span className="text-[11px] text-stone-400">
                Selecione 1 técnica para começar sua jornada
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableSkills.map((sk) => {
                const isSelected = selectedSkills.includes(sk.id);
                // Bloqueado se:
                // 1) Requer arco e a arma NÃO é arco
                // 2) Requer corpo a corpo (adagas) e a arma É arco
                const isBowRequiredBlocked = Boolean(sk.requiresWeapon && selectedWeaponId !== sk.requiresWeapon);
                const isMeleeRequiredBlocked = Boolean(sk.requiresWeaponType === 'melee' && selectedWeaponId === 'longbow');
                const isDisabled = isBowRequiredBlocked || isMeleeRequiredBlocked;

                return (
                  <button
                    key={sk.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleSkill(sk.id)}
                    className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-stone-950/40 border-stone-900 text-stone-500'
                        : isSelected
                        ? 'bg-purple-500/15 border-purple-400 active:scale-[0.99]'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-600 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold text-sm flex items-center gap-1.5 ${isDisabled ? 'text-stone-500' : 'text-stone-100'}`}>
                        <Zap className={`w-3.5 h-3.5 ${isDisabled ? 'text-stone-600' : 'text-purple-400'}`} />
                        {sk.name}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        isDisabled
                          ? 'bg-stone-900 border-stone-800 text-stone-600'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/20'
                      }`}>
                        {sk.cost} MP
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isDisabled ? 'text-stone-600' : 'text-stone-400'}`}>
                      {sk.description}
                    </p>
                    {isBowRequiredBlocked && (
                      <div className="mt-1.5 text-[10px] font-semibold text-amber-500/80 uppercase tracking-wider">
                        🔒 Indisponível (Requer Arco de Madeira)
                      </div>
                    )}
                    {isMeleeRequiredBlocked && (
                      <div className="mt-1.5 text-[10px] font-semibold text-amber-500/80 uppercase tracking-wider">
                        🔒 Indisponível com Arco (Requer Adagas)
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Coluna Direita: Resumo da Ficha e Botão Iniciar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 bg-stone-900/95 border border-amber-500/30 rounded-xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
                Ficha do Herói
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-0.5 truncate">
                {name || 'Sem Nome'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400">
                {currentClass.name} • Nível 1
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
              <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-2 sm:p-2.5">
                <div className="text-[10px] sm:text-[11px] text-red-300 uppercase">Vida Máx</div>
                <div className="text-base sm:text-lg font-bold text-red-200">
                  {previewStats.hp} HP
                </div>
              </div>
              <div className="bg-blue-950/30 border border-blue-900/40 rounded-lg p-2 sm:p-2.5">
                <div className="text-[10px] sm:text-[11px] text-blue-300 uppercase">Mana Máx</div>
                <div className="text-base sm:text-lg font-bold text-blue-200">
                  {previewStats.mp} MP
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-stone-800/70">
                <span className="text-stone-400">Força (FOR)</span>
                <span className="font-semibold text-stone-100">
                  {previewStats.str}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800/70">
                <span className="text-stone-400">Inteligência (INT)</span>
                <span className="font-semibold text-stone-100">
                  {previewStats.int}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800/70">
                <span className="text-stone-400">Destreza (DES)</span>
                <span className="font-semibold text-stone-100">
                  {previewStats.dex}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800/70">
                <span className="text-stone-400">Defesa (DEF)</span>
                <span className="font-semibold text-stone-100">
                  {previewStats.def}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-400">Chance Crítica</span>
                <span className="font-semibold text-amber-300">
                  {previewStats.crit}%
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-stone-800 space-y-1.5 text-xs">
              <div className="truncate">
                <span className="text-stone-400">Arma: </span>
                <span className="text-stone-200 font-medium">
                  {currentWeapon.name}
                </span>
              </div>
              <div className="truncate">
                <span className="text-stone-400">Habilidade: </span>
                <span className="text-purple-300 font-medium">
                  {selectedSkills
                    .map((id) => SKILLS.find((s) => s.id === id)?.name)
                    .filter(Boolean)
                    .join(', ') || 'Selecione 1'}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canStart}
              onClick={() =>
                startNewAdventure({
                  name,
                  classId: selectedClassId,
                  weaponId: selectedWeaponId,
                  skillIds: selectedSkills,
                })
              }
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition"
            >
              <span>Iniciar Jornada</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
