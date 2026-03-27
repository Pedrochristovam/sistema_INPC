import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calculator } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/inpc-update', icon: Calculator, label: 'INPC' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-sky-700/30">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-semibold text-white">Sistema INPC</span>
                <span className="text-xs text-slate-300">Gestão de índices e histórico</span>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      isActive
                        ? 'bg-white text-slate-900 border-white shadow-md shadow-sky-500/20'
                        : 'border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
