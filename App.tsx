import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Flame, Trophy, BookOpen, X, Send, Wifi, CheckCircle2, 
  Battery as BatteryIcon, Bell, Settings, Info, User, Star, 
  BarChart2, History, ArrowLeft, ChevronRight, FolderHeart, 
  Power, Clock, Trash2, Activity, Book 
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';

// Утилита для классов
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

// Данные
const MOCK_LEADERBOARD = [
  { name: "Сомнамбула", streak: 42 },
  { name: "Мечтатель99", streak: 38 },
  { name: "НочнаяСова", streak: 31 },
  { name: "СомнаПро", streak: 28 },
  { name: "ЛюбительЛуны", streak: 24 },
];

const MOTIVATIONAL_PHRASES = [
  "Сон — это лучшая медитация.", "Каждая ночь — это шанс начать все сначала.",
  "Твой мозг благодарит тебя за отдых.", "Завтрашний успех начинается сегодня сегодня.",
  "Спи крепко, мечтай масштабно.", "Тишина — это музыка для души."
];

const RANKS = [
  { name: "Новичок", color: "#94a3b8" }, { name: "Исследователь", color: "#38bdf8" },
  { name: "Мастер покоя", color: "#4ade80" }, { name: "Хранитель ночи", color: "#818cf8" },
  { name: "Лунный странник", color: "#c084fc" }, { name: "Легенда SOMNA", color: "#00f3ff" }
];

// --- Компоненты ---

const BackgroundMesh = memo(() => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#050510]">
    <div className="mesh-blob w-[150%] h-[150%] -top-[25%] -left-[25%] bg-neon-blue/20 animate-mesh" />
    <div className="mesh-blob w-[130%] h-[130%] -bottom-[30%] -right-[20%] bg-neon-purple/20 animate-mesh" style={{ animationDelay: '-5s' }} />
  </div>
));

const RatingSlider = memo(({ value, onChange, label, moods, colorClass, glowColor }: any) => {
  const currentMood = moods[Math.min(Math.floor((value - 1) / 10 * moods.length), moods.length - 1)];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{label}</label>
          <div className="text-[9px] text-white/30 italic">{currentMood}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-mono font-bold", colorClass)}>{value}</span>
          <span className="text-[10px] text-white/20">/10</span>
        </div>
      </div>
      <div className="relative h-8 flex items-center group">
        <div className="absolute w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div className={cn("h-full", glowColor)} animate={{ width: `${(value / 10) * 100}%` }} />
        </div>
        <input type="range" min="1" max="10" value={value} 
               onChange={(e) => { onChange(parseInt(e.target.value)); WebApp.HapticFeedback.impactOccurred('light'); }}
               className="absolute w-full h-8 opacity-0 cursor-pointer z-10" />
      </div>
    </div>
  );
});

// --- Главное приложение ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nickname, setNickname] = useState<string | null>(null);
  const [tempNickname, setTempNickname] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  
  // Состояния дневника
  const [gratitude, setGratitude] = useState('');
  const [advice, setAdvice] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [ritualEntries, setRitualEntries] = useState<any[]>([]);
  
  // Состояния опроса
  const [showSurvey, setShowSurvey] = useState(false);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [fallingAsleepQuality, setFallingAsleepQuality] = useState(5);
  const [somnaInfluence, setSomnaInfluence] = useState(5);

  const [streakCount, setStreakCount] = useState(0);
  const [batteryLevel] = useState(85);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    
    const savedNick = localStorage.getItem('somna_nickname_v3');
    const savedEntries = localStorage.getItem('somna_rituals_v3');
    
    if (savedNick) {
      setNickname(savedNick);
      setIsNewUser(false);
    }
    if (savedEntries) setRitualEntries(JSON.parse(savedEntries));
    setStreakCount(parseInt(localStorage.getItem('somna_streak_v3') || '0'));
  }, []);

  const handleSetNickname = () => {
    if (tempNickname.length >= 3) {
      setNickname(tempNickname);
      setIsNewUser(false);
      localStorage.setItem('somna_nickname_v3', tempNickname);
      WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const saveRitual = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ru-RU'),
      gratitude,
      advice,
      sleepQuality,
      fallingAsleepQuality,
      somnaInfluence
    };
    
    const updated = [newEntry, ...ritualEntries];
    setRitualEntries(updated);
    localStorage.setItem('somna_rituals_v3', JSON.stringify(updated));
    setStreakCount(prev => prev + 1);
    localStorage.setItem('somna_streak_v3', (streakCount + 1).toString());
    
    setGratitude('');
    setAdvice('');
    setShowSurvey(true);
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  const currentRank = useMemo(() => {
    const idx = Math.min(Math.floor(streakCount / 7), RANKS.length - 1);
    return RANKS[idx];
  }, [streakCount]);

  return (
    <div className="relative min-h-screen flex flex-col text-white custom-scrollbar">
      <BackgroundMesh />
      
      <header className="relative z-20 p-6 flex justify-between items-center bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-neon-blue" />
          <h1 className="text-xl font-black tracking-tighter neon-text-blue">SOMNA</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/40 uppercase">Заряд</p>
            <p className="text-xs font-mono font-bold text-neon-blue">{batteryLevel}%</p>
          </div>
          <BatteryIcon className="w-5 h-5 text-white/20" />
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6 pb-32">
        <AnimatePresence mode="wait">
          {isNewUser ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-8">
              <div className="w-20 h-20 rounded-3xl bg-neon-blue/20 flex items-center justify-center animate-breathe">
                <User className="w-10 h-10 text-neon-blue" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Добро пожаловать</h2>
                <p className="text-white/40">Введи свой никнейм для начала пути</p>
              </div>
              <input 
                value={tempNickname} onChange={(e) => setTempNickname(e.target.value)}
                className="w-full max-w-xs bg-white/5 border border-white/10 p-4 rounded-2xl text-center outline-none focus:border-neon-blue transition-all"
                placeholder="Твой ник..."
              />
              <button onClick={handleSetNickname} className="w-full max-w-xs py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest">Войти</button>
            </motion.div>
          ) : activeTab === 'dashboard' ? (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <div className="text-center space-y-2">
                <h2 className="text-sm uppercase tracking-[0.2em] text-white/40">Привет, {nickname}</h2>
                <div className="flex items-center justify-center gap-3">
                  <Flame className="w-8 h-8 text-neon-blue animate-pulse" />
                  <span className="text-6xl font-black font-mono neon-text-blue">{streakCount}</span>
                </div>
                <p className="text-[10px] font-bold text-neon-purple uppercase tracking-widest">{currentRank.name}</p>
              </div>

              <div className="glass-card p-6 rounded-[32px] text-center italic text-white/70">
                "{MOTIVATIONAL_PHRASES[streakCount % MOTIVATIONAL_PHRASES.length]}"
              </div>
            </motion.div>
          ) : activeTab === 'diary' ? (
            <motion.div key="diary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-3xl font-bold neon-text-purple">Дневник</h2>
              <div className="glass-card p-6 rounded-[32px] space-y-4">
                <textarea 
                  value={gratitude} onChange={(e) => setGratitude(e.target.value)}
                  placeholder="За что ты благодарен сегодня?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] outline-none text-sm"
                />
                <textarea 
                  value={advice} onChange={(e) => setAdvice(e.target.value)}
                  placeholder="Совет себе на завтра..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] outline-none text-sm"
                />
                <button onClick={saveRitual} className="w-full py-4 bg-neon-blue text-black rounded-2xl font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                  Сохранить
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 uppercase tracking-widest font-bold">
              В разработке...
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Навигация */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="glass-card rounded-full p-2 flex justify-between items-center border border-white/10 backdrop-blur-3xl">
          {[
            { id: 'dashboard', icon: Zap },
            { id: 'diary', icon: BookOpen },
            { id: 'leaderboard', icon: Trophy },
            { id: 'settings', icon: Settings }
          ].map((item) => (
            <button 
              key={item.id} onClick={() => { setActiveTab(item.id); WebApp.HapticFeedback.impactOccurred('medium'); }}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                activeTab === item.id ? "bg-white text-black" : "text-white/40"
              )}
            >
              <item.icon size={24} />
            </button>
          ))}
        </div>
      </nav>

      {/* Модалка опроса */}
      <AnimatePresence>
        {showSurvey && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="glass-card w-full max-w-sm p-8 rounded-[40px] space-y-8">
              <h3 className="text-2xl font-bold text-center neon-text-blue">Как самочувствие?</h3>
              <RatingSlider label="Качество сна" value={sleepQuality} onChange={setSleepQuality} colorClass="text-neon-blue" glowColor="bg-neon-blue" moods={["Ужасно", "Ок", "Идеально"]} />
              <button onClick={() => setShowSurvey(false)} className="w-full py-4 bg-white text-black rounded-2xl font-bold">ЗАКРЫТЬ</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
