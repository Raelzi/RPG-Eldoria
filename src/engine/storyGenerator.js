import { LOOT_WEAPONS } from '../data/characterData';

/**
 * Motor Narrativo Híbrido:
 * Combina cenas ramificadas reativas (que mudam o texto e as opções conforme classe, arma e escolhas passadas)
 * com geração procedural de eventos de exploração e gatilhos de batalhas aleatórias.
 */

export const REGIONS = {
  crossroads: {
    id: 'crossroads',
    name: 'Encruzilhada das Cinzas',
    dangerLabel: 'Perigo Baixo (30%)',
    encounterRate: 0.3,
    enemyTier: 'tier1',
  },
  whispering_woods: {
    id: 'whispering_woods',
    name: 'Floresta dos Sussurros',
    dangerLabel: 'Perigo Moderado (45%)',
    encounterRate: 0.45,
    enemyTier: 'tier1',
  },
  sunken_crypts: {
    id: 'sunken_crypts',
    name: 'Catacumbas Submersas',
    dangerLabel: 'Perigo Alto (50%)',
    encounterRate: 0.5,
    enemyTier: 'tier2',
  },
  eclipse_citadel: {
    id: 'eclipse_citadel',
    name: 'Cidadela do Eclipse',
    dangerLabel: 'Perigo Extremo (60%)',
    encounterRate: 0.6,
    enemyTier: 'tier2',
  },
  endless_veil: {
    id: 'endless_veil',
    name: 'Fronteira Infinita do Véu',
    dangerLabel: 'Mutável (55%)',
    encounterRate: 0.55,
    enemyTier: 'tier2',
  },
};

export function buildScene(sceneId, state) {
  const { player, flags } = state;
  const className = player?.classInfo?.name || 'Aventureiro';
  const weaponName = player?.weapon?.name || 'sua arma';

  // Se for uma cena procedural dinâmica
  if (sceneId.startsWith('proc_')) {
    return generateProceduralScene(sceneId, state);
  }

  const scenes = {
    intro_awakening: () => ({
      id: 'intro_awakening',
      region: 'crossroads',
      chapter: 'Ato I • O Despertar sob Cinzas',
      title: 'O Marco Partidário de Eldoria',
      paragraphs: [
        `O céu cor de chumbo despeja flocos de cinza fria sobre a estrada arruinada. Como ${className}, você ajusta o punho de ${weaponName} ao ouvir gritos abafados vindos além da colina.`,
        `Desde que o Eclipse Eterno engoliu a capital, criaturas espreitam cada trilha. À sua frente, uma carroça tombada fumega ao lado de um marco de pedra antigo: um mercador ferido pede socorro enquanto sombras se movem nos arbustos.`,
      ],
      choices: [
        {
          id: 'help_merchant',
          label: 'Proteger e socorrer o mercador ferido',
          hint: 'Ganha gratidão, uma pista valiosa e chance de emboscada imediata',
          encounterChance: 0.55,
          nextScene: 'crossroads_aftermath',
          consequence: {
            flag: 'saved_merchant',
            gold: 20,
            hpChange: 0,
            journalText: `Você ergueu ${weaponName} e protegeu o mercador Aldren na estrada das cinzas, conquistando um aliado e informações sobre um atalho antigo.`,
          },
        },
        {
          id: 'loot_wagon',
          label: 'Ignorar os apelos e vasculhar os suprimentos da carroça',
          hint: '[Astúcia] Garante ouro e poção extras, mas endurece sua reputação',
          encounterChance: 0.35,
          nextScene: 'crossroads_aftermath',
          consequence: {
            flag: 'looted_merchant',
            gold: 45,
            addItem: 'health_potion',
            journalText: `Priorizando sua própria sobrevivência, você recolheu suprimentos valiosos dos destroços antes que mais feras cercassem a colina.`,
          },
        },
        {
          id: 'inspect_obelisk',
          label: 'Examinar as runas brilhantes no marco de pedra',
          hint: 'Teste de Inteligência (INT >= 11) para absorver poder místico',
          statCheck: { stat: 'int', target: 11 },
          encounterChance: 0.25,
          nextScene: 'crossroads_aftermath',
          consequenceSuccess: {
            flag: 'deciphered_obelisk',
            mpChange: 25,
            xp: 30,
            permanentStat: { stat: 'int', amount: 2 },
            journalText: `Decifrando os glifos ancestrais do marco, sua mente expandiu (+2 INT permanente) ao vislumbrar a origem do Eclipse.`,
          },
          consequenceFail: {
            hpChange: -12,
            xp: 10,
            journalText: `As runas instáveis repeliram seu toque com uma descarga ardente (-12 HP), mas revelaram dois caminhos rumo ao norte.`,
          },
        },
      ],
    }),

    crossroads_aftermath: () => {
      const introLine = flags.saved_merchant
        ? `Grato pela vida salva, o mercador Aldren entrega-lhe um saco de moedas e um mapa rabiscado: "Evite o portão principal da Cidadela. Há uma passagem esquecida se atravessar a floresta ou as catacumbas."`
        : flags.deciphered_obelisk
        ? `Com o eco das runas ainda vibrando em sua mente, você enxerga linhas sutis de energia cortando o horizonte em duas direções distintas.`
        : `Com a mochila mais pesada e o silêncio retornando à estrada, você observa a bifurcação que leva em direção à Cidadela do Eclipse.`;

      return {
        id: 'crossroads_aftermath',
        region: 'crossroads',
        chapter: 'Ato I • A Bifurcação do Destino',
        title: 'Dois Caminhos para a Escuridão',
        paragraphs: [
          introLine,
          `Ao leste estende-se a Floresta dos Sussurros, onde árvores retorcidas ocultam altares feéricos e patrulhas selvagens. Ao oeste, escadarias quebradas descem às Catacumbas Submersas, repletas de relíquias antigas e guardiões mortos-vivos.`,
        ],
        choices: [
          {
            id: 'go_woods',
            label: 'Seguir pelo Leste: Floresta dos Sussurros',
            hint: 'Perigo Moderado • Mais encontros ágeis e santuários naturais',
            encounterChance: 0.4,
            nextScene: 'woods_heart',
            consequence: {
              flag: 'path_woods',
              journalText: `Você adentrou a névoa esmeralda da Floresta dos Sussurros, onde cada galho parecia murmurar seu nome.`,
            },
          },
          {
            id: 'go_crypts',
            label: 'Descer pelo Oeste: Catacumbas Submersas',
            hint: 'Perigo Alto • Inimigos mais fortes, porém maiores tesouros',
            encounterChance: 0.5,
            nextScene: 'crypts_sanctum',
            consequence: {
              flag: 'path_crypts',
              journalText: `Você acendeu uma tocha e desceu às Catacumbas Submersas, enfrentando o ar gélido dos reis esquecidos.`,
            },
          },
          {
            id: 'patrol_crossroads',
            label: 'Explorar os arredores em busca de treino e saques',
            hint: 'Gera um evento dinâmico ou batalha aleatória antes de avançar',
            encounterChance: 0.65,
            nextScene: 'proc_explore_return_crossroads',
            consequence: {
              journalText: `Você decidiu vasculhar as ruínas vizinhas da encruzilhada para fortalecer suas habilidades.`,
            },
          },
        ],
      };
    },

    woods_heart: () => ({
      id: 'woods_heart',
      region: 'whispering_woods',
      chapter: 'Ato II • Floresta dos Sussurros',
      title: 'A Clareira do Carvalho Sangrento',
      paragraphs: [
        `Raízes monumentais emergem da névoa como serpentes petrificadas. No centro da clareira repousa uma fonte de águas prateadas guardada por totens rúnicos e teias luminescentes.`,
        flags.saved_merchant
          ? `Seguindo a dica de Aldren, você nota um compartimento oculto sob as raízes do grande carvalho, brilhando com aço encantado.`
          : `Um silêncio tenso paira no ar; beber da fonte pode restaurar seu vigor ou despertar o espírito guardião da mata.`,
      ],
      choices: [
        {
          id: 'drink_spring',
          label: 'Beber das águas prateadas da fonte ancestral',
          hint: 'Restaura Vida e Mana máximas e concede bênção vital (+15 HP Máx)',
          encounterChance: 0.35,
          nextScene: 'citadel_gates',
          consequence: {
            flag: 'blessed_by_spring',
            fullRestore: true,
            permanentStat: { stat: 'maxHp', amount: 15 },
            journalText: `As águas prateadas revigoraram seu sangue (+15 HP Máx) antes da marcha final rumo à Cidadela.`,
          },
        },
        {
          id: 'climb_roots',
          label: 'Escalar as raízes espinhosas até o relicário oculto',
          hint: 'Teste de Destreza (DES >= 12) para obter uma Arma Rara!',
          statCheck: { stat: 'dex', target: 12 },
          encounterChance: 0.45,
          nextScene: 'citadel_gates',
          consequenceSuccess: {
            flag: 'found_forest_relic',
            grantRareWeapon: true,
            xp: 45,
            journalText: `Com agilidade impecável, você alcançou o relicário suspenso e reivindicou uma arma rara ancestral!`,
          },
          consequenceFail: {
            hpChange: -18,
            gold: 30,
            journalText: `Espinhos venenosos rasgaram sua capa (-18 HP), embora você tenha conseguido resgatar uma bolsa de moedas antigas.`,
          },
        },
        {
          id: 'hunt_woods',
          label: 'Rastrear criaturas na mata fechada para evoluir',
          hint: 'Exploração procedural com alta chance de combate e XP',
          encounterChance: 0.75,
          nextScene: 'proc_explore_return_woods',
          consequence: {
            journalText: `Você seguiu pegadas frescas mata adentro, caçando predadores para afiar seu domínio com ${weaponName}.`,
          },
        },
      ],
    }),

    crypts_sanctum: () => ({
      id: 'crypts_sanctum',
      region: 'sunken_crypts',
      chapter: 'Ato II • Catacumbas Submersas',
      title: 'O Sarcófago do Rei Sem Nome',
      paragraphs: [
        `A água negra bate em seus tornozelos enquanto ecos metálicos ressoam pelas galerias abobadadas. No salão central, um sarcófago de obsidiana está selado por correntes pesadas.`,
        `Inscrições nas colunas prometem poder bélico incomparável a quem quebrar o selo, mas o ar gélido denuncia a presença de sentinelas imortais.`,
      ],
      choices: [
        {
          id: 'shatter_chains',
          label: 'Arrebentar as correntes do sarcófago à força',
          hint: 'Teste de Força (FOR >= 13) para saquear Arma Rara e Ouro',
          statCheck: { stat: 'str', target: 13 },
          encounterChance: 0.6,
          nextScene: 'citadel_gates',
          consequenceSuccess: {
            flag: 'opened_sarcophagus',
            grantRareWeapon: true,
            gold: 60,
            xp: 55,
            journalText: `Com um golpe estrondoso de ${weaponName}, você partiu as correntes seculares e tomou o armamento real do sarcófago!`,
          },
          consequenceFail: {
            hpChange: -20,
            gold: 25,
            journalText: `As correntes encantadas resistiram e revidaram com um choque cinético (-20 HP), restando apenas moedas espalhadas no altar.`,
          },
        },
        {
          id: 'channel_altar',
          label: 'Canalizar a névoa de almas no braseiro cerimonial',
          hint: 'Ganha +2 FOR, +2 INT permanentes e um Elixir de Éter',
          encounterChance: 0.45,
          nextScene: 'citadel_gates',
          consequence: {
            flag: 'channeled_souls',
            addItem: 'mana_elixir',
            permanentStat: { stat: 'str', amount: 2 },
            xp: 40,
            journalText: `Você absorveu a memória marcial dos antigos campeões sepultados (+2 FOR permanente) e seguiu rumo à superfície.`,
          },
        },
        {
          id: 'delve_crypts',
          label: 'Vasculhar câmaras laterais das catacumbas',
          hint: 'Evento dinâmico nas profundezas com chance de tesouros e batalhas',
          encounterChance: 0.7,
          nextScene: 'proc_explore_return_crypts',
          consequence: {
            journalText: `Você decidiu explorar corredores secundários das catacumbas antes de subir para a Cidadela.`,
          },
        },
      ],
    }),

    citadel_gates: () => {
      const allyText = flags.saved_merchant
        ? `Graças ao mapa de Aldren, você encontra uma fenda lateral na muralha, podendo preparar-se ou infiltrar-se com vantagem tática!`
        : `Diante de você erguem-se os portões titânicos da Cidadela do Eclipse, coroados por relâmpagos carmesins onde Malakor aguarda.`;

      return {
        id: 'citadel_gates',
        region: 'eclipse_citadel',
        chapter: 'Ato III • Cidadela do Eclipse',
        title: 'O Trono sob o Sol Negro',
        paragraphs: [
          `Você finalmente alcança o coração da corrupção. ${allyText}`,
          `No alto da escadaria de basalto, Malakor, o Arauto do Eclipse, ergue sua lâmina sombria ao perceber sua presença. Este confronto decidirá o destino de Eldoria.`,
        ],
        choices: [
          {
            id: 'rest_campfire',
            label: 'Montar acampamento oculto e comprar/preparar suprimentos (40 Ouro)',
            hint: 'Custa 40 Ouro (se tiver) ou descansa parcialmente: recupera HP/MP antes do Chefe',
            encounterChance: 0.2,
            nextScene: 'citadel_gates_ready',
            consequence: {
              campRest: true,
              journalText: `Sob a sombra das muralhas partidas, você afiou ${weaponName} e recobrou suas forças para o duelo decisivo.`,
            },
          },
          {
            id: 'train_courtyard',
            label: 'Enfrentar a guarda da Cidadela no pátio externo',
            hint: 'Evento e combates de alto XP para subir de nível antes do Chefe',
            encounterChance: 0.85,
            nextScene: 'proc_explore_return_citadel',
            consequence: {
              journalText: `Você desafiou os guardiões do pátio externo para fortalecer seu nível antes de encarar Malakor.`,
            },
          },
          {
            id: 'confront_boss',
            label: 'Subir a escadaria e enfrentar Malakor, Arauto do Eclipse!',
            hint: 'BATALHA DE CHEFE • Prepare suas poções e melhores habilidades!',
            forceBoss: 'malakor_eclipse',
            nextScene: 'victory_epilogue',
            consequence: {
              flag: 'challenged_malakor',
              journalText: `Sem hesitar, você cruzou o salão do trono e desafiou Malakor sob a luz ardente do Sol Negro!`,
            },
          },
        ],
      };
    },

    citadel_gates_ready: () => ({
      id: 'citadel_gates_ready',
      region: 'eclipse_citadel',
      chapter: 'Ato III • O Confronto Final',
      title: 'Às Portas do Salão do Trono',
      paragraphs: [
        `Revigorado e com o espírito focado, você encara os portões abertos do Salão do Trono. As chamas negras tremulam conforme o Arauto do Eclipse aguarda seu avanço.`,
      ],
      choices: [
        {
          id: 'confront_boss_ready',
          label: 'Desembainhar sua arma e enfrentar Malakor!',
          hint: 'BATALHA DE CHEFE',
          forceBoss: 'malakor_eclipse',
          nextScene: 'victory_epilogue',
          consequence: {
            flag: 'challenged_malakor',
            journalText: `Com vigor renovado, você marchou até o trono de basalto para o embate final contra Malakor!`,
          },
        },
        {
          id: 'patrol_more_citadel',
          label: 'Explorar os salões laterais mais uma vez',
          hint: 'Gera encontro dinâmico extra',
          encounterChance: 0.75,
          nextScene: 'proc_explore_return_citadel',
          consequence: {
            journalText: `Você vasculhou mais uma ala da fortaleza em busca de poder adicional.`,
          },
        },
      ],
    }),

    victory_epilogue: () => ({
      id: 'victory_epilogue',
      region: 'endless_veil',
      chapter: 'Epílogo & Modo Infinito • Lenda de Eldoria',
      title: 'A Aurora Restaurada',
      paragraphs: [
        `Com a queda de Malakor, o anel sombrio no céu se desfaz em feixes dourados! A primeira luz da manhã em anos toca as torres partidas de Eldoria enquanto bardos já começam a cantar o nome de ${player?.name || 'um herói'}, ${className} que triunfou empunhando ${weaponName}.`,
        flags.saved_merchant
          ? `Nas estradas reconstruídas, caravanas lideradas por Aldren prosperam sob sua proteção, honrando sua compaixão no início da jornada.`
          : `Seu nome inspira temor e respeito absoluto por todos os reinos sobreviventes.`,
        `Contudo, fragmentos do Véu ainda pulsam além das montanhas. Você pode continuar sua lenda em Expedições Geradas Dinamicamente ou iniciar uma nova crônica com outra classe!`,
      ],
      choices: [
        {
          id: 'enter_endless',
          label: 'Continuar Jogando: Expedição Infinita Além do Véu',
          hint: 'Gera aventuras, dilemas, relíquias e batalhas aleatórias infinitamente!',
          encounterChance: 0.45,
          nextScene: 'proc_endless_adventure',
          consequence: {
            fullRestore: true,
            journalText: `Recusando a aposentadoria, você partiu rumo às Terras Além do Véu em busca de novos mistérios e glórias sem fim.`,
          },
        },
      ],
    }),
  };

  const builder = scenes[sceneId] || scenes.intro_awakening;
  return builder();
}

/**
 * Gerador Procedural de Eventos Dinâmicos:
 * Cria situações inéditas conforme a região atual, nível e sorte do jogador.
 */
function generateProceduralScene(sceneId, state) {
  const { player } = state;
  const weaponName = player?.weapon?.name || 'sua arma';

  let returnScene = 'proc_endless_adventure';
  let regionKey = 'endless_veil';

  if (sceneId.includes('return_crossroads')) {
    returnScene = 'crossroads_aftermath';
    regionKey = 'crossroads';
  } else if (sceneId.includes('return_woods')) {
    returnScene = 'woods_heart';
    regionKey = 'whispering_woods';
  } else if (sceneId.includes('return_crypts')) {
    returnScene = 'crypts_sanctum';
    regionKey = 'sunken_crypts';
  } else if (sceneId.includes('return_citadel')) {
    returnScene = 'citadel_gates';
    regionKey = 'eclipse_citadel';
  }

  const templates = [
    {
      title: 'O Mercador Mascarado do Crepúsculo',
      paragraphs: [
        `Entre ruínas cobertas de hera, uma figura envolta em mantos púrpura exibe frascos reluzentes sobre um tapete gasto. "Moedas por sobrevivência, viajante... ou talvez prefira apostar com o destino?"`,
      ],
      choices: [
        {
          id: 'buy_potion_proc',
          label: 'Comprar Poção de Sangue Vital (25 Ouro)',
          hint: 'Adiciona +1 Poção ao inventário (requer 25 Ouro)',
          encounterChance: 0.2,
          nextScene: returnScene,
          consequence: {
            buyItem: { itemId: 'health_potion', cost: 25 },
            journalText: `Você negociou suprimentos vitais com um mercador misterioso na estrada.`,
          },
        },
        {
          id: 'gamble_fate',
          label: 'Aceitar o Jogo dos Dados Rúnicos (Aposta 20 Ouro)',
          hint: 'Pode dobrar seu ouro, conceder XP ou atrair criaturas próximas!',
          encounterChance: 0.45,
          nextScene: returnScene,
          consequence: {
            gambleGold: true,
            journalText: `Você lançou os dados rúnicos do mercador mascarado, testando sua sorte contra o acaso.`,
          },
        },
        {
          id: 'move_on_merchant',
          label: returnScene === 'proc_endless_adventure' ? 'Seguir adiante pela fronteira' : 'Retornar à trilha principal',
          hint: 'Continua a jornada com chance moderada de batalha aleatória',
          encounterChance: 0.5,
          nextScene: returnScene,
          consequence: {
            xp: 15,
            journalText: `Você cumprimentou o viajante com cautela e retomou sua marcha.`,
          },
        },
      ],
    },
    {
      title: 'O Baú Acorrentado por Espinhos',
      paragraphs: [
        `Em uma ravina silenciosa, você descobre uma arca militar abandonada. Runas de alarme ainda piscam fracamente na fechadura de bronze.`,
      ],
      choices: [
        {
          id: 'disarm_chest',
          label: 'Desarmar o mecanismo com precisão cirúrgica',
          hint: 'Teste de Destreza (DES >= 11) para saquear Ouro e Item sem dano',
          statCheck: { stat: 'dex', target: 11 },
          encounterChance: 0.35,
          nextScene: returnScene,
          consequenceSuccess: {
            gold: 40,
            addItem: 'mana_elixir',
            xp: 35,
            journalText: `Suas mãos firmes desativaram a armadilha rúnica, revelando ouro e um elixir intacto!`,
          },
          consequenceFail: {
            hpChange: -15,
            gold: 20,
            journalText: `Agulhas encantadas dispararam da fechadura (-15 HP), mas você ainda recuperou moedas do fundo da arca.`,
          },
        },
        {
          id: 'smash_chest',
          label: `Destroçar a fechadura usando ${weaponName}`,
          hint: 'Garante saque rápido, mas o barulho tem 80% de chance de atrair inimigos!',
          encounterChance: 0.8,
          nextScene: returnScene,
          consequence: {
            gold: 35,
            xp: 25,
            journalText: `O estrondo de ${weaponName} partiu o baú ao meio — ecoando por toda a região!`,
          },
        },
      ],
    },
    {
      title: 'Monólito da Memória Guerreira',
      paragraphs: [
        `Uma coluna de quartzo negro pulsa em meio à neblina. Ecos de antigos heróis oferecem treinamento espiritual a quem tocar a pedra.`,
      ],
      choices: [
        {
          id: 'meditate_monolith',
          label: 'Meditar diante do monólito para absorver sabedoria',
          hint: 'Concede +45 XP e restaura 30 de Mana',
          encounterChance: 0.4,
          nextScene: returnScene,
          consequence: {
            xp: 45,
            mpChange: 30,
            journalText: `Visões de batalhas ancestrais fortaleceram sua técnica diante do monólito negro.`,
          },
        },
        {
          id: 'offer_blood',
          label: 'Fazer um pacto de sangue na pedra (-15 HP por poder permanente)',
          hint: 'Sacrifica 15 HP para ganhar +2 de Força ou Inteligência permanentemente!',
          encounterChance: 0.5,
          nextScene: returnScene,
          consequence: {
            hpChange: -15,
            permanentBestStat: 2,
            journalText: `Seu sangue despertou o monólito ancestral, ampliando permanentemente seu atributo principal!`,
          },
        },
      ],
    },
    {
      title: 'Emboscada na Passagem Estreita',
      paragraphs: [
        `Galhos quebram acima do desfiladeiro e sombras cercam a passagem! Você percebe o movimento instantes antes do ataque.`,
      ],
      choices: [
        {
          id: 'charge_ambush',
          label: 'Atacar primeiro com fúria total!',
          hint: 'Inicia batalha garantida com recompensa bônus de Ouro e XP',
          encounterChance: 1.0,
          nextScene: returnScene,
          consequence: {
            gold: 25,
            xp: 25,
            journalText: `Você virou a emboscada contra seus perseguidores em um contra-ataque implacável!`,
          },
        },
        {
          id: 'evade_ambush',
          label: 'Usar o terreno para contornar silenciosamente',
          hint: 'Baixa chance de combate (20%) e recupera um pouco de fôlego (+15 HP)',
          encounterChance: 0.2,
          nextScene: returnScene,
          consequence: {
            hpChange: 15,
            xp: 15,
            journalText: `Movendo-se pelas sombras do desfiladeiro, você evitou o cerco e recuperou o fôlego.`,
          },
        },
      ],
    },
  ];

  const chosen = templates[Math.floor(Math.random() * templates.length)];

  // Se estiver no modo infinito, adiciona opção extra de caçar um Campeão/Chefe Errante a cada evento
  const extraChoices =
    returnScene === 'proc_endless_adventure'
      ? [
          ...chosen.choices,
          {
            id: 'hunt_veil_champion',
            label: 'Rastrear anomalia poderosa do Véu (Desafio de Alto Risco)',
            hint: 'Batalha intensa garantida com chance de encontrar Arma Rara!',
            encounterChance: 1.0,
            nextScene: 'proc_endless_adventure',
            consequence: {
              xp: 50,
              gold: 45,
              chanceRareWeapon: 0.35,
              journalText: `Você mergulhou voluntariamente em uma fenda do Véu para enfrentar suas criaturas mais letais.`,
            },
          },
        ]
      : chosen.choices;

  return {
    id: `${sceneId}_${Date.now()}`,
    region: regionKey,
    chapter:
      returnScene === 'proc_endless_adventure'
        ? 'Crônicas Infinitas • Além do Véu'
        : 'Exploração Dinâmica • Evento Emergente',
    title: chosen.title,
    paragraphs: chosen.paragraphs,
    choices: extraChoices,
  };
}

export function pickRandomRareWeapon(currentWeaponId) {
  const candidates = LOOT_WEAPONS.filter((w) => w.id !== currentWeaponId);
  const pool = candidates.length > 0 ? candidates : LOOT_WEAPONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
