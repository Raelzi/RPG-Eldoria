# Crônicas de Eldoria — RPG Web Interativo

Protótipo funcional de RPG em **JavaScript** construído com **Vite + React + Tailwind CSS + Zustand**.

## Funcionalidades Implementadas

- **Criação Completa de Personagem**:
  - 4 Classes únicas com atributos próprios e habilidades passivas (*Guerreiro da Vanguarda*, *Arcanista do Véu*, *Ladino das Sombras* e *Guardião Solar*).
  - 5 Armas iniciais com escalonamento por atributo (`FOR`, `INT`, `DES`) e bônus de combate + Armas Raras saqueáveis durante a aventura.
  - Seleção de 2 Habilidades iniciais ativas entre 7 opções (magias, ataques físicos, veneno, cura e postura defensiva com escudo).
- **Motor Narrativo Dinâmico & Procedural**:
  - História reativa que muda diálogos, consequências e atalhos conforme sua classe, arma e decisões anteriores.
  - Testes de atributos (`FOR`, `INT`, `DES`) integrados às escolhas.
  - Eventos procedurais emergentes e **Modo Expedição Infinita** após derrotar o chefe do capítulo.
  - **Diário da Crônica** gerado automaticamente registrando cada escolha sua.
- **Sistema de Batalhas Aleatórias por Turnos**:
  - Encontros aleatórios calculados conforme o nível de perigo da região ou acionáveis manualmente pelo botão *Caçar Monstros*.
  - Efeitos de status (*Queimadura*, *Veneno*, *Atordoamento*, *Enfraquecimento*, *Escudo*), acertos críticos, uso de poções e tentativa de fuga.
  - Evolução de nível (*Level Up*) permitindo aprender novas habilidades ou especializar atributos.
  - Salvamento automático no navegador (`localStorage`).

## Como Executar

```bash
npm install
npm run dev
```
