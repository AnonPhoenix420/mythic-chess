import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Swords, Zap, RefreshCw, Cpu, User, Terminal, ShieldAlert, Activity, Trophy } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react";

const THEMES = {
  vamp_wolf: {
    name: "Vampires vs Werewolves",
    board: "bg-red-950/20",
    cells: { light: "bg-slate-300", dark: "bg-red-900" },
    w: { k: '🧛', q: '🩸', r: '⚰️', b: '🦇', n: '🍷', p: '💉' },
    b: { k: '🐺', q: '🌕', r: '🌲', b: '🐾', n: '🦴', p: '🐾' }
  },
  knight_dragon: {
    name: "Knights vs Dragons",
    board: "bg-amber-950/20",
    cells: { light: "bg-[#e2d1b3]", dark: "bg-[#7d4427]" },
    w: { k: '🤴', q: '👸', r: '🏰', b: '🏹', n: '🐎', p: '🛡️' },
    b: { k: '💀', q: '🐲', r: '🌋', b: '🐍', n: '🦎', p: '🔥' }
  },
  heaven_hell: {
    name: "Angels vs Demons",
    board: "bg-blue-950/20",
    cells: { light: "bg-blue-50", dark: "bg-slate-800" },
    w: { k: '😇', q: '✨', r: '☁️', b: '⚖️', n: '🎺', p: '🕊️' },
    b: { k: '😈', q: '🔥', r: '⛓️', b: '🐐', n: '🔱', p: '🕯️' }
  },
  wizard_witch: {
    name: "Wizards vs Witches",
    board: "bg-purple-950/20",
    cells: { light: "bg-purple-100", dark: "bg-indigo-950" },
    w: { k: '🧙', q: '🧹', r: '📜', b: '🔮', n: '🦉', p: '🧪' },
    b: { k: '🧙‍♀️', q: '🕯️', r: '🍄', b: '👁️', n: '🐈‍⬛', p: '🍄' }
  },
  classic: {
    name: "Classic_System",
    board: "bg-black",
    cells: { light: "bg-slate-200", dark: "bg-slate-600" },
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
  }
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [theme, setTheme] = useState('vamp_wolf');
  const [mode, setMode] = useState('ai');
  const [iq, setIq] = useState(1200);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameOver, setGameOver] = useState(null);
  const scrollRef = useRef(null);

  const currentTheme = THEMES[theme];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [moveHistory]);

  function makeMove(from, to) {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: 'q' });
      if (move) {
        setGame(gameCopy);
        setMoveHistory(prev => [...prev, { san: move.san, color: move.color, time: new Date().toLocaleTimeString() }]);
        if (gameCopy.isGameOver()) handleEnd(gameCopy);
        else if (mode === 'ai') setTimeout(() => makeAIMove(gameCopy), 400);
        return move;
      }
    } catch (e) { return null; }
  }

  function makeAIMove(currentSearch) {
    const moves = currentSearch.moves();
    if (moves.length > 0) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      currentSearch.move(move);
      setGame(new Chess(currentSearch.fen()));
      setMoveHistory(prev => [...prev, { san: move, color: 'b', time: new Date().toLocaleTimeString() }]);
      if (currentSearch.isGameOver()) handleEnd(currentSearch);
    }
  }

  function handleEnd(g) {
    if (g.isCheckmate()) {
      const winner = g.turn() === 'w' ? 'LOSS' : 'WIN';
      if (winner === 'WIN') setIq(prev => prev + 65);
      setGameOver(winner);
    } else setGameOver('DRAW');
  }

  return (
    <div className="fixed inset-0 bg-[#050505] text-slate-300 flex flex-col items-center font-mono select-none overflow-hidden touch-none">
      <SpeedInsights />
      
      {/* HUD HEADER */}
      <header className="w-full max-w-[500px] p-4 flex justify-between items-center border-b border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950 border border-emerald-500 rounded animate-pulse">
            <Swords size={18} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest text-emerald-400">MYTHIC_V3</h1>
            <div className="flex items-center gap-1.5 text-[8px] text-emerald-500/40">
              <Activity size={10}/> NEURAL_LINK: ACTIVE
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded">
                <p className="text-[7px] text-slate-500 uppercase">Strategic_IQ</p>
                <p className="text-xs font-black text-white">{iq}</p>
            </div>
            <button onClick={() => {setGame(new Chess()); setGameOver(null); setMoveHistory([]);}} className="p-2 bg-slate-800 rounded active:scale-90">
                <RefreshCw size={16} />
            </button>
        </div>
      </header>

      {/* 3D BOARD CONTAINER */}
      <main className="flex-grow flex items-center justify-center w-full px-2 py-4 perspective-1000">
        <div className={`w-[96vw] h-[96vw] max-w-[450px] max-h-[450px] grid grid-cols-8 border-[8px] border-[#111] shadow-[0_40px_60px_-15px_rgba(0,0,0,0.9)] bg-black relative transform rotateX-10`}>
          {game.board().map((row, i) => row.map((square, j) => {
            const coords = `${String.fromCharCode(97 + j)}${8 - i}`;
            const isDark = (i + j) % 2 === 1;
            const isSelected = selectedSquare === coords;
            
            return (
              <div 
                key={coords}
                onClick={() => {
                    if (gameOver) return;
                    if (selectedSquare === null) {
                        if (square && square.color === game.turn()) setSelectedSquare(coords);
                    } else {
                        const m = makeMove(selectedSquare, coords);
                        setSelectedSquare(null);
                        if (!m && square && square.color === game.turn()) setSelectedSquare(coords);
                    }
                }}
                className={`relative flex items-center justify-center transition-all
                  ${isDark ? currentTheme.cells.dark : currentTheme.cells.light}
                  ${isSelected ? 'ring-4 ring-inset ring-emerald-400 bg-emerald-500/20' : ''}`}
              >
                {square && (
                  <div className="relative group cursor-pointer transition-transform active:scale-110">
                    {/* 3D SHADOW DEPTH */}
                    <span className="absolute inset-0 text-4xl blur-sm opacity-40 translate-y-2 translate-x-1 grayscale pointer-events-none">
                        {currentTheme[square.color][square.type]}
                    </span>
                    {/* MAIN PIECE */}
                    <span className="relative text-4xl sm:text-5xl drop-shadow-md z-10 block transform -translate-y-1 hover:-translate-y-2 transition-transform">
                        {currentTheme[square.color][square.type]}
                    </span>
                  </div>
                )}
              </div>
            );
          }))}

          {/* GAME OVER OVERLAY */}
          {gameOver && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <Trophy size={60} className={gameOver === 'WIN' ? 'text-yellow-400' : 'text-red-500'} />
              <h2 className="text-3xl font-black text-white my-2">{gameOver === 'WIN' ? 'SYSTEM_BYPASSED' : 'ACCESS_DENIED'}</h2>
              <p className="text-emerald-500 text-[10px] tracking-widest mb-6 uppercase">New IQ Index: {iq}</p>
              <button onClick={() => {setGame(new Chess()); setGameOver(null); setMoveHistory([]);}} className="w-full bg-emerald-600 text-black font-black py-4 rounded-lg tracking-tighter">RE-INITIALIZE LINK</button>
            </div>
          )}
        </div>
      </main>

      {/* TERMINAL LOG */}
      <section className="w-full max-w-[500px] h-36 bg-black border-t border-slate-900 p-4 font-mono text-[9px]">
        <div className="flex items-center gap-2 mb-2 text-slate-600 border-b border-white/5 pb-1 uppercase font-bold tracking-widest text-[10px]">
          <Terminal size={14} /> Packet_Stream_Log
        </div>
        <div ref={scrollRef} className="h-full overflow-y-auto space-y-1.5 pb-8 scrollbar-hide">
          {moveHistory.map((m, idx) => (
            <div key={idx} className="flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity">
              <span className={m.color === 'w' ? "text-emerald-400" : "text-red-400"}>
                {m.color === 'w' ? '>> UPLINK:'
