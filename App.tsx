<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>SOMNA - Sleep Device</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;800&display=swap');
        body { margin: 0; padding: 0; background: #0a0a1a; color: white; font-family: 'Lexend', sans-serif; overflow: hidden; }
        .mesh-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; pointer-events: none; }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useMemo, useRef } = React;
        const { motion, AnimatePresence } = FramerMotion;

        // --- Утилиты ---
        const RANKS = [
            { name: "Новичок", color: "#94a3b8" },
            { name: "Исследователь снов", color: "#38bdf8" },
            { name: "Мастер покоя", color: "#4ade80" },
            { name: "Хранитель ночи", color: "#818cf8" },
            { name: "Легенда SOMNA", color: "#00f3ff" }
        ];

        // --- Компоненты (твоя логика) ---
        function App() {
            const [isActivated, setIsActivated] = useState(false);
            const [streak, setStreak] = useState(0);
            const [activeTab, setActiveTab] = useState('dashboard');
            const tg = window.Telegram.WebApp;

            useEffect(() => {
                tg.ready();
                tg.expand();
                const savedStreak = localStorage.getItem('somna_streak');
                if (savedStreak) setStreak(parseInt(savedStreak));
            }, []);

            const togglePower = () => {
                setIsActivated(!isActivated);
                tg.HapticFeedback.impactOccurred(isActivated ? 'medium' : 'heavy');
                if (!isActivated) {
                    const newStreak = streak + 1;
                    setStreak(newStreak);
                    localStorage.setItem('somna_streak', newStreak);
                }
            };

            const getRank = () => RANKS[Math.min(Math.floor(streak / 7), RANKS.length - 1)];

            return (
                <div className="flex flex-col min-h-screen p-6 relative h-full">
                    {/* Фон (Mesh) */}
                    <div className="fixed inset-0 -z-10 overflow-hidden">
                        <div className="mesh-blob w-96 h-96 bg-blue-500 top-[-10%] left-[-10%] animate-pulse"></div>
                        <div className="mesh-blob w-96 h-96 bg-purple-500 bottom-[-10%] right-[-10%] animate-pulse"></div>
                    </div>

                    {/* Хедер */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter">SOMNA</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40" style={{color: getRank().color}}>
                                {getRank().name} • {streak} ДНЯ
                            </p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-2xl border border-white/10">
                            <i data-lucide="settings" className="w-5 h-5 text-white/60"></i>
                        </div>
                    </div>

                    {/* 3D Куб / Центр */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                        <div className="relative w-64 h-64 flex items-center justify-center perspective-1000">
                             <motion.div 
                                animate={{ rotateY: 360, rotateX: isActivated ? [0, 10, -10, 0] : 0 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 bg-gray-600/20 border-2 border-white/20 rounded-2xl preserve-3d flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                style={{ boxShadow: isActivated ? '0 0 40px #38bdf8' : 'none' }}
                             >
                                <div className={`w-4 h-4 rounded-full transition-colors duration-500 ${isActivated ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-white/10'}`}></div>
                             </motion.div>
                             
                             {/* Свечение под кубом */}
                             <div className={`absolute w-40 h-40 blur-[60px] rounded-full transition-all duration-1000 ${isActivated ? 'bg-cyan-500/20 scale-125' : 'bg-transparent'}`}></div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold">{isActivated ? "СИСТЕМА АКТИВНА" : "ГОТОВ К ЗАПУСКУ"}</h2>
                            <p className="text-white/40 text-xs">Держите устройство рядом с подушкой</p>
                        </div>
                    </div>

                    {/* Главная кнопка */}
                    <button 
                        onClick={togglePower}
                        className={`w-full py-6 rounded-[2.5rem] font-black text-lg tracking-widest transition-all active:scale-95 shadow-2xl ${isActivated ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-cyan-500 text-black shadow-cyan-500/20'}`}
                    >
                        {isActivated ? "ВЫКЛЮЧИТЬ" : "АКТИВИРОВАТЬ СОН"}
                    </button>

                    {/* Навигация */}
                    <div className="mt-8 bg-white/5 p-2 rounded-3xl border border-white/10 flex justify-between items-center px-6 py-4">
                        <i data-lucide="zap" className={`w-6 h-6 ${activeTab==='dashboard'?'text-cyan-400':'text-white/20'}`}></i>
                        <i data-lucide="book-open" className="w-6 h-6 text-white/20"></i>
                        <i data-lucide="bar-chart-2" className="w-6 h-6 text-white/20"></i>
                        <i data-lucide="trophy" className="w-6 h-6 text-white/20"></i>
                    </div>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
        
        // Рендерим иконки Lucide
        setTimeout(() => lucide.createIcons(), 500);
    </script>
</body>
</html>
