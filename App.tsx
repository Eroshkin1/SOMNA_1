import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Flame, Trophy, BookOpen, X, Send, Wifi, CheckCircle2, 
  Battery as BatteryIcon, Bell, Settings, Info, User, Star, 
  BarChart2, History, ArrowLeft, ChevronRight, FolderHeart, 
  Power, Clock, Trash2, Activity, Book 
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';

// --- Утилиты и Данные ---
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

const MOCK_LEADERBOARD = [
  { name: "Сомнамбула", streak: 42 }, { name: "Мечтатель99", streak: 38 },
  { name: "НочнаяСова", streak: 31 }, { name: "СомнаПро", streak: 28 }
];

const MOTIVATIONAL_PHRASES = [
  "Сон — это лучшая медитация.", "Каждая ночь — это шанс начать все сначала.",
  "Твой мозг благодарит тебя за отдых.", "Завтрашний успех начинается сегодня вечером."
];

const RANKS = [
  { name: "Новичок", color: "#94a3b8" }, { name: "Исследователь снов", color: "#38bdf8" },
  { name: "Мастер покоя", color: "#4ade80" }, { name: "Хранитель ночи", color: "#818cf8" },
  { name: "Лунный странник", color: "#c084fc" }, { name: "Звездный навигатор", color: "#fb7185" },
  { name: "Творец сновидений", color: "#fb923c" }, { name: "Повелитель тишины", color: "#2dd4bf" },
  { name: "Архитектор сна", color: "#a78bfa" }, { name: "Вечный мечтатель", color: "#f472b6" },
  { name: "Провидец сумерек", color: "#fbbf24" }, { name: "Легенда SOMNA", color: "#00f3ff" },
  { name: "Властелин астрала", color: "#bc13fe" }, { name: "Космический спящий", color: "#ffffff" },
  { name: "Божество снов", color: "#ffd700" }
];

// --- Компоненты ---

const Cube3D = memo(({ isActivated }: { isActivated: boolean }) => {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleStart = (e: any) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleMove = useCallback((e: any) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setRotation(prev => ({ 
      x: prev.x - (clientY - lastPos.current.y) * 0.5, 
      y: prev.y + (clientX - lastPos.current.x) * 0.5 
    }));
    lastPos.current = { x: clientX, y: clientY };
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      const end = () => setIsDragging(false);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', end);
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', end);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', end);
      };
    }
  }, [isDragging, handleMove]);

  return (
    <div className="w-64 h-64 flex items-center justify-center cursor-grab active:cursor-grabbing"
         onMouseDown={handleStart} onTouchStart={handleStart} style={{ perspective: '1000px' }}>
      <motion.div className="relative w-32 h-32" style={{ transformStyle: 'preserve-3d', rotateX: rotation.x, rotateY: rotation.y }}>
        {[0, 180, 90, -90, 90, -90].map((rot, i) => (
          <div key={i} className="absolute inset-0 border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm"
               style={{ 
                 transform: `rotate${i < 4 ? 'Y' : 'X'}(${rot}deg) translateZ(64px)`,
                 boxShadow: isActivated ? 'inset 0 0 30px rgba(0, 243, 255, 0.4)' : 'none'
               }}>
            <div className={cn("w-2 h-2 rounded-full", isActivated ? "bg-neon-blue shadow-[0_0_10px_#00f3ff]" : "bg-white/10")} />
          </div>
        ))}
      </motion.div>
    </div>
  );
});

const RatingSlider = ({ value, onChange, label, moods, colorClass, glowColor }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</label>
      <span className={cn("text-xl font-mono font-bold", colorClass)}>{value}/10</span>
    </div>
    <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))}
           className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white" />
  </div>
);

// --- Основной экран ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nickname, setNickname] = useState<string | null>(null);
  const [tempNickname, setTempNickname] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [showRankUpAnim, setShowRankUpAnim] = useState(false);
  
  const [gratitude, setGratitude] = useState('');
  const [advice, setAdvice] = useState('');
  const [ritualEntries, setRitualEntries] = useState<any[]>([]);

  useEffect(() => {
    WebApp.ready();
    const saved = localStorage.getItem('somna_nickname_v3');
    if (saved) setNickname(saved);
    setStreakCount(parseInt(localStorage.getItem('somna_streak_v3') || '0'));
  }, []);

  const getRank = (s: number) => {
    const idx = s < 35 ? Math.min(Math.floor(s / 7), 4) : Math.min(5 + Math.floor((s - 35) / 14), RANKS.length - 1);
    return RANKS[idx];
  };

  const handleSave = () => {
    if (!gratitude.trim()) return;
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    localStorage.setItem('somna_streak_v3', newStreak.toString());
    setRitualEntries([{ id: Date.now(), gratitude, date: 'Сегодня' }, ...ritualEntries]);
    setGratitude('');
    if (newStreak % 7 === 0) setShowRankUpAnim(true);
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  if (!nickname) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-8 text-center space-y-8">
        <Zap className="w-16 h-16 text-neon-blue animate-pulse" />
        <h2 className="text-2xl font-bold">Как тебя называть?</h2>
        <input value={tempNickname} onChange={e => setTempNickname(e.target.value)} 
               className="w-full max-w-xs bg-white/5 border border-white/10 p-4 rounded-2xl text-center" />
        <button onClick={() => { setNickname(tempNickname); localStorage.setItem('somna_nickname_v3', tempNickname); }}
                className="px-12 py-4 bg-white text-black rounded-full font-bold">НАЧАТЬ</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col overflow-hidden">
      {/* Анимация Ранга */}
      <AnimatePresence>
        {showRankUpAnim && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
            <Trophy className="w-24 h-24 text-amber-500 mb-6 shadow-[0_0_50px_rgba(245,158,11,0.5)]" />
            <h2 className="text-4xl font-black italic mb-4">НОВЫЙ РАНГ!</h2>
            <p className="text-2xl text-neon-blue uppercase font-bold">{getRank(streakCount).name}</p>
            <button onClick={() => setShowRankUpAnim(false)} className="mt-12 px-8 py-3 bg-white text-black rounded-full font-bold">КРУТО</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-6 flex justify-between items-center z-10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-blue" />
          <span className="font-black tracking-tighter text-xl neon-text-blue">SOMNA</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-white/30 uppercase">Дисциплина</span>
          <div className="flex items-center gap-1 text-neon-blue font-mono font-bold">
            <Flame size={14} /> {streakCount}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pb-32">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-8">
            <div className="text-center pt-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1" style={{ color: getRank(streakCount).color }}>{getRank(streakCount).name}</p>
              <h2 className="text-2xl font-bold">Спокойной ночи, {nickname}</h2>
            </div>
            
            <Cube3D isActivated={isActivated} />

            <button onClick={() => { setIsActivated(!isActivated); WebApp.HapticFeedback.impactOccurred('heavy'); }}
                    className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl", 
                               isActivated ? "bg-neon-blue text-black scale-110 shadow-[0_0_40px_#00f3ff]" : "bg-white/5 text-white border border-white/10")}>
              <Power size={32} />
            </button>

            <p className="text-center text-sm text-white/40 italic px-8">"{MOTIVATIONAL_PHRASES[streakCount % 4]}"</p>
          </motion.div>
        )}

        {activeTab === 'diary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-3xl font-bold neon-text-purple">Ритуал</h2>
            <div className="glass-card p-6 rounded-[32px] space-y-4">
              <label className="text-[10px] uppercase font-bold text-white/30">За что благодарен сегодня?</label>
              <textarea value={gratitude} onChange={e => setGratitude(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[120px] outline-none text-sm focus:border-neon-blue" />
              <button onClick={handleSave} className="w-full py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest">ЗАПИСАТЬ</button>
            </div>
          </motion.div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-card rounded-full p-2 flex justify-between items-center z-50 border border-white/10">
        {[
          { id: 'dashboard', icon: Zap }, { id: 'diary', icon: BookOpen },
          { id: 'leaderboard', icon: Trophy }, { id: 'settings', icon: Settings }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all", 
                             activeTab === tab.id ? "bg-white text-black" : "text-white/40")}>
            <tab.icon size={20} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
