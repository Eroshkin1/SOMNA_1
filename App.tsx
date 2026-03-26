/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import WebApp from '@twa-dev/sdk';
import { 
  Zap, 
  Flame, 
  Trophy, 
  BookOpen, 
  X,
  Send,
  Wifi,
  CheckCircle2,
  Battery as BatteryIcon,
  Bell,
  Settings,
  Info,
  User,
  Star,
  BarChart2,
  History,
  ArrowLeft,
  ChevronRight,
  FolderHeart,
  Power,
  Clock,
  Trash2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Утилита для объединения классов Tailwind
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Типы данных
interface RitualEntry {
  id: string;
  date: string;
  gratitude: string;
  advice: string;
  sleepQuality: number;
  fallingAsleepQuality: number;
  somnaInfluence: number;
}

interface LeaderboardUser {
  name: string;
  streak: number;
}

// Тестовые данные для таблицы лидеров
const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { name: "Сомнамбула", streak: 42 },
  { name: "Мечтатель99", streak: 38 },
  { name: "НочнаяСова", streak: 31 },
  { name: "СомнаПро", streak: 28 },
  { name: "ЛюбительЛуны", streak: 24 },
];

// 30 Мотивационных фраз
const MOTIVATIONAL_PHRASES = [
  "Сон — это лучшая медитация.",
  "Каждая ночь — это шанс начать все сначала.",
  "Твой мозг благодарит тебя за отдых.",
  "Завтрашний успех начинается сегодня вечером.",
  "Спи крепко, мечтай масштабно.",
  "Тишина — это музыка для души.",
  "Отдых — это не роскошь, а необходимость.",
  "Твое тело восстанавливается, пока ты спишь.",
  "Сны — это ответы на вопросы, которые мы еще не задали.",
  "Пусть звезды охраняют твой покой.",
  "Глубокий сон — залог ясного ума.",
  "Ты заслуживаешь самого лучшего отдыха.",
  "Позволь своим мыслям уплыть в океан снов.",
  "Ночь — время для магии и восстановления.",
  "Твой стрик — это твоя суперсила.",
  "С каждым днем твой сон становится качественнее.",
  "SOMNA — твой верный спутник в мире грез.",
  "Проснись полным энергии и вдохновения.",
  "Твое здоровье начинается с подушки.",
  "Мир подождет, пока ты отдыхаешь.",
  "Сон — это инвестиция в твое будущее.",
  "Пусть твои сны будут яркими и добрыми.",
  "Ты делаешь огромный вклад в свое долголетие.",
  "Спокойствие внутри — залог успеха снаружи.",
  "Твой прогресс впечатляет!",
  "Не останавливайся, ты на верном пути.",
  "Сон очищает твой разум от лишнего шума.",
  "Ты — мастер своего отдыха.",
  "Пусть эта ночь принесет тебе ответы.",
  "Завтра будет великий день, выспись как следует."
];

// 15 Званий (каждые 7 дней) с уникальными цветами
const RANKS = [
  { name: "Новичок", color: "#94a3b8" }, // Slate 400
  { name: "Исследователь снов", color: "#38bdf8" }, // Sky 400
  { name: "Мастер покоя", color: "#4ade80" }, // Green 400
  { name: "Хранитель ночи", color: "#818cf8" }, // Indigo 400
  { name: "Лунный странник", color: "#c084fc" }, // Purple 400
  { name: "Звездный навигатор", color: "#fb7185" }, // Rose 400
  { name: "Творец сновидений", color: "#fb923c" }, // Orange 400
  { name: "Повелитель тишины", color: "#2dd4bf" }, // Teal 400
  { name: "Архитектор сна", color: "#a78bfa" }, // Violet 400
  { name: "Вечный мечтатель", color: "#f472b6" }, // Pink 400
  { name: "Провидец сумерек", color: "#fbbf24" }, // Amber 400
  { name: "Легенда SOMNA", color: "#00f3ff" }, // Neon Blue
  { name: "Властелин астрала", color: "#bc13fe" }, // Neon Purple
  { name: "Космический спящий", color: "#ffffff" }, // White
  { name: "Божество снов", color: "#ffd700" } // Gold
];

const BackgroundMesh = React.memo(() => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0a0a1a]">
    {/* Simplified layers of light for performance */}
    <div className="mesh-blob w-[160%] h-[160%] -top-[30%] -left-[30%] bg-neon-blue/30 blur-[80px]" style={{ animationDuration: '25s' }} />
    <div className="mesh-blob w-[140%] h-[140%] -bottom-[40%] -right-[30%] bg-neon-purple/30 blur-[70px]" style={{ animationDuration: '30s', animationDelay: '-5s' }} />
    
    {/* Reduced shimmering accents */}
    <motion.div 
      animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-blue/30 rounded-full blur-[80px]"
    />
    <motion.div 
      animate={{ opacity: [0.15, 0.35, 0.15] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-purple/30 rounded-full blur-[90px]"
    />

    {/* Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
  </div>
));

const BurningFlame = ({ active }: { active: boolean }) => {
  if (!active) {
    return <Flame className="w-8 h-8 text-white/10 transition-all duration-500" />;
  }

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-neon-blue/40 rounded-full blur-xl"
      />
      
      {/* Fire Layers */}
      <div className="relative">
        {/* Base Flame */}
        <motion.div
          animate={{ 
            scaleY: [1, 1.2, 0.9, 1.1, 1],
            scaleX: [1, 0.9, 1.1, 0.95, 1],
            y: [0, -2, 0]
          }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame className="w-10 h-10 text-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,1)]" />
        </motion.div>

        {/* Inner Core */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [0.9, 1, 0.9],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-4 h-6 bg-white rounded-full blur-[4px] opacity-40" />
        </motion.div>
      </div>
    </div>
  );
};

const Cube3D = React.memo(({ isActivated }: { isActivated: boolean }) => {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x: clientX, y: clientY };
  }, []);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - lastPos.current.x;
    const deltaY = clientY - lastPos.current.y;
    
    setRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    lastPos.current = { x: clientX, y: clientY };
  }, []);

  const handleEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div 
      className="w-64 h-64 flex items-center justify-center perspective-1000 cursor-grab active:cursor-grabbing"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <motion.div 
        className="relative w-32 h-32 preserve-3d"
        style={{ 
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
      >
        {/* Cube Faces */}
        {[
          { transform: 'rotateY(0deg) translateZ(64px)', color: 'rgba(100, 100, 100, 0.8)' },
          { transform: 'rotateY(180deg) translateZ(64px)', color: 'rgba(80, 80, 80, 0.8)' },
          { transform: 'rotateY(90deg) translateZ(64px)', color: 'rgba(120, 120, 120, 0.8)' },
          { transform: 'rotateY(-90deg) translateZ(64px)', color: 'rgba(90, 90, 90, 0.8)' },
          { transform: 'rotateX(90deg) translateZ(64px)', color: 'rgba(110, 110, 110, 0.8)' },
          { transform: 'rotateX(-90deg) translateZ(64px)', color: 'rgba(70, 70, 70, 0.8)' },
        ].map((face, i) => (
          <div 
            key={i}
            className="absolute inset-0 border border-white/20 flex items-center justify-center overflow-hidden"
            style={{ 
              transform: face.transform, 
              backgroundColor: face.color,
              boxShadow: isActivated ? 'inset 0 0 30px rgba(0, 243, 255, 0.3)' : 'none',
              transition: 'box-shadow 0.5s ease'
            }}
          >
            {isActivated && (
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-full bg-neon-blue/5"
              />
            )}
            <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10" />
          </div>
        ))}
      </motion.div>
      
      {/* Glow under cube */}
      <div className={cn(
        "absolute w-48 h-48 rounded-full blur-[80px] transition-all duration-1000 -z-10",
        isActivated ? "bg-neon-blue/20 scale-110" : "bg-white/5"
      )} />
    </div>
  );
});

const RatingSlider = React.memo(({ 
  value, 
  onChange, 
  label, 
  minLabel, 
  maxLabel, 
  colorClass,
  glowColor,
  moods
}: { 
  value: number, 
  onChange: (val: number) => void, 
  label: string, 
  minLabel: string, 
  maxLabel: string,
  colorClass: string,
  glowColor: string,
  moods: string[]
}) => {
  const [isInteracting, setIsInteracting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value);
    if (newVal !== value) {
      onChange(newVal);
      WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const currentMood = moods[Math.min(Math.floor((value - 1) / 10 * moods.length), moods.length - 1)];
  
  // Динамический цвет свечения в зависимости от значения
  const getDynamicGlow = () => {
    if (value <= 3) return 'rgba(239, 68, 68, 0.4)'; // Red
    if (value <= 7) return 'rgba(0, 243, 255, 0.4)'; // Neon Blue
    return 'rgba(188, 19, 254, 0.4)'; // Neon Purple
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">{label}</label>
          <AnimatePresence mode="wait">
            <motion.span 
              key={currentMood}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              className="text-[9px] text-white/30 font-medium italic"
            >
              {currentMood}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <motion.span 
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            className={cn("text-2xl font-mono font-bold transition-colors duration-500", colorClass)}
          >
            {value}
          </motion.span>
          <span className="text-[10px] text-white/20 font-bold">/10</span>
        </div>
      </div>
      <div className="relative h-8 flex items-center group">
        {/* Glow Trail */}
        <motion.div 
          className={cn("absolute h-2 rounded-full blur-[8px] opacity-0 group-hover:opacity-20 transition-opacity", glowColor)}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Main Track */}
        <div className="absolute w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className={cn("h-full", glowColor)}
            initial={false}
            animate={{ 
              width: `${(value / 10) * 100}%`,
              backgroundColor: value <= 3 ? '#ef4444' : value <= 7 ? '#00f3ff' : '#bc13fe'
            }}
            transition={{ duration: 0.3 }}
            style={{ 
               boxShadow: `0 0 15px ${getDynamicGlow()}` 
            }}
          />
        </div>
        
        <input 
          type="range" min="1" max="10" step="1"
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsInteracting(true)}
          onMouseUp={() => setIsInteracting(false)}
          onMouseLeave={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
        />
        
        {/* Custom Thumb */}
        <motion.div 
          className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] pointer-events-none z-20 flex items-center justify-center"
          initial={false}
          animate={{ 
            left: `calc(${(value / 10) * 100}% - 12px)`,
            scale: isInteracting ? 1.2 : 1,
            boxShadow: isInteracting ? '0 0 20px rgba(255,255,255,0.8)' : '0 0 10px rgba(255,255,255,0.4)'
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Internal Glow for Thumb */}
          <motion.div 
            animate={{ 
              backgroundColor: value <= 3 ? '#ef4444' : value <= 7 ? '#00f3ff' : '#bc13fe'
            }}
            className="w-2.5 h-2.5 rounded-full opacity-60" 
          />
        </motion.div>
        
        {/* Particles on 10 */}
        {value === 10 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 2.5], opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute right-0 w-10 h-10 rounded-full bg-white/30 blur-2xl pointer-events-none"
          />
        )}
      </div>
      <div className="flex justify-between text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
});

export default function App() {
  // Состояние навигации
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'diary' | 'stats' | 'settings'>('dashboard');
  
  // Состояние пользователя (Onboarding)
  const [nickname, setNickname] = useState<string | null>(null);
  const [tempNickname, setTempNickname] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);

  // Состояние устройства
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isActivated, setIsActivated] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  // Состояние данных пользователя
  const [streakCount, setStreakCount] = useState(0);
  const [ritualEntries, setRitualEntries] = useState<RitualEntry[]>([]);
  const [gratitude, setGratitude] = useState('');
  const [advice, setAdvice] = useState('');
  const [lastInteractionDate, setLastInteractionDate] = useState<string | null>(null);
  const [dailyDeadline, setDailyDeadline] = useState('23:00');
  
  // Состояние опроса
  const [sleepQuality, setSleepQuality] = useState(5);
  const [fallingAsleepQuality, setFallingAsleepQuality] = useState(5);
  const [somnaInfluence, setSomnaInfluence] = useState(5);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [showStreakAnim, setShowStreakAnim] = useState(false);
  const [showRankUpAnim, setShowRankUpAnim] = useState(false);
  const [newRankName, setNewRankName] = useState('');

  // Состояние формы подключения
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Загрузка данных из localStorage и инициализация Telegram WebApp
  useEffect(() => {
    // Инициализация Telegram WebApp
    WebApp.ready();
    WebApp.expand();
    
    // Пытаемся получить никнейм из Telegram
    const tgUser = WebApp.initDataUnsafe.user;
    const savedNickname = localStorage.getItem('somna_nickname_v3');
    
    if (savedNickname) {
      setNickname(savedNickname);
      setIsNewUser(false);
    } else if (tgUser) {
      const defaultNick = tgUser.username || tgUser.first_name || '';
      if (defaultNick.length >= 3) {
        setNickname(defaultNick);
        setIsNewUser(false);
      }
    }

    const savedEntries = localStorage.getItem('somna_rituals_v3');
    if (savedEntries) setRitualEntries(JSON.parse(savedEntries));
    
    const savedStreak = localStorage.getItem('somna_streak_v3');
    if (savedStreak) setStreakCount(parseInt(savedStreak));

    const savedLastInteraction = localStorage.getItem('somna_last_interaction_v3');
    if (savedLastInteraction) setLastInteractionDate(savedLastInteraction);

    const savedDeadline = localStorage.getItem('somna_deadline_v3');
    if (savedDeadline) setDailyDeadline(savedDeadline);

    const savedConnection = localStorage.getItem('somna_connected_v3');
    if (savedConnection === 'true') setIsDeviceConnected(true);
  }, []);

  // Обработка кнопки "Назад" в Telegram
  useEffect(() => {
    const handleBack = () => {
      setActiveTab('dashboard');
    };

    if (activeTab !== 'dashboard') {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(handleBack);
    } else {
      WebApp.BackButton.hide();
    }
    
    return () => {
      WebApp.BackButton.offClick(handleBack);
    };
  }, [activeTab]);

  // Сохранение данных в localStorage
  useEffect(() => {
    if (nickname) localStorage.setItem('somna_nickname_v3', nickname);
    localStorage.setItem('somna_rituals_v3', JSON.stringify(ritualEntries));
    localStorage.setItem('somna_streak_v3', streakCount.toString());
    localStorage.setItem('somna_connected_v3', isDeviceConnected.toString());
    if (lastInteractionDate) localStorage.setItem('somna_last_interaction_v3', lastInteractionDate);
    localStorage.setItem('somna_deadline_v3', dailyDeadline);
  }, [nickname, ritualEntries, streakCount, isDeviceConnected, lastInteractionDate, dailyDeadline]);

  // Проверка сброса стрика
  useEffect(() => {
    const checkStreak = () => {
      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];
      
      const [deadlineHours, deadlineMinutes] = dailyDeadline.split(':').map(Number);
      const deadlineTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), deadlineHours, deadlineMinutes).getTime();
      
      if (lastInteractionDate) {
        const lastDate = new Date(lastInteractionDate);
        const lastDateStr = lastInteractionDate.split('T')[0];
        
        // Если сегодня еще не было взаимодействия и время вышло
        if (lastDateStr !== todayDate && now.getTime() > deadlineTime) {
          setStreakCount(0);
          WebApp.HapticFeedback.notificationOccurred('error');
        }
        
        // Если пропущено больше одного дня
        const lastMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const diffDays = (todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 1) {
          setStreakCount(0);
        }
      }
    };

    checkStreak();
    const interval = setInterval(checkStreak, 60000); // Проверяем каждую минуту
    return () => clearInterval(interval);
  }, [lastInteractionDate, dailyDeadline]);

  const handleSetNickname = () => {
    if (tempNickname.trim().length >= 3) {
      setNickname(tempNickname.trim());
      setIsNewUser(false);
    }
  };

  // Получение звания по количеству дней
  const getRankByStreak = (streak: number) => {
    if (streak < 35) {
      const rankIndex = Math.min(Math.floor(streak / 7), 4);
      return RANKS[rankIndex];
    } else {
      const extraStreak = streak - 35;
      const rankIndex = 5 + Math.floor(extraStreak / 14);
      return RANKS[Math.min(rankIndex, RANKS.length - 1)];
    }
  };

  // Получение случайной фразы (меняется при изменении стрика)
  const currentPhrase = React.useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[randomIndex];
  }, [streakCount]);

  // Анимация стрика (улучшенная)
  const triggerStreakAnimation = (newStreak: number) => {
    const oldRank = getRankByStreak(newStreak - 1);
    const newRank = getRankByStreak(newStreak);

    if (oldRank.name !== newRank.name) {
      setNewRankName(newRank.name);
      setShowRankUpAnim(true);
      WebApp.HapticFeedback.notificationOccurred('success');
      setTimeout(() => {
        setShowRankUpAnim(false);
        setShowSurvey(true);
      }, 5000);
    } else {
      setShowStreakAnim(true);
      WebApp.HapticFeedback.notificationOccurred('success');
      setTimeout(() => {
        setShowStreakAnim(false);
        setShowSurvey(true);
      }, 4000);
    }
  };

  const toggleActivation = () => {
    if (!isDeviceConnected) {
      setShowConnectModal(true);
      WebApp.HapticFeedback.notificationOccurred('warning');
      return;
    }
    
    // Виброотклик Telegram
    WebApp.HapticFeedback.impactOccurred('heavy');
    
    setIsActivated(!isActivated);
  };

  const saveRitual = () => {
    if (!gratitude.trim() || !advice.trim()) return;
    
    // Сначала запускаем анимацию стрика, которая в конце откроет опрос
    triggerStreakAnimation(streakCount + 1);
  };

  const handleSurveySave = async () => {
    const newEntry: RitualEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      gratitude,
      advice,
      sleepQuality,
      fallingAsleepQuality,
      somnaInfluence
    };
    
    setRitualEntries([newEntry, ...ritualEntries]);
    
    // Отправка в Telegram через бота (если есть токен)
    const botToken = "8143626484:AAGThG_Wd89WcWoN6mosbAJb59ysfU8NhKY";
    const userId = WebApp.initDataUnsafe.user?.id;
    
    if (botToken && userId) {
      try {
        const text = `📝 *Новая запись в дневнике SOMNA*\n\n🌟 *Спасибо себе:* ${gratitude}\n🔮 *Совет на завтра:* ${advice}\n\n📊 *Оценки:*\n- Сон: ${sleepQuality}/10\n- Засыпание: ${fallingAsleepQuality}/10\n- Влияние SOMNA: ${somnaInfluence}/10`;
        
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userId,
            text: text,
            parse_mode: 'Markdown'
          })
        });
      } catch (err) {
        console.error("Failed to send telegram message:", err);
      }
    }
    
    // Сброс полей после сохранения
    setGratitude('');
    setAdvice('');
    setShowSurvey(false);
    
    // Сброс оценок для следующего раза
    setSleepQuality(5);
    setFallingAsleepQuality(5);
    setSomnaInfluence(5);
    
    setActiveTab('dashboard');
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  // Расчет статистики (среднее арифметическое по всем записям)
  const getStats = React.useMemo(() => {
    if (!ritualEntries || ritualEntries.length === 0) {
      return { 
        sleep: "0", sleepCount: 0,
        falling: "0", fallingCount: 0,
        influence: "0", influenceCount: 0 
      };
    }
    
    let sSum = 0, sCount = 0;
    let fSum = 0, fCount = 0;
    let iSum = 0, iCount = 0;

    ritualEntries.forEach(entry => {
      // Безопасное получение числового значения
      const getVal = (val: any) => {
        if (val === null || val === undefined || val === '') return NaN;
        return parseFloat(String(val));
      };

      const s = getVal(entry.sleepQuality);
      const f = getVal(entry.fallingAsleepQuality);
      const i = getVal(entry.somnaInfluence);

      if (!isNaN(s)) { sSum += s; sCount++; }
      if (!isNaN(f)) { fSum += f; fCount++; }
      if (!isNaN(i)) { iSum += i; iCount++; }
    });
    
    const format = (sum: number, count: number) => {
      if (count === 0) return "0";
      const avg = sum / count;
      // Округляем до 1 знака после запятой для точности
      return avg.toFixed(1);
    };

    return {
      sleep: format(sSum, sCount),
      sleepCount: sCount,
      falling: format(fSum, fCount),
      fallingCount: fCount,
      influence: format(iSum, iCount),
      influenceCount: iCount
    };
  }, [ritualEntries]);

  const clearHistory = () => {
    if (window.confirm('Вы уверены, что хотите удалить все записи и сбросить стрик?')) {
      setRitualEntries([]);
      setStreakCount(0);
      localStorage.removeItem('somna_rituals_v3');
      localStorage.removeItem('somna_streak_v3');
      WebApp.HapticFeedback.notificationOccurred('warning');
    }
  };

  const connectDevice = () => {
    if (!wifiSsid.trim() || !wifiPass.trim()) return;
    
    setIsConnecting(true);
    WebApp.HapticFeedback.impactOccurred('light');
    // Симуляция процесса подключения
    setTimeout(() => {
      setIsDeviceConnected(true);
      setIsConnecting(false);
      setShowConnectModal(false);
      WebApp.HapticFeedback.notificationOccurred('success');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-neon-blue/30 flex flex-col max-w-md mx-auto relative overflow-hidden" style={{ backgroundColor: WebApp.themeParams.bg_color || '#050505' }}>
      <BackgroundMesh />

      {/* Анимация стрика (Full-screen) */}
      <AnimatePresence>
        {showStreakAnim && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.1, 1], 
                y: 0, 
                opacity: 1,
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
              {/* Лучи света */}
              <div className="absolute inset-0 -z-10">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 0.3, 0], scale: [0, 1.5, 2], rotate: i * 90 }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute top-1/2 left-1/2 w-1 h-48 bg-gradient-to-t from-neon-blue to-transparent origin-bottom -translate-x-1/2 -translate-y-full"
                  />
                ))}
              </div>

              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple p-1 shadow-[0_0_100px_rgba(0,243,255,0.6)]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-neon-blue/10 blur-xl"
                  />
                  <Flame className="w-20 h-20 text-neon-blue relative z-10" />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <h2 className="text-5xl font-black italic tracking-tighter text-white mb-2">
                  <span className="text-neon-blue">НОВЫЙ</span> СТРИК!
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-12 bg-white/20" />
                  <span className="text-3xl font-mono font-bold text-neon-purple">{streakCount} ДНЯ</span>
                  <div className="h-px w-12 bg-white/20" />
                </div>
                <p className="mt-4 text-white/50 font-medium uppercase tracking-[0.2em] text-[10px]">Ваш мозг говорит спасибо</p>
                <p className="mt-2 text-neon-blue text-sm italic font-medium max-w-[240px] mx-auto leading-relaxed">
                  «{currentPhrase}»
                </p>
              </motion.div>

              {/* Частицы */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`p-${i}`}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 300, 
                    y: (Math.random() - 0.5) * 300,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="absolute w-2 h-2 rounded-full bg-neon-blue"
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Анимация получения звания */}
      <AnimatePresence>
        {showRankUpAnim && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            {/* Фоновое свечение */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-br from-amber-500/20 via-transparent to-neon-purple/20 blur-[150px] animate-pulse" />
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="relative z-10"
            >
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-[0_0_80px_rgba(251,191,36,0.5)]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Trophy className="w-24 h-24 text-amber-500" />
                </div>
              </div>
              
              {/* Лучи */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  style={{ rotate: i * 45 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
                />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center z-10"
            >
              <p className="text-amber-400 font-bold uppercase tracking-[0.4em] text-xs mb-4">НОВОЕ ДОСТИЖЕНИЕ</p>
              <h2 className="text-6xl font-black italic tracking-tighter text-white mb-6 leading-none">
                {newRankName.toUpperCase()}
              </h2>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8" />
              <p className="text-white/60 text-lg font-medium max-w-xs mx-auto italic">
                «Ваша дисциплина сна достигла нового уровня. Вы становитесь легендой SOMNA.»
              </p>
            </motion.div>

            {/* Конфетти */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`c-${i}`}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  rotate: 0
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 500, 
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                className={cn(
                  "absolute w-3 h-3 rounded-sm",
                  i % 3 === 0 ? "bg-amber-400" : i % 3 === 1 ? "bg-white" : "bg-neon-purple"
                )}
              />
            ))}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              onClick={() => setShowRankUpAnim(false)}
              className="absolute bottom-12 px-12 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
            >
              ПРОДОЛЖИТЬ
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Опрос после стрика */}
      <AnimatePresence>
        {showSurvey && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm glass-card p-8 rounded-[32px] space-y-8 relative overflow-hidden"
            >
              {/* Dynamic Background Glow */}
              <motion.div 
                className="absolute inset-0 pointer-events-none opacity-20"
                animate={{ 
                  background: `radial-gradient(circle at 50% 50%, ${((sleepQuality + fallingAsleepQuality + somnaInfluence) / 3) > 7 ? '#00f3ff' : '#bc13fe'} 0%, transparent 70%)` 
                }}
              />

              <div className="text-center space-y-2 relative z-10">
                <h3 className="text-2xl font-bold tracking-tight text-neon-blue">Как прошла ночь?</h3>
                <p className="text-white/40 text-sm italic">Спустя время вы увидите разницу.</p>
              </div>

              <div className="space-y-8 relative z-10">
                <RatingSlider 
                  label="Качество сна"
                  value={sleepQuality}
                  onChange={setSleepQuality}
                  minLabel="Тяжело"
                  maxLabel="Идеально"
                  colorClass="text-neon-blue"
                  glowColor="bg-neon-blue"
                  moods={["Разбито", "Тяжело", "Плохо", "Нормально", "Ок", "Хорошо", "Бодро", "Отлично", "Прекрасно", "Идеально"]}
                />

                <RatingSlider 
                  label="Скорость засыпания"
                  value={fallingAsleepQuality}
                  onChange={setFallingAsleepQuality}
                  minLabel="Долго"
                  maxLabel="Мгновенно"
                  colorClass="text-neon-purple"
                  glowColor="bg-neon-purple"
                  moods={["Час+", "Долго", "Трудно", "Средне", "Ок", "Быстро", "Легко", "Мгновенно", "Как в сказке", "Вне времени"]}
                />

                <RatingSlider 
                  label="Влияние SOMNA"
                  value={somnaInfluence}
                  onChange={setSomnaInfluence}
                  minLabel="Нет"
                  maxLabel="Сильное"
                  colorClass="text-neon-blue"
                  glowColor="bg-neon-blue"
                  moods={["Никак", "Слабо", "Заметно", "Ощутимо", "Хорошо", "Сильно", "Мощно", "Магия", "Космос", "Вне реальности"]}
                />
              </div>

              <button 
                onClick={handleSurveySave}
                className="w-full py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-white transition-all shadow-xl relative z-10"
              >
                СОХРАНИТЬ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Шапка */}
      <header className="p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter neon-text-blue">SOMNA</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Заряд</span>
              <span className="text-xs font-mono font-bold text-neon-blue">{batteryLevel}%</span>
            </div>
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${batteryLevel}%` }}
                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <User className="w-5 h-5 text-white/40" />
          </div>
        </div>
      </header>

      {/* Экран приветствия */}
      <AnimatePresence>
        {isNewUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[150] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-neon-blue/5 rounded-full blur-[120px] animate-pulse" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="z-10 w-full max-w-xs space-y-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,243,255,0.3)]">
                <Zap className="w-10 h-10 text-black" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter neon-text-blue">SOMNA</h1>
                <p className="text-white/50 text-sm">Добро пожаловать. Как нам вас называть?</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="Введите ваш никнейм"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-lg outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                />
                <button 
                  onClick={handleSetNickname}
                  disabled={tempNickname.trim().length < 3}
                  className="w-full py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-neon-blue hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                >
                  НАЧАТЬ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной контент */}
      <main className="flex-1 relative z-10 flex flex-col pb-32 px-4 sm:px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-8 flex flex-col items-center justify-center gap-12 relative z-10"
            >
              {/* Приветствие */}
              <div className="w-full text-center space-y-1">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold tracking-tight"
                >
                  Привет, <span className="neon-text-blue">{nickname}</span>
                </motion.h1>
              </div>

              {/* Статистика */}
              <div className="w-full flex flex-col items-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3 text-neon-blue mb-1">
                    <BurningFlame active={streakCount > 0} />
                    <span className={cn(
                      "text-4xl font-bold font-mono tracking-tighter transition-all duration-500",
                      streakCount > 0 ? "text-neon-blue" : "text-white/20"
                    )}>
                      {streakCount}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                    Текущий стрик
                  </span>
                </div>

                <motion.button 
                  onClick={() => {
                    setStreakCount(prev => prev + 1);
                    WebApp.HapticFeedback.impactOccurred('medium');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-bold text-white/20 hover:text-white/40 transition-all uppercase tracking-widest"
                >
                  Dev: +1 Streak
                </motion.button>

                <div className="w-full flex justify-center">
                  {/* Звание */}
                  <div className="flex flex-col items-center justify-center p-4 glass-card rounded-3xl border border-white/5 min-w-[140px]">
                    <div className="flex items-center gap-2 mb-1" style={{ color: getRankByStreak(streakCount).color }}>
                      <Trophy className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {getRankByStreak(streakCount).name}
                      </span>
                    </div>
                    <span className="text-[8px] uppercase tracking-tighter text-white/30 font-bold">
                      Ваше звание
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-xs flex flex-col gap-4">
                  <p className="text-center text-white/60 text-sm font-medium italic leading-relaxed px-4">
                    «{currentPhrase}»
                  </p>
                  
                  {/* Кнопка для разработчика */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newStreak = streakCount + 1;
                      setStreakCount(newStreak);
                      triggerStreakAnimation(newStreak);
                      WebApp.HapticFeedback.impactOccurred('light');
                    }}
                    className="mt-4 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[8px] uppercase tracking-[0.2em] font-bold text-white/20 transition-all border border-white/5"
                  >
                    +1 Стрик (Dev)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-8 flex flex-col"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2 neon-text-blue">Лидеры</h2>
                <p className="text-white/50">Сообщество осознанного сна.</p>
              </div>

              <div className="glass-card rounded-3xl p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Таблица лидеров
                  </h3>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Топ спящих</span>
                </div>

                <div className="space-y-4">
                  {MOCK_LEADERBOARD.map((user, i) => (
                    <div key={user.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-white/20 font-mono w-4">{i + 1}</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-[9px] uppercase font-bold tracking-tighter" style={{ color: getRankByStreak(user.streak).color }}>
                            {getRankByStreak(user.streak).name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-neon-blue">
                        <Flame className="w-4 h-4" />
                        <span className="font-mono font-bold">{user.streak}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Текущий пользователь */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 mt-6">
                    <div className="flex items-center gap-4">
                      <span className="text-neon-blue font-mono w-4">12</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-neon-blue">{nickname} (Вы)</span>
                        <span className="text-[9px] uppercase font-bold tracking-tighter" style={{ color: getRankByStreak(streakCount).color }}>
                          {getRankByStreak(streakCount).name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-neon-blue">
                      <Flame className="w-4 h-4" />
                      <span className="font-mono font-bold">{streakCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'diary' && (
            <motion.div 
              key="diary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar"
            >
              <AnimatePresence mode="wait">
                {!showHistory ? (
                  <motion.div
                    key="diary-main"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold tracking-tight mb-2 neon-text-blue">Дневник</h2>
                      <p className="text-white/50">Зафиксируйте свои мысли и настройтесь на сон.</p>
                    </div>

                    {/* Форма новой записи */}
                    <div className="glass-card p-6 rounded-[32px] space-y-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <h3 className="text-xs uppercase tracking-[0.2em] text-neon-blue font-bold relative z-10">Новая запись</h3>
                      
                      <div className="space-y-3 relative z-10">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                          За что вы скажете спасибо себе сегодня?
                        </label>
                        <textarea 
                          value={gratitude}
                          onChange={(e) => setGratitude(e.target.value)}
                          placeholder="Сегодня я благодарен себе за..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all resize-none text-sm text-white/90 placeholder:text-white/10"
                        />
                      </div>

                      <div className="space-y-3 relative z-10">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                          Какой совет вы дадите себе на завтра?
                        </label>
                        <textarea 
                          value={advice}
                          onChange={(e) => setAdvice(e.target.value)}
                          placeholder="Завтра мне стоит..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all resize-none text-sm text-white/90 placeholder:text-white/10"
                        />
                      </div>

                      <button 
                        onClick={saveRitual}
                        disabled={!gratitude.trim() || !advice.trim() || showSurvey}
                        className="w-full py-5 bg-white text-black rounded-2xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neon-blue hover:text-white transition-all shadow-xl relative z-10"
                      >
                        <Send className="w-4 h-4" />
                        СОХРАНИТЬ В ДНЕВНИК
                      </button>
                    </div>

                    {/* Кнопка перехода к истории */}
                    <button 
                      onClick={() => {
                        setShowHistory(true);
                        WebApp.HapticFeedback.impactOccurred('medium');
                      }}
                      className="w-full glass-card p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-neon-blue/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FolderHeart className="w-6 h-6 text-neon-blue" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-sm">Ваши записи</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                            {ritualEntries.length} {ritualEntries.length === 1 ? 'запись' : 'записей'} в истории
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-neon-blue group-hover:translate-x-1 transition-all" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="diary-history"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <button 
                        onClick={() => {
                          setShowHistory(false);
                          WebApp.HapticFeedback.impactOccurred('light');
                        }}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight neon-text-blue">История записей</h2>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Ваш путь к осознанности</p>
                      </div>
                    </div>

                    {ritualEntries.length === 0 ? (
                      <div className="p-12 text-center glass-card rounded-[32px] border-dashed border-white/10">
                        <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/30 text-sm italic">Здесь будут ваши записи</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pb-10">
                        {ritualEntries.map((entry) => (
                          <motion.div 
                            key={entry.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 rounded-[32px] space-y-4 border border-white/5 hover:border-white/10 transition-all"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">{entry.date}</span>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-neon-blue fill-neon-blue" />
                                  <span className="text-[10px] font-mono font-bold">{entry.sleepQuality}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-neon-purple fill-neon-purple" />
                                  <span className="text-[10px] font-mono font-bold">{entry.fallingAsleepQuality}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-neon-blue fill-neon-blue" />
                                  <span className="text-[10px] font-mono font-bold">{entry.somnaInfluence}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Благодарность дня</p>
                                <p className="text-sm text-white/80 italic leading-relaxed">«{entry.gratitude}»</p>
                              </div>
                              <div className="h-px w-full bg-white/5" />
                              <div className="space-y-1.5">
                                <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Совет на завтра</p>
                                <p className="text-sm text-white/80 italic leading-relaxed">«{entry.advice}»</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2 neon-text-purple">Статистика</h2>
                <p className="text-white/50">Анализ вашего прогресса.</p>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neon-blue/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-neon-blue" />
                    </div>
                    <h3 className="font-bold text-sm">Оценка сна</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-mono font-bold text-neon-blue">{getStats.sleep}</span>
                    <div className="flex flex-col mb-1">
                      <span className="text-[10px] text-white/30 uppercase font-bold">Средний балл</span>
                      <span className="text-[8px] text-white/20 uppercase font-bold">На основе {getStats.sleepCount} зап.</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neon-purple/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-neon-purple" />
                    </div>
                    <h3 className="font-bold text-sm">Оценка скорости засыпания</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-mono font-bold text-neon-purple">{getStats.falling}</span>
                    <div className="flex flex-col mb-1">
                      <span className="text-[10px] text-white/30 uppercase font-bold">Средний балл</span>
                      <span className="text-[8px] text-white/20 uppercase font-bold">На основе {getStats.fallingCount} зап.</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neon-blue/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                    </div>
                    <h3 className="font-bold text-sm">Оценка влияния SOMNA на сон</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-mono font-bold text-neon-blue">{getStats.influence}</span>
                    <div className="flex flex-col mb-1">
                      <span className="text-[10px] text-white/30 uppercase font-bold">Средний балл</span>
                      <span className="text-[8px] text-white/20 uppercase font-bold">На основе {getStats.influenceCount} зап.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-8 flex flex-col"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2 neon-text-blue">Настройки</h2>
                <p className="text-white/50">Управление устройством и профилем.</p>
              </div>

              <div className="space-y-4">
                <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-neon-blue/20 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-neon-blue" />
                    </div>
                    <div>
                      <p className="font-bold">Wi-Fi Подключение</p>
                      <p className="text-xs text-white/40">{isDeviceConnected ? "Подключено" : "Не настроено"}</p>
                    </div>
                  </div>
                  <motion.button 
                    onClick={() => setShowConnectModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
                  >
                    ИЗМЕНИТЬ
                  </motion.button>
                </div>

                <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-neon-purple/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="font-bold">Никнейм</p>
                      <p className="text-xs text-white/40">{nickname}</p>
                    </div>
                  </div>
                  <motion.button 
                    onClick={() => setIsNewUser(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
                  >
                    ИЗМЕНИТЬ
                  </motion.button>
                </div>

                <div className="glass-card p-6 rounded-3xl flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="font-bold">Уведомления</p>
                      <p className="text-xs text-white/40">Включены</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-neon-blue/20 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-neon-blue rounded-full" />
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-neon-blue/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-neon-blue" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Лимит времени</h3>
                        <p className="text-[10px] text-white/30">Стрик сгорает после этого времени</p>
                      </div>
                    </div>
                    <input 
                      type="time" 
                      value={dailyDeadline}
                      onChange={(e) => setDailyDeadline(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-neon-blue transition-all text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Очистить данные</h3>
                        <p className="text-[10px] text-white/30">Удалить все записи и сбросить стрик</p>
                      </div>
                    </div>
                    <motion.button 
                      onClick={clearHistory}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-colors"
                    >
                      Очистить
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <div className="p-4 bg-white/5 rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-white/20 mt-0.5" />
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    Версия приложения: 1.2.0 (Stable)<br />
                    Прошивка устройства: 0.9.4-beta<br />
                    Разработано для SOMNA Labs.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Панель навигации */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 pb-8 pointer-events-none z-[100]">
        <div className="max-w-md mx-auto flex justify-between items-center glass-card rounded-[28px] p-1.5 pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border border-white/10">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => {
              setActiveTab('dashboard');
              WebApp.HapticFeedback.selectionChanged();
            }}
            icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Главная"
          />
          <NavButton 
            active={activeTab === 'leaderboard'} 
            onClick={() => {
              setActiveTab('leaderboard');
              WebApp.HapticFeedback.selectionChanged();
            }}
            icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Лидеры"
          />
          <NavButton 
            active={activeTab === 'diary'} 
            onClick={() => {
              setActiveTab('diary');
              WebApp.HapticFeedback.selectionChanged();
            }}
            icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Дневник"
          />
          <NavButton 
            active={activeTab === 'stats'} 
            onClick={() => {
              setActiveTab('stats');
              WebApp.HapticFeedback.selectionChanged();
            }}
            icon={<BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Статы"
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => {
              setActiveTab('settings');
              WebApp.HapticFeedback.selectionChanged();
            }}
            icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Настройки"
          />
        </div>
      </nav>

      {/* Модальное окно подключения */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-end justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md glass-card rounded-t-[40px] p-8 pb-12"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold neon-text-blue">Smart Connect</h3>
                <button onClick={() => setShowConnectModal(false)} className="p-2 bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isDeviceConnected ? (
                <div className="space-y-6">
                  <div className="p-6 bg-neon-blue/10 border border-neon-blue/20 rounded-3xl flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-full bg-neon-blue flex items-center justify-center", isConnecting && "animate-pulse")}>
                      <Wifi className="text-black w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">{isConnecting ? "Подключение..." : "Поиск SOMNA..."}</p>
                      <p className="text-xs text-white/50">Убедитесь, что устройство в режиме Setup</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Wi-Fi SSID</label>
                      <input 
                        type="text" 
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="Название сети"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-neon-blue transition-all text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Пароль</label>
                      <input 
                        type="password" 
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-neon-blue transition-all text-white"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={connectDevice}
                    disabled={isConnecting || !wifiSsid.trim() || !wifiPass.trim()}
                    className="w-full py-5 bg-neon-blue text-black font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all disabled:opacity-30"
                  >
                    {isConnecting ? "ПОДКЛЮЧЕНИЕ..." : "ПОДКЛЮЧИТЬ УСТРОЙСТВО"}
                  </button>
                  
                  <div className="flex items-start gap-2 p-4 bg-white/5 rounded-2xl">
                    <Info className="w-4 h-4 text-white/40 mt-0.5" />
                    <p className="text-[10px] text-white/30 font-medium leading-relaxed">
                      Проблемы с подключением? Проверьте инструкцию по настройке <span className="underline text-white/50">AP SOMNA_Setup</span>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 gap-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Устройство подключено</h4>
                    <p className="text-white/50">SOMNA v1.0 готова к работе.</p>
                  </div>
                  <button 
                    onClick={() => setShowConnectModal(false)}
                    className="w-full py-5 bg-white text-black font-bold rounded-2xl mt-4 shadow-xl"
                  >
                    ПРОДОЛЖИТЬ
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavButton = React.memo(({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => {
  return (
    <motion.button 
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 relative flex-1 min-w-0",
        active ? "text-neon-blue" : "text-white/30 hover:text-white/60"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-neon-blue/10 blur-lg rounded-full"
          transition={{ duration: 0.3 }}
        />
      )}
      <div className={cn("transition-transform duration-300 relative z-10", active && "scale-110 drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]")}>
        {icon}
      </div>
      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter relative z-10 truncate w-full text-center">
        {label}
      </span>
    </motion.button>
  );
});
