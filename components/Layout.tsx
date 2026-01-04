import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Lock } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "text-teal-600 font-bold" : "text-gray-600 hover:text-teal-500";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-teal-500" />
              <span className="text-xl font-medium tracking-tight bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                ThetaHealing®
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link to="/" className={isActive('/')}>ホーム</Link>
              <Link to="/schedule" className={isActive('/schedule')}>体験会日程</Link>
              <Link to="/testimonials" className={isActive('/testimonials')}>参加者の声</Link>
              <Link to="/admin" className="text-gray-400 hover:text-purple-600 transition-colors">
                <Lock className="w-4 h-4" />
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-medium">ホーム</Link>
            <Link to="/schedule" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-medium">体験会日程</Link>
            <Link to="/testimonials" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-medium">参加者の声</Link>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-gray-400 text-sm">管理者ログイン</Link>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p className="mb-2">&copy; {new Date().getFullYear()} ThetaHealing Experience. All rights reserved.</p>
          <p>このサイトはVPSサーバーでの運用を想定したデモサイトです。</p>
        </div>
      </footer>
    </div>
  );
};