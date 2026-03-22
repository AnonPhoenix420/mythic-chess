import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Swords, Zap, RefreshCw, Cpu, User, Terminal, Activity, Trophy } from 'lucide-react';

const THEMES = {
  vamp_wolf: {
    name: "Vampires vs Werewolves",
    cells: { light: "bg-slate-300", dark: "bg-red-950" },
    w: { k: '🧛', q: '🩸', r: '⚰️', b: '🦇', n: '🍷', p: '💉' },
    b: { k: '🐺', q: '🌕', r: '🌲', b: '🐾', n: '🦴', p: '🐾' }
  },
  knight_dragon: {
    name: "Knights vs Dragons",
    cells: { light: "bg-[#e2d1b3]", dark: "bg-[#451a03]" },
    w: { k: '🤴', q: '👸', r: '🏰', b: '🏹', n: '🐎', p: '🛡️' },
    b: { k: '💀', q: '🐲', r: '🌋', b: '🐍', n: '🦎', p: '🔥' }
  },
  heaven_hell: {
    name: "Angels vs Demons",
    cells: { light: "bg-blue-100", dark: "bg-slate-900" },
    w: { k: '😇', q: '✨', r: '☁️', b: '⚖️', n: '🎺', p: '🕊️' },
    b: { k: '😈', q: '🔥', r: '⛓️', b: '🐐', n: '🔱', p: '🕯️' }
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
    const winner = g.isCheckmate() ? (g.turn() === 'w' ? 'LOSS' : 'WIN') : 'DRAW';
    if (winner === 'WIN') setIq(prev => prev + 65);
    setGameOver(winner);
  }

  const reset = () => {
    setGame(new Chess());
    setGameOver(null);
    setMoveHistory([]);
    setSelectedSquare(null);
  };

  return (
    <div className="fixed inset-0 bg-[#020202] text-slate-300 flex flex-col items-center font-mono select-none overflow-hidden touch-none">
      
      {/* HEADER HUD */}
      <header className="w-full max-w-[500px] p-4 flex justify-between items-center border-b border-emerald-500/20 bg-emerald-950/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-900/40 border border-emerald-500 rounded animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Swords size={18} className="text-emerald-400" />
          </div>
          <h1 className="text-xs font-black tracking-widest text-emerald-400 uppercase">Mythic_Engine</h1>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-[7px] text-slate-500 uppercase font-bold">Strategic_IQ</p>
                <p className="text-sm font-black text-white">{iq}</p>
            </div>
            <button onClick={reset} className="p-2 bg-white/5 border border-white/10 rounded active:bg-emerald-900">
                <RefreshCw size={16} />
            </button>
        </div>
      </header>

      {/* FIXED-DIMENSION BOARD */}
      <main className="flex-grow w-full flex flex-col items-center justify-center p-2 overflow-hidden">
        {/* Aspect ratio lock ensures the board stays square on all mobile heights */}
        <div 
          className="grid grid-cols-8 border-[6px] border-[#111] shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] bg-black relative aspect-square w-full max-w-[min(92vw,450px)]"
          style={{ transform: 'rotateX(5deg)', transformStyle: 'preserve-3d' }}
        >
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
                className={`relative flex items-center justify-center transition-all duration-75
                  ${isDark ? currentTheme.cells.dark : currentTheme.cells.light}
                  ${isSelected ? 'ring-2 ring-inset ring-emerald-400 bg-emerald-500/30' : ''}`}
              >
                {square && (
                  <div className="relative pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                    <span className="absolute inset-0 text-[min(9vw,38px)] opacity-30 blur-sm grayscale translate-y-2">
                        {currentTheme[square.color][square.type]}
                    </span>
                    <span className="relative text-[min(9vw,38px)] drop-shadow-2xl block" 
                          style={{ transform: 'translateZ(20px) translateY(-2px)' }}>
                        {currentTheme[square.color][square.type]}
                    </span>
                  </div>
                )}
              </div>
            );
          }))}

          {/* OVERLAY */}
          {gameOver && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95">
              <Trophy size={64} className={gameOver === 'WIN' ? 'text-yellow-400' : 'text-red-500'} />
              <h2 className="text-4xl font-black text-white mt-4 italic tracking-tighter uppercase">
                {gameOver === 'WIN' ? 'Objective_Met' : 'Core_Failure'}
              </h2>
              <button onClick={reset} className="mt-8 w-full bg-emerald-600 text-black font-black py-4 rounded uppercase tracking-widest active:scale-95 transition-transform">
                Restart_Uplink
              </button>
            </div>
          )}
        </div>
      </main>

      {/* TERMINAL LOG */}
      <section className="w-full max-w-[500px] h-28 bg-black border-t border-slate-900 p-3 font-mono shrink-0">
        <div className="flex items-center gap-2 mb-1 text-slate-600 border-b border-white/5 pb-1 uppercase font-bold text-[9px] tracking-widest">
          <Terminal size={14} /> System_Packet_Log
        </div>
        <div ref={scrollRef} className="h-full overflow-y-auto space-y-1 pb-10">
          {moveHistory.map((m, idx) => (
            <div key={idx} className="flex justify-between items-center text-[10px]">
              <span className={m.color === 'w' ? "text-emerald-400" : "text-red-400"}>
                {m.color === 'w' ? '>> INJECT:' : '<< COUNTER:'} {m.san}
              </span>
              <span className="text-slate-700">[{m.time}]</span>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-[500px] p-4 bg-slate-950 flex gap-3 border-t border-slate-900 shrink-0 mb-safe">
        <div className="flex-1">
          <label className="text-[7px] text-slate-500 uppercase font-black block mb-1">Archetype</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black border border-slate-800 text-emerald-400 text-[10px] p-2 rounded outline-none font-bold uppercase">
            {Object.entries(THEMES).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[7px] text-slate-500 uppercase font-black block mb-1">Logic</label>
          <button onClick={() => setMode(mode === 'pvp' ? 'ai' : 'pvp')} className="w-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-[10px] p-2 rounded flex items-center justify-center gap-2 font-black uppercase">
            {mode === 'ai' ? <Cpu size={14}/> : <User size={14}/>} {mode}
          </button>
        </div>
      </footer>
    </div>
  );
}
