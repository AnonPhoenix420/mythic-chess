import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Swords, Zap, RefreshCw, Cpu, User, Terminal, Activity, Trophy } from 'lucide-react';

// THEME CONFIG: Mapping your uploaded art styles to pieces
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
  },
  classic: {
    name: "Classic_System",
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

  // Auto-scroll the terminal log
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
      <header className="w-full max-w-[500px] p-4 flex justify-between items-center border-b border-emerald-500/20 bg-emerald-950/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-900/40 border border-emerald-500 rounded animate-pulse">
            <Swords size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-emerald-400 uppercase">Mythic_Engine</h1>
            <div className="flex items-center gap-1.5 text-[7px] text-emerald-500/40">
              <Activity size={10}/> NEURAL_LINK: ACTIVE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-[7px] text-slate-500 uppercase font-bold tracking-tighter">Strategic_IQ</p>
                <p className="text-sm font-black text-white">{iq}</p>
            </div>
            <button onClick={reset} className="p-2 bg-white/5 border border-white/10 rounded active:bg-emerald-900 transition-colors">
                <RefreshCw size={16} />
            </button>
        </div>
      </header>

      {/* 3D-LIFT BOARD */}
      <main className="flex-grow flex items-center justify-center w-full px-2 py-4" style={{ perspective: '1000px' }}>
        <div className="w-[min(98vw,440px)] h-[min(98vw,440px)] grid grid-cols-8 border-[10px] border-[#111] shadow-2xl bg-black relative" 
             style={{ transform: 'rotateX(10deg)', transformStyle: 'preserve-3d' }}>
          
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
                  ${isSelected ? 'ring-4 ring-inset ring-emerald-400 bg-emerald-500/30' : ''}`}
              >
                {square && (
                  <div className="relative pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                    {/* DROP SHADOW */}
                    <span className="absolute inset-0 text-4xl opacity-30 blur-sm grayscale translate-y-3 translate-x-1">
                        {currentTheme[square.color][square.type]}
                    </span>
                    {/* LIFTED PIECE */}
                    <span className="relative text-4xl sm:text-5xl drop-shadow-2xl block" 
                          style={{ transform: 'translateZ(30px) translateY(-4px)' }}>
                        {currentTheme[square.color][square.type]}
                    </span>
                  </div>
                )}
              </div>
            );
          }))}

          {/* CHECKMATE OVERLAY */}
          {gameOver && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95">
              <Trophy size={64} className={gameOver === 'WIN' ? 'text-yellow-400' : 'text-red-500'} />
              <h2 className="text-4xl font-black text-white mt-4 italic tracking-tighter">
                {gameOver === 'WIN' ? 'CORE_BYPASSED' : 'UPLINK_SEVERED'}
              </h2>
              <p className="text-emerald-500 font-bold text-xs tracking-widest mb-8 uppercase">IQ Update: +65</p>
              <button onClick={reset} className="w-full bg-emerald-600 text-black font-black py-4 rounded uppercase tracking-widest hover:bg-emerald-400">
                Restart_Uplink
              </button>
            </div>
          )}
        </div>
      </main>

      {/* TERMINAL LOG */}
      <section className="w-full max-w-[500px] h-32 bg-black border-t border-slate-900 p-3 font-mono">
        <div className="flex items-center gap-2 mb-2 text-slate-600 border-b border-white/5 pb-1 uppercase font-bold text-[9px] tracking-widest">
          <Terminal size={14} /> System_Packet_Log
        </div>
        <div ref={scrollRef} className="h-full overflow-y-auto space-y-1 pb-10">
          {moveHistory.map((m, idx) => (
            <div key={idx} className="flex justify-between items-center text-[10px]">
              <span className={m.color === 'w' ? "text-emerald-400" : "text-red-400"}>
                {m.color === 'w' ? '>> INJECT:' : '<< COUNTER:'} {m.san}
              </span>
              <span className="text-slate-700 font-bold">[{m.time}]</span>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CONTROLS */}
      <footer className="w-full max-w-[500px] p-4 bg-slate-950 flex gap-3 border-t border-slate-900">
        <div className="flex-1">
          <label className="text-[7px] text-slate-500 uppercase font-black block mb-1">Archetype_Skin</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black border border-slate-800 text-emerald-400 text-[10px] p-2 rounded outline-none font-bold uppercase">
            {Object.entries(THEMES).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[7px] text-slate-500 uppercase font-black block mb-1">Combat_Mode</label>
          <button onClick={() => setMode(mode === 'pvp' ? 'ai' : 'pvp')} className="w-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-[10px] p-2 rounded flex items-center justify-center gap-2 font-black uppercase">
            {mode === 'ai' ? <Cpu size={14}/> : <User size={14}/>} {mode}
          </button>
        </div>
      </footer>
    </div>
  );
}
