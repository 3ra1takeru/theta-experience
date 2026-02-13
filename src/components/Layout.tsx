import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Lock } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "text-teal-600 font-bold" : "text-gray-600 hover:text-teal-500";

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-sans text-slate-700">
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-teal-400 animate-pulse" />
                <div className="absolute inset-0 bg-teal-200 blur-xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
              </div>
              <span className="text-2xl font-medium tracking-tight bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent font-heading">
                ThetaHealing®
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-10 items-center">
              <Link to="/" className={isActive('/') + " font-medium transition-all hover:-translate-y-0.5"}>ホーム</Link>
              <Link to="/schedule" className={isActive('/schedule') + " font-medium transition-all hover:-translate-y-0.5"}>体験会日程</Link>
              <Link to="/personal-session" className={isActive('/personal-session') + " font-medium transition-all hover:-translate-y-0.5"}>個人セッション</Link>
              <Link to="/testimonials" className={isActive('/testimonials') + " font-medium transition-all hover:-translate-y-0.5"}>参加者の声</Link>
              <Link to="/admin" className="text-slate-300 hover:text-purple-400 transition-colors">
                <Lock className="w-4 h-4" />
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:bg-white/50 rounded-full transition-colors"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden glass border-t border-white/50 py-6 px-4 space-y-4 animate-fade-in">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 font-medium hover:text-teal-500 pl-2 border-l-2 border-transparent hover:border-teal-300 transition-all">ホーム</Link>
            <Link to="/schedule" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 font-medium hover:text-teal-500 pl-2 border-l-2 border-transparent hover:border-teal-300 transition-all">体験会日程</Link>
            <Link to="/personal-session" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 font-medium hover:text-teal-500 pl-2 border-l-2 border-transparent hover:border-teal-300 transition-all">個人セッション</Link>
            <Link to="/testimonials" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 font-medium hover:text-teal-500 pl-2 border-l-2 border-transparent hover:border-teal-300 transition-all">参加者の声</Link>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-slate-400 text-sm pl-2">管理者ログイン</Link>
          </div>
        )}
      </header>

      <main className="flex-grow pb-24 md:pb-0">
        {children}
      </main>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/80 backdrop-blur-md border-t border-white/50 shadow-lg animate-fade-in-up">
        <Link to="/schedule" className="w-full text-center bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold py-3.5 rounded-full shadow-md shadow-teal-200/50 active:scale-95 transition-transform flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          体験会に参加する - ¥3,000
        </Link>
      </div>

      <footer className="bg-white/40 backdrop-blur-sm border-t border-white/60 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p className="mb-3 font-heading text-slate-600">&copy; {new Date().getFullYear()} ThetaHealing Experience. All rights reserved.</p>
          <p className="text-xs text-slate-400">このサイトはVPSサーバーでの運用を想定したデモサイトです。</p>
        </div>
      </footer>
    </div>
  );
};