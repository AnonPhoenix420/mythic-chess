import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Swords, RefreshCw, Cpu, User, Terminal, Trophy } from 'lucide-react';

const THEMES = {
  vamp_wolf: {
    name: "Vampires vs Werewolves",
    cells: { light: "bg-slate-400", dark: "bg-red-950" },
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
  wizard_witch: {
    name: "Wizards vs Witches",
    cells: { light: "bg-purple-200", dark: "bg-indigo-950" },
    w: { k: '🧙', q: '🧹', r: '📜', b: '🔮', n: '🦉', p: '🧪' },
    b: { k: '🧙‍♀️', q: '🕯️', r: '🍄', b: '👁️', n: '🐈‍⬛', p: '🍄' }
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
        if (gameCopy.isGameOver()) setGameOver(gameCopy.turn() === 'w' ? 'LOSS' : 'WIN');
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
      if (currentSearch.isGameOver()) setGameOver('LOSS');
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-slate-300 flex flex-col font-mono overflow-hidden touch-none">
      
      {/* HEADER - Fixed Height */}
      <header className="h-14 border-b border-emerald-500/20 bg-black flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Swords size={18} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Mythic_Engine</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-white bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/20">IQ {iq}</span>
          <button onClick={() => {setGame(new Chess()); setMoveHistory([]); setGameOver(null);}} className="text-slate-400 active:text-white">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* THE BOARD - The "No-Squish" Zone */}
      <main className="flex-grow flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
        <div className="relative w-full max-w-[min(100%,400px)] aspect-square border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-8 w-full h-full">
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
                  className={`flex items-center justify-center relative
                    ${isDark ? currentTheme.cells.dark : currentTheme.cells.light}
                    ${isSelected ? 'ring-2 ring-inset ring-emerald-400 bg-emerald-500/20' : ''}`}
                >
                  {square && (
                    <span className="text-3xl sm:text-4xl pointer-events-none drop-shadow-md">
                      {currentTheme[square.color][square.type]}
                    </span>
                  )}
                </div>
              );
            }))}
          </div>

          {/* GAME OVER OVERLAY */}
          {gameOver && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
              <Trophy size={48} className="text-yellow-500 mb-2" />
              <h2 className="text-2xl font-black text-white uppercase italic">{gameOver === 'WIN' ? 'System_Breached' : 'Link_Severed'}</h2>
              <button onClick={() => {setGame(new Chess()); setGameOver(null); setMoveHistory([]);}} className="mt-6 w-full bg-emerald-600 text-black font-bold py-3 rounded text-xs tracking-widest active:scale-95 transition-transform">RE-INITIALIZE</button>
            </div>
          )}
        </div>
      </main>

      {/* PACKET LOG - Fixed Height */}
      <section className="h-24 bg-black/80 border-t border-slate-900 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 mb-1 opacity-40 uppercase font-bold text-[8px] tracking-widest">
          <Terminal size={10} /> Packet_Stream
        </div>
        <div ref={scrollRef} className="h-full overflow-y-auto space-y-1 pb-4 scrollbar-hide">
          {moveHistory.map((m, idx) => (
            <div key={idx} className="flex justify-between items-center text-[9px] text-emerald-500/70 border-l border-emerald-500/20 pl-2">
              <span>{m.color === 'w' ? '>> TX' : '<< RX'}: {m.san}</span>
              <span className="text-[7px] opacity-30">{m.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - Fixed Height */}
      <footer className="h-20 bg-slate-950 border-t border-slate-900 flex items-center gap-3 px-4 shrink-0 pb-safe">
        <div className="flex-1">
          <label className="text-[7px] text-slate-600 uppercase font-black block mb-1">Archetype</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black border border-slate-800 text-emerald-400 text-[10px] p-2 rounded outline-none appearance-none font-bold">
            {Object.entries(THEMES).map(([id, t]) => <option key={id} value={id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[7px] text-slate-600 uppercase font-black block mb-1">Combat</label>
          <button onClick={() => setMode(mode === 'pvp' ? 'ai' : 'pvp')} className="w-full bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-[10px] p-2 rounded flex items-center justify-center gap-2 font-black uppercase">
            {mode === 'ai' ? <Cpu size={12}/> : <User size={12}/>} {mode}
          </button>
        </div>
      </footer>
    </div>
  );
}
