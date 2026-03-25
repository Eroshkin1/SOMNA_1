const { useState, useEffect, useCallback, useRef, memo } = React;
const { motion, AnimatePresence } = FramerMotion;
const WebApp = window.Telegram.WebApp;

// Иконки из Lucide
const { 
  Zap, Flame, Trophy, BookOpen, X, Send, Wifi, CheckCircle2, 
  Battery: BatteryIcon, Bell, Settings, Info, User, Star, 
  BarChart2, History, ArrowLeft, ChevronRight, FolderHeart, 
  Power, Clock, Trash2 
} = lucide;

// Утилита для классов
function cn(...inputs) {
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
  "Твой мозг благодарит тебя за отдых.", "Завтрашний успех начинается сегодня вечером.",
  "Спи крепко, мечтай масштабно.", "Тишина — это музыка для души."
  // ... (остальные фразы подтянутся в логике)
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

// Компонент фона
const BackgroundMesh = memo(() => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0a0a1a]">
    <div className="absolute w-[160%] h-[160%] -top-[30%] -left-[30%] bg-[#00f3ff]/10 blur-[80px] animate-pulse" />
    <div className="absolute w-[140%] h-[140%] -bottom-[40%] -right-[30%] bg-[#bc13fe]/10 blur-[70px] animate-pulse" />
  </div>
));

// Компонент пламени
const BurningFlame = ({ active }) => {
  if (!active) return <Flame className="w-8 h-8 text-white/10" />;
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-cyan-500/40 rounded-full blur-xl" />
      <motion.div animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1], y: [0, -2, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
        <Flame className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_15px_#00f3ff]" />
      </motion.div>
    </div>
  );
};

 const Cube3D = memo(({ isActivated }) => {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((e) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x: clientX, y: clientY };
  }, []);

  const handleMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - lastPos.current.x;
    const deltaY = clientY - lastPos.current.y;
    
    setRotation(prev => ({ x: prev.x - deltaY * 0.5, y: prev.y + deltaX * 0.5 }));
    lastPos.current = { x: clientX, y: clientY };
  }, [isDragging]);

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

  const faces = [
    { transform: 'rotateY(0deg) translateZ(64px)', color: 'rgba(100, 100, 100, 0.8)' },
    { transform: 'rotateY(180deg) translateZ(64px)', color: 'rgba(80, 80, 80, 0.8)' },
    { transform: 'rotateY(90deg) translateZ(64px)', color: 'rgba(120, 120, 120, 0.8)' },
    { transform: 'rotateY(-90deg) translateZ(64px)', color: 'rgba(90, 90, 90, 0.8)' },
    { transform: 'rotateX(90deg) translateZ(64px)', color: 'rgba(110, 110, 110, 0.8)' },
    { transform: 'rotateX(-90deg) translateZ(64px)', color: 'rgba(70, 70, 70, 0.8)' }
  ];

  return (
    <div className="w-64 h-64 flex items-center justify-center cursor-grab active:cursor-grabbing"
         onMouseDown={handleStart} onTouchStart={handleStart} style={{ perspective: '1000px' }}>
      <motion.div className="relative w-32 h-32" style={{ transformStyle: 'preserve-3d', rotateX: rotation.x, rotateY: rotation.y }}>
        {faces.map((face, i) => (
          <div key={i} className="absolute inset-0 border border-white/20 flex items-center justify-center overflow-hidden"
               style={{ transform: face.transform, backgroundColor: face.color, boxShadow: isActivated ? 'inset 0 0 30px rgba(0, 243, 255, 0.3)' : 'none' }}>
            <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10" />
          </div>
        ))}
      </motion.div>
    </div>
  );
});

const RatingSlider = memo(({ value, onChange, label, moods, colorClass, glowColor }) => {
  const [isInteracting, setIsInteracting] = useState(false);
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
        <div className="absolute w-full h-2 bg-white/5 rounded-full border border-white/5 overflow-hidden">
          <motion.div className={cn("h-full", glowColor)} animate={{ width: `${(value / 10) * 100}%` }} />
        </div>
        <input type="range" min="1" max="10" value={value} 
               onChange={(e) => { onChange(parseInt(e.target.value)); WebApp.HapticFeedback.impactOccurred('light'); }}
               onPointerDown={() => setIsInteracting(true)} onPointerUp={() => setIsInteracting(false)}
               className="absolute w-full h-8 opacity-0 cursor-pointer z-10" />
        <motion.div className="absolute w-6 h-6 bg-white rounded-full z-20 pointer-events-none flex items-center justify-center"
                    animate={{ left: `calc(${(value / 10) * 100}% - 12px)`, scale: isInteracting ? 1.2 : 1 }} />
      </div>
    </div>
  );
});
     const App = () => {
  // Навигация и Пользователь
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nickname, setNickname] = useState(null);
  const [tempNickname, setTempNickname] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);

  // Устройство
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isActivated, setIsActivated] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  // Данные и Стрики
  const [streakCount, setStreakCount] = useState(0);
  const [ritualEntries, setRitualEntries] = useState([]);
  const [lastInteractionDate, setLastInteractionDate] = useState(null);
  const [dailyDeadline, setDailyDeadline] = useState('23:00');
  
  // Опрос и Анимации
  const [sleepQuality, setSleepQuality] = useState(5);
  const [fallingAsleepQuality, setFallingAsleepQuality] = useState(5);
  const [somnaInfluence, setSomnaInfluence] = useState(5);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showStreakAnim, setShowStreakAnim] = useState(false);
  const [showRankUpAnim, setShowRankUpAnim] = useState(false);
  const [newRankName, setNewRankName] = useState('');

  // Инициализация Telegram и загрузка данных
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const tgUser = tg.initDataUnsafe?.user;
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
    }

    // Загрузка из локального хранилища
    const savedEntries = localStorage.getItem('somna_rituals_v3');
    if (savedEntries) setRitualEntries(JSON.parse(savedEntries));
    
    setStreakCount(parseInt(localStorage.getItem('somna_streak_v3') || '0'));
    setLastInteractionDate(localStorage.getItem('somna_last_interaction_v3'));
    setDailyDeadline(localStorage.getItem('somna_deadline_v3') || '23:00');
    setIsDeviceConnected(localStorage.getItem('somna_connected_v3') === 'true');
  }, []);

  // Автосохранение при изменениях
  useEffect(() => {
    if (nickname) localStorage.setItem('somna_nickname_v3', nickname);
    localStorage.setItem('somna_rituals_v3', JSON.stringify(ritualEntries));
    localStorage.setItem('somna_streak_v3', streakCount.toString());
    localStorage.setItem('somna_connected_v3', isDeviceConnected.toString());
    if (lastInteractionDate) localStorage.setItem('somna_last_interaction_v3', lastInteractionDate);
    localStorage.setItem('somna_deadline_v3', dailyDeadline);
  }, [nickname, ritualEntries, streakCount, isDeviceConnected, lastInteractionDate, dailyDeadline]);

  // Логика сброса стрика (дедлайн)
  useEffect(() => {
    const checkStreak = () => {
      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];
      const [hours, mins] = dailyDeadline.split(':').map(Number);
      const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins).getTime();
      
      if (lastInteractionDate) {
        const lastDateStr = lastInteractionDate.split('T')[0];
        if (lastDateStr !== todayDate && now.getTime() > deadline) {
          setStreakCount(0);
          if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
      }
    };
    const interval = setInterval(checkStreak, 60000);
    return () => clearInterval(interval);
  }, [lastInteractionDate, dailyDeadline]);

  // Ранги
  const getRankByStreak = (streak) => {
    const idx = streak < 35 ? Math.min(Math.floor(streak / 7), 4) : Math.min(5 + Math.floor((streak - 35) / 14), RANKS.length - 1);
    return RANKS[idx];
  };

  const currentPhrase = React.useMemo(() => {
    return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
  }, [streakCount]);

 const toggleActivation = () => {
    if (!isDeviceConnected) {
      setShowConnectModal(true);
      if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      return;
    }
    if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    setIsActivated(!isActivated);
  };

  const handleSurveySave = async () => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      gratitude,
      advice,
      sleepQuality,
      fallingAsleepQuality,
      somnaInfluence
    };
    
    setRitualEntries([newEntry, ...ritualEntries]);
    
    // Отправка в Telegram через твоего бота
    const botToken = "8143626484:AAGThG_Wd89WcWoN6mosbAJb59ysfU8NhKY";
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    
    if (botToken && userId) {
      try {
        const text = `📝 *Запись SOMNA*\n\n🌟 *Благодарность:* ${gratitude}\n🔮 *Совет:* ${advice}\n\n📊 *Оценки:* Сон ${sleepQuality}/10, Засыпание ${fallingAsleepQuality}/10`;
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: userId, text: text, parse_mode: 'Markdown' })
        });
      } catch (err) { console.error("TG Send Error:", err); }
    }
    
    setGratitude(''); setAdvice(''); setShowSurvey(false);
    setActiveTab('dashboard');
  };

  const getStats = React.useMemo(() => {
    if (!ritualEntries.length) return { sleep: "0", falling: "0", influence: "0" };
    const avg = (key) => (ritualEntries.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0) / ritualEntries.length).toFixed(1);
    return {
      sleep: avg('sleepQuality'),
      falling: avg('fallingAsleepQuality'),
      influence: avg('somnaInfluence')
    };
  }, [ritualEntries]);

  // Хендлер анимации стрика (вызывается при сохранении ритуала)
  const saveRitual = () => {
    if (!gratitude.trim() || !advice.trim()) return;
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    setLastInteractionDate(new Date().toISOString());
    
    // Запуск анимации
    setShowStreakAnim(true);
    if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    
    setTimeout(() => {
      setShowStreakAnim(false);
      setShowSurvey(true); // После анимации открываем опрос
    }, 4000);
  };
             {/* Анимация получения звания */}
      <AnimatePresence>
        {showRankUpAnim && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-br from-amber-500/20 via-transparent to-purple-500/20 blur-[150px] animate-pulse" />
            </div>

            <motion.div 
              initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }} className="relative z-10"
            >
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-[0_0_80px_rgba(251,191,36,0.5)]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Trophy className="w-24 h-24 text-amber-500" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 text-center z-10">
              <p className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-4">НОВОЕ ДОСТИЖЕНИЕ</p>
              <h2 className="text-5xl font-black italic text-white mb-6">{newRankName.toUpperCase()}</h2>
              <p className="text-white/60 text-lg italic max-w-xs mx-auto">«Ваша дисциплина сна достигла нового уровня.»</p>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              onClick={() => setShowRankUpAnim(false)}
              className="absolute bottom-12 px-12 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest"
            >
              ПРОДОЛЖИТЬ
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Опрос после записи */}
      <AnimatePresence>
        {showSurvey && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm bg-white/5 border border-white/10 p-8 rounded-[32px] space-y-8 relative overflow-hidden">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-[#00f3ff]">Как прошла ночь?</h3>
                <p className="text-white/40 text-sm italic">Статистика поможет улучшить сон.</p>
              </div>

              <div className="space-y-8">
                <RatingSlider label="Качество сна" value={sleepQuality} onChange={setSleepQuality} colorClass="text-[#00f3ff]" glowColor="bg-[#00f3ff]" moods={["Плохо", "Ок", "Идеально"]} />
                <RatingSlider label="Скорость засыпания" value={fallingAsleepQuality} onChange={setFallingAsleepQuality} colorClass="text-[#bc13fe]" glowColor="bg-[#bc13fe]" moods={["Долго", "Быстро", "Мгновенно"]} />
                <RatingSlider label="Влияние SOMNA" value={somnaInfluence} onChange={setSomnaInfluence} colorClass="text-[#00f3ff]" glowColor="bg-[#00f3ff]" moods={["Нет", "Заметно", "Магия"]} />
              </div>

              <button onClick={handleSurveySave} className="w-full py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest">
                СОХРАНИТЬ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Шапка */}
      <header className="p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f3ff] to-[#bc13fe] flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-[#00f3ff]">SOMNA</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono font-bold text-[#00f3ff]">{batteryLevel}%</span>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${batteryLevel}%` }} className="h-full bg-[#00f3ff]" />
            </div>
          </div>
        </div>
      </header>
      {/* Экран приветствия (Onboarding) */}
      <AnimatePresence>
        {isNewUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[150] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="z-10 w-full max-w-xs space-y-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00f3ff] to-[#bc13fe] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,243,255,0.3)]">
                <Zap className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter text-[#00f3ff]">SOMNA</h1>
                <p className="text-white/50 text-sm">Добро пожаловать. Как нам тебя называть?</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="Твой никнейм"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-lg outline-none focus:border-[#00f3ff] transition-all"
                />
                <button 
                  onClick={handleSetNickname} disabled={tempNickname.trim().length < 3}
                  className="w-full py-5 bg-white text-black rounded-2xl font-bold text-lg disabled:opacity-30"
                >
                  НАЧАТЬ
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной контент */}
      <main className="flex-1 relative z-10 flex flex-col pb-32 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 p-8 flex flex-col items-center justify-center gap-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Привет, <span className="text-[#00f3ff]">{nickname}</span></h1>
              </div>

              {/* Стрик и Звание */}
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-3 justify-center text-[#00f3ff]">
                    <Flame className={streakCount > 0 ? "text-[#00f3ff]" : "text-white/10"} />
                    <span className={`text-5xl font-black font-mono ${streakCount > 0 ? "text-[#00f3ff]" : "text-white/10"}`}>{streakCount}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-2">Дней дисциплины</p>
                </div>

                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center min-w-[160px]">
                  <div className="flex items-center gap-2 mb-1" style={{ color: getRankByStreak(streakCount).color }}>
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">{getRankByStreak(streakCount).name}</span>
                  </div>
                  <span className="text-[8px] text-white/30 uppercase font-bold">Твой статус</span>
                </div>
              </div>

              <p className="text-center text-white/60 text-sm italic max-w-xs">«{currentPhrase}»</p>
              
              {/* Dev Button для тестов */}
              <button onClick={() => { setStreakCount(s => s + 1); triggerStreakAnimation(streakCount + 1); }} className="text-[8px] text-white/10 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full">
                Симуляция прогресса
              </button>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#00f3ff]">Лидеры</h2>
              <div className="space-y-3">
                {MOCK_LEADERBOARD.map((user, i) => (
                  <div key={user.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                      <span className="text-white/20 font-mono w-4">{i + 1}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-[9px] uppercase font-bold" style={{ color: getRankByStreak(user.streak).color }}>
                          {getRankByStreak(user.streak).name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#00f3ff]">
                      <Flame className="w-4 h-4" />
                      <span className="font-mono font-bold">{user.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
                   {activeTab === 'diary' && (
            <motion.div key="diary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {!showHistory ? (
                  <motion.div key="diary-main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    <div className="mb-4">
                      <h2 className="text-3xl font-bold tracking-tight text-[#00f3ff]">Дневник</h2>
                      <p className="text-white/50 text-sm">Настройся на глубокий сон.</p>
                    </div>

                    {/* Форма записи */}
                    <div className="bg-white/5 p-6 rounded-[32px] space-y-6 border border-white/10 shadow-2xl relative overflow-hidden group">
                      <div className="space-y-3 relative z-10">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">За что ты скажешь спасибо себе сегодня?</label>
                        <textarea 
                          value={gratitude} onChange={(e) => setGratitude(e.target.value)}
                          placeholder="Сегодня я молодец, потому что..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] outline-none text-sm text-white focus:border-[#00f3ff] transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-3 relative z-10">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Совет на завтра</label>
                        <textarea 
                          value={advice} onChange={(e) => setAdvice(e.target.value)}
                          placeholder="Завтра мне стоит..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] outline-none text-sm text-white focus:border-[#bc13fe] transition-all resize-none"
                        />
                      </div>

                      <button 
                        onClick={saveRitual} disabled={!gratitude.trim() || !advice.trim() || showSurvey}
                        className="w-full py-5 bg-white text-black rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#00f3ff] transition-all"
                      >
                        <Send className="w-4 h-4" /> СОХРАНИТЬ В ДНЕВНИК
                      </button>
                    </div>

                    <button 
                      onClick={() => setShowHistory(true)}
                      className="w-full bg-white/5 p-6 rounded-[32px] border border-white/5 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#00f3ff]/10 flex items-center justify-center">
                          <Book className="w-6 h-6 text-[#00f3ff]" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-sm">История записей</h3>
                          <p className="text-[10px] text-white/30 uppercase font-bold">{ritualEntries.length} записей в архиве</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="diary-history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <button onClick={() => setShowHistory(false)} className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
                      <ArrowLeft className="w-4 h-4" /> Назад
                    </button>
                    <h2 className="text-2xl font-bold text-[#00f3ff] mb-6">Твой путь</h2>
                    {ritualEntries.length === 0 ? (
                      <p className="text-white/20 italic text-center py-20">Тут пока пусто...</p>
                    ) : (
                      ritualEntries.map((entry) => (
                        <div key={entry.id} className="bg-white/5 p-6 rounded-[32px] border border-white/5 space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-bold text-[#00f3ff] uppercase">
                            <span>{entry.date}</span>
                            <div className="flex gap-2 text-white/40">
                              <span>Сон: {entry.sleepQuality}</span>
                              <span>SOMNA: {entry.somnaInfluence}</span>
                            </div>
                          </div>
                          <p className="text-sm text-white/80 italic leading-relaxed">«{entry.gratitude}»</p>
                          <div className="h-px bg-white/5" />
                          <p className="text-xs text-white/40 font-medium">Совет: {entry.advice}</p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-8 space-y-6">
              <h2 className="text-3xl font-bold text-[#bc13fe]">Статистика</h2>
              <div className="grid grid-cols-1 gap-4">
                <StatCard icon={<Star className="text-[#00f3ff]"/>} label="Качество сна" val={getStats.sleep} count={getStats.sleepCount} />
                <StatCard icon={<Zap className="text-[#bc13fe]"/>} label="Засыпание" val={getStats.falling} count={getStats.fallingCount} />
                <StatCard icon={<Activity className="text-[#00f3ff]"/>} label="Влияние SOMNA" val={getStats.influence} count={getStats.influenceCount} />
              </div>
            </motion.div>
          )}
          {/* Настройки */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 p-8 flex flex-col">
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
                  <motion.button onClick={() => setShowConnectModal(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">ИЗМЕНИТЬ</motion.button>
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
                  <motion.button onClick={() => setIsNewUser(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">ИЗМЕНИТЬ</motion.button>
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
                    <input type="time" value={dailyDeadline} onChange={(e) => setDailyDeadline(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none text-white" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </div>
                      <h3 className="font-bold text-sm">Очистить историю</h3>
                    </div>
                    <motion.button onClick={clearHistory} whileHover={{ scale: 1.05 }} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold">ОЧИСТИТЬ</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Панель навигации */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 pb-8 pointer-events-none z-[100]">
        <div className="max-w-md mx-auto flex justify-between items-center glass-card rounded-[28px] p-1.5 pointer-events-auto shadow-2xl border border-white/10">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Zap className="w-5 h-5" />} label="Главная" />
          <NavButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy className="w-5 h-5" />} label="Лидеры" />
          <NavButton active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} icon={<BookOpen className="w-5 h-5" />} label="Дневник" />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart2 className="w-5 h-5" />} label="Статы" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} label="Опции" />
        </div>
      </nav>

      {/* Модальное окно Smart Connect */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-end justify-center p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-md glass-card rounded-t-[40px] p-8 pb-12">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold neon-text-blue">Smart Connect</h3>
                <button onClick={() => setShowConnectModal(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              {!isDeviceConnected ? (
                <div className="space-y-6">
                  <div className="p-6 bg-neon-blue/10 border border-neon-blue/20 rounded-3xl flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-full bg-neon-blue flex items-center justify-center", isConnecting && "animate-pulse")}>
                      <Wifi className="text-black w-6 h-6" />
                    </div>
                    <p className="font-bold">{isConnecting ? "Подключение..." : "Поиск устройства..."}</p>
                  </div>
                  <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="SSID вашей сети" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-white" />
                  <input type="password" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="Пароль" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-white" />
                  <button onClick={connectDevice} disabled={isConnecting} className="w-full py-5 bg-neon-blue text-black font-bold rounded-2xl">ПОДКЛЮЧИТЬ</button>
                </div>
              ) : (
                <div className="text-center py-10 space-y-6">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                  <h4 className="text-xl font-bold">Готово к работе!</h4>
                  <button onClick={() => setShowConnectModal(false)} className="w-full py-5 bg-white text-black font-bold rounded-2xl">ЗАКРЫТЬ</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Карточка статистики
const StatCard = ({ icon, label, val, count }) => (
  <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-bold text-sm text-white/90">{label}</h3>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-4xl font-mono font-bold text-white">{val}</span>
      <div className="flex flex-col mb-1">
        <span className="text-[10px] text-white/30 uppercase font-bold">Средний балл</span>
        <span className="text-[8px] text-white/20 uppercase font-bold">На основе {count} зап.</span>
      </div>
    </div>
  </div>
);

// Элемент списка лидеров
const LeadItem = ({ user, rank, isMe }) => (
  <div className={cn(
    "flex items-center justify-between p-4 rounded-2xl transition-all",
    isMe ? "bg-neon-blue/10 border border-neon-blue/20" : "bg-white/5 border border-transparent"
  )}>
    <div className="flex items-center gap-4">
      <span className={cn(
        "text-lg font-black w-6",
        rank === 1 ? "text-yellow-400" : rank === 2 ? "text-slate-300" : rank === 3 ? "text-amber-600" : "text-white/20"
      )}>
        {rank}
      </span>
      <div>
        <p className="font-bold text-sm text-white">{user.name} {isMe && "(Вы)"}</p>
        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{user.status}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-white">{user.score}</p>
      <p className="text-[8px] text-white/30 uppercase font-bold">Очков</p>
    </div>
  </div>
);
