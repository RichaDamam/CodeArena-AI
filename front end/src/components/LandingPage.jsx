import React from 'react';
import { Play, Code, Cpu, Trophy, LogOut } from 'lucide-react';

export default function LandingPage({ user, onLogout, onOpenAuth, onSelectDifficulty }) {
  const difficulties = [
    {
      level: 'easy',
      title: 'EASY TRAINING',
      description: 'Master fundamentals. Focuses on loops, hash maps, simple array manipulation, and basic operators.',
      stat: 'Ref Time: 10m',
      color: 'border-cyber-green/30 hover:border-cyber-green text-cyber-green shadow-glow-green/10 hover:shadow-glow-green/30'
    },
    {
      level: 'medium',
      title: 'MEDIUM CHALLENGE',
      description: 'Slide through algorithms. Focuses on sliding windows, custom sorting, string structures, and pointers.',
      stat: 'Ref Time: 20m',
      color: 'border-cyber-yellow/30 hover:border-cyber-yellow text-cyber-yellow shadow-glow-cyan/10 hover:shadow-glow-cyan/30'
    },
    {
      level: 'hard',
      title: 'HARD ARENA',
      description: 'Battle peak complexity. Focuses on dynamic programming, structural traversal, and extreme optimization.',
      stat: 'Ref Time: 40m',
      color: 'border-cyber-magenta/30 hover:border-cyber-magenta text-cyber-magenta shadow-glow-magenta/10 hover:shadow-glow-magenta/30'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col font-sans relative overflow-hidden">
      {/* Visual Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyber-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyber-cyan/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-dark-border/40 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30">
            <Cpu className="text-cyber-cyan animate-pulse" size={24} />
          </div>
          <span className="text-xl font-black font-sans tracking-widest text-white">
            CODEARENA<span className="text-cyber-cyan">.AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-cyber-cyan font-mono font-bold">RATING: {user.rating} // LVL: {user.level}</span>
              </div>
              <button 
                onClick={onLogout}
                className="p-2.5 rounded-xl border border-dark-border bg-dark-card hover:bg-cyber-magenta hover:text-black hover:border-cyber-magenta transition-all flex items-center justify-center gap-2 group text-sm"
              >
                <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline font-semibold">Sign Out</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20 hover:from-cyber-cyan hover:to-cyber-purple border border-cyber-cyan/40 hover:border-cyber-cyan hover:text-black font-bold tracking-wide transition-all text-sm"
            >
              SIGN IN
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center relative z-10 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-cyan/20 bg-cyber-cyan/5 text-xs text-cyber-cyan font-bold tracking-widest mb-6 font-sans">
            <Trophy size={14} />
            <span>AGENTIC ASSESSMENT SYSTEM ENABLED</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6 text-white uppercase">
            CHALLENGE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-magenta text-glow-cyan">CODE SKILL</span>
          </h1>

          <p className="text-base md:text-lg text-dark-muted leading-relaxed font-light">
            An adaptive playground assessing code in real time. Submit solutions and let our system calibrate difficulty on the fly using attempts, speed, lines of code, and correctness.
          </p>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => user ? onSelectDifficulty('easy') : onOpenAuth()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-purple text-black hover:from-cyber-cyan hover:to-cyber-magenta font-black font-sans tracking-widest transition-all shadow-glow-cyan/20 hover:shadow-glow-cyan/40 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 text-sm md:text-base"
            >
              <Play size={18} fill="black" />
              <span>START CODING WORKSPACE</span>
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-xs font-black tracking-widest text-dark-muted uppercase font-sans">SELECT ACCESS SECTOR</h3>
            <div className="h-0.5 w-12 bg-cyber-cyan mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {difficulties.map((diff) => (
              <div 
                key={diff.level}
                onClick={() => onSelectDifficulty(diff.level)}
                className={`glass-panel cursor-pointer rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${diff.color}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black font-mono tracking-widest px-2.5 py-1 rounded bg-black/40 border border-white/5">{diff.title}</span>
                    <span className="text-xs font-mono font-bold text-dark-muted">{diff.stat}</span>
                  </div>
                  <h4 className="text-xl font-bold tracking-tight text-white mb-3">SECTOR {diff.level.toUpperCase()}</h4>
                  <p className="text-sm text-dark-muted leading-relaxed">{diff.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-dark-border/20 flex items-center justify-between text-xs font-bold font-mono">
                  <span className="text-white hover:underline flex items-center gap-1.5">
                    INITIALIZE CODE CHALLENGE
                    <Code size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-dark-muted/60 border-t border-dark-border/20 relative z-10">
        <span>© {new Date().getFullYear()} CodeArena.AI. Secure Compiler Engine Active.</span>
      </footer>
    </div>
  );
}
