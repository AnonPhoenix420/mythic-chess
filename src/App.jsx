import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Trophy, Swords, Zap, RefreshCw, LayoutGrid, User, Cpu } from 'lucide-react';

// --- THEME DEFINITIONS ---
const THEMES = {
  mythic: {
    name: "Knights vs Dragons",
    light: "bg-amber-100",
    dark: "bg-amber-800",
    white: { p: '🛡️', r: '🏰', n: '🐎', b: '🏹', q: '👸', k: '🤴' },
    black: { p: '🔥', r: '🌋', n: '🦎', b: '🐍', q: '🐲', k: '💀' }
  },
  heaven: {
    name: "Angels vs Demons",
    light: "bg-sky-100",
    dark: "bg-indigo-900",
    white: { p: '🕊️', r: '☁️', n: '🎺', b: '⚖️', q: '✨', k: '😇' },
    black: { p: '🕯️', r: '⛓️', n: '🐐', b: '🔱', q: '🔥', k: '😈' }
  },
  wizard: {
    name: "Wizards vs Witches",
    light: "bg-purple-100",
    dark: "bg-purple-900",
    white: { p: '🧪', r: '📜', n: '🦉', b: '🔮', q: '🧹', k: '🧙' },
    black: { p: '🍄', r: '💀', n: '🐈‍⬛', b: '👁️', q: '🕯️', k: '🧙‍♀️' }
  },
  classic: {
    name: "Classic Pro",
    light: "bg-slate-200",
    dark: "bg-slate-500",
    white: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
    black: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
  }
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [gameType, setGameType] = useState('chess'); // chess or checkers
  const [theme, setTheme] = useState('mythic');
  const [mode, setMode] = useState('pvp'); // pvp or ai
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [iq, setIq] = useState(1200);

  // --- GAME LOGIC ---
  const onSquareClick = (square) => {
    if (selectedSquare === null) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    } else {
      const move = makeMove(selectedSquare, square);
      if (move) {
        setSelectedSquare(null);
        if (mode === 'ai') setTimeout(makeAIMove, 500);
      } else {
        // Switch selection if clicking another of your own pieces
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    }
  };

  const makeMove = (from, to) => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: 'q' });
      if (move) {
        setGame(gameCopy);
        if (gameCopy.isCheckmate()) setIq(prev => prev + 25);
        return move;
      }
    } catch (e) { return null; }
  };

  const makeAIMove = () => {
    const moves = game.moves();
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      game.move(randomMove);
      setGame(new Chess(game.fen()));
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
  };

  const currentTheme = THEMES[theme];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-4">
      
      {/* HEADER SECTION */}
      <header className="w-full max-w-md flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 text-emerald-400">
            <Swords size={24} /> MYTHIC CHESS
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Intel System v3.0</p>
        </div>
        <button onClick={resetGame} className="p-2 bg-slate-800 rounded-lg active:scale-95 transition-transform">
          <RefreshCw size={20} className="text-slate-300" />
        </button>
      </header>

      {/* IQ STAT CARD */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-3 rounded-2xl mb-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Zap className="text-emerald-400 fill-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Intelligence Rank</p>
            <p className="text-lg font-black tracking-tight">{iq} <span className="text-xs text-emerald-500 font-medium">STRATEGIST</span></p>
          </div>
        </div>
        <Trophy size={28} className="text-slate-700" />
      </div>

      {/* THE CHESS BOARD */}
      <div className="w-full max-w-md aspect-square grid grid-cols-8 border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        {game.board().map((row, i) => row.map((square, j) => {
          const squareCoord = String.fromCharCode(97 + j) + (8 - i);
          const isDark = (i + j) % 2 === 1;
          const piece = square;
          const isSelected = selectedSquare === squareCoord;

          return (
            <div 
              key={squareCoord}
              onClick={() => onSquareClick(squareCoord)}
              className={`flex items-center justify-center text-4xl sm:text-5xl cursor-pointer transition-colors
                ${isDark ? currentTheme.dark : currentTheme.light}
                ${isSelected ? 'ring-4 ring-inset ring-emerald-400 z-10' : ''}`}
            >
              {piece && (
                <span className={`drop-shadow-lg select-none transform active:scale-110 transition-transform
                  ${theme === 'classic' ? currentTheme.pieces[piece.color] : ''}`}>
                  {theme === 'classic' 
                    ? currentTheme.white[piece.type] 
                    : (piece.color === 'w' ? currentTheme.white[piece.type] : currentTheme.black[piece.type])}
                </span>
              )}
            </div>
          );
        }))}
      </div>

      {/* GAME CONTROLS */}
      <div className="w-full max-w-md mt-6 grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Battle Theme</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-transparent text-emerald-400 font-bold text-sm outline-none w-full appearance-none cursor-pointer"
          >
            {Object.entries(THEMES).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}
          </select>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Opponent</label>
          <button 
            onClick={() => setMode(mode === 'pvp' ? 'ai' : 'pvp')}
            className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-tight"
          >
            {mode === 'pvp' ? <User size={14}/> : <Cpu size={14}/>}
            {mode === 'pvp' ? 'Player' : 'Deep Engine'}
          </button>
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <nav className="w-full max-w-md mt-auto pt-6 flex justify-around border-t border-slate-900">
        <button className="flex flex-col items-center gap-1 text-emerald-400">
          <Swords size={20} />
          <span className="text-[10px] font-bold">PLAY</span>
        </button>
        <button onClick={() => alert("Checkers & Puzzles Unlocking Soon...")} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <LayoutGrid size={20} />
          <span className="text-[10px] font-bold">MODE</span>
        </button>
      </nav>
    </div>
  );
}
