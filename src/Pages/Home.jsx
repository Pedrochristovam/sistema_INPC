import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calculator, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const modules = [
    {
      id: 'inpc',
      title: 'Atualização INPC',
      description: 'Processamento seguro das planilhas com aplicação do índice mensal',
      icon: Calculator,
      gradient: 'from-sky-500 to-indigo-500',
      href: 'INPCUpdate',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-slate-700 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span className="text-sm font-medium text-slate-100">Plataforma Corporativa</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Operações de Atualização INPC
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Processo padronizado para atualização mensal, verificação de processo e histórico auditável.
        </p>
      </motion.div>

      {/* Module Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={createPageUrl(module.href)}>
              <div className="group relative bg-white/5 border border-slate-800 rounded-2xl p-6 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-900/30 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-sky-900/50`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {module.title}
                    </h3>
                    <p className="text-sm text-slate-300 mb-3">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-sky-300 group-hover:gap-3 transition-all">
                      <span>Acessar</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 border border-slate-800 rounded-2xl p-6 backdrop-blur"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Planilhas processadas', value: '––', accent: 'from-emerald-400 to-emerald-500' },
            { label: 'Histórico', value: 'Local', accent: 'from-sky-400 to-sky-500' },
            { label: 'Atualização alvo', value: 'Mês vigente', accent: 'from-indigo-400 to-indigo-500' },
            { label: 'INPC atual', value: '--', accent: 'from-amber-400 to-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-slate-800">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${stat.accent} flex items-center justify-center text-slate-900 font-semibold`}>
                •
              </div>
              <p className="text-xl font-semibold text-white leading-tight">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
