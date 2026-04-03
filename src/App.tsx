/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Settings, 
  Keyboard, 
  BookOpen, 
  RotateCcw, 
  ChevronRight, 
  Zap,
  CheckCircle2,
  XCircle,
  BarChart3,
  Home
} from 'lucide-react';
import { TOP_WORDS } from './data/words';

type Mode = 'menu' | 'infinite' | 'stats' | 'flashcards';

interface WordStats {
  totalTyped: number;
  correctWords: number;
  totalChars: number;
  correctChars: number;
  flashcardsSeen: number;
}

export default function App() {
  const [mode, setMode] = useState<Mode>('menu');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState<WordStats>(() => {
    const saved = localStorage.getItem('english-master-stats');
    return saved ? JSON.parse(saved) : {
      totalTyped: 0,
      correctWords: 0,
      totalChars: 0,
      correctChars: 0,
      flashcardsSeen: 0
    };
  });

  // Shuffle words for infinite mode
  const shuffledWords = useMemo(() => {
    return [...TOP_WORDS].sort(() => Math.random() - 0.5);
  }, []);

  const currentWord = shuffledWords[currentWordIndex];

  useEffect(() => {
    localStorage.setItem('english-master-stats', JSON.stringify(stats));
  }, [stats]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    // Update char stats
    if (value.length > userInput.length) {
      const charIndex = value.length - 1;
      const lastChar = value[charIndex]?.toLowerCase();
      const expectedChar = currentWord?.en?.[charIndex]?.toLowerCase();
      
      if (lastChar !== undefined) {
        setStats(prev => ({
          ...prev,
          totalChars: prev.totalChars + 1,
          correctChars: prev.correctChars + (expectedChar !== undefined && lastChar === expectedChar ? 1 : 0)
        }));
      }
    }

    // Check if word is complete and correct
    if (currentWord?.en && value.toLowerCase() === currentWord.en.toLowerCase()) {
      setStats(prev => ({
        ...prev,
        totalTyped: prev.totalTyped + 1,
        correctWords: prev.correctWords + 1
      }));
      
      // Small delay before next word for visual feedback
      setTimeout(() => {
        setUserInput('');
        setCurrentWordIndex((prev) => (prev + 1) % shuffledWords.length);
      }, 300);
    }
  };

  const nextFlashcard = () => {
    setIsFlipped(false);
    setStats(prev => ({ ...prev, flashcardsSeen: prev.flashcardsSeen + 1 }));
    setCurrentWordIndex((prev) => (prev + 1) % shuffledWords.length);
  };

  const resetStats = () => {
    const newStats = {
      totalTyped: 0,
      correctWords: 0,
      totalChars: 0,
      correctChars: 0,
      flashcardsSeen: 0
    };
    setStats(newStats);
    localStorage.setItem('english-master-stats', JSON.stringify(newStats));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-between px-6">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setMode('menu');
            setIsFlipped(false);
            setUserInput('');
          }}
        >
          <div className="p-2 bg-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            English Master 3000
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMode('stats')}
            className={`p-2 rounded-full transition-colors ${mode === 'stats' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              setMode('menu');
              setIsFlipped(false);
              setUserInput('');
            }}
            className={`p-2 rounded-full transition-colors ${mode === 'menu' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="col-span-full mb-8">
                <h2 className="text-3xl font-bold mb-2">Bienvenue, Apprenant !</h2>
                <p className="text-slate-400">Prêt à maîtriser les 3000 mots les plus utilisés en anglais ?</p>
              </div>

              <MenuCard 
                icon={<Zap className="w-8 h-8 text-yellow-400" />}
                title="Mode Infini"
                description="Tapez les mots le plus vite possible. Apprentissage par répétition pure."
                onClick={() => setMode('infinite')}
                color="border-yellow-500/20 hover:border-yellow-500/50"
              />

              <MenuCard 
                icon={<Keyboard className="w-8 h-8 text-cyan-400" />}
                title="Flashcards"
                description="Mémorisez les mots visuellement avant de passer à la pratique."
                onClick={() => setMode('flashcards')}
                color="border-cyan-500/20 hover:border-cyan-500/50"
              />

              <div className="col-span-full p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Votre Progression
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Mots appris" value={stats.correctWords} />
                  <StatBox label="Précision" value={`${stats.totalChars > 0 ? Math.round((stats.correctChars / stats.totalChars) * 100) : 0}%`} />
                  <StatBox label="Flashcards" value={stats.flashcardsSeen} />
                  <StatBox label="Top 3000" value={`${Math.round((stats.correctWords / 3000) * 100)}%`} />
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'infinite' && (
            <motion.div
              key="infinite"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                  <motion.div 
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentWordIndex / shuffledWords.length) * 100}%` }}
                  />
                </div>

                <div className="text-center mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 block">
                    Mot {currentWordIndex + 1} / {shuffledWords.length}
                  </span>
                  
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                    {currentWord?.fr}
                  </h3>

                  <div className="flex justify-center flex-wrap gap-1 text-4xl md:text-6xl font-black tracking-tight mb-8">
                    {currentWord?.en?.split('').map((char, index) => {
                      const isTyped = index < userInput.length;
                      const isCorrect = isTyped && userInput[index]?.toLowerCase() === char.toLowerCase();
                      
                      return (
                        <motion.span 
                          key={index}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${isTyped ? (isCorrect ? 'text-green-400' : 'text-red-500') : 'text-slate-700'} transition-colors duration-150`}
                        >
                          {isTyped ? userInput[index] : '_'}
                        </motion.span>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 text-2xl text-center focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="Traduisez en anglais..."
                    spellCheck={false}
                    autoComplete="off"
                  />
                  
                  <div className="mt-6 flex justify-center gap-4 text-slate-500 text-sm">
                    <div className="flex items-center gap-1">
                      <Keyboard className="w-4 h-4" />
                      <span>Tapez le mot anglais correspondant</span>
                    </div>
                  </div>
                </div>

                {/* Success indicator */}
                <AnimatePresence>
                  {currentWord?.en && userInput.toLowerCase() === currentWord.en.toLowerCase() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center bg-green-500/10 pointer-events-none"
                    >
                      <CheckCircle2 className="w-24 h-24 text-green-400/50" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setMode('menu')}
                className="mt-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retour au menu
              </button>
            </motion.div>
          )}

          {mode === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md aspect-[3/4] cursor-pointer perspective-1000"
              >
                <motion.div 
                  className="w-full h-full relative transition-all duration-500 preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-slate-900 border-2 border-indigo-500/30 rounded-3xl flex flex-col items-center justify-center p-12 shadow-2xl">
                    <BookOpen className="w-12 h-12 text-indigo-400 mb-6" />
                    <span className="text-slate-500 text-sm uppercase tracking-widest mb-2">Anglais</span>
                    <h3 className="text-5xl font-bold text-center">{currentWord?.en}</h3>
                    <p className="mt-12 text-slate-500 text-sm italic">Cliquez pour voir la traduction</p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl flex flex-col items-center justify-center p-12 shadow-2xl rotate-y-180">
                    <CheckCircle2 className="w-12 h-12 text-white mb-6" />
                    <span className="text-indigo-200 text-sm uppercase tracking-widest mb-2">Français</span>
                    <h3 className="text-4xl font-bold text-center text-white">
                      {currentWord?.fr}
                    </h3>
                    <p className="mt-12 text-indigo-200 text-sm">Prêt pour le suivant ?</p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => setMode('menu')}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" /> Menu
                </button>
                <button 
                  onClick={nextFlashcard}
                  className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Suivant <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Vos Performances</h2>
                <button 
                  onClick={resetStats}
                  className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center">
                  <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                    <Trophy className="w-8 h-8 text-indigo-400" />
                  </div>
                  <span className="text-4xl font-bold mb-1">{stats.correctWords}</span>
                  <span className="text-slate-400 text-sm">Mots Maîtrisés</span>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center">
                  <div className="p-4 bg-green-500/10 rounded-full mb-4">
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                  <span className="text-4xl font-bold mb-1">
                    {stats.totalChars > 0 ? Math.round((stats.correctChars / stats.totalChars) * 100) : 0}%
                  </span>
                  <span className="text-slate-400 text-sm">Précision Globale</span>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center">
                  <div className="p-4 bg-cyan-500/10 rounded-full mb-4">
                    <Keyboard className="w-8 h-8 text-cyan-400" />
                  </div>
                  <span className="text-4xl font-bold mb-1">{stats.totalChars}</span>
                  <span className="text-slate-400 text-sm">Lettres Tapées</span>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6">Niveaux de Maîtrise</h3>
                <div className="space-y-4">
                  <LevelProgress 
                    label="Débutant (100 mots)" 
                    current={stats.correctWords} 
                    target={100} 
                    color="bg-green-500"
                  />
                  <LevelProgress 
                    label="Intermédiaire (500 mots)" 
                    current={stats.correctWords} 
                    target={500} 
                    color="bg-indigo-500"
                  />
                  <LevelProgress 
                    label="Avancé (1500 mots)" 
                    current={stats.correctWords} 
                    target={1500} 
                    color="bg-purple-500"
                  />
                  <LevelProgress 
                    label="Expert (3000 mots)" 
                    current={stats.correctWords} 
                    target={3000} 
                    color="bg-cyan-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 text-center text-slate-500 text-xs border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        Apprenez les 3000 mots les plus courants pour comprendre 90% de l'anglais quotidien.
      </footer>
    </div>
  );
}
function MenuCard({ icon, title, description, onClick, color }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  onClick: () => void,
  color: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-8 rounded-2xl bg-slate-900/50 border text-left transition-all group ${color}`}
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-indigo-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        Commencer <ChevronRight className="w-4 h-4" />
      </div>
    </motion.button>
  );
}

function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function LevelProgress({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const progress = Math.min(100, (current / target) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{current} / {target}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
