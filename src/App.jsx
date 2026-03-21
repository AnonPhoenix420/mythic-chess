import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Trophy, Swords, Zap, RefreshCw, Cpu, User, ShieldAlert, Activity } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react";

const THEMES = {
  mythic: {
    name: "Knights vs Dragons",
    light: "bg-[#e2d1b3]", 
    dark: "bg-[#7d4427]",  
    white: { p: '🛡️', r: '🏰', n: '🐎', b: '🏹', q: '👸', k: '🤴' },
    black: { p: '🔥', r: '🌋', n: '🦎', b: '🐍', q: '🐲', k: '💀' }
  },
  heaven: {
    name: "Angels vs Demons",
    light: "bg-blue-50",
    dark: "bg-slate-800",
    white: { p: '🕊️', r: '☁️', n: '🎺', b: '⚖️', q: '✨', k: '😇' },
    black: { p: '🕯️', r: '⛓️', n: '🐐', b: '🔱', q: '🔥', k: '😈' }
  },
  wizard: {
    name: "Wizards vs Witches",
    light: "bg-purple-100",
    dark: "bg-indigo-950",
    white: { p: '🧪', r: '📜', n: '🦉', b: '🔮', q: '🧹', k: '🧙' },
    black: { p: '🍄', r: '💀', n: '🐈‍⬛', b: '👁️', q: '🕯️', k: '🧙‍♀️' }
  }
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [theme, setTheme] = useState('mythic');
  const [mode, setMode] = useState('pvp');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);

  const currentTheme = THEMES[theme];

  function onSquareClick(square) {
    const piece = game.get(square);
    if (selectedSquare === null) {
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    } else {
      const move = makeMove(selectedSquare, square);
      if (move) {
        setSelectedSquare(null);
      } else {
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    }
  }

  function makeMove(from, to) {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: 'q' });
      if (move) {
        setGame(gameCopy);
        setMoveHistory([...moveHistory, move.san]);
        if (mode === 'ai' && !gameCopy.isGameOver()) {
          setTimeout(makeAIMove, 400);
        }
        return move;
      }
    } catch (e) { return null; }
  }

  function makeAIMove() {
    const moves = game.moves();
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      game.move(randomMove);
      setGame(new Chess(game.fen()));
    }
  }

  return (
    <div className="fixed inset-0 bg-black text-slate-200 flex flex-col items-center p-4 font-mono select-none overflow-hidden">
      <SpeedInsights />
      
      {/* SYSTEM HEADER */}
      <div className="w-full max-w-[420px] flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-emerald-500 flex items-center gap-2">
            <Swords size={22} /> MYTHIC_INTEL
          </h1>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Nexus Node: Active</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <Activity size={10} className="text-emerald-500 animate-pulse" />
            <span className="text-[8px] text-emerald-500 font-bold">LIVE_DATA</span>
          </div>
          <button onClick={() => {setGame(new Chess()); setMoveHistory([]);}} className="p-2 bg-slate-900 border border-slate-800 rounded-md active:bg-emerald-900 transition-colors">
            <RefreshCw size={18} className="text-emerald-500" />
          </button>
        </div>
      </div>

      {/* GAME STATUS BAR */}
      <div className="w-full max-w-[420px] grid grid-cols-3 gap-2 mb-4">
        <div className={`p-2 rounded border ${game.turn() === 'w' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-600'} text-center text-[10px] font-bold transition-all`}>
          WHITE_UNIT
        </div>
        <div className="flex items-center justify-center">
          {game.inCheck() && <div className="flex items-center gap-1 text-red-500 animate-pulse text-[10px] font-bold"><ShieldAlert size={12}/> CHECK</div>}
        </div>
        <div className={`p-2 rounded border ${game.turn() === 'b' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-600'} text-center text-[10px] font-bold transition-all`}>
          BLACK_UNIT
        </div>
      </div>

      {/* FIXED ASPECT BOARD */}
      <div className="w-full max-w-[420px] aspect-square grid grid-cols-8 border-[4px] border-slate-900 shadow-[0_0_40px_rgba(0,0,0,0.7)] bg-slate-900 touch-none">
        {game.board().map((row, i) => row.map((square, j) => {
          const coords = `${String.fromCharCode(97 + j)}${8 - i}`;
          const isDark = (i + j) % 2 === 1;
          const isSelected = selectedSquare === coords;
          
          return (
            <div 
              key={coords}
              onClick={() => onSquareClick(coords)}
              className={`relative flex items-center justify-center text-3xl sm:text-4xl transition-all duration-75
                ${isDark ? currentTheme.dark : currentTheme.light}
                ${isSelected ? 'ring-4 ring-inset ring-emerald-400 bg-emerald-500/20 z-10' : ''}`}
            >
              {square && (
                <span className="drop-shadow-2xl transform active:scale-110 transition-transform pointer-events-none">
                  {square.color === 'w' ? currentTheme.white[square.type] : currentTheme.black[square.type]}
                </span>
              )}
            </div>
          );
        }))}
      </div>

      {/* CONTROL DECK */}
      <div className="w-full max-w-[420px] mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Visual Skin</p>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold text-xs w-full outline-none cursor-pointer"
            >
              {Object.entries(THEMES).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}
            </select>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Combat Logic</p>
            <button onClick={() => setMode(mode === 'pvp' ? 'ai' : 'pvp')} className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase w-full">
              {mode === 'pvp' ? <User size={14}/> : <Cpu size={14}/>} {mode === 'pvp' ? 'Human' : 'Neural'}
            </button>
          </div>
        </div>

        {/* HUD DATA */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-500/10 rounded flex items-center justify-center border border-emerald-500/20">
              <Zap className="text-emerald-400 fill-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cognitive Index</p>
              <p className="text-lg font-black tracking-widest text-white">1240 <span className="text-[8px] font-normal text-emerald-500 ml-1">RANK_ELITE</span></p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-bold text-slate-500 uppercase">Packet_Log</p>
             <p className="text-[10px] text-emerald-500 font-bold font-mono tracking-tighter">{moveHistory.slice(-1)[0] || '---'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
